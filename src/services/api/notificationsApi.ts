import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/api/axiosBaseQuery';

export interface Notification {
  id: number;
  type: 'like_post' | 'like_comment' | 'comment' | 'reply' | 'follow' | 'mention';
  user_id: number;
  actor_id: number;
  actor?: {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  target_id?: number;
  target_type?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface NotificationFilters {
  type?: 'all' | 'like_post' | 'like_comment' | 'comment' | 'reply' | 'follow' | 'mention';
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
          notifications: data.data || data.items || data.notifications || [],
          unreadCount: data.total ?? 0,
          hasMore: data.has_next || data.hasMore || false,
          nextCursor: data.has_next && data.page ? String(data.page + 1) : undefined
        };
      },
      providesTags: ['Notification'],
    }),

    // Get unread count only (for badge)
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => ({ url: '/unread-count' }),
      transformResponse: (response: any) => {
        const data = response.data ?? response;
        return { count: data.unread_count ?? data.count ?? 0 };
      },
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
            const notification = draft.notifications.find(n => n.id === Number(notificationId));
            if (notification) {
              notification.is_read = true;
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
        url: '/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', {}, (draft) => {
            draft.notifications.forEach(notification => {
              notification.is_read = true;
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
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApi;