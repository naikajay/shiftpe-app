import { create } from "zustand";

import { notificationService } from "../services/notificationService";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  read?: boolean;
  createdAt?: string;
}

interface NotificationStoreState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  pushNotification: (notification: NotificationItem) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  async loadNotifications() {
    set({ loading: true, error: null });
    try {
      const notifications = await notificationService.getNotifications({ limit: 50 });
      set({
        notifications,
        unreadCount: notifications.filter((item: NotificationItem) => !item.read).length,
      });
    } catch (caught: any) {
      set({ error: caught.message });
    } finally {
      set({ loading: false });
    }
  },

  async markAsRead(notificationId) {
    await notificationService.markAsRead(notificationId);
    set((state) => {
      const notifications = state.notifications.map((item) =>
        item._id === notificationId ? { ...item, read: true } : item
      );
      return {
        notifications,
        unreadCount: notifications.filter((item) => !item.read).length,
      };
    });
  },

  pushNotification(notification) {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    }));
  },

  clearError() {
    set({ error: null });
  },
}));
