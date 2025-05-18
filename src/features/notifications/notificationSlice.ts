// features/notifications/notificationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '@/store/store';

interface Notification {
  id: string;
  type: 'comment' | 'file' | 'access' | 'mention' | 'completion' | 'fileAdd';
  user: { name: string; avatar: string };
  action: string;
  target: string;
  campaign?: string;
  fileDetails?: { name: string; size: string };
  timeAgo: string;
}

interface NotificationState {
  items: Notification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.items = action.payload;
      state.isLoading = false;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.items.unshift(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    handleNotificationSocketMessage(state, action: PayloadAction<any>) {
      const { type, data } = action.payload;
      switch (type) {
        case 'NOTIFICATIONS_DATA':
          state.items = data;
          state.isLoading = false;
          break;
        case 'NEW_NOTIFICATION':
          state.items.unshift(data);
          break;
        default:
          break;
      }
    },
  },
});

// WebSocket fetch thunk
export const fetchNotifications = () => (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  dispatch({
    type: 'ws/send',
    payload: {
      type: 'FETCH_NOTIFICATIONS',
    },
  });
};

export const {
  setNotifications,
  addNotification,
  setLoading,
  setError,
  handleNotificationSocketMessage,
} = notificationSlice.actions;

export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectNotificationsLoading = (state: RootState) => state.notifications.isLoading;

export default notificationSlice.reducer;
