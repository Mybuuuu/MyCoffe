import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  UserProfile, 
  ConsumptionLog, 
  Notification, 
  Goal, 
  View,
  DrinkType 
} from './types';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import DrinkTracker from './components/DrinkTracker';
import CaffeineCalculatorModal from './components/CaffeineCalculatorModal';
import NotificationCenter from './components/NotificationCenter';
import Analytics from './components/Analytics';
import History from './components/History';
import Goals from './components/Goals';
import Settings from './components/Settings';
import EducationModule from './components/EducationModule';
import BrandHub from './components/BrandHub';
import { AnimatePresence, motion } from 'motion/react';
import { checkAndUpdateNotifications, playNotificationSound, createNotification } from './utils/notifications';

const INITIAL_PROFILE: UserProfile = {
  name: '',
  dailyLimit: 400,
  weight: 70,
  sensitivity: 'Medium',
  onboarded: false,
  sleepGoal: 8,
  streak: 0,
  theme: 'light',
  bedtime: '23:00',
  lifestyle: 'Office',
  lastLogDate: null
};

const INITIAL_GOALS: Goal[] = [
  { id: 'sleep', title: 'Sleep First', description: 'Avoid caffeine 8 hours before bedtime', target: 5, current: 0, icon: 'Moon', isCompleted: false },
  { id: 'limit', title: 'Smart Balancer', description: 'Stay under your daily limit', target: 7, current: 0, icon: 'Zap', isCompleted: false },
  { id: 'water', title: 'Hydration Hero', description: 'Drink water after each coffee', target: 10, current: 0, icon: 'Droplets', isCompleted: false },
];

