// hooks/useNotifications.ts
import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWebSocketContext } from '@/context/useWebSocketContext';
import {
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsError,
  selectUnreadNotificationsCount,
  fetchNotifications,
  subscribeToNotifications,
  markNotificationAsRead,
  markAllAsRead,
  handleNotificationSocketMessage,
} from '@/features/notifications/notificationSlice';
import { AppDispatch } from '@/store/store';
import { Notification } from '@/types/notification';

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sendMessage, isConnected } = useWebSocketContext();

  // Selectors
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);
  const unreadCount = useSelector(selectUnreadNotificationsCount);

  // Actions
  const fetchNotificationsData = useCallback(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const subscribeToNotificationsData = useCallback(() => {
    dispatch(subscribeToNotifications());
  }, [dispatch]);

  const markAsRead = useCallback((notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  }, [dispatch]);

  const markAllAsReadAction = useCallback(() => {
    dispatch(markAllAsRead());
    
    // Send to server via WebSocket
    if (isConnected) {
      sendMessage('MARK_ALL_NOTIFICATIONS_READ', {
        userId: 'current_user', // Replace with actual user ID
        timestamp: Date.now(),
      });
    }
  }, [dispatch, sendMessage, isConnected]);

  const handleSocketMessage = useCallback((message: any) => {
    dispatch(handleNotificationSocketMessage(message));
  }, [dispatch]);

  // Send custom notification-related WebSocket messages
  const sendNotificationAction = useCallback((type: string, payload: any) => {
    if (isConnected) {
      sendMessage(type, {
        ...payload,
        timestamp: Date.now(),
      });
    }
  }, [sendMessage, isConnected]);

  return {
    // State
    notifications,
    loading,
    error,
    unreadCount,
    isConnected,

    // Actions
    fetchNotifications: fetchNotificationsData,
    subscribeToNotifications: subscribeToNotificationsData,
    markAsRead,
    markAllAsRead: markAllAsReadAction,
    handleSocketMessage,
    sendNotificationAction,

    // Utility functions
    getUnreadNotifications: () => notifications.filter(n => !n.isRead),
    getNotificationsByType: (type: string) => notifications.filter((n: Notification) => n.type === type),
    hasUnreadNotifications: unreadCount > 0,
  };
};