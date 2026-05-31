import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calculator, 
  Coffee, 
  Zap, 
  Activity, 
  Clock, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  CheckCircle2,
  ListPlus
} from 'lucide-react';
import { UserProfile, ConsumptionLog } from '../types';
import { cn } from '../lib/utils';

interface CaffeineCalculatorModalProps {
  onClose: () => void;
  profile: UserProfile;
  currentLogs: ConsumptionLog[];
  onLogTempDrinks?: (drinks: { name: string; caffeine: number }[]) => void;
}

interface DraftDrink {
  id: string;
  name: string;
  caffeine: number;
}

const QUICK_PRESETS = [
  { id: 'espresso', name: 'Espresso Shot', caffeine: 64, icon: '☕' },
  { id: 'brewed_coffee', name: 'Brewed Coffee', caffeine: 95, icon: '☕' },
  { id: 'sweet_latte', name: 'Sweet Café Latte', caffeine: 85, icon: '🥤' },
  { id: 'matcha', name: 'Green Tea / Matcha', caffeine: 35, icon: '🍵' },
  { id: 'energy_drink', name: 'Energy Drink', caffeine: 80, icon: '⚡' },
];

export default function CaffeineCalculatorModal({ 
  onClose, 
  profile, 
  currentLogs,
  onLogTempDrinks 
}: CaffeineCalculatorModalProps) {
  const [draftDrinks, setDraftDrinks] = useState<DraftDrink[]>([]);
  const [customName, setCustomName] = useState('');
  const [customCaffeine, setCustomCaffeine] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const isFocusOnInput = document.activeElement?.tagName === 'INPUT';
        if (!isFocusOnInput && draftDrinks.length > 0 && onLogTempDrinks && !isSuccessMessage) {
          e.preventDefault();
          handleLogAll();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalEnter);
    return () => window.removeEventListener('keydown', handleGlobalEnter);
  }, [draftDrinks, onLogTempDrinks, isSuccessMessage]);

  // Calculate current caffeine total for today
  const currentTotal = useMemo(() => {
    const today = new Date().toDateString();
    return currentLogs
      .filter(log => new Date(log.timestamp).toDateString() === today)
      .reduce((sum, log) => sum + log.caffeine, 0);
  }, [currentLogs]);

  // Calculate draft addition total
  const addedTotal = useMemo(() => {
    return draftDrinks.reduce((sum, item) => sum + item.caffeine, 0);
  }, [draftDrinks]);

  // Projected total caffeine intake
  const projectedTotal = currentTotal + addedTotal;

  // Comparison metrics
  const dailyLimit = profile.dailyLimit || 400;
  const currentPercentage = Math.min(100, (currentTotal / dailyLimit) * 100);
  const projectedPercentage = Math.min(100, (projectedTotal / dailyLimit) * 100);
  const isOverLimit = projectedTotal > dailyLimit;
  const isCloseToLimit = projectedTotal > dailyLimit * 0.8 && !isOverLimit;

  // Custom advice depending on projection
  const { statusText, statusColor, textDesc, bgCard } = useMemo(() => {
    if (addedTotal === 0) {
      return {
        statusText: "Simulator Ready",
        statusColor: "text-espresso dark:text-soft-white",
        bgCard: "bg-latte-cream/20 dark:bg-white/5 border-warm-beige/30 dark:border-white/10",
        textDesc: "Add draft beverages below to project your prospective daily caffeine total without affecting permanent history logs."
      };
    }
    if (isOverLimit) {
      return {
        statusText: "Daily Limit Exceeded!",
        statusColor: "text-red-600 dark:text-red-400",
        bgCard: "bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30",
        textDesc: `This projection will put you at ${projectedTotal}mg caffeine, exceeding your personalized daily safe threshold of ${dailyLimit}mg. Higher risks of sleep cycle disruption, restlessness, or increased heart rate.`
      };
    }
    if (isCloseToLimit) {
      return {
        statusText: "Approaching Safe Limit",
        statusColor: "text-amber-600 dark:text-amber-400",
        bgCard: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
        textDesc: `You are in the high-dosage caution zone (${Math.round(projectedPercentage)}% of limit). We strongly advise avoiding additional caffeinated drinks after this.`
      };
    }
    return {
      statusText: "Intake Comfortably Safe",
      statusColor: "text-emerald-600 dark:text-emerald-400",
      bgCard: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-950/30",
      textDesc: `Your projected intake remains within your custom safe threshold guidelines. Focus and cognitive clarity will be supported without overcharging your bio-metabolism.`
    };
  }, [addedTotal, isOverLimit, isCloseToLimit, projectedTotal, dailyLimit, projectedPercentage]);

  // Half-life estimation based on current time
  const estClearanceTime = useMemo(() => {
    if (addedTotal === 0) return null;
    const now = new Date();
    // Caffeine half-life is typically 5 hours
    const halfLifeHours = 5;
    const peakHour = 1; // Peaks in 45-60 mins
    
    const peakTime = new Date(now.getTime() + peakHour * 60 * 60 * 1000);
    const halfLifeTime = new Date(now.getTime() + (peakHour + halfLifeHours) * 60 * 60 * 1000);
    
    return {
      peak: peakTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      half: halfLifeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }, [addedTotal]);

  const handleAddPreset = (preset: typeof QUICK_PRESETS[0]) => {
    const newItem: DraftDrink = {
      id: `draft-${Date.now()}-${Math.random()}`,
      name: preset.name,
      caffeine: preset.caffeine,
    };
    setDraftDrinks(prev => [...prev, newItem]);
  };

  const handleAddCustom = () => {
    const caffeineVal = parseInt(customCaffeine);
    if (!customName || isNaN(caffeineVal) || caffeineVal <= 0) return;

    const newItem: DraftDrink = {
      id: `draft-${Date.now()}`,
      name: customName,
      caffeine: caffeineVal,
    };

    setDraftDrinks(prev => [...prev, newItem]);
    setCustomName('');
    setCustomCaffeine('');
  };

  const handleRemoveDraft = (id: string) => {
    setDraftDrinks(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAllDrafts = () => {
    setDraftDrinks([]);
  };

  const handleLogAll = () => {
    if (draftDrinks.length === 0 || !onLogTempDrinks) return;
    onLogTempDrinks(draftDrinks.map(d => ({ name: d.name, caffeine: d.caffeine })));
    setIsSuccessMessage(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // SVG parameters for progress comparison ring
  const strokeDash = 565; // Circle perimeter with r=90

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      id="calculator-modal-backdrop"
      className="fixed inset-0 bg-espresso/80 backdrop-blur-md z-[200] flex items-end md:items-center justify-center p-0 md:p-6"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        id="calculator-modal-content"
        className="bg-soft-white dark:bg-espresso w-full max-w-3xl h-[95vh] md:h-auto md:max-h-[95vh] rounded-t-[4rem] md:rounded-[4rem] overflow-hidden flex flex-col relative shadow-2xl border border-warm-beige/20 dark:border-white/5"
      >
        {isSuccessMessage && (
          <div className="absolute inset-0 bg-white dark:bg-espresso z-[250] flex flex-col items-center justify-center text-center p-12">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-4xl font-display font-black text-espresso dark:text-soft-white mb-2">Logs Applied!</h2>
            <p className="text-espresso/40 dark:text-soft-white/45 font-medium tracking-tight">Draft calculations successfully saved to your coffee journal.</p>
          </div>
        )}

        {/* Header */}
        <div className="px-8 py-6 md:p-10 border-b border-warm-beige/20 dark:border-white/5 flex items-center justify-between bg-white dark:bg-espresso relative z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-espresso dark:text-soft-white tracking-tight">Caffeine Quick Calculator</h2>
              <p className="text-[10px] font-bold text-espresso/40 dark:text-soft-white/45 uppercase tracking-wider">Scratchpad & Daily Intake Projection</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 rounded-2xl bg-latte-cream dark:bg-white/5 text-espresso/40 dark:text-soft-white/50 hover:text-espresso dark:hover:text-soft-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          {/* Main projection view card */}
          <div className="grid md:grid-cols-12 gap-8 items-center bg-white dark:bg-espresso-dark border border-warm-beige/30 dark:border-white/5 p-6 md:p-10 rounded-[3rem] shadow-sm">
            {/* Round metrics comparison circle */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 md:w-52 md:h-52 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {/* Empty Ring placeholder */}
                  <circle 
                    cx="100" cy="100" r="90" 
                    className="stroke-latte-cream dark:stroke-white/5 fill-none" 
                    strokeWidth="16"
                  />
                  {/* Current Daily Tracker Ring */}
                  <circle 
                    cx="100" cy="100" r="90" 
                    className="stroke-amber-600/30 dark:stroke-amber-400/20 fill-none" 
                    strokeWidth="16"
                    strokeDasharray={strokeDash}
                    strokeDashoffset={strokeDash - (strokeDash * currentPercentage) / 100}
                    strokeLinecap="round"
                  />
                  {/* Projected total intake highlight ring */}
                  <motion.circle 
                    cx="100" cy="100" r="90" 
                    className={cn(
                      "fill-none transition-all duration-1000 ease-out",
                      isOverLimit ? "stroke-red-500" : isCloseToLimit ? "stroke-amber-500" : "stroke-caramel"
                    )}
                    strokeWidth="16"
                    strokeDasharray={strokeDash}
                    initial={{ strokeDashoffset: strokeDash }}
                    animate={{ strokeDashoffset: strokeDash - (strokeDash * projectedPercentage) / 100 }}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Central Labels */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-espresso/40 dark:text-soft-white/45 uppercase tracking-wide">Projected</span>
                  <span className="text-4xl font-display font-black text-espresso dark:text-soft-white leading-none my-1">{projectedTotal}</span>
                  <span className="text-[10px] font-bold text-espresso/45 dark:text-soft-white/40 uppercase tracking-widest">mg / {dailyLimit}mg</span>
                </div>
              </div>

              <div className="flex gap-6 mt-4 justify-center text-xs font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-600/30" />
                  <span className="text-espresso/60 dark:text-soft-white/60">Logged: {currentTotal}mg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-3 h-3 rounded", isOverLimit ? "bg-red-500" : isCloseToLimit ? "bg-amber-500" : "bg-caramel")} />
                  <span className="text-espresso/60 dark:text-soft-white/60">Draft: +{addedTotal}mg</span>
                </div>
              </div>
            </div>

            {/* Projection Feedback / Clearance stats */}
            <div className="md:col-span-7 space-y-5 text-left">
              <div className={cn("p-5 rounded-[2rem] border transition-colors leading-relaxed", bgCard)}>
                <div className="flex items-center gap-2 mb-2">
                  {isOverLimit ? (
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  ) : (
                    <Activity className="w-5 h-5 text-caramel" />
                  )}
                  <span className={cn("font-display font-black text-sm uppercase tracking-wide", statusColor)}>
                    {statusText}
                  </span>
                </div>
                <p className="text-xs font-medium text-espresso/70 dark:text-soft-white/70">
                  {textDesc}
                </p>
              </div>

              {addedTotal > 0 && estClearanceTime && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-latte-cream/10 dark:bg-white/5 p-4 rounded-[1.5rem] border border-warm-beige/20 dark:border-white/5">
                    <p className="text-[8px] font-bold text-espresso/35 dark:text-soft-white/40 uppercase tracking-widest mb-1.5">Estimated Peak Effect</p>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span className="text-base font-display font-black text-espresso dark:text-soft-white">{estClearanceTime.peak}</span>
                    </div>
                  </div>
                  <div className="bg-latte-cream/10 dark:bg-white/5 p-4 rounded-[1.5rem] border border-warm-beige/20 dark:border-white/5">
                    <p className="text-[8px] font-bold text-espresso/35 dark:text-soft-white/40 uppercase tracking-widest mb-1.5">Half-Life Clearance</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span className="text-base font-display font-black text-espresso dark:text-soft-white">{estClearanceTime.half}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Preset Picker */}
          <div className="space-y-4 text-left">
            <h3 className="text-xs font-bold text-espresso/30 dark:text-soft-white/40 uppercase tracking-widest pl-2">Quick Beverage Presets</h3>
            <div className="flex flex-wrap gap-3">
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleAddPreset(preset)}
                  className="flex items-center gap-2.5 px-5 py-3.5 bg-white dark:bg-espresso border border-warm-beige/30 dark:border-white/10 rounded-[1.5rem] text-xs font-medium text-espresso dark:text-soft-white hover:border-caramel/40 dark:hover:border-caramel/40 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  <span className="text-base">{preset.icon}</span>
                  <span className="font-bold">{preset.name}</span>
                  <span className="text-[10px] text-espresso/40 dark:text-soft-white/40 font-mono pl-1">+{preset.caffeine}mg</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form and Draft List Row */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Custom Drink Addition Fields */}
            <div className="space-y-4 text-left bg-white dark:bg-espresso-dark border border-warm-beige/30 dark:border-white/5 p-6 rounded-[2.5rem] shadow-sm">
              <h3 className="text-base font-display font-black text-espresso dark:text-soft-white tracking-tight">Custom Drink Input</h3>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCustom();
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-espresso/40 dark:text-soft-white/40 uppercase tracking-widest pl-2">Beverage Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Honey Latte"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-soft-white dark:bg-espresso/50 border border-warm-beige/25 dark:border-white/10 focus:border-caramel/40 outline-none font-bold text-xs text-espresso dark:text-soft-white dark:placeholder:text-soft-white/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-espresso/40 dark:text-soft-white/40 uppercase tracking-widest pl-2">Caffeine Content (mg)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 140"
                    value={customCaffeine}
                    onChange={(e) => setCustomCaffeine(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-soft-white dark:bg-espresso/50 border border-warm-beige/25 dark:border-white/10 focus:border-caramel/40 outline-none font-bold text-xs text-espresso dark:text-soft-white dark:placeholder:text-soft-white/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!customName || !customCaffeine}
                  className="w-full py-4 bg-espresso dark:bg-soft-white text-soft-white dark:text-espresso rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Add to Simulation
                </button>
              </form>
            </div>

            {/* List of Simulated Drinks */}
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between pl-2">
                <h3 className="text-base font-display font-black text-espresso dark:text-soft-white tracking-tight">
                  Simulated Drinks ({draftDrinks.length})
                </h3>
                {draftDrinks.length > 0 && (
                  <button 
                    onClick={handleClearAllDrafts}
                    className="text-[9px] font-bold text-red-500 hover:text-red-600 uppercase tracking-wider bg-transparent outline-none border-none cursor-pointer"
                  >
                    Clear Drafts
                  </button>
                )}
              </div>

              <div className="bg-white dark:bg-espresso-dark border border-warm-beige/30 dark:border-white/5 rounded-[2.5rem] p-5 h-[230px] overflow-y-auto space-y-3 flex flex-col justify-start">
                <AnimatePresence initial={false}>
                  {draftDrinks.length > 0 ? (
                    draftDrinks.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 10 }}
                        className="flex items-center justify-between p-4 bg-soft-white dark:bg-espresso/30 rounded-2xl border border-warm-beige/20 dark:border-white/5 overflow-hidden"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-caramel/10 text-caramel flex items-center justify-center font-display font-black text-[10px]">
                            ☕
                          </div>
                          <div>
                            <span className="font-bold text-xs text-espresso dark:text-soft-white block">
                              {item.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-xs font-bold text-espresso/70 dark:text-soft-white/70">
                            +{item.caffeine} mg
                          </span>
                          <button
                            onClick={() => handleRemoveDraft(item.id)}
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all cursor-pointer md:opacity-80 md:hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-espresso/35 dark:text-soft-white/30">
                      <ListPlus className="w-8 h-8 mb-3 opacity-30" />
                      <p className="text-xs font-medium">Draft is empty.</p>
                      <p className="text-[10px] opacity-75 mt-1">Select a preset above or add a custom beverage to initiate simulation projection.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-8 py-6 md:p-8 border-t border-warm-beige/20 dark:border-white/5 bg-white dark:bg-espresso-dark flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <p className="text-[11px] text-espresso/40 dark:text-soft-white/40 text-center sm:text-left leading-normal font-medium">
            * Simulated drinks do not affect your permanent logs unless committed to history.
          </p>
          
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-4 rounded-2xl border border-warm-beige/30 dark:border-white/10 text-espresso dark:text-soft-white hover:bg-latte-cream dark:hover:bg-espresso transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Dismiss Calculator
            </button>
            {onLogTempDrinks && draftDrinks.length > 0 && (
              <button
                onClick={handleLogAll}
                className="flex-1 sm:flex-none px-8 py-4 rounded-2xl bg-coffee-brown text-white hover:scale-105 active:scale-95 transition-all font-display font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                Commit to History Log
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