export default function App() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('mycoffee_profile', INITIAL_PROFILE);
  const [logs, setLogs] = useLocalStorage<ConsumptionLog[]>('mycoffee_logs', []);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('mycoffee_notifications', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('mycoffee_goals', INITIAL_GOALS);
  const [customDrinks, setCustomDrinks] = useLocalStorage<DrinkType[]>('mycoffee_custom_drinks', []);
  
  const [view, setView] = useState<View>(profile.onboarded ? 'DASHBOARD' : 'LANDING');
  const [showDrinkTracker, setShowDrinkTracker] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Rejuvenate dates from local storage
  const activeLogs = useMemo(() => {
    return logs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp)
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [logs]);

  // Sync state with back-end on mount
  useEffect(() => {
    fetch('/api/state')
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          if (data.profile.onboarded) {
            setProfile(data.profile);
            setView('DASHBOARD');
          } else if (profile.onboarded) {
             // Seed backend with our local storage settings if empty
             fetch('/api/profile', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(profile)
             });
             localStorage.getItem('mycoffee_logs') && JSON.parse(localStorage.getItem('mycoffee_logs') || '[]').forEach((l: any) => {
               fetch('/api/logs', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(l)
               });
             });
          }
          
          if (data.logs && data.logs.length > 0) setLogs(data.logs);
          if (data.goals && data.goals.length > 0) setGoals(data.goals);
          if (data.customDrinks && data.customDrinks.length > 0) setCustomDrinks(data.customDrinks);
          if (data.notifications && data.notifications.length > 0) setNotifications(data.notifications);
        }
      })
      .catch(err => console.error('Error auto-syncing application database on startup:', err));
  }, []);

  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  // Periodic notification check
  useEffect(() => {
    if (profile.onboarded) {
      const newNotif = checkAndUpdateNotifications(logs, profile, notifications);
      if (newNotif) {
        // Double-check local state before updating to block potential double-renders
        setNotifications(prev => {
          if (prev.some(n => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
        playNotificationSound();
        // Sync custom notification to database
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNotif)
        });
      }
    }
  }, [logs, profile, notifications]);

  const handleAddLog = useCallback((log: ConsumptionLog) => {
    setLogs(prev => [log, ...prev]);
    const isWater = log.drinkId === 'water';
    const isNoCaffeine = log.caffeine === 0;
    const newNotif = createNotification(
      isWater ? "Hydration Logged 💧" : isNoCaffeine ? "Drink Tracked 🍃" : "Drink Tracked ☕",
      isWater 
        ? `Added a ${log.size} glass of water.`
        : isNoCaffeine
          ? `Added ${log.name} (Caffeine-Free).`
          : `Added ${log.name} (${log.caffeine}mg) of caffeine.`,
      isWater || isNoCaffeine ? 'success' : 'info'
    );
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();

    // Persist log to Express backend database
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    });
  }, [setLogs, setNotifications]);

  const handleRemoveLog = useCallback((id: string) => {
    const logToRemove = logs.find(l => l.id === id);
    if (logToRemove) {
      const isNoCaffeine = logToRemove.caffeine === 0;
      const newNotif = createNotification(
        "Log Deleted 🗑️",
        isNoCaffeine
          ? `Removed caffeine-free ${logToRemove.name} from your history.`
          : `Removed ${logToRemove.name} (${logToRemove.caffeine}mg) from your history.`,
        'info'
      );
      setNotifications(prev => [newNotif, ...prev]);
      playNotificationSound();

      // Delete log from backend
      fetch(`/api/logs/${id}`, { method: 'DELETE' });
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif)
      });
    }
    setLogs(prev => prev.filter(l => l.id !== id));
  }, [logs, setLogs, setNotifications]);

  const handleLogWater = useCallback(() => {
    const waterLog: ConsumptionLog = {
      id: Math.random().toString(36).substr(2, 9),
      drinkId: 'water',
      name: 'Glass of Water',
      caffeine: 0,
      timestamp: new Date(),
      size: '250ml'
    };
    setLogs(prev => [waterLog, ...prev]);
    const newNotif = createNotification(
      "Hydration Logged 💧",
      "Added a 250ml glass of water.",
      'success'
    );
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();

    // Persist water tracking
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waterLog)
    });
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    });
  }, [setLogs, setNotifications]);

  const handleRemoveCustomDrink = useCallback((id: string) => {
    const removed = customDrinks.find(d => d.id === id);
    if (removed) {
      const newNotif = createNotification(
        "Custom Drink Removed 🗑️",
        `Deleted custom drink option: ${removed.name}.`,
        'info'
      );

      setNotifications(prev => [newNotif, ...prev]);
      playNotificationSound();

      // Sync deletion
      fetch(`/api/custom-drinks/${id}`, { method: 'DELETE' });
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif)
      });
    }
    setCustomDrinks(prev => prev.filter(d => d.id !== id));
  }, [customDrinks, setCustomDrinks, setNotifications]);

  const handleReset = useCallback(() => {
     setLogs([]);
     setProfile(INITIAL_PROFILE);
     setNotifications([]);
     setGoals(INITIAL_GOALS);
     setCustomDrinks([]);
     setView('LANDING');

     // Trigger full back-end reset
     fetch('/api/reset', { method: 'POST' });
  }, [setLogs, setProfile, setNotifications, setGoals, setCustomDrinks, setView]);

  const handleAddCustomDrink = useCallback((d: DrinkType) => {
    setCustomDrinks(prev => [d, ...prev]);
    const newNotif = createNotification(
      "Custom Drink Saved ✨",
      `Saved custom drink: ${d.name} (${d.baseCaffeine}mg).`,
      'success'
    );
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();

    // Persist recipe
    fetch('/api/custom-drinks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    });
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    });
  }, [setCustomDrinks, setNotifications]);

  const handleMarkNotifAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    fetch('/api/notifications/read-all', { method: 'POST' });
  }, [setNotifications]);

  const handleClearNotifs = useCallback(() => {
    setNotifications([]);
    fetch('/api/notifications/read-all', { method: 'POST' });
  }, [setNotifications]);

  const handleBack = useCallback(() => {
    if (profile.onboarded) {
      setView('DASHBOARD');
    } else {
      setView('LANDING');
    }
  }, [profile.onboarded, setView]);

  const handleNavigateFromLanding = useCallback((targetView: View) => {
    if (targetView === 'EDUCATION' || targetView === 'LANDING') {
      setView(targetView);
    } else {
      if (!profile.onboarded) {
        setView('ONBOARDING');
      } else {
        setView(targetView);
      }
    }
  }, [profile.onboarded, setView]);

  const handleStartOnboarding = useCallback(() => {
    setView('ONBOARDING');
  }, [setView]);

  const handleOnboardingComplete = useCallback((p: UserProfile) => {
    setProfile(p);
    setView('DASHBOARD');
    const newNotif = createNotification(
      "Profile Initialized 🚀",
      `Welcome, ${p.name}! Your customizable caffeine threshold is set to ${p.dailyLimit}mg.`,
      'success'
    );
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();

    // Sync profile to server settings
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    });
  }, [setProfile, setView, setNotifications]);

  const handleUpdateProfile = useCallback((p: UserProfile) => {
    setProfile(p);
    const newNotif = createNotification(
      "Settings Saved ⚙️",
      "Your biometric configurations and theme preferences have been safely updated.",
      'success'
    );
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();

    // Sync profile edits
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    });
  }, [setProfile, setNotifications]);

  const handleToggleTheme = useCallback(() => {
    const nextTheme = profile.theme === 'light' ? 'dark' : 'light';
    setProfile(prev => {
      const updated = { ...prev, theme: nextTheme };
      localStorage.setItem('user_profile', JSON.stringify(updated));
      fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      return updated;
    });
    const newNotif = createNotification(
      "Appearance Updated 🌗",
      `Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode.`,
      'success'
    );
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    });
  }, [profile.theme, setProfile, setNotifications]);

  const handleShowDrinkTracker = useCallback(() => setShowDrinkTracker(true), []);
  const handleHideDrinkTracker = useCallback(() => setShowDrinkTracker(false), []);
  const handleShowNotifs = useCallback(() => setShowNotifs(true), []);
  const handleHideNotifs = useCallback(() => setShowNotifs(false), []);
  const handleShowCalculator = useCallback(() => setShowCalculator(true), []);
  const handleHideCalculator = useCallback(() => setShowCalculator(false), []);

  const handleLogTempDrinks = useCallback((drinks: { name: string; caffeine: number }[]) => {
    drinks.forEach((d, idx) => {
      // Add key difference to timing to stagger logs if multiples are added
      const logTime = new Date(Date.now() + idx * 1000);
      const logItem: ConsumptionLog = {
        id: Math.random().toString(36).substr(2, 9),
        drinkId: `custom-calc-${Date.now()}-${Math.random()}`,
        name: d.name,
        caffeine: d.caffeine,
        timestamp: logTime,
        size: 'Medium'
      };
      handleAddLog(logItem);
    });
  }, [handleAddLog]);

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-soft-white ${profile.theme === 'dark' ? 'dark bg-espresso text-soft-white' : ''}`}>
      <AnimatePresence mode="wait">
        {view === 'LANDING' && (
          <motion.div key="landing" exit={{ opacity: 0 }}>
            <LandingPage onStart={handleStartOnboarding} onNavigate={handleNavigateFromLanding} />
          </motion.div>
        )}

        {view === 'ONBOARDING' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Onboarding onComplete={handleOnboardingComplete} onBack={handleBack} />
          </motion.div>
        )}

        {view === 'DASHBOARD' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Dashboard 
              logs={activeLogs} 
              profile={profile} 
              onAddDrink={handleShowDrinkTracker}
              onLogWater={handleLogWater}
              onNavigate={setView}
              onToggleNotifs={handleShowNotifs}
              hasUnreadNotifs={notifications.some(n => !n.read)}
              onRemoveLog={handleRemoveLog}
              onToggleTheme={handleToggleTheme}
              onOpenCalculator={handleShowCalculator}
            />
          </motion.div>
        )}

        {view === 'ANALYTICS' && (
          <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Analytics logs={activeLogs} profile={profile} onBack={handleBack} />
          </motion.div>
        )}

        {view === 'HISTORY' && (
          <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <History logs={activeLogs} onRemoveLog={handleRemoveLog} onBack={handleBack} />
          </motion.div>
        )}

        {view === 'GOALS' && (
          <motion.div key="goals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Goals goals={goals} logs={activeLogs} profile={profile} onBack={handleBack} />
          </motion.div>
        )}

        {view === 'SETTINGS' && (
          <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Settings 
              profile={profile} 
              customDrinks={customDrinks}
              onUpdate={handleUpdateProfile} 
              onBack={handleBack} 
              onReset={handleReset} 
              onRemoveCustomDrink={handleRemoveCustomDrink}
            />
          </motion.div>
        )}

        {view === 'EDUCATION' && (
          <motion.div key="education" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <EducationModule onBack={handleBack} />
          </motion.div>
        )}

        {view === 'BRAND' && (
          <motion.div key="brand" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <BrandHub onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDrinkTracker && (
          <DrinkTracker 
            onClose={handleHideDrinkTracker} 
            onLog={handleAddLog} 
            customDrinks={customDrinks}
            onAddCustomDrink={handleAddCustomDrink}
          />
        )}

        {showCalculator && (
          <CaffeineCalculatorModal 
            onClose={handleHideCalculator}
            profile={profile}
            currentLogs={activeLogs}
            onLogTempDrinks={handleLogTempDrinks}
          />
        )}

        {showNotifs && (
          <NotificationCenter 
            notifications={notifications}
            onClose={handleHideNotifs}
            onClear={handleClearNotifs}
            onMarkAsRead={handleMarkNotifAsRead}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
