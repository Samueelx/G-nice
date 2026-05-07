import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/api/axiosBaseQuery';

export interface Notification {
  id: string;
  type: 'all' | 'mentions' | 'comments' | 'files' | 'access'; // Updated to match slice types
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
  type?: 'all' | 'mentions' | 'comments' | 'files' | 'access'; // Updated to match slice types
  isRead?: boolean;
  limit?: number;
  cursor?: string;
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: axiosBaseQuery({
    baseUrl: '/notifications',
  }),
  tagTypes: ['Notification'],
  // Global configuration to keep polling even on errors
  keepUnusedDataFor: 60, // Keep data for 60 seconds
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    // Get notifications with pagination and filters
    getNotifications: builder.query<NotificationsResponse, NotificationFilters>({
      query: (filters = {}) => {
        const params: Record<string, string> = {};
        if (filters.type && filters.type !== 'all') params['type'] = filters.type;
        if (filters.isRead !== undefined) params['isRead'] = String(filters.isRead);
        if (filters.limit) params['page_size'] = String(filters.limit);
        if (filters.cursor) params['page'] = filters.cursor;

        return {
          url: '',
          params,
        };
      },
      transformResponse: (response: any): NotificationsResponse => {
        const data = response.data ?? response;
        return {
          notifications: data.items || data.notifications || [],
          unreadCount: 0, // Should be fetched via getUnreadCount
          hasMore: data.has_next || data.hasMore || false,
          nextCursor: data.page ? String(data.page + 1) : undefined
        };
      },
      providesTags: ['Notification'],
    }),

    // Get unread count only (for badge)
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => ({ url: '/unread-count' }),
      transformResponse: (response: any) => response.data ?? response,
      providesTags: ['Notification'],
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
        data: { action },
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