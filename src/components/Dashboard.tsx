import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Bell, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  Zap, 
  Moon, 
  Sun,
  Calendar,
  Activity,
  Award,
  BookOpen,
  Settings as SettingsIcon,
  Droplets,
  ShieldAlert,
  Heart,
  Coffee,
  Flame,
  Trash2,
  Calculator
} from 'lucide-react';
import { ConsumptionLog, UserProfile, View } from '../types';
import { cn } from '../lib/utils';
import AlarmReminder from './AlarmReminder';
import { 
  getDailyTotal, 
  getRemainingLimit, 
  getCaffeineStatus, 
  getProgressPercentage,
  getTodaysLogs
} from '../utils/caffeine';

interface DashboardProps {
  logs: ConsumptionLog[];
  profile: UserProfile;
  onAddDrink: () => void;
  onLogWater: () => void;
  onNavigate: (view: View) => void;
  onToggleNotifs: () => void;
  hasUnreadNotifs: boolean;
  onRemoveLog: (id: string) => void;
  onToggleTheme?: () => void;
  onOpenCalculator?: () => void;
}

interface AIInsights {
  metabolismText: string;
  halfLifeWarning: string;
  optimizedRoutine: string;
  insights: string[];
}

export default function Dashboard({ logs, profile, onAddDrink, onLogWater, onNavigate, onToggleNotifs, hasUnreadNotifs, onRemoveLog, onToggleTheme, onOpenCalculator }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('/assets/mycoffe4.mp4');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    setIsAiLoading(true);
    fetch('/api/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, logs })
    })
      .then(res => {
        if (!res.ok) throw new Error('Caffeine advisor API failed');
        return res.json();
      })
      .then(data => {
        if (data && !data.error) {
          setAiInsights(data);
        }
      })
      .catch(err => console.error('Error fetching dynamic metabolism statistics:', err))
      .finally(() => setIsAiLoading(false));
  }, [logs, profile]);
  
  const {
    todaysLogs,
    totalCaffeine,
    remaining,
    percentage,
    status,
    isWarning,
    isDanger,
    waterGlasses
  } = useMemo(() => {
    const todays = getTodaysLogs(logs);
    const total = getDailyTotal(logs);
    const rem = getRemainingLimit(total, profile.dailyLimit);
    const pct = getProgressPercentage(total, profile.dailyLimit);
    const stat = getCaffeineStatus(total, profile.dailyLimit);
    const warn = total > profile.dailyLimit * 0.8;
    const dang = total >= profile.dailyLimit;
    const water = todays.filter(l => l.drinkId === 'water').length;
    return {
      todaysLogs: todays,
      totalCaffeine: total,
      remaining: rem,
      percentage: pct,
      status: stat,
      isWarning: warn,
      isDanger: dang,
      waterGlasses: water
    };
  }, [logs, profile.dailyLimit]);

  const recommendation = useMemo(() => {
    if (isDanger) return "You've passed your limit. Avoid more caffeine today and drink plenty of water.";
    if (isWarning) return "You're close to your limit. Consider switching to water or herbal tea.";
    if (totalCaffeine === 0) return "Starting fresh! Track your first drink when you're ready.";
    return "You're doing great! You're still within your healthy range.";
  }, [isDanger, isWarning, totalCaffeine]);

  const lastLogTime = useMemo(() => {
    const lastCaffeinated = todaysLogs.find(l => l.caffeine > 0);
    return lastCaffeinated 
      ? new Date(lastCaffeinated.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'None';
  }, [todaysLogs]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 md:p-12 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-coffee-brown"
        >
          <Coffee className="w-16 h-16 opacity-20" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 pb-32 relative">
      {/* Dynamic Looping Dashboard Backdrop Video Option */}
      <div className="absolute inset-x-0 top-0 h-[260px] pointer-events-none overflow-hidden z-0">
        <video 
          src={videoUrl}
          autoPlay 
          loop 
          muted 
          playsInline 
          onError={() => setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-with-steam-close-up-15777-large.mp4')}
          className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-25 transition-opacity duration-1000"
        />
        {/* Soft elegant gradient fade to seamlessly blend into background at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-soft-white dark:to-espresso" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between mb-16 relative z-10">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-espresso dark:bg-soft-white dark:text-espresso text-soft-white rounded-2xl flex items-center justify-center shadow-2xl shadow-espresso/20">
             <Coffee className="w-8 h-8" />
           </div>
           <div>
              <h1 className="text-3xl font-display font-black text-espresso dark:text-soft-white tracking-tight">Today’s Caffeine</h1>
              <p className="text-[10px] font-bold text-espresso/30 dark:text-soft-white/40 uppercase tracking-[0.4em] mt-1">{profile.name || 'Coffee Lover'}'s Tracker</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          {onToggleTheme && (
            <button 
              onClick={onToggleTheme}
              className="p-4 rounded-[1.25rem] bg-white dark:bg-espresso border border-warm-beige/30 dark:border-white/10 text-espresso dark:text-soft-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={profile.theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {profile.theme === 'dark' ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-indigo-600" />}
            </button>
          )}
          <button 
            onClick={onToggleNotifs}
            className="p-4 rounded-[1.25rem] bg-white dark:bg-espresso border border-warm-beige/30 dark:border-white/10 text-espresso dark:text-soft-white relative hover:scale-[1.05] active:scale-95 transition-all cursor-pointer"
          >
            <Bell className="w-6 h-6" />
            {hasUnreadNotifs && <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-espresso" />}
          </button>
          <button 
            onClick={() => onNavigate('SETTINGS')}
            className="p-4 rounded-[1.25rem] bg-white dark:bg-espresso border border-warm-beige/30 dark:border-white/10 text-espresso dark:text-soft-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Left Column containing Main Progress and AI Advice */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
          {/* Main Consumption Card */}
          <div className="relative overflow-hidden bg-white dark:bg-espresso rounded-[3rem] md:rounded-[4rem] p-6 md:p-12 border border-warm-beige/30 dark:border-white/10 shadow-[0_20px_50px_-12px_rgba(111,78,55,0.15)] dark:shadow-[0_35px_80px_rgba(0,0,0,0.85)]">
             <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
                <Coffee className="w-96 h-96 dark:text-soft-white z-0" />
             </div>
             
             <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="space-y-6 md:space-y-8 flex flex-col items-center text-center md:items-start md:text-left">
                   <div className="flex flex-col items-center md:items-start">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6",
                        isDanger ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400" : isWarning ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                      )}>
                        {isDanger ? <ShieldAlert className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                        {status}
                      </div>
                      <h2 className="text-4xl md:text-5xl font-display font-black text-espresso dark:text-soft-white tracking-tight leading-[1] md:leading-[0.9]">
                        Daily <br className="hidden md:block" /> Progress
                      </h2>
                   </div>

                   <div className="bg-[#F7F3ED] dark:bg-[#1E110A] border border-[#EAD9C0]/40 dark:border-white/5 p-4 rounded-3xl relative w-full max-w-sm mt-3 shadow-sm">
                     <div className="absolute left-6 -top-2 w-4 h-4 bg-[#F7F3ED] dark:bg-[#1E110A] border-t border-l border-[#EAD9C0]/40 dark:border-white/5 rotate-45" />
                     <p className="text-xs font-semibold leading-relaxed text-espresso/80 dark:text-soft-white/80">
                       <span className="font-bold text-[#6B4E31] dark:text-[#EAD9C0] block mb-1">🐾 Barista Cat Advice:</span>
                       {recommendation}
                     </p>
                   </div>

                   <div className="flex gap-10 md:gap-12 justify-center md:justify-start">
                      <div>
                         <p className="text-[10px] font-bold text-espresso/20 dark:text-soft-white/35 uppercase tracking-widest mb-2">Total mg</p>
                         <p className="text-3xl md:text-4xl font-display font-black text-espresso dark:text-soft-white">{totalCaffeine}</p>
                      </div>
                      <div className="w-px h-16 bg-warm-beige/30 dark:bg-white/10 mt-4" />
                      <div>
                         <p className="text-[10px] font-bold text-espresso/20 dark:text-soft-white/35 uppercase tracking-widest mb-2">Remaining</p>
                         <p className="text-3xl md:text-4xl font-display font-black text-espresso dark:text-soft-white">{totalCaffeine >= profile.dailyLimit ? 0 : remaining}<span className="text-sm font-bold text-espresso/20 dark:text-soft-white/35 ml-1">mg</span></p>
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-4 justify-center md:justify-start w-full md:w-auto">
                     <button 
                      onClick={onAddDrink}
                      className="flex items-center gap-4 px-8 md:px-10 py-5 md:py-6 bg-coffee-brown text-white rounded-[2rem] font-display font-black text-lg md:text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-coffee-brown/20 group"
                     >
                       Log Drink
                       <Plus className="w-6 h-6 md:w-7 md:h-7 group-hover:rotate-90 transition-transform duration-500" />
                     </button>
                      {onOpenCalculator && (
                        <button 
                         onClick={onOpenCalculator}
                         className="flex items-center gap-3 px-6 md:px-8 py-5 md:py-6 bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-800 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30 rounded-[2rem] font-bold text-sm tracking-tight hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
                         title="Quick Caffeine Calculator"
                        >
                          <Calculator className="w-4.5 h-4.5" />
                          <span>Calculator</span>
                        </button>
                      )}
                     <button 
                      onClick={() => onNavigate('HISTORY')}
                      className="flex items-center gap-4 px-6 md:px-8 py-5 md:py-6 bg-white dark:bg-[#1E110A] border border-warm-beige/30 dark:border-white/10 text-espresso dark:text-soft-white rounded-[2rem] font-bold text-sm hover:bg-soft-white dark:hover:bg-espresso transition-all cursor-pointer"
                     >
                       Full History
                     </button>
                   </div>
                </div>

                <div className="relative flex items-center justify-center">
                   <svg viewBox="0 0 288 288" className="w-60 h-60 md:w-72 md:h-72 transform -rotate-90">
                     <circle 
                      cx="144" cy="144" r="130" 
                      className="stroke-latte-cream dark:stroke-white/10 fill-none" 
                      strokeWidth="24"
                     />
                     <motion.circle 
                      cx="144" cy="144" r="130" 
                      className={cn(
                        "fill-none transition-all duration-1000 ease-out",
                        isDanger ? "stroke-red-500" : isWarning ? "stroke-amber-500" : "stroke-caramel"
                      )}
                      strokeWidth="24"
                      strokeDasharray={816}
                      initial={{ strokeDashoffset: 816 }}
                      animate={{ strokeDashoffset: 816 - (816 * percentage) / 100 }}
                      strokeLinecap="round"
                      id="caffeine-progress-ring"
                     />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                      <span className="text-3xl mb-1 animate-bounce select-none" title="Barista Cat Reaction">
                        {percentage < 50 ? '😸' : percentage < 80 ? '😽' : percentage < 100 ? '😿' : '🙀'}
                      </span>
                      <span className="text-4xl md:text-5xl font-display font-black text-[#6B4E31] dark:text-soft-white">{Math.round(percentage)}%</span>
                      <span className="text-[9px] font-sans font-black text-[#6B4E31]/40 dark:text-soft-white/45 uppercase tracking-[0.2em]">{status}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* AI Sleep Readiness & Metabolism Insights */}
          <div className="bg-white dark:bg-[#1A0F0A] border border-warm-beige/30 dark:border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-[0_20px_50px_-12px_rgba(111,78,55,0.05)] dark:shadow-[0_25px_65px_rgba(0,0,0,0.45)] relative overflow-hidden text-left">
             {/* Accent decoration glows */}
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-caramel/10 dark:bg-caramel/25 rounded-full blur-3xl pointer-events-none" />
             <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
             
             <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-caramel/10 text-caramel rounded-2xl flex items-center justify-center font-sans">
                         <Zap className="w-6 h-6 text-caramel fill-caramel animate-pulse" />
                      </div>
                      <div>
                         <h3 className="text-xl font-display font-black text-espresso dark:text-soft-white tracking-tight">
                            Metabolism & Sleep Readiness
                         </h3>
                         <p className="text-[10px] font-bold text-indigo-500/60 dark:text-indigo-400 uppercase tracking-widest mt-0.5 font-sans">Biometric Advisory via Back-End Gemini</p>
                      </div>
                   </div>
                   <span className="px-3.5 py-1.5 bg-caramel/10 dark:bg-caramel/25 text-caramel rounded-full text-[9px] font-bold uppercase tracking-wider">
                      Dynamic Analytics
                   </span>
                </div>

                {isAiLoading ? (
                   <div className="py-12 flex flex-col items-center justify-center gap-4">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 border-4 border-caramel/20 border-t-caramel rounded-full"
                      />
                      <p className="text-xs font-bold text-espresso/30 dark:text-soft-white/45 uppercase tracking-widest animate-pulse">Computing sleep latency & clearance statistics...</p>
                   </div>
                ) : aiInsights ? (
                   <div className="space-y-6 md:space-y-8 font-sans">
                      <div className="grid md:grid-cols-2 gap-6 pt-2 font-sans">
                         <div>
                            <p className="text-[10px] font-black text-caramel dark:text-caramel uppercase tracking-widest mb-2 font-sans">Est. Metabolism Curve</p>
                            <p className="text-sm font-medium text-espresso/80 dark:text-soft-white/80 leading-relaxed bg-latte-cream/20 dark:bg-[#100805] p-4 md:p-5 rounded-[1.8rem] border border-warm-beige/10 dark:border-white/10">
                               {aiInsights.metabolismText}
                            </p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2 font-sans">Sleep Impact warning</p>
                            <p className="text-sm font-medium text-espresso/80 dark:text-soft-white/80 leading-relaxed bg-indigo-50/20 dark:bg-[#19153B] p-4 md:p-5 rounded-[1.8rem] border border-indigo-100/10 dark:border-indigo-950/30">
                               {aiInsights.halfLifeWarning}
                            </p>
                         </div>
                      </div>

                      <div className="bg-gradient-to-r from-coffee-brown to-caramel text-white p-5 md:p-6 rounded-[2rem] shadow-sm">
                         <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1.5 font-sans">Optimized Caffeine Protocol</p>
                         <p className="text-sm md:text-base font-bold leading-normal">
                            {aiInsights.optimizedRoutine}
                         </p>
                      </div>

                      {aiInsights.insights && aiInsights.insights.length > 0 && (
                         <div className="pt-6 border-t border-warm-beige/30 dark:border-white/10">
                            <p className="text-[10px] font-black text-espresso/40 dark:text-soft-white/45 uppercase tracking-widest mb-4 font-sans">Core Physiologic Factors</p>
                            <div className="grid md:grid-cols-3 gap-4 font-sans">
                               {aiInsights.insights.map((insight, index) => (
                                  <div key={index} className="bg-latte-cream/10 dark:bg-[#1E110A] hover:bg-latte-cream/20 dark:hover:bg-[#28170E] p-5 rounded-[2rem] border border-warm-beige/25 dark:border-white/10 transition-all text-left">
                                     <span className="inline-flex w-6 h-6 bg-caramel/10 text-caramel rounded-full text-xs font-bold items-center justify-center mb-3">
                                        {index + 1}
                                     </span>
                                     <p className="text-xs text-espresso/70 dark:text-soft-white/70 font-medium leading-relaxed">
                                        {insight}
                                     </p>
                                  </div>
                               ))}
                            </div>
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="py-8 text-center bg-latte-cream/10 dark:bg-[#100805] border border-warm-beige/15 dark:border-white/10 rounded-[2rem]">
                      <p className="text-xs font-bold text-espresso/30 dark:text-soft-white/45 uppercase tracking-widest">Connect back-end to render tailored physiological guidelines</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8">
            <div className="grid grid-cols-2 gap-4 md:gap-6 font-sans">
              <MiniCard 
                icon={<Clock className="w-5 h-5" />}
                label="Last Caffeine"
                value={lastLogTime}
                color="text-amber-600 dark:text-amber-400"
                bg="bg-amber-50 dark:bg-amber-950/30"
                onClick={() => onNavigate('HISTORY')}
              />
              <MiniCard 
                icon={<Flame className="w-5 h-5" />}
                label="Daily Streak"
                value={`${profile.streak} Days`}
                color="text-orange-600 dark:text-orange-400"
                bg="bg-orange-50 dark:bg-orange-950/30"
                onClick={() => onNavigate('GOALS')}
              />
              <MiniCard 
                icon={<Droplets className="w-5 h-5" />}
                label="Water Goal"
                value={`${waterGlasses} / 8`}
                color="text-blue-600 dark:text-blue-400"
                bg="bg-blue-50 dark:bg-blue-950/30"
                onClick={onLogWater}
              />
              <MiniCard 
                icon={<Moon className="w-5 h-5" />}
                label="Sleep Goal"
                value={`${profile.sleepGoal}h`}
                color="text-indigo-600 dark:text-indigo-400"
                bg="bg-indigo-50 dark:bg-indigo-950/30"
                onClick={() => onNavigate('SETTINGS')}
              />
            </div>

            <div className="bg-espresso p-10 rounded-[3rem] text-soft-white border border-white/5 relative overflow-hidden group">
               <div className="absolute inset-0 z-0">
                  <img 
                    src="/assets/mycoffe2.jpg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop';
                    }}
                    alt="Cafe workspace background"
                    className="w-full h-full object-cover opacity-20 filter brightness-50 group-hover:scale-105 transition-transform duration-[2000ms]"
                    referrerPolicy="no-referrer"
                  />
               </div>
               
               <div className="relative z-10 text-left">
                  <h3 className="text-xl font-display font-black mb-4 flex items-center gap-3">
                     <Award className="w-6 h-6 text-caramel fill-caramel" />
                     Consistency Reward
                  </h3>
                  <p className="text-soft-white/60 text-sm font-medium leading-relaxed">
                    {profile.streak >= 3 
                      ? "Congratulations! You've unlocked the \"Smart Sipper\" badge. Keep going to unlock \"Consistency King\"!" 
                      : `Stay under your limit for ${Math.max(1, 3 - profile.streak)} more day${3 - profile.streak > 1 ? 's' : ''} to earn the "Smart Sipper" badge.`}
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex -space-x-4">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-10 h-10 rounded-full border-4 border-espresso bg-white overflow-hidden shadow-xl">
                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Friend" />
                         </div>
                       ))}
                    </div>
                    <button onClick={() => onNavigate('GOALS')} className="text-xs font-bold text-caramel uppercase tracking-widest hover:text-white transition-colors">View Goals</button>
                  </div>
               </div>
            </div>

            {/* Alarm Reminder Widget */}
             <AlarmReminder logs={logs} profile={profile} />

             {/* Aesthetics & Ambient Media Status */}
            
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
         <NavCard icon={<TrendingUp className="w-6 h-6" />} label="Analytics" view="ANALYTICS" onClick={onNavigate} />
         <NavCard icon={<Calendar className="w-6 h-6" />} label="History" view="HISTORY" onClick={onNavigate} />
         <NavCard icon={<BookOpen className="w-6 h-6" />} label="Education" view="EDUCATION" onClick={onNavigate} />
         <NavCard icon={<Heart className="w-6 h-6" />} label="Goals" view="GOALS" onClick={onNavigate} />
      </div>

      {/* Recent History */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-10 px-4">
           <h3 className="text-2xl font-display font-black text-espresso dark:text-soft-white tracking-tight">Recent Drinks</h3>
           <button onClick={() => onNavigate('HISTORY')} className="text-xs font-bold text-espresso/30 dark:text-soft-white/40 uppercase tracking-widest hover:text-caramel transition-colors flex items-center gap-2 cursor-pointer">
             See History
             <ChevronRight className="w-4 h-4" />
           </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {todaysLogs.length > 0 ? (
             todaysLogs.slice(0, 3).map((log, i) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-[#1E110A] p-6 rounded-[2.5rem] border border-warm-beige/30 dark:border-white/10 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all"
                >
                   <div className="w-16 h-16 bg-latte-cream/40 dark:bg-[#140B06] rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                      {(() => {
                        if (log.drinkId === 'water') return '💧';
                        if (log.drinkId === 'espresso') return '☕';
                        if (log.drinkId.includes('tea')) return '🍵';
                        if (log.drinkId.includes('energy')) return '⚡';
                        return '☕';
                      })()}
                   </div>
                   <div className="flex-1">
                      <h4 className="font-display font-black text-espresso dark:text-soft-white">{log.name}</h4>
                      <p className="text-[10px] font-bold text-espresso/30 dark:text-soft-white/40 uppercase tracking-widest mt-1">Today • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                   <div className="flex items-center gap-3 shrink-0">
                      {log.caffeine === 0 ? (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                           <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Caffeine-Free</p>
                        </div>
                      ) : (
                        <div className="bg-soft-white dark:bg-[#140B06] px-4 py-2 rounded-2xl border border-warm-beige/20 dark:border-white/10 text-center">
                           <p className="text-sm font-black text-espresso dark:text-soft-white">{log.caffeine}</p>
                           <p className="text-[8px] font-bold text-espresso/20 dark:text-soft-white/30 uppercase">mg</p>
                        </div>
                      )}
                      {deletingId === log.id ? (
                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 p-1.5 rounded-2xl border border-red-100 dark:border-red-900/30">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveLog(log.id);
                              setDeletingId(null);
                            }}
                            className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider scale-95 hover:scale-100 transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(null);
                            }}
                            className="px-2.5 py-1.5 bg-espresso/5 dark:bg-white/10 text-espresso dark:text-soft-white rounded-xl font-bold text-[10px] uppercase tracking-wider scale-95 hover:scale-100 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(log.id);
                          }}
                          className="p-3 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/45 text-red-500 rounded-2xl border border-red-100/50 dark:border-red-950/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
                          title="Remove Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                   </div>
                </motion.div>
             ))
           ) : (
             <div className="col-span-full py-16 text-center bg-white dark:bg-[#1E110A] rounded-[3rem] border border-dashed border-warm-beige/40 dark:border-white/10">
                <div className="w-24 h-24 bg-latte-cream/40 dark:bg-[#140B06] rounded-full flex items-center justify-center mx-auto mb-6 relative hover:scale-105 transition-all">
                   <span className="text-5xl animate-bounce select-none">😴🐾</span>
                </div>
                <p className="text-[#6B4E31] dark:text-[#EAD9C0] font-black font-display text-xl mb-1">"Purr-fect sleep readiness so far!"</p>
                <p className="text-espresso/40 dark:text-soft-white/45 font-medium text-xs">You haven't logged any beverages today. Keep up the high clearance, human companion!</p>
             </div>
           )}
        </div>
      </section>

      {/* Floating Modern iOS-Style Navigation Dock/Bar for Mobile */}
      <div className="fixed bottom-6 inset-x-4 md:hidden z-50 flex justify-center">
         <div className="flex items-center justify-between gap-1 px-4 py-3 bg-white/85 dark:bg-espresso/90 backdrop-blur-xl border border-warm-beige/25 dark:border-white/10 rounded-[2rem] shadow-[0_24px_50px_-12px_rgba(44,24,16,0.3)] w-full max-w-sm safe-bottom">
            <button 
              onClick={() => onNavigate('DASHBOARD')}
              className="flex flex-col items-center justify-center gap-1 text-espresso/45 dark:text-soft-white/45 hover:text-caramel dark:hover:text-amber-400 active:scale-95 transition-all flex-1 py-1"
            >
              <Activity className="w-5 h-5 text-caramel dark:text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider scale-90">Home</span>
            </button>
            
            <button 
              onClick={() => onOpenCalculator?.()}
              className="flex flex-col items-center justify-center gap-1 text-espresso/45 dark:text-soft-white/45 hover:text-caramel dark:hover:text-amber-400 active:scale-95 transition-all flex-1 py-1"
            >
              <Calculator className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider scale-90">Calc</span>
            </button>

            {/* Main Primary Action in the Center with a custom floating bubble */}
            <div className="relative -translate-y-5 px-2">
              <button 
                onClick={onAddDrink}
                className="w-14 h-14 bg-coffee-brown dark:bg-caramel text-white rounded-full flex items-center justify-center shadow-lg shadow-coffee-brown/40 dark:shadow-caramel/30 active:scale-90 hover:scale-105 transition-all border-4 border-soft-white dark:border-espresso z-50 duration-200"
              >
                <Plus className="w-7 h-7" />
              </button>
            </div>

            <button 
              onClick={() => onNavigate('ANALYTICS')}
              className="flex flex-col items-center justify-center gap-1 text-espresso/45 dark:text-soft-white/45 hover:text-caramel dark:hover:text-amber-400 active:scale-95 transition-all flex-1 py-1"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider scale-90">Trends</span>
            </button>

            <button 
              onClick={() => onNavigate('HISTORY')}
              className="flex flex-col items-center justify-center gap-1 text-espresso/45 dark:text-soft-white/45 hover:text-caramel dark:hover:text-amber-400 active:scale-95 transition-all flex-1 py-1"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider scale-90">Logs</span>
            </button>
         </div>
      </div>
    </div>
  );
}

function MiniCard({ icon, label, value, color, bg, onClick }: { icon: React.ReactNode, label: string, value: string, color: string, bg: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "bg-white dark:bg-[#1E110A] p-6 rounded-[2.5rem] border border-warm-beige/30 dark:border-white/10 shadow-sm transition-all text-left group cursor-pointer",
        onClick && "hover:shadow-xl hover:-translate-y-1 active:scale-95"
      )}
    >
       <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <p className="text-[8px] font-bold text-espresso/30 dark:text-soft-white/40 uppercase tracking-[0.2em] mb-1">{label}</p>
       <div className="flex items-center justify-between">
          <p className="text-lg font-display font-black text-espresso dark:text-soft-white mb-0">{value}</p>
          {onClick && <Plus className="w-4 h-4 text-espresso/20 dark:text-soft-white/20 group-hover:text-espresso dark:group-hover:text-soft-white" />}
       </div>
    </button>
  );
}

function NavCard({ icon, label, view, onClick }: { icon: React.ReactNode, label: string, view: View, onClick: (v: View) => void }) {
  return (
    <button 
      onClick={() => onClick(view)}
      className="bg-white dark:bg-[#1E110A] p-8 rounded-[3rem] border border-warm-beige/30 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center gap-5 cursor-pointer"
    >
       <div className="w-14 h-14 bg-latte-cream/40 dark:bg-warm-beige/10 text-espresso/40 dark:text-soft-white/40 rounded-2xl flex items-center justify-center group-hover:bg-caramel group-hover:text-white transition-all duration-500">
         {icon}
       </div>
       <span className="text-[10px] font-bold text-espresso/40 dark:text-soft-white/50 uppercase tracking-[0.3em] group-hover:text-espresso dark:group-hover:text-soft-white transition-colors">{label}</span>
    </button>
  );
}
