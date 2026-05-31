import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Volume2, 
  Play, 
  Square, 
  Clock, 
  Timer as TimerIcon, 
  Check, 
  Plus, 
  Trash2, 
  VolumeX, 
  Coffee, 
  Sparkles,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ConsumptionLog, UserProfile } from '../types';
import { getDailyTotal } from '../utils/caffeine';

export interface Alarm {
  id: string;
  label: string;
  time: string; // 'HH:MM' for scheduled, or 'minutes' countdown for timer
  type: 'scheduled' | 'timer';
  active: boolean;
  timeLeft?: number; // seconds remaining (for timer)
  originalDuration?: number; // original duration in seconds (for timer)
}

interface AlarmReminderProps {
  logs?: ConsumptionLog[];
  profile?: UserProfile;
}

export default function AlarmReminder({ logs, profile }: AlarmReminderProps) {
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem('mycoffee_alarms');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: '1', label: 'Caffeine Cutoff', time: '14:30', type: 'scheduled', active: true },
      { id: '2', label: 'Hydrate Reminder', time: '45', type: 'timer', active: false, timeLeft: 2700, originalDuration: 2700 }
    ];
  });

  const [inputLabel, setInputLabel] = useState('');
  const [inputType, setInputType] = useState<'scheduled' | 'timer'>('scheduled');
  const [inputTime, setInputTime] = useState('08:00');
  const [inputMinutes, setInputMinutes] = useState('30');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAlarmTriggered, setActiveAlarmTriggered] = useState<Alarm | null>(null);
  const [audioVersion, setAudioVersion] = useState(Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<number | null>(null);
  const lastAlertedLogsRef = useRef<string | null>(null);

  // Save alarms to localStorage
  useEffect(() => {
    localStorage.setItem('mycoffee_alarms', JSON.stringify(alarms));
  }, [alarms]);

  // Handle playing audio sound
  const playSound = () => {
    const newVer = Date.now();
    setAudioVersion(newVer);
    
    // Allow state update to propagate so src is updated, then load and play
    setTimeout(() => {
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          audioRef.current.load(); // Refresh / reload the media source with the newly generated version
        } catch (e) {
          console.warn('Audio load error:', e);
        }
        
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Audio play failed, using fallback synthesizer: ', err);
          playFallbackSynth();
          setIsPlaying(true);
        });
      } else {
        playFallbackSynth();
        setIsPlaying(true);
      }
    }, 50);
  };

  // Fallback Audio Synthesizer (Web Audio API)
  const playFallbackSynth = () => {
    stopFallbackSynth();
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playBeep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Multi-frequency rich alarm alert tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.15); // Pitch change
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      };

      playBeep();
      const interval = setInterval(playBeep, 800) as any;
      synthIntervalRef.current = interval;
    } catch (e) {
      console.error('Synthesizer error:', e);
    }
  };

  const stopFallbackSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopFallbackSynth();
    setIsPlaying(false);
  };

  // Alarm tracking engine loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;
      const isNewMinute = now.getSeconds() === 0;

      setAlarms(prevAlarms => {
        let alarmToTrigger: Alarm | null = null;
        let hasChanges = false;

        const next = prevAlarms.map(alarm => {
          if (!alarm.active) return alarm;

          if (alarm.type === 'scheduled') {
            // Check scheduled time match exactly at start of minute
            if (alarm.time === timeStr && isNewMinute) {
              alarmToTrigger = alarm;
              hasChanges = true;
              return { ...alarm, active: false }; // Auto turn off or leave active based on preference
            }
          } else if (alarm.type === 'timer' && alarm.timeLeft !== undefined) {
            // Countdown timer decrement
            if (alarm.timeLeft <= 1) {
              alarmToTrigger = alarm;
              hasChanges = true;
              return { ...alarm, active: false, timeLeft: 0 };
            } else {
              hasChanges = true;
              return { ...alarm, timeLeft: alarm.timeLeft - 1 };
            }
          }
          return alarm;
        });

        if (alarmToTrigger) {
          triggerAlarm(alarmToTrigger);
        }

        if (hasChanges) {
          return next;
        }
        return prevAlarms;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      stopFallbackSynth();
    };
  }, []);

  const triggerAlarm = (alarm: Alarm) => {
    setActiveAlarmTriggered(alarm);
    playSound();
  };

  // Watch for daily caffeine limit exceeding to trigger alarm automatically
  useEffect(() => {
    if (!logs || !profile) return;
    const dailyTotal = getDailyTotal(logs);
    
    // Generate a unique fingerprint for the current logs to detect additions/removals
    const logsKey = logs.map(l => `${l.id}-${l.timestamp}`).join(',');
    
    if (dailyTotal >= profile.dailyLimit) {
      if (lastAlertedLogsRef.current !== logsKey) {
        lastAlertedLogsRef.current = logsKey;
        
        // Trigger limit exceeded alarm
        const limitAlarm: Alarm = {
          id: 'daily-limit-exceeded-' + Date.now(),
          label: '⚠️ Batas Kafein Terlampaui!',
          time: '',
          type: 'scheduled',
          active: true
        };
        triggerAlarm(limitAlarm);
      }
    } else {
      // Reset if we go below the limit, to allow re-triggering upon exceeding again
      lastAlertedLogsRef.current = null;
    }
  }, [logs, profile]);

  const handleDismissAlarm = () => {
    stopSound();
    setActiveAlarmTriggered(null);
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => {
      if (alarm.id !== id) return alarm;
      const willBeActive = !alarm.active;
      let extra = {};
      if (alarm.type === 'timer' && willBeActive) {
        // Reset timer duration if turned back on
        const durationSec = (alarm.originalDuration || parseInt(alarm.time, 10) * 60) || 1800;
        extra = { timeLeft: durationSec, originalDuration: durationSec };
      }
      return { ...alarm, active: willBeActive, ...extra };
    }));
  };

  const handleDeleteAlarm = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlarms(prev => prev.filter(al => al.id !== id));
  };

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = inputLabel.trim() || (inputType === 'scheduled' ? 'Scheduled Alarm' : 'Timer');
    let alarmTime = '';
    let durationSeconds = 0;

    if (inputType === 'scheduled') {
      alarmTime = inputTime;
    } else {
      const mins = Math.max(1, parseInt(inputMinutes, 10) || 5);
      alarmTime = String(mins);
      durationSeconds = mins * 60;
    }

    const newAlarm: Alarm = {
      id: Math.random().toString(36).substring(2, 9),
      label: cleanLabel,
      time: alarmTime,
      type: inputType,
      active: true,
      ...(inputType === 'timer' ? { timeLeft: durationSeconds, originalDuration: durationSeconds } : {})
    };

    setAlarms(prev => [newAlarm, ...prev]);
    setInputLabel('');
  };

  const formatTimerValue = (secondsLeft?: number) => {
    if (secondsLeft === undefined) return '00:00';
    const hrs = Math.floor(secondsLeft / 3600);
    const mins = Math.floor((secondsLeft % 3600) / 60);
    const secs = secondsLeft % 60;

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    if (hrs > 0) {
      return `${hrs}:${formattedMins}:${formattedSecs}`;
    }
    return `${formattedMins}:${formattedSecs}`;
  };

  return (
    <div className="bg-white dark:bg-espresso/45 p-8 rounded-[3rem] border border-warm-beige/30 dark:border-white/10 shadow-xl relative overflow-hidden text-left">
      {/* Hidden sound resource */}
      <audio 
        ref={audioRef} 
        src={`/assets/alarm1.mp3?v=${audioVersion}`} 
        loop 
        preload="auto"
        onError={() => console.log('Place alarm1.mp3 in public/assets to play custom loop')}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center">
            <Bell className="w-5 h-5 animate-swing" />
          </div>
          <div>
            <h3 className="font-display font-black text-espresso dark:text-soft-white text-lg leading-tight">Reminders & Alarms</h3>
            <p className="text-[9px] font-bold text-espresso/30 dark:text-soft-white/45 uppercase tracking-widest">Alarm Pengingat Kafein</p>
          </div>
        </div>
        
        {/* Play tester indicator */}
        <button
          onClick={() => {
            if (isPlaying) stopSound();
            else playSound();
          }}
          className={cn(
            "p-2.5 rounded-xl border transition-all text-xs flex items-center gap-1 font-bold",
            isPlaying 
              ? "bg-red-50 text-red-500 border-red-200" 
              : "bg-soft-white dark:bg-white/5 border-warm-beige/20 dark:border-white/5 text-espresso/60 dark:text-soft-white/70 hover:bg-white dark:hover:bg-white/10"
          )}
          title="Test audio loop or synth tone"
        >
          {isPlaying ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-espresso/60" />}
          <span>{isPlaying ? 'Mute' : 'Test Loop'}</span>
        </button>
      </div>

      {/* Alarm list */}
      <div className="space-y-3 mb-6 max-h-[220px] overflow-y-auto pr-1">
        {alarms.length === 0 ? (
          <div className="text-center py-6 bg-soft-white dark:bg-white/5 rounded-2xl border border-dashed border-warm-beige/35 dark:border-white/5 text-espresso/30 dark:text-soft-white/40 text-xs">
            No active alarms configured.
          </div>
        ) : (
          alarms.map(alarm => (
            <div 
              key={alarm.id} 
              onClick={() => handleToggleAlarm(alarm.id)}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group/item",
                alarm.active 
                  ? "bg-white dark:bg-espresso/60 border-caramel/20 dark:border-white/10 shadow-sm text-espresso dark:text-soft-white" 
                  : "bg-soft-white/60 dark:bg-espresso/20 border-warm-beige/10 dark:border-white/5 opacity-60"
              )}
            >
              {alarm.active && alarm.type === 'timer' && alarm.timeLeft !== undefined && alarm.originalDuration && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-caramel/20 transition-all duration-1000"
                  style={{ width: `${(alarm.timeLeft / alarm.originalDuration) * 100}%` }}
                />
              )}
              
              <div className="flex items-center gap-3 relative z-10">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  alarm.type === 'scheduled' ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-600"
                )}>
                  {alarm.type === 'scheduled' ? <Clock className="w-4 h-4" /> : <TimerIcon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-espresso dark:text-soft-white leading-normal">{alarm.label}</p>
                  <p className="text-[10px] text-espresso/40 dark:text-soft-white/45 font-mono flex items-center gap-1 leading-none mt-0.5">
                    {alarm.type === 'scheduled' ? (
                       <span>📌 At {alarm.time}</span>
                    ) : (
                       <span>⏳ Remaining: {formatTimerValue(alarm.timeLeft)}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                {/* Custom toggle slider */}
                <div className={cn(
                  "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-300",
                  alarm.active ? "bg-caramel" : "bg-warm-beige/35"
                )}>
                  <div className={cn(
                    "w-4.5 h-4.5 bg-white rounded-full shadow-md transition-transform duration-300",
                    alarm.active ? "translate-x-4.5" : "translate-x-0"
                  )} />
                </div>

                <button 
                  onClick={(e) => handleDeleteAlarm(alarm.id, e)}
                  className="p-1 px-1.5 rounded-lg text-espresso/20 dark:text-soft-white/30 group-hover/item:text-red-500 dark:group-hover/item:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Alarm Input Form */}
      <form onSubmit={handleAddAlarm} className="p-4 bg-soft-white/60 dark:bg-white/5 rounded-2xl border border-warm-beige/25 dark:border-white/5 space-y-3">
        <label className="text-[10px] font-bold text-espresso/40 dark:text-soft-white/45 uppercase tracking-widest block">Add reminder alarm</label>
        
        {/* Mode Selector */}
        <div className="flex gap-1.5 p-1 bg-white dark:bg-espresso rounded-xl border border-warm-beige/20 dark:border-white/10 text-[10px] font-bold">
          <button 
            type="button"
            onClick={() => setInputType('scheduled')}
            className={cn(
              "flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1",
              inputType === 'scheduled' ? "bg-espresso text-white dark:bg-soft-white dark:text-espresso" : "text-espresso/40 dark:text-soft-white/45 hover:text-espresso dark:hover:text-soft-white"
            )}
          >
            <Clock className="w-3 h-3" />
            At Specific Time
          </button>
          <button 
            type="button"
            onClick={() => setInputType('timer')}
            className={cn(
              "flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1",
              inputType === 'timer' ? "bg-espresso text-white dark:bg-soft-white dark:text-espresso" : "text-espresso/40 dark:text-soft-white/45 hover:text-espresso dark:hover:text-soft-white"
            )}
          >
            <TimerIcon className="w-3 h-3" />
            Interval Timer
          </button>
        </div>

        {/* Form Inputs Group */}
        <div className="space-y-2">
          <input 
            type="text" 
            placeholder="Label (e.g. Stop Coffee)" 
            value={inputLabel}
            onChange={(e) => setInputLabel(e.target.value)}
            className="w-full text-xs font-bold text-espresso dark:text-soft-white bg-white dark:bg-espresso/60 border border-warm-beige/20 dark:border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-caramel/50 dark:placeholder:text-soft-white/30"
          />

          <div className="flex gap-2">
            {inputType === 'scheduled' ? (
              <input 
                type="time" 
                value={inputTime}
                onChange={(e) => setInputTime(e.target.value)}
                className="flex-1 text-xs font-bold text-espresso dark:text-soft-white bg-white dark:bg-espresso/60 border border-warm-beige/20 dark:border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-caramel/50"
              />
            ) : (
              <div className="flex-1 flex items-center bg-white dark:bg-espresso/60 border border-warm-beige/20 dark:border-white/10 rounded-xl px-3 py-2.5">
                <input 
                  type="number" 
                  min="1" 
                  max="1440"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(e.target.value)}
                  className="w-full text-xs font-bold text-espresso dark:text-soft-white focus:outline-none bg-transparent"
                />
                <span className="text-[10px] font-bold text-espresso/40 ml-1.5 uppercase tracking-wider">Mins</span>
              </div>
            )}

            <button 
              type="submit"
              className="px-5 bg-caramel text-espresso font-display font-black text-xs rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-caramel/10 shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>
        </div>
      </form>

      <p className="text-[9px] font-medium text-espresso/35 dark:text-soft-white/40 mt-4 leading-normal">
        Your alarm loop triggers <strong>alarm1.mp3</strong> automatically. Make sure the sound is turned on!
      </p>

      {/* Big beautiful Alert Overlay screen when alarm triggers */}
      <AnimatePresence>
        {activeAlarmTriggered && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-espresso/95 backdrop-blur-2xl z-[9999] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="absolute inset-0 bg-radial-gradient from-amber-500/15 via-transparent to-transparent pointer-events-none" />
            
            <motion.div 
              animate={{ 
                scale: [1, 1.12, 1],
                rotate: [0, -5, 5, -5, 5, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-32 h-32 bg-caramel text-espresso rounded-[3.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-caramel/30 border border-white/10"
            >
              <Bell className="w-16 h-16 animate-pulse" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="max-w-md w-full space-y-6 px-4"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-caramel/10 border border-caramel/20 text-caramel rounded-full text-[10px] font-black uppercase tracking-widest">
                <AlertCircle className="w-3.5 h-3.5" />
                {activeAlarmTriggered.id.startsWith('daily-limit-exceeded-') ? 'Batas Kafein Terlampaui!' : 'Alarm Pengingat Aktif'}
              </span>

              <h2 className="text-white font-display font-black text-4xl tracking-tight leading-normal">
                {activeAlarmTriggered.label}
              </h2>

              <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto font-medium">
                Alat pengingat otomatis berbunyi menggunakan sountrack audio <strong className="text-caramel font-mono px-1.5 py-0.5 bg-white/5 rounded">alarm1.mp3</strong>.
              </p>

              <div className="flex justify-center items-center gap-2 text-emerald-400 font-mono text-xs py-1 px-3 bg-white/5 rounded-full w-fit mx-auto border border-emerald-500/10 backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Audio Loops Active (alarm1.mp3)</span>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleDismissAlarm}
                  className="w-full py-6 bg-white hover:bg-caramel text-espresso hover:text-espresso font-display font-black text-2xl rounded-[2.5rem] transition-all shadow-2xl shadow-white/10 flex items-center justify-center gap-3 uppercase tracking-wide hover:scale-105 active:scale-95"
                >
                  <Check className="w-7 h-7" />
                  Selesai
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
