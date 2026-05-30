import { create } from 'zustand';
import { 
  getAllUserNotificationsApi, 
  markNotificationReadApi 
} from '../api/notification.api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (limit = 50) => {
    set({ isLoading: true });
    try {
      const data = await getAllUserNotificationsApi(limit);
      const notifications = Array.isArray(data) ? data : (data.data || []);
      
      const unread = notifications.filter(n => !n.isRead).length;
      
      set({ notifications, unreadCount: unread, isLoading: false });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    set((state) => {
      const updated = state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      const unread = updated.filter(n => !n.isRead).length;
      return { notifications: updated, unreadCount: unread };
    });

    try {
      await markNotificationReadApi(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      get().fetchNotifications();
    }
  },

  addRealtimeNotification: (newNotification) => {
    set((state) => {
      if (state.notifications.some(n => n.id === newNotification.id)) {
        return state;
      }
      return {
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    });
  }
}));

export default useNotificationStore;