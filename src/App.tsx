import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  UserProfile, 
  ConsumptionLog, 
  AppNotification as Notification, 
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
import { 
  Home, 
  PlusCircle, 
  History as IconHistory, 
  PieChart, 
  Settings as IconSettings, 
  Award, 
  BookOpen, 
  Cat, 
  Wifi, 
  WifiOff, 
  X, 
  Sparkles, 
  Bell, 
  Bookmark, 
  Grid 
} from 'lucide-react';

const INITIAL_PROFILE: UserProfile = {
  name: '',
  dailyLimit: 400,
  weight: 70,
  sensitivity: 'Medium',
  onboarded: false,
  sleepGoal: 8,
  streak: 0,
  bestStreak: 0,
  hydrationAlerts: true,
  cutoffAlerts: true,
  sleepAlerts: true,
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

  // UX & PWA stats
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const [showOnboardingConfetti, setShowOnboardingConfetti] = useState(false);

  // Rejuvenate dates from local storage
  const activeLogs = useMemo(() => {
    return logs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp)
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [logs]);

  // Toast System Wrapper helper
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Sync state with back-end helper (offline-safe)
  const syncWithBackend = useCallback(async (url: string, method = 'GET', body: any = null) => {
    if (!navigator.onLine) return null;
    try {
      const config: RequestInit = { method };
      if (body) {
        config.headers = { 'Content-Type': 'application/json' };
        config.body = JSON.stringify(body);
      }
      const res = await fetch(url, config);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`[MyCoffee] Backend offline-fallback for: ${url}`);
    }
    return null;
  }, []);

  // On mount listeners & initial syncs
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast("Network connection restored! Synchronizing logs... 🟢", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast("Connection offline. Switched to offline-local performance. 🐾", "info");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture standard install prompts for PWA helper
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaBanner(true);
    });

    // Check backend sync on mount
    syncWithBackend('/api/state')
      .then(data => {
        if (data && data.profile) {
          if (data.profile.onboarded) {
            setProfile(data.profile);
            setView('DASHBOARD');
          } else if (profile.onboarded) {
             // Seed backend with our local storage settings if empty on server
             syncWithBackend('/api/profile', 'POST', profile);
             logs.forEach((l) => {
               syncWithBackend('/api/logs', 'POST', l);
             });
          }
          if (data.logs && data.logs.length > 0) setLogs(data.logs);
          if (data.goals && data.goals.length > 0) setGoals(data.goals);
          if (data.customDrinks && data.customDrinks.length > 0) setCustomDrinks(data.customDrinks);
          if (data.notifications && data.notifications.length > 0) setNotifications(data.notifications);
        }
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update DOM theme
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  // Periodic notification & scheduled reminders check effect
  useEffect(() => {
    if (profile.onboarded) {
      const newNotif = checkAndUpdateNotifications(logs, profile, notifications);
      if (newNotif) {
        setNotifications(prev => {
          if (prev.some(n => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
        playNotificationSound();
        addToast(newNotif.title, newNotif.type === 'alert' ? 'error' : 'info');
        syncWithBackend('/api/notifications', 'POST', newNotif);
      }
    }
  }, [logs, profile, notifications, addToast]);

  // Custom Scheduled Alarms (Hydration, Sleep cutoff, wind down) Background Loop
  useEffect(() => {
    if (!profile.onboarded) return;

    const runRemindersLoop = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const todayStr = now.toISOString().split('T')[0];

      // Parse user's bedtime (default "23:00")
      const [bedHour, bedMin] = (profile.bedtime || '23:00').split(':').map(Number);
      
      // Calculate hours to bedtime
      let hoursToBed = bedHour - currentHour;
      if (hoursToBed < 0) hoursToBed += 24;

      // 1. Sleek Bedtime cutoff warning (8 hours before bed)
      if (profile.cutoffAlerts !== false && Math.abs(hoursToBed - 8) < 0.2) {
        const key = `scheduled-cutoff-${todayStr}`;
        if (!notifications.some(n => n.id === key)) {
          const cutNotif = createNotification(
            "🕒 8-Hour Caffeine Cutoff!",
            `Hi ${profile.name}! You are exactly 8 hours from bedtime (${profile.bedtime}). Avoid caffeine doses now to protect deep slow-wave sleep.`,
            'warning'
          );
          setNotifications(prev => [{ ...cutNotif, id: key }, ...prev]);
          playNotificationSound();
          addToast("🕒 8-Hour bedtime caffeine cutoff reached!", "info");
          syncWithBackend('/api/notifications', 'POST', { ...cutNotif, id: key });
        }
      }

      // 2. Cozy Cat Sleep winding advice (1 hour before bedtime)
      if (profile.sleepAlerts !== false && Math.abs(hoursToBed - 1) < 0.2) {
        const key = `scheduled-sleep-${todayStr}`;
        if (!notifications.some(n => n.id === key)) {
          const sleepNotif = createNotification(
            "😴 Bedtime is approaching",
            "Cozy Cat Napper Advisory: Bedtime is 1 hour away. Dim your screens, sip clean water, and start winding down! 🐾",
            'info'
          );
          setNotifications(prev => [{ ...sleepNotif, id: key }, ...prev]);
          playNotificationSound();
          addToast("😴 Target bedtime is 1 hour away. Time to wind down!", "info");
          syncWithBackend('/api/notifications', 'POST', { ...sleepNotif, id: key });
        }
      }

      // 3. Hourly Hydration Alarm if user hasn't consumed water in the last 2 hours
      if (profile.hydrationAlerts !== false) {
        const lastCoffeeLog = activeLogs.find(l => l.caffeine > 0);
        const lastWaterLog = activeLogs.find(l => l.drinkId === 'water');
        
        if (lastCoffeeLog) {
          const hoursSinceWater = lastWaterLog 
            ? (now.getTime() - lastWaterLog.timestamp.getTime()) / (1000 * 60 * 60)
            : (now.getTime() - lastCoffeeLog.timestamp.getTime()) / (1000 * 60 * 60);

          if (hoursSinceWater >= 2) {
            const key = `hydration-ping-${todayStr}-${currentHour}`;
            if (!notifications.some(n => n.id === key)) {
              const waterNotif = createNotification(
                "💧 Hydration Health Check!",
                "You haven't logged water since your last beverage. Drink a rich 250ml glass now to clear adenosine pathways! 🐾",
                'info'
              );
              setNotifications(prev => [{ ...waterNotif, id: key }, ...prev]);
              playNotificationSound();
              addToast("💧 Hydration reminder: Drink a glass of water!", "info");
              syncWithBackend('/api/notifications', 'POST', { ...waterNotif, id: key });
            }
          }
        }
      }
    };

    // Run every 45-60 seconds
    const interval = setInterval(runRemindersLoop, 60000);
    runRemindersLoop(); // Run once immediately

    return () => clearInterval(interval);
  }, [profile, logs, notifications, activeLogs, addToast, syncWithBackend]);

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
    syncWithBackend('/api/logs', 'POST', log);
    syncWithBackend('/api/notifications', 'POST', newNotif);
  }, [setLogs, setNotifications, syncWithBackend]);

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
      syncWithBackend(`/api/logs/${id}`, 'DELETE');
      syncWithBackend('/api/notifications', 'POST', newNotif);
    }
    setLogs(prev => prev.filter(l => l.id !== id));
  }, [logs, setLogs, setNotifications, syncWithBackend]);

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
    syncWithBackend('/api/logs', 'POST', waterLog);
    syncWithBackend('/api/notifications', 'POST', newNotif);
  }, [setLogs, setNotifications, syncWithBackend]);

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
      syncWithBackend(`/api/custom-drinks/${id}`, 'DELETE');
      syncWithBackend('/api/notifications', 'POST', newNotif);
    }
    setCustomDrinks(prev => prev.filter(d => d.id !== id));
  }, [customDrinks, setCustomDrinks, setNotifications, syncWithBackend]);

  const handleReset = useCallback(() => {
     setLogs([]);
     setProfile(INITIAL_PROFILE);
     setNotifications([]);
     setGoals(INITIAL_GOALS);
     setCustomDrinks([]);
     setView('LANDING');

     // Trigger full back-end reset
     syncWithBackend('/api/reset', 'POST');
  }, [setLogs, setProfile, setNotifications, setGoals, setCustomDrinks, setView, syncWithBackend]);

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
    syncWithBackend('/api/custom-drinks', 'POST', d);
    syncWithBackend('/api/notifications', 'POST', newNotif);
  }, [setCustomDrinks, setNotifications, syncWithBackend]);

  const handleMarkNotifAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    syncWithBackend('/api/notifications/read-all', 'POST');
    addToast("Notification marked as read! 🐾", "info");
  }, [setNotifications, syncWithBackend, addToast]);

  const handleClearNotifs = useCallback(() => {
    setNotifications([]);
    syncWithBackend('/api/notifications/read-all', 'POST');
    addToast("All notifications cleared! ✅", "success");
  }, [setNotifications, syncWithBackend, addToast]);

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
    setShowOnboardingConfetti(true);
    setView('DASHBOARD');
    
    const newNotif = createNotification(
      "Profile Initialized 🚀",
      `Welcome, ${p.name}! Your customizable caffeine threshold is set to ${p.dailyLimit}mg. Barista Cat is excited to track with you!`,
      'success'
    );
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();
    addToast(`Greetings, ${p.name}! Welcome to MyCoffee! 🎉`, "success");

    // Sync profile to server settings
    syncWithBackend('/api/profile', 'POST', p);
    syncWithBackend('/api/notifications', 'POST', newNotif);
  }, [setProfile, setView, setNotifications, addToast, syncWithBackend]);

  const handleUpdateProfile = useCallback((p: UserProfile) => {
    setProfile(p);
    const newNotif = createNotification(
      "Settings Saved ⚙️",
      "Your biometric configurations and theme preferences have been safely updated.",
      'success'
    );
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();
    addToast("Settings successfully synced! ⚙️", "success");

    // Sync profile edits
    syncWithBackend('/api/profile', 'POST', p);
    syncWithBackend('/api/notifications', 'POST', newNotif);
  }, [setProfile, setNotifications, addToast, syncWithBackend]);

  const handleToggleTheme = useCallback(() => {
    const nextTheme = profile.theme === 'light' ? 'dark' : 'light';
    setProfile(prev => {
      const updated = { ...prev, theme: nextTheme };
      localStorage.setItem('user_profile', JSON.stringify(updated));
      syncWithBackend('/api/profile', 'POST', updated);
      return updated;
    });
    const newNotif = createNotification(
      "Appearance Updated 🌗",
      `Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode.`,
      'success'
    );
    setNotifications(prev => [newNotif, ...prev]);
    playNotificationSound();
    addToast(`Mode changed to ${nextTheme}! 🌗`, "success");
    syncWithBackend('/api/notifications', 'POST', newNotif);
  }, [profile.theme, setProfile, setNotifications, addToast, syncWithBackend]);

  const handleShowDrinkTracker = useCallback(() => setShowDrinkTracker(true), []);
  const handleHideDrinkTracker = useCallback(() => setShowDrinkTracker(false), []);
  const handleShowNotifs = useCallback(() => setShowNotifs(true), []);
  const handleHideNotifs = useCallback(() => setShowNotifs(false), []);
  const handleShowCalculator = useCallback(() => setShowCalculator(true), []);
  const handleHideCalculator = useCallback(() => setShowCalculator(false), []);

  const handleLogTempDrinks = useCallback((drinks: { name: string; caffeine: number }[]) => {
    drinks.forEach((d, idx) => {
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

  // Execute native PWA install
  const handlePwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      addToast("Successfully installed! Welcome to the desktop app! 🐈💻", "success");
      setDeferredPrompt(null);
      setShowPwaBanner(false);
    } else {
      addToast("Installation declined.", "info");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-soft-white ${profile.theme === 'dark' ? 'dark bg-espresso text-soft-white' : ''}`}>
      
      {/* 1. Global Online / Offline Minimal Ribbon */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-[11px] font-black tracking-widest text-center py-2 uppercase z-50 relative flex items-center justify-center gap-1.5 shadow-md">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Local Storage Only (Offline)</span>
        </div>
      )}

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

      {/* 2. Celebrate Onboarding Celebration Modal */}
      <AnimatePresence>
        {showOnboardingConfetti && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-6 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white dark:bg-espresso p-12 rounded-[3.5rem] max-w-md w-full text-center border-4 border-caramel relative shadow-2xl overflow-hidden"
            >
              {/* Confetti Emoji Floaters */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-6 text-3xl animate-bounce">✨</div>
                <div className="absolute bottom-12 right-8 text-3xl animate-pulse">🎉</div>
                <div className="absolute top-1/3 right-4 text-4xl animate-bounce duration-1000">☕</div>
                <div className="absolute bottom-6 left-12 text-3xl animate-pulse">⭐️</div>
              </div>

              <div className="w-24 h-24 bg-latte-cream dark:bg-latte-cream/10 text-espresso dark:text-latte-cream rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner hover:scale-110 transition-transform">
                😸
              </div>
              
              <h3 className="text-4xl font-display font-black text-espresso dark:text-soft-white mb-4 tracking-tight">Onboarding Completed!</h3>
              <p className="text-sm font-medium text-espresso/60 dark:text-soft-white/60 mb-8 leading-relaxed">
                "Mew! Success, partner! You are officially fully calibrated! Barista Cat will serve cute tips & safety reminders whenever you log."
              </p>

              <button
                onClick={() => setShowOnboardingConfetti(false)}
                className="w-full py-5 bg-coffee-brown hover:bg-caramel text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all duration-200"
              >
                Let's Brew! 🐾
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. PWA Prompt Promotion Banner */}
      <AnimatePresence>
        {showPwaBanner && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[95] glass border border-warm-beige dark:border-white/10 p-6 rounded-3xl premium-shadow flex items-start gap-4 mb-2"
          >
            <div className="w-12 h-12 bg-caramel/10 text-caramel rounded-2xl flex items-center justify-center shrink-0 text-2xl">
              😸
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-black text-espresso dark:text-soft-white">Install Desktop Client</h4>
              <p className="text-xs text-espresso/50 dark:text-soft-white/50 mt-1">
                Install to home screen for super-speed offline tracking and customized widget reactions!
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handlePwaInstall}
                  className="px-4 py-2 bg-coffee-brown text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-caramel transition-colors"
                >
                  Install Now
                </button>
                <button
                  onClick={() => setShowPwaBanner(false)}
                  className="px-4 py-2 bg-transparent text-espresso/40 dark:text-soft-white/40 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-white/10"
                >
                  Later
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowPwaBanner(false)}
              className="text-espresso/20 hover:text-espresso shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Elegant Reactive Toast Overlay Stack */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1001] flex flex-col gap-3 w-full max-w-sm px-6 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-4 rounded-2xl shadow-xl border text-left flex items-start gap-3 pointer-events-auto w-full backdrop-blur-md ${
                toast.type === 'success' ? 'bg-emerald-500/95 border-emerald-400 text-white' :
                toast.type === 'error' ? 'bg-rose-500/95 border-rose-400 text-white' :
                'bg-espresso/95 border-espresso/80 text-latte-cream'
              }`}
            >
              <div className="text-lg shrink-0">
                {toast.type === 'success' ? '✨' : toast.type === 'error' ? '⚠️' : '🔔'}
              </div>
              <p className="text-xs font-semibold leading-relaxed flex-1">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 5. Mobile Native Bottom Navigation Stick (Aids mobile touch interactions) */}
      {profile.onboarded && view !== 'LANDING' && view !== 'ONBOARDING' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-espresso/80 backdrop-blur-md border-t border-warm-beige/20 dark:border-white/10 md:hidden flex justify-around py-3 safe-bottom px-2 shadow-2xl">
          {[
            { id: 'DASHBOARD', label: 'Home', icon: <Home className="w-5 h-5" /> },
            { id: 'HISTORY', label: 'History', icon: <IconHistory className="w-5 h-5" /> },
            { id: 'TRACKER_TRIGGER', label: 'Log', icon: <PlusCircle className="w-5 h-5" />, highlight: true },
            { id: 'ANALYTICS', label: 'Charts', icon: <PieChart className="w-5 h-5" /> },
            { id: 'SETTINGS', label: 'Config', icon: <IconSettings className="w-5 h-5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'TRACKER_TRIGGER') {
                  setShowDrinkTracker(true);
                } else {
                  setView(tab.id as any);
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer relative ${
                tab.highlight 
                  ? "text-coffee-brown dark:text-latte-cream scale-105" 
                  : view === tab.id 
                    ? "text-coffee-brown dark:text-latte-cream bg-coffee-brown/5 dark:bg-white/5 font-black" 
                    : "text-espresso/40 dark:text-soft-white/40 font-medium hover:text-espresso"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] uppercase tracking-wider font-extrabold">{tab.label}</span>
              {view === tab.id && !tab.highlight && (
                <motion.div layoutId="mobile_nav_dot" className="absolute top-1 w-1 h-1 bg-coffee-brown dark:bg-latte-cream rounded-full" />
              )}
            </button>
          ))}
        </nav>
      )}

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
