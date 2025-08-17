import { useEffect } from 'react';
import { useGetUnreadCountQuery, useGetNotificationsQuery } from '@/services/api/notificationsApi';

/**
 * Global hook to manage notifications polling throughout the app
 * Use this in your root App component
 */
export const useGlobalNotifications = () => {
  // Poll for unread count every 15 seconds (lightweight request)
  const { 
    data: unreadData,
    isError: unreadError,
    error: unreadErrorDetails
  } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 15000,
    skipPollingIfUnfocused: false,
    refetchOnMountOrArgChange: true,
  });

  // Poll for notifications less frequently (heavier request)
  // This keeps the cache fresh for when user visits notifications page
  const { 
    data: notificationsData,
    isError: notificationsError,
    error: notificationsErrorDetails
  } = useGetNotificationsQuery({}, {
    pollingInterval: 60000, // Every minute
    skipPollingIfUnfocused: false,
    refetchOnMountOrArgChange: true,
  });

  // Log errors for debugging (remove in production)
  useEffect(() => {
    if (unreadError) {
      console.warn('Failed to fetch unread count:', unreadErrorDetails);
    }
    if (notificationsError) {
      console.warn('Failed to fetch notifications:', notificationsErrorDetails);
    }
  }, [unreadError, notificationsError, unreadErrorDetails, notificationsErrorDetails]);

  // Log successful polling (remove in production)
  useEffect(() => {
    if (unreadData) {
      console.log('Unread count updated:', unreadData.count);
    }
  }, [unreadData]);

  return {
    unreadCount: unreadData?.count ?? 0,
    notifications: notificationsData?.notifications ?? [],
    totalNotifications: notificationsData?.notifications?.length ?? 0,
    hasMore: notificationsData?.hasMore ?? false,
    hasErrors: unreadError || notificationsError,
    isPolling: true, // Always true when this hook is active
  };
};