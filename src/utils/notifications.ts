import { AppNotification, UserProfile, ConsumptionLog } from '../types';
import { getDailyTotal, isLateCaffeine } from './caffeine';

export const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First high note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.06, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.3);
    
    // Second note (slightly later, higher pitch) to make a pleasant double-chime "ding-dong"
    setTimeout(() => {
      try {
        if (ctx.state === 'closed') return;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.4);
      } catch (e) {
        // Safe catch for timeout
      }
    }, 120);
  } catch (e) {
    console.error('Notification sound error:', e);
  }
};

export const createNotification = (
  title: string,
  message: string,
  type: 'info' | 'warning' | 'success' | 'alert'
): AppNotification => {
  // Trigger HTML5 system browser notification if permitted
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new window.Notification(`🐈 MyCoffee: ${title}`, {
        body: message,
        icon: '/assets/mycoffe1.jpg',
        badge: '/assets/mycoffe1.jpg',
        tag: 'mycoffee-alert'
      });
    }
  } catch (error) {
    console.error('Failed to dispatch system browser notification:', error);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    title,
    message,
    type,
    timestamp: new Date(),
    read: false,
  };
};

export const checkAndUpdateNotifications = (
  logs: ConsumptionLog[],
  profile: UserProfile,
  existingNotifications: AppNotification[]
): AppNotification | null => {
  const dailyTotal = getDailyTotal(logs);
  const todayStr = new Date().toISOString().split('T')[0];

  // Limit check (80%)
  if (dailyTotal >= profile.dailyLimit * 0.8 && dailyTotal < profile.dailyLimit) {
    const key = `limit-80-${todayStr}`;
    if (!existingNotifications.some(n => n.id.includes(key))) {
      return {
        ...createNotification(
          "Almost at your limit ☕",
          "You've reached 80% of your healthy daily caffeine limit. Maybe switch to water?",
          'warning'
        ),
        id: key
      };
    }
  }

  // Limit check (100%)
  if (dailyTotal >= profile.dailyLimit) {
    const key = `limit-100-${todayStr}`;
    if (!existingNotifications.some(n => n.id.includes(key))) {
      return {
        ...createNotification(
          "Daily limit reached!",
          "You've passed your recommended caffeine limit for today. Stay hydrated!",
          'alert'
        ),
        id: key
      };
    }
  }

  // Late caffeine check
  const lastLog = logs.find(l => l.caffeine > 0);
  if (lastLog && isLateCaffeine(lastLog.timestamp, profile.bedtime)) {
    const key = `late-caffeine-${lastLog.id}`;
    if (!existingNotifications.some(n => n.id.includes(key))) {
      return {
        ...createNotification(
          "Late caffeine alert",
          "Drinking caffeine this late might affect your deep sleep tonight.",
          'warning'
        ),
        id: key
      };
    }
  }

  return null;
};
