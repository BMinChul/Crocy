import { create } from 'zustand';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'loot-gold' | 'loot-item';
}

interface NotificationStore {
  notifications: Notification[];
  cooldowns: Record<string, number>;
  addNotification: (message: string, type?: Notification['type'], cooldownKey?: string) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  cooldowns: {},
  addNotification: (message, type = 'info', cooldownKey) => {
    const now = Date.now();
    
    // Cooldown Check
    if (cooldownKey) {
      const lastTime = get().cooldowns[cooldownKey];
      if (lastTime && now - lastTime < 3000) {
        return; // Skip notification
      }
      // Update cooldown
      set((state) => ({
        cooldowns: { ...state.cooldowns, [cooldownKey]: now }
      }));
    }

    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));

    // Auto-remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 3000);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
