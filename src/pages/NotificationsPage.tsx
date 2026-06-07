import { useEffect } from 'react';
import { X, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  type Notification 
} from '@/services/api/notificationsApi';
import { setActiveTab, setLastSeenTimestamp } from '@/features/notifications/notificationsSlice';
import type { RootState } from '@/store/store';
import NotificationsSkeleton from '@/components/templates/NotificationsSkeleton';

const MobileNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeTab } = useSelector((state: RootState) => state.notifications);
  
  // RTK Query hooks
  const { 
    data: notificationsData, 
    isLoading, 
    isError,
    error,
    refetch 
  } = useGetNotificationsQuery({
    type: activeTab === 'all' ? undefined : activeTab,
  }, {
    pollingInterval: 30000, // Poll every 30 seconds
    skipPollingIfUnfocused: false,
    refetchOnFocus: true,
  });

  // Debug logging
  useEffect(() => {
    console.log('Notifications query state:', { 
      isLoading, 
      isError, 
      error, 
      dataCount: notificationsData?.notifications?.length 
    });
  }, [isLoading, isError, error, notificationsData]);

  const [markAsRead] = useMarkAsReadMutation();

  // Update last seen timestamp when component mounts
  useEffect(() => {
    dispatch(setLastSeenTimestamp(new Date().toISOString()));
  }, [dispatch]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id.toString());
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate based on notification type
    if (notification.target_type === 'Post' && notification.target_id) {
      navigate(`/posts/${notification.target_id}`);
    } else if (notification.type === 'follow' && notification.actor?.username) {
      navigate(`/users/${notification.actor.username}`);
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'like_post': return 'liked your post';
      case 'like_comment': return 'liked your comment';
      case 'comment': return 'commented on your post';
      case 'reply': return 'replied to your comment';
      case 'follow': return 'started following you';
      case 'mention': return 'mentioned you';
      default: return 'interacted with you';
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div 
      className={`py-4 px-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${
        !notification.is_read ? 'bg-blue-50' : ''
      }`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex gap-3">
        {/* Unread indicator */}
        {!notification.is_read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0" />
        )}
        
        <img
          src={notification.actor?.avatar_url || `https://ui-avatars.com/api/?name=${notification.actor?.username || 'U'}&background=random`}
          alt=""
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold">{notification.actor?.display_name || notification.actor?.username || 'Someone'}</span>{' '}
            <span className="text-gray-600">{getActionText(notification.type)}</span>
          </p>
          
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {new Date(notification.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isError) {
    return (
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-600 mb-4">Failed to load notifications</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#B43E8F] text-white rounded-md hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-lg font-semibold">
            Notifications
            {notificationsData?.unreadCount ? (
              <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                {notificationsData.unreadCount}
              </span>
            ) : null}
          </h1>
          <button className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" onClick={() => navigate(-1)}/>
          </button>
        </div>
        
        <div className="flex px-4 gap-4 pb-2 justify-evenly">
          {[
            { key: 'all', label: 'All' },
            { key: 'mention', label: 'Mentions' },
            { key: 'comment', label: 'Comments' },
            { key: 'like_post', label: 'Likes' },
            { key: 'follow', label: 'Follows' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => dispatch(setActiveTab(tab.key as any))}
              className={`text-sm py-1 px-2 ${
                activeTab === tab.key
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <NotificationsSkeleton />
      ) : (
        <div className="divide-y divide-gray-100">
          {notificationsData?.notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <p>No notifications yet</p>
            </div>
          ) : (
            notificationsData?.notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MobileNotifications;