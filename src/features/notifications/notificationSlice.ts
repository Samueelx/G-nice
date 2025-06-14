// features/notifications/notificationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '@/store/store';

// Server notification schema interface
interface ServerNotification {
  name: "NOTIFICATION";
  Timestamp: string;
  NotificationType: {
    NotificationType: "FOLLOW" | "INTERACT" | "POST" | "TOPIC" | "EVENT";
  };
  NotificationID: number;
  User: Array<{
    UserId: number;
    Email: string;
    Username: string;
    Contacts: number;
    Verified: boolean;
    LastName: string;
    FirstName: string;
    Posts: any[];
    Cancel: boolean;
    TopicsFollowing: any[];
    CategoriesFollowing: any[];
    UserSecurity: any[];
  }>;
}

// Client notification interface (what we use in the UI)
interface Notification {
  id: string;
  type: 'comment' | 'file' | 'access' | 'mention' | 'completion' | 'fileAdd' | 'follow' | 'interact' | 'post' | 'topic' | 'event';
  user: { name: string; avatar: string };
  action: string;
  target: string;
  campaign?: string;
  fileDetails?: { name: string; size: string };
  timeAgo: string;
  timestamp: string;
  notificationType: string;
  isRead: boolean;
}

interface NotificationState {
  items: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: NotificationState = {
  items: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
};

// Helper function to transform server notification to client format
const transformServerNotification = (serverNotification: ServerNotification): Notification => {
  const user = serverNotification.User[0]; // Assuming first user is the relevant one
  const notificationType = serverNotification.NotificationType.NotificationType.toLowerCase();
  
  // Generate action text based on notification type
  const getActionText = (type: string): string => {
    switch (type) {
      case 'follow':
        return 'started following you';
      case 'interact':
        return 'interacted with your post';
      case 'post':
        return 'created a new post';
      case 'topic':
        return 'posted in a topic you follow';
      case 'event':
        return 'created an event';
      default:
        return 'sent you a notification';
    }
  };

  // Calculate time ago (simple implementation)
  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return {
    id: serverNotification.NotificationID.toString(),
    type: notificationType as Notification['type'],
    user: {
      name: `${user.FirstName} ${user.LastName}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.Username}`, // Generate avatar or use default
    },
    action: getActionText(notificationType),
    target: user.Username,
    timeAgo: getTimeAgo(serverNotification.Timestamp),
    timestamp: serverNotification.Timestamp,
    notificationType: serverNotification.NotificationType.NotificationType,
    isRead: false,
  };
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.items = action.payload;
      state.isLoading = false;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    
    addNotification(state, action: PayloadAction<Notification>) {
      // Avoid duplicates
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex === -1) {
        state.items.unshift(action.payload);
        if (!action.payload.isRead) {
          state.unreadCount += 1;
        }
      }
    },
    
    addServerNotification(state, action: PayloadAction<ServerNotification>) {
      const transformedNotification = transformServerNotification(action.payload);
      // Avoid duplicates
      const existingIndex = state.items.findIndex(item => item.id === transformedNotification.id);
      if (existingIndex === -1) {
        state.items.unshift(transformedNotification);
        state.unreadCount += 1;
      }
    },
    
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.items.find(item => item.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllAsRead(state) {
      state.items.forEach(item => {
        item.isRead = true;
      });
      state.unreadCount = 0;
    },
    
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    clearError(state) {
      state.error = null;
    },
    
    // Handle WebSocket messages
    handleNotificationSocketMessage(state, action: PayloadAction<any>) {
      const { type, payload } = action.payload;
      
      switch (type) {
        case 'NOTIFICATIONS_DATA':
          // Handle bulk notifications data
          if (Array.isArray(payload)) {
            state.items = payload.map(transformServerNotification);
            state.unreadCount = state.items.filter(n => !n.isRead).length;
          }
          state.isLoading = false;
          break;
          
        case 'NEW_NOTIFICATION':
          // Handle single new notification
          if (payload && payload.name === 'NOTIFICATION') {
            const transformedNotification = transformServerNotification(payload);
            const existingIndex = state.items.findIndex(item => item.id === transformedNotification.id);
            if (existingIndex === -1) {
              state.items.unshift(transformedNotification);
              state.unreadCount += 1;
            }
          }
          break;
          
        case 'NOTIFICATION_READ':
          // Handle notification read status update
          if (payload && payload.notificationId) {
            const notification = state.items.find(item => item.id === payload.notificationId);
            if (notification && !notification.isRead) {
              notification.isRead = true;
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          }
          break;
          
        case 'NOTIFICATIONS_ERROR':
          state.error = payload.message || 'An error occurred while fetching notifications';
          state.isLoading = false;
          break;
          
        default:
          console.warn('Unhandled notification socket message type:', type);
          break;
      }
    },
    
    removeNotification(state, action: PayloadAction<string>) {
      const index = state.items.findIndex(item => item.id === action.payload);
      if (index !== -1) {
        const notification = state.items[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items.splice(index, 1);
      }
    },
  },
});

// WebSocket-based thunk actions
export const fetchNotifications = () => (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  dispatch(clearError());
  
  // Send WebSocket message to request notifications
  dispatch({
    type: 'ws/send',
    payload: {
      type: 'FETCH_NOTIFICATIONS',
      payload: {
        userId: 'current_user', // Replace with actual user ID
        timestamp: Date.now(),
      },
    },
  });
};

export const subscribeToNotifications = () => (dispatch: AppDispatch) => {
  // Send WebSocket message to subscribe to notifications
  dispatch({
    type: 'ws/send',
    payload: {
      type: 'subscribe_notifications',
      payload: {
        userId: 'current_user', // Replace with actual user ID
        timestamp: Date.now(),
      },
    },
  });
};

export const markNotificationAsRead = (notificationId: string) => (dispatch: AppDispatch) => {
  dispatch(markAsRead(notificationId));
  
  // Send to server
  dispatch({
    type: 'ws/send',
    payload: {
      type: 'MARK_NOTIFICATION_READ',
      payload: {
        notificationId,
        timestamp: Date.now(),
      },
    },
  });
};

// Export actions
export const {
  setNotifications,
  addNotification,
  addServerNotification,
  markAsRead,
  markAllAsRead,
  setLoading,
  setError,
  clearError,
  handleNotificationSocketMessage,
  removeNotification,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectNotificationsLoading = (state: RootState) => state.notifications.isLoading;
export const selectNotificationsError = (state: RootState) => state.notifications.error;
export const selectUnreadNotificationsCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsByType = (type: Notification['type']) => (state: RootState) => 
  state.notifications.items.filter(notification => notification.type === type);

export default notificationSlice.reducer;