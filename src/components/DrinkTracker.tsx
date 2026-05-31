import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Coffee, Zap, Leaf, Check, ChevronRight, Clock, Moon, Sparkles, Star, Plus } from 'lucide-react';
import { DRINK_DATABASE, DrinkType, ConsumptionLog } from '../types';
import { cn } from '../lib/utils';

interface DrinkTrackerProps {
  onClose: () => void;
  onLog: (log: ConsumptionLog) => void;
  customDrinks: DrinkType[];
  onAddCustomDrink: (drink: DrinkType) => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All Drinks', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'Coffee', name: 'Coffee', icon: <Coffee className="w-4 h-4" /> },
  { id: 'Tea', name: 'Tea', icon: <Leaf className="w-4 h-4" /> },
  { id: 'Energy', name: 'Energy', icon: <Zap className="w-4 h-4" /> },
  { id: 'Custom', name: 'Saved', icon: <Star className="w-4 h-4" /> },
];

const SIZES = [
  { id: 'S', name: 'Small', multiplier: 0.8, volume: '8oz' },
  { id: 'M', name: 'Medium', multiplier: 1, volume: '12oz' },
  { id: 'L', name: 'Large', multiplier: 1.5, volume: '16oz' },
];

export default function DrinkTracker({ onClose, onLog, customDrinks, onAddCustomDrink }: DrinkTrackerProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedDrink, setSelectedDrink] = useState<DrinkType | null>(null);
  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customDrinkName, setCustomDrinkName] = useState('');
  const [customDrinkCaffeine, setCustomDrinkCaffeine] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDrink && scrollContainerRef.current) {
      setTimeout(() => {
        const logPanel = scrollContainerRef.current?.querySelector('.log-drink-panel');
        if (logPanel) {
          logPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          const activeItem = scrollContainerRef.current?.querySelector('.border-caramel');
          if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }, 180);
    }
  }, [selectedDrink]);

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (showCustomForm) return;
        if (selectedDrink && !isSuccess) {
          e.preventDefault();
          handleLog();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalEnter);
    return () => window.removeEventListener('keydown', handleGlobalEnter);
  }, [selectedDrink, selectedSize, showCustomForm, isSuccess]);

  const combinedDatabase = useMemo(() => [...DRINK_DATABASE, ...customDrinks], [customDrinks]);

  const filteredDrinks = useMemo(() => {
    return combinedDatabase.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = category === 'all' || 
                         (category === 'Custom' ? customDrinks.some(cd => cd.id === d.id) : d.category === category);
      return matchesSearch && matchesCat;
    });
  }, [search, category, combinedDatabase, customDrinks]);

  const handleCreateCustom = () => {
    if (!customDrinkName || !customDrinkCaffeine) return;
    const newDrink: DrinkType = {
      id: `custom-${Date.now()}`,
      name: customDrinkName,
      baseCaffeine: Number(customDrinkCaffeine),
      icon: '✨',
      category: 'Other'
    };
    onAddCustomDrink(newDrink);
    setShowCustomForm(false);
    setCustomDrinkName('');
    setCustomDrinkCaffeine('');
    setCategory('Custom');
  };

  const handleLog = () => {
    if (!selectedDrink) return;
    
    const log: ConsumptionLog = {
      id: Math.random().toString(36).substr(2, 9),
      drinkId: selectedDrink.id,
      name: selectedDrink.name,
      caffeine: Math.round(selectedDrink.baseCaffeine * selectedSize.multiplier),
      timestamp: new Date(),
      size: selectedSize.name,
    };
    
    setIsSuccess(true);
    setTimeout(() => {
      onLog(log);
      onClose();
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-espresso/80 backdrop-blur-md z-[200] flex items-end md:items-center justify-center p-0 md:p-6 overflow-y-auto"
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-soft-white dark:bg-espresso w-full max-w-2xl h-[680px] max-h-[90vh] md:max-h-[82vh] rounded-t-[2.5rem] md:rounded-[4rem] overflow-y-auto flex flex-col relative shadow-2xl"
      >
        <AnimatePresence>
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white dark:bg-espresso z-[250] overflow-y-auto premium-scrollbar"
            >
              <div className="min-h-full w-full flex flex-col items-center justify-center text-center p-6 sm:p-12">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="w-16 h-16 sm:w-24 sm:h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-xl shadow-emerald-500/20"
                >
                  <Check className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl sm:text-4xl font-display font-black text-espresso dark:text-soft-white mb-2">Drink Logged!</h2>
                <p className="text-espresso/40 dark:text-soft-white/45 font-medium text-xs sm:text-base tracking-tight">Your caffeine status has been updated.</p>
              </div>
            </motion.div>
          )}

          {showCustomForm && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-[240] bg-white dark:bg-espresso overflow-y-auto premium-scrollbar"
            >
              <div className="min-h-full w-full flex flex-col items-center justify-center p-6 sm:p-12 text-center relative">
                <button 
                  onClick={() => setShowCustomForm(false)}
                  className="absolute top-4 right-4 sm:top-10 sm:right-10 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-soft-white dark:bg-white/5 text-espresso/20 dark:text-soft-white/30 hover:text-espresso dark:hover:text-soft-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 sm:w-6 h-6" />
                </button>
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-caramel/10 text-caramel rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-8">
                  <Sparkles className="w-6 h-6 sm:w-10 sm:h-10 animate-pulse" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-black text-espresso dark:text-soft-white mb-4 sm:mb-8">Create Custom Drink</h2>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateCustom();
                  }}
                  className="w-full max-w-sm space-y-4 sm:space-y-6"
                >
                  <div className="space-y-1.5 sm:space-y-2 text-left">
                    <label className="text-[9px] sm:text-[10px] font-bold text-espresso/40 dark:text-soft-white/40 uppercase tracking-widest pl-3 sm:pl-4">Drink Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Extra Strong Brew"
                      value={customDrinkName}
                      onChange={(e) => setCustomDrinkName(e.target.value)}
                      className="w-full px-6 py-4 sm:px-8 sm:py-6 rounded-xl sm:rounded-[2rem] bg-soft-white dark:bg-espresso/50 border border-warm-beige/20 dark:border-white/10 focus:border-caramel/40 outline-none font-bold text-sm sm:text-base text-espresso dark:text-soft-white dark:placeholder:text-soft-white/20"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 text-left">
                    <label className="text-[9px] sm:text-[10px] font-bold text-espresso/40 dark:text-soft-white/40 uppercase tracking-widest pl-3 sm:pl-4">Caffeine (mg)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 150"
                      value={customDrinkCaffeine}
                      onChange={(e) => setCustomDrinkCaffeine(e.target.value)}
                      className="w-full px-6 py-4 sm:px-8 sm:py-6 rounded-xl sm:rounded-[2rem] bg-soft-white dark:bg-espresso/50 border border-warm-beige/20 dark:border-white/10 focus:border-caramel/40 outline-none font-bold text-sm sm:text-base text-espresso dark:text-soft-white dark:placeholder:text-soft-white/20"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 sm:py-6 md:py-7 rounded-xl sm:rounded-[2rem] bg-caramel text-white font-display font-black text-base sm:text-xl shadow-xl shadow-caramel/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Save & Select
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 sm:p-5 md:p-6 border-b border-warm-beige/30 dark:border-white/10 bg-white/50 dark:bg-espresso/60 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-display font-black text-espresso dark:text-soft-white tracking-tight">Add Caffeine</h2>
              <p className="text-[9px] sm:text-[10px] font-bold text-espresso/30 dark:text-soft-white/40 uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-0.5 sm:mt-1">What are you drinking?</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={() => setShowCustomForm(true)}
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-caramel/10 text-caramel font-bold text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 hover:bg-caramel/20 transition-all border border-caramel/10 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Custom
              </button>
              <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-soft-white dark:bg-white/5 hover:bg-warm-beige/20 dark:hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-espresso/20 dark:text-soft-white/30" />
              </button>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="relative group">
              <Search className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/20 group-focus-within:text-caramel transition-colors" />
              <input 
                type="text"
                placeholder="Search compounds..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-4 sm:pr-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-white dark:bg-espresso/60 border border-warm-beige/30 dark:border-white/10 focus:border-caramel/40 outline-none transition-all font-bold text-xs sm:text-sm text-espresso dark:text-soft-white placeholder:text-espresso/10 dark:placeholder:text-soft-white/20"
              />
            </div>

            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 premium-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all border cursor-pointer",
                    category === cat.id 
                      ? "bg-coffee-brown border-coffee-brown text-white shadow-md shadow-coffee-brown/10" 
                      : "bg-white dark:bg-white/5 border-warm-beige/20 dark:border-white/5 text-espresso/40 dark:text-soft-white/45 hover:border-caramel/30"
                  )}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto premium-scrollbar min-h-0 flex flex-col justify-between"
        >
          <div className="p-4 sm:p-5 md:p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 flex-shrink-0">
            {filteredDrinks.map(drink => (
              <button
                key={drink.id}
                onClick={() => setSelectedDrink(drink)}
                className={cn(
                  "p-3 sm:p-4 md:p-5 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center text-center group relative cursor-pointer",
                  selectedDrink?.id === drink.id 
                    ? "bg-white dark:bg-espresso/50 border-caramel shadow-xl scale-[1.03]" 
                    : "bg-white/50 dark:bg-white/5 border-warm-beige/10 dark:border-white/5 hover:border-warm-beige/40"
                )}
              >
                <div className={cn(
                  "w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3 md:mb-4 transition-all duration-700",
                  selectedDrink?.id === drink.id ? "bg-caramel text-white rotate-12" : "bg-latte-cream/40 dark:bg-white/10"
                )}>
                  {drink.icon}
                </div>
                <p className="font-display font-black text-espresso dark:text-soft-white text-xs sm:text-sm md:text-base mb-1 line-clamp-1 sm:line-clamp-none">{drink.name}</p>
                {drink.baseCaffeine === 0 ? (
                  <p className="text-[7.5px] sm:text-[9px] font-bold text-emerald-600 uppercase tracking-[0.1em] sm:tracking-[0.15em]">Caffeine-Free</p>
                ) : (
                  <p className="text-[7.5px] sm:text-[9px] font-bold text-espresso/20 dark:text-soft-white/35 uppercase tracking-[0.1em] sm:tracking-[0.15em]">{drink.baseCaffeine}mg base</p>
                )}
                
                {selectedDrink?.id === drink.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute top-3 right-3 sm:top-4 sm:right-4"
                  >
                     <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-caramel flex items-center justify-center shadow-lg shadow-caramel/20">
                       <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white" />
                     </div>
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedDrink && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="log-drink-panel mt-auto bg-white dark:bg-espresso border-t border-warm-beige/30 dark:border-white/10 shadow-[0_-15px_45px_rgba(0,0,0,0.08)] relative z-10 overflow-hidden flex-shrink-0"
              >
                <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 sm:gap-6 md:gap-8">
                    <div className="flex-1 w-full space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[9px] sm:text-[10px] font-bold text-espresso/40 dark:text-soft-white/40 uppercase tracking-widest">Select Size</span>
                        <span className="text-base sm:text-lg font-display font-black text-espresso dark:text-soft-white">
                          {selectedDrink.baseCaffeine === 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">Caffeine-Free</span>
                          ) : (
                            `${Math.round(selectedDrink.baseCaffeine * selectedSize.multiplier)}mg`
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-soft-white dark:bg-white/5 rounded-xl sm:rounded-2xl border border-warm-beige/20 dark:border-white/5 shadow-inner">
                        {SIZES.map(size => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedSize(size)}
                            className={cn(
                              "py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex flex-col items-center cursor-pointer",
                              selectedSize.id === size.id 
                                ? "bg-white dark:bg-espresso/50 text-caramel shadow-md border border-warm-beige/10 dark:border-white/5" 
                                : "text-espresso/30 dark:text-soft-white/45 opacity-60 hover:opacity-100 hover:scale-105"
                            )}
                          >
                            <span>{size.name}</span>
                            <span className="text-[8px] sm:text-[9px] opacity-40 font-medium">{size.volume}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 w-full flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 p-3 sm:p-4 bg-latte-cream/40 dark:bg-white/5 rounded-2xl border border-warm-beige/25 dark:border-white/5 flex-1">
                        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-espresso/30 dark:text-soft-white/40 animate-pulse" />
                        <div className="text-left">
                           <p className="text-[8px] sm:text-[10px] font-bold text-espresso/30 dark:text-soft-white/40 uppercase tracking-widest">Sleep Impact</p>
                           <p className="text-[10.5px] sm:text-xs font-bold text-espresso dark:text-soft-white">
                             {selectedDrink.baseCaffeine === 0 ? "Safe for Bedtime" : "~9.4h clearance"}
                           </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleLog}
                        className="flex-[2] py-3.5 sm:py-5 rounded-2xl bg-coffee-brown text-white font-display font-black text-xs sm:text-sm md:text-base flex items-center justify-center gap-1.5 sm:gap-2.5 hover:scale-[1.03] active:scale-[0.97] transition-all premium-shadow group shadow-coffee-brown/30 cursor-pointer"
                      >
                        Log Drink
                        <ChevronRight className="w-4 h-4 sm:w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
