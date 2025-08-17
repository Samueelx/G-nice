import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store/store';

export interface Notification {
  id: string;
  type: 'comment' | 'file' | 'access' | 'mention' | 'completion' | 'fileAdd';
  userId: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  campaign?: string;
  fileDetails?: {
    name: string;
    size: string;
  };
  timeAgo: string;
  createdAt: string;
  isRead: boolean;
  relatedEntityId?: string; // ID of post, comment, etc.
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface NotificationFilters {
  type?: 'all' | 'mentions' | 'comments' | 'files' | 'access';
  isRead?: boolean;
  limit?: number;
  cursor?: string;
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/api/notifications',
    prepareHeaders: (headers, { getState }) => {
      // Add auth token if you have one in your state
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notification'],
  // Global configuration to keep polling even on errors
  keepUnusedDataFor: 60, // Keep data for 60 seconds
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    // Get notifications with pagination and filters
    getNotifications: builder.query<NotificationsResponse, NotificationFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.type && filters.type !== 'all') params.append('type', filters.type);
        if (filters.isRead !== undefined) params.append('isRead', String(filters.isRead));
        if (filters.limit) params.append('limit', String(filters.limit));
        if (filters.cursor) params.append('cursor', filters.cursor);
        
        return `?${params.toString()}`;
      },
      providesTags: ['Notification'],
      // Enable polling - refetch every 30 seconds
      pollingInterval: 30000,
      // Continue polling even on error and when unfocused
      skipPollingIfUnfocused: false,
      // Force polling to continue even after errors (for development)
      forceRefetch: ({ currentArg, previousArg }) => {
        return true; // Always refetch
      },
    }),

    // Get unread count only (for badge)
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/unread-count',
      providesTags: ['Notification'],
      // Poll more frequently for unread count
      pollingInterval: 15000,
      // Continue polling even on error
      skipPollingIfUnfocused: false,
    }),

    // Mark notification as read
    markAsRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
      // Optimistic update
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', {}, (draft) => {
            const notification = draft.notifications.find(n => n.id === notificationId);
            if (notification) {
              notification.isRead = true;
            }
            draft.unreadCount = Math.max(0, draft.unreadCount - 1);
          })
        );

        const countPatchResult = dispatch(
          notificationsApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
            draft.count = Math.max(0, draft.count - 1);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          countPatchResult.undo();
        }
      },
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/mark-all-read',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', {}, (draft) => {
            draft.notifications.forEach(notification => {
              notification.isRead = true;
            });
            draft.unreadCount = 0;
          })
        );

        const countPatchResult = dispatch(
          notificationsApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
            draft.count = 0;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          countPatchResult.undo();
        }
      },
    }),

    // Handle access request responses (approve/deny)
    respondToAccessRequest: builder.mutation<void, { notificationId: string; action: 'approve' | 'deny' }>({
      query: ({ notificationId, action }) => ({
        url: `/${notificationId}/access-response`,
        method: 'POST',
        body: { action },
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useRespondToAccessRequestMutation,
} = notificationsApi;