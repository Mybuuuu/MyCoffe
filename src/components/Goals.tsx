import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Target, 
  Trophy, 
  Clock, 
  Zap, 
  Droplets, 
  Flame, 
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Users
} from 'lucide-react';
import { Goal, UserProfile, ConsumptionLog } from '../types';
import { cn } from '../lib/utils';

interface GoalsProps {
  goals: Goal[];
  logs?: ConsumptionLog[];
  profile?: UserProfile;
  onBack: () => void;
}

export default function Goals({ goals, logs = [], profile, onBack }: GoalsProps) {
  // Read actual profile & log states if undefined (fallback)
  const activeProfile = profile || (() => {
    const raw = localStorage.getItem('mycoffee_profile');
    return raw ? JSON.parse(raw) : { streak: 0, sleepGoal: 8 };
  })();

  const activeLogs = logs.length > 0 ? logs : (() => {
    const raw = localStorage.getItem('mycoffee_logs');
    return raw ? JSON.parse(raw) : [];
  })();

  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [isJoined, setIsJoined] = useState<boolean>(() => {
    return localStorage.getItem('mycoffee_joined_challenge') === 'true';
  });

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('mycoffee_read_articles') || '[]');
    setReadArticles(list);
  }, []);

  // Calculate badges dynamically based on user habits
  const calculatedBadges = [
    { 
      id: '1', 
      name: 'Smart Barista Cup', 
      description: 'Stay under limit for 3 days', 
      icon: <Award className="w-8 h-8" />, 
      unlocked: activeProfile.streak >= 3,
      current: activeProfile.streak,
      target: 3,
      unit: 'days under limit',
      unlockedTip: "Barista Cat approves! Your adenosine receptors are well-synchronized, human partner! 😼",
      lockedTip: "Stay under limit for 3 consecutive days to earn Barista Cat's first-class copper collar pin."
    },
    { 
      id: '2', 
      name: 'Cozy Cat Napper', 
      description: 'No caffeine after 4 PM', 
      icon: <Clock className="w-8 h-8" />, 
      // check if any caffeinated drink logs occur at/after hour 16
      unlocked: activeLogs.length > 0 && !activeLogs.some(l => l.caffeine > 0 && new Date(l.timestamp).getHours() >= 16),
      current: activeLogs.length > 0 && !activeLogs.some(l => l.caffeine > 0 && new Date(l.timestamp).getHours() >= 16) ? 1 : 0,
      target: 1,
      unit: 'late cup avoided',
      unlockedTip: "Purr-fect! No active caffeine compounds will disrupt your sweet evening cat-naps! 😴🐾",
      lockedTip: "Avoid any caffeinated drinks after 4:00 PM to help Barista Cat preserve deep sleep stage-4 cycles."
    },
    { 
      id: '3', 
      name: 'Streak Companion', 
      description: '7-day logging streak', 
      icon: <ShieldCheck className="w-8 h-8" />, 
      unlocked: activeProfile.streak >= 7,
      current: activeProfile.streak,
      target: 7,
      unit: 'days logged',
      unlockedTip: "Spectacular! You and Barista Cat have logged under-limit caffeine safely for a full week straight! 🐈🎉",
      lockedTip: "Maintain an uninterrupted 7-day logging streak with Barista Cat to optimize metabolic calibration."
    },
    { 
      id: '4', 
      name: 'Calm Sage Scholar', 
      description: 'Read all education articles', 
      icon: <Zap className="w-8 h-8" />, 
      unlocked: readArticles.length >= 4,
      current: readArticles.length,
      target: 4,
      unit: 'articles read',
      unlockedTip: "Meow! You have successfully mastered tea pharmacology, half-lives, and safe brewing! 🎓☕",
      lockedTip: "Read all 4 intelligence articles in the Academy library to unlock this wise mascot scroll."
    }
  ];

  const unlockedCount = calculatedBadges.filter(b => b.unlocked).length;

  const handleJoinChallenge = () => {
    const nextJoined = !isJoined;
    setIsJoined(nextJoined);
    localStorage.setItem('mycoffee_joined_challenge', String(nextJoined));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32 font-sans">
      <header className="mb-16">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 group px-5 py-2.5 bg-espresso text-soft-white hover:bg-caramel dark:bg-soft-white dark:text-espresso dark:hover:bg-caramel dark:hover:text-soft-white transition-all rounded-full font-sans font-black text-xs uppercase tracking-widest mb-8 shadow-md hover:scale-105 active:scale-95 duration-200 cursor-pointer w-fit"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
           <div>
              <h1 className="text-5xl font-display font-black text-espresso dark:text-soft-white tracking-tight">Wellness Goals</h1>
              <p className="text-espresso/40 dark:text-soft-white/40 font-medium mt-2">Personalized achievements & medical protocols.</p>
           </div>
           <div className="w-20 h-20 bg-caramel rounded-[2rem] flex items-center justify-center shadow-2xl shadow-caramel/20 shrink-0">
              <Trophy className="w-10 h-10 text-white" />
           </div>
        </div>
      </header>

      <div className="space-y-16">
        {/* Active Goals */}
        <section>
          <h2 className="text-xs font-bold text-espresso/20 dark:text-soft-white/30 uppercase tracking-[0.4em] mb-10 px-4">Active Goals</h2>
          <div className="grid gap-8">
            {goals.map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-espresso/50 p-10 rounded-[3.5rem] border border-warm-beige/30 dark:border-white/10 shadow-xl overflow-hidden relative group"
              >
                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-10">
                  <div className={cn(
                    "w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner shrink-0 transition-all duration-700",
                    goal.isCompleted ? "bg-emerald-500 text-white scale-110 rotate-12" : "bg-latte-cream/40 dark:bg-espresso text-espresso dark:text-soft-white"
                  )}>
                    {goal.isCompleted ? <CheckCircle2 className="w-10 h-10" /> : (
                      <>
                        {goal.icon === 'Zap' && <Zap className="w-10 h-10 text-caramel" />}
                        {goal.icon === 'Moon' && <Clock className="w-10 h-10 text-indigo-500" />}
                        {goal.icon === 'Droplets' && <Droplets className="w-10 h-10 text-blue-500" />}
                      </>
                    )}
                  </div>

                  <div className="flex-1 space-y-8">
                    <div>
                      <h3 className="text-2xl font-display font-black text-espresso dark:text-soft-white mb-2">{goal.title}</h3>
                      <p className="text-espresso/40 dark:text-soft-white/40 font-medium text-sm leading-relaxed">{goal.description}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-bold text-espresso/40 dark:text-soft-white/40 uppercase tracking-widest">
                        <span>Progress</span>
                        <span>{goal.current} / {goal.target} {goal.id === 'sleep' ? 'Sessions' : 'Days'}</span>
                      </div>
                      <div className="h-4 w-full bg-warm-beige/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            goal.isCompleted ? "bg-emerald-500" : "bg-caramel"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-center">
                    {goal.isCompleted ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-6 h-6" />
                        </span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Goal Met</span>
                      </div>
                    ) : (
                      <div className="text-center bg-latte-cream/20 dark:bg-espresso px-6 py-4 rounded-3xl border border-warm-beige/10">
                         <p className="text-2xl font-display font-black text-espresso dark:text-soft-white">{Math.round((goal.current / goal.target) * 100)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Achievement Badges */}
        <section>
          <div className="flex items-center justify-between mb-10 px-4">
            <h2 className="text-xs font-bold text-espresso/20 dark:text-soft-white/30 uppercase tracking-[0.4em]">Achievements</h2>
            <div className="flex items-center gap-2 text-caramel">
               <Sparkles className="w-4 h-4 fill-caramel text-caramel" />
               <span className="text-xs font-bold uppercase tracking-widest">{unlockedCount} of 4 Unlocked</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {calculatedBadges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  onClick={() => setSelectedBadge(badge)}
                  className={cn(
                    "bg-white dark:bg-espresso/50 p-8 rounded-[3rem] border border-warm-beige/30 dark:border-white/10 shadow-sm flex flex-col items-center text-center gap-6 group hover:shadow-xl hover:border-caramel/30 hover:-translate-y-1 transition-all cursor-pointer",
                    !badge.unlocked && "opacity-65"
                  )}
                >
                   <div className={cn(
                     "w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-lg transition-all duration-700",
                     badge.unlocked ? "bg-espresso dark:bg-soft-white text-caramel dark:text-espresso group-hover:scale-110" : "bg-latte-cream/40 dark:bg-espresso text-espresso/20 dark:text-soft-white/10"
                   )}>
                      {badge.unlocked ? badge.icon : <Lock className="w-8 h-8 text-espresso/30 dark:text-soft-white/20" />}
                   </div>
                   <div>
                      <h4 className={cn("text-lg font-display font-black mb-1 text-espresso dark:text-soft-white")}>
                        {badge.name}
                      </h4>
                      <p className="text-[10px] font-medium text-espresso/40 dark:text-soft-white/40 leading-tight">
                        {badge.unlocked ? "Unlocked ✅" : 'Locked 🔒'}
                      </p>
                      <div className="mt-4 text-left w-full max-w-xs space-y-1 bg-latte-cream/20 dark:bg-espresso/40 p-3 rounded-2xl border border-warm-beige/10">
                         <div className="flex justify-between text-[8px] font-bold text-espresso/40 dark:text-soft-white/40 uppercase">
                           <span>Progress</span>
                           <span>{badge.current}/{badge.target}</span>
                         </div>
                         <div className="w-full h-1 bg-warm-beige/20 rounded-full overflow-hidden">
                           <div className="h-full bg-caramel" style={{ width: `${Math.min(1, badge.current / badge.target) * 100}%` }} />
                         </div>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </section>

        {/* Global Challenge - NOW FULLY ACTIONABLE! */}
        <section className="bg-espresso p-12 rounded-[4.5rem] text-soft-white border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-45 transition-all duration-1000">
             <Flame className="w-48 h-48 text-white" />
           </div>
           
           <div className="max-w-md relative z-10 text-left">
              <span className="inline-block px-4 py-1.5 bg-caramel/20 text-caramel rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-caramel/30">
                ⭐ Community Event
              </span>
              <h3 className="text-3xl font-display font-black mb-4">Elite 30-Day Challenge</h3>
              <p className="text-soft-white/60 font-medium leading-relaxed mb-10 text-sm">Join 12,400+ health professionals and operators in our 30-day consistency audit. Earn exclusive metallic decals and deep metabolic reports.</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                 <div className="flex -space-x-4 shrink-0">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-espresso bg-white overflow-hidden shadow-xl shrink-0">
                         <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt="User" />
                      </div>
                    ))}
                 </div>
                 
                 <button 
                   onClick={handleJoinChallenge}
                   className={cn(
                     "px-10 py-5 rounded-2xl font-display font-black text-sm transition-all focus:outline-none shrink-0 w-full sm:w-auto",
                     isJoined 
                       ? "bg-transparent border border-emerald-500 text-emerald-400 font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20" 
                       : "bg-caramel text-espresso hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                   )}
                 >
                   {isJoined ? (
                     <>
                       Joined Challenge ✅
                     </>
                   ) : (
                     "Join Program"
                   )}
                 </button>
              </div>
           </div>
        </section>
      </div>

      {/* Badge Information Modal Popup */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white dark:bg-espresso max-w-md w-full rounded-[3.5rem] p-10 border border-warm-beige/30 dark:border-white/10 shadow-2xl relative z-10 text-center space-y-8"
            >
              <button 
                onClick={() => setSelectedBadge(null)}
                className="absolute top-6 right-6 p-3 rounded-full bg-soft-white dark:bg-white/5 text-espresso dark:text-soft-white hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>

              <div className={cn(
                "w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-xl mx-auto border border-warm-beige/10",
                selectedBadge.unlocked ? "bg-espresso text-caramel dark:bg-soft-white dark:text-espresso" : "bg-latte-cream/40 text-espresso/20"
              )}>
                {selectedBadge.unlocked ? selectedBadge.icon : <Lock className="w-10 h-10" />}
              </div>

              <div className="space-y-3">
                 <h3 className="text-3xl font-display font-black text-espresso dark:text-soft-white">{selectedBadge.name}</h3>
                 <p className="text-xs font-bold text-caramel uppercase tracking-widest">
                   {selectedBadge.unlocked ? "Achievement Unlocked 🏆" : "Locked Block 🔒"}
                 </p>
              </div>

              <div className="space-y-4 py-4 bg-latte-cream/10 dark:bg-white/5 rounded-3xl p-6 border border-warm-beige/10">
                 <p className="text-sm font-semibold text-espresso dark:text-soft-white leading-relaxed">
                   {selectedBadge.unlocked ? selectedBadge.unlockedTip : selectedBadge.lockedTip}
                 </p>
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-espresso/40 dark:text-soft-white/40 uppercase">
                       <span>Progress</span>
                       <span>{selectedBadge.current} / {selectedBadge.target} {selectedBadge.unit}</span>
                    </div>
                    <div className="w-full h-1.5 bg-warm-beige/20 dark:bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-caramel" style={{ width: `${Math.min(1, selectedBadge.current / selectedBadge.target) * 100}%` }} />
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setSelectedBadge(null)}
                className="w-full py-5 bg-coffee-brown text-white rounded-3xl font-bold font-sans text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {selectedBadge.unlocked ? 'Sensational' : 'I Understand'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
