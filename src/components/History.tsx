import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History as HistoryIcon, 
  Clock, 
  Coffee, 
  Trash2, 
  ChevronLeft, 
  Search, 
  Filter, 
  Calendar,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { ConsumptionLog, DRINK_DATABASE } from '../types';

interface HistoryProps {
  logs: ConsumptionLog[];
  onBack: () => void;
  onRemoveLog: (id: string) => void;
}

export default function History({ logs, onBack, onRemoveLog }: HistoryProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Coffee' | 'Tea' | 'Energy' | 'Other'>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const drink = DRINK_DATABASE.find(d => d.id === log.drinkId);
      const matchesSearch = log.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'All' || drink?.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [logs, search, filter]);

  const groupedLogs = useMemo((): Record<string, ConsumptionLog[]> => {
    return filteredLogs.reduce((acc, log) => {
      const date = new Date(log.timestamp).toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(log);
      return acc;
    }, {} as Record<string, ConsumptionLog[]>);
  }, [filteredLogs]);

  const totalCaffeine = filteredLogs.reduce((sum, log) => sum + log.caffeine, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32">
      <header className="mb-12">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 group px-5 py-2.5 bg-espresso text-soft-white hover:bg-caramel dark:bg-soft-white dark:text-espresso dark:hover:bg-caramel dark:hover:text-soft-white transition-all rounded-full font-sans font-black text-xs uppercase tracking-widest mb-8 shadow-md hover:scale-105 active:scale-95 duration-200 cursor-pointer w-fit"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <h1 className="text-5xl font-display font-black text-espresso dark:text-soft-white tracking-tight">Drinking History</h1>
              <p className="text-espresso/40 dark:text-soft-white/40 font-medium mt-2">Every sip tracked and analyzed.</p>
           </div>
           <div className="bg-latte-cream/50 dark:bg-espresso/40 px-8 py-4 rounded-3xl border border-warm-beige/20 dark:border-white/15 flex items-center gap-8 shadow-sm">
              <div className="text-center">
                <p className="text-[10px] font-bold text-espresso/40 dark:text-soft-white/40 uppercase tracking-widest mb-1">Total Logs</p>
                <p className="text-2xl font-display font-black text-espresso dark:text-soft-white">{filteredLogs.length}</p>
              </div>
              <div className="w-px h-8 bg-warm-beige/30" />
              <div className="text-center">
                <p className="text-[10px] font-bold text-espresso/40 dark:text-soft-white/40 uppercase tracking-widest mb-1">Total mg</p>
                <p className="text-2xl font-display font-black text-espresso dark:text-soft-white">{totalCaffeine}</p>
              </div>
           </div>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
         <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-espresso/20 group-focus-within:text-caramel transition-colors" />
            <input 
              type="text"
              placeholder="Search drinks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-6 rounded-[2rem] bg-white dark:bg-espresso/50 border border-warm-beige/30 dark:border-white/10 focus:border-caramel/40 outline-none transition-all font-medium text-espresso dark:text-soft-white placeholder:text-espresso/20 dark:placeholder:text-soft-white/20"
            />
         </div>
         <div className="flex gap-2 p-1.5 bg-latte-cream/30 dark:bg-espresso/50 rounded-[2rem] border border-warm-beige/20 dark:border-white/10 overflow-x-auto no-scrollbar">
            {(['All', 'Coffee', 'Tea', 'Energy'] as const).map(f => (
               <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-4 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  filter === f ? 'bg-coffee-brown text-white' : 'text-espresso/40 dark:text-soft-white/40 hover:text-espresso dark:hover:text-soft-white'
                }`}
               >
                 {f}
               </button>
            ))}
         </div>
      </div>

      {Object.keys(groupedLogs).length > 0 ? (
        <div className="space-y-12">
          {(Object.entries(groupedLogs) as [string, ConsumptionLog[]][]).map(([date, dayLogs]) => (
            <section key={date} className="space-y-6">
              <div className="flex items-center gap-4 px-4">
                 <div className="w-2 h-2 rounded-full bg-caramel" />
                 <h3 className="text-xs font-bold text-espresso/30 uppercase tracking-[0.3em] font-display">{date}</h3>
                 <div className="flex-1 h-px bg-warm-beige/10" />
              </div>
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {dayLogs.map((log, i) => (
                    <motion.div 
                      key={log.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -15 }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 350, 
                        damping: 25,
                        layout: { type: 'spring', stiffness: 350, damping: 25 }
                      }}
                      className="bg-white dark:bg-espresso/40 p-6 rounded-[2.5rem] border border-warm-beige/30 dark:border-white/10 shadow-sm flex items-center justify-between group hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-latte-cream/40 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          {(() => {
                            const drink = DRINK_DATABASE.find(d => d.id === log.drinkId);
                            if (log.drinkId === 'water') return '💧';
                            if (drink?.category === 'Coffee') return '☕';
                            if (drink?.category === 'Tea') return '🍵';
                            if (drink?.category === 'Energy') return '⚡';
                            return '🥤';
                          })()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-display font-black text-espresso dark:text-soft-white text-xl">{log.name}</h4>
                            {(() => {
                              const drink = DRINK_DATABASE.find(d => d.id === log.drinkId);
                              if (!drink) return null;
                              return (
                                <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-latte-cream dark:bg-white/10 text-espresso/40 dark:text-soft-white/60 uppercase tracking-widest mt-0.5">
                                  {drink.category}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-xs text-espresso/40 dark:text-soft-white/50 font-bold uppercase tracking-widest">
                              <Clock className="w-4 h-4 text-caramel/40" />
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {log.caffeine === 0 ? (
                              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                Caffeine-Free
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-espresso/40 dark:text-soft-white/50 font-bold uppercase tracking-widest">
                                 <Coffee className="w-4 h-4 text-caramel/40" />
                                 {log.caffeine}mg
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {deletingId === log.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 p-1.5 rounded-2xl border border-red-100 dark:border-red-900/30">
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
                           onClick={() => setDeletingId(log.id)}
                           className="p-4 rounded-2xl bg-espresso/5 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-950/40 text-espresso/40 dark:text-soft-white/40 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 cursor-pointer"
                           title="Remove Log"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-espresso/40 rounded-[4rem] p-24 text-center border border-warm-beige/30 dark:border-white/10 shadow-sm">
          <div className="w-32 h-32 bg-latte-cream dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
            <Search className="w-12 h-12 text-espresso/10 dark:text-soft-white/25" />
          </div>
          <h2 className="text-3xl font-display font-black text-espresso dark:text-soft-white mb-4">No Matches Found</h2>
          <p className="text-espresso/40 dark:text-soft-white/45 font-medium max-w-sm mx-auto leading-relaxed">
            {search ? `We couldn't find any logs matching "${search}" in the ${filter} category.` : 'Your history is clear. Start tracking your drinks on the dashboard.'}
          </p>
          {search && (
            <button 
              onClick={() => { setSearch(''); setFilter('All'); }}
              className="mt-10 px-8 py-4 bg-espresso dark:bg-soft-white text-white dark:text-espresso rounded-2xl font-bold transition-all hover:scale-105 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
