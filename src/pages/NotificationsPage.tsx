import React, { useEffect, useCallback } from 'react';
import { X, FileText, Clock, Wifi, WifiOff, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  subscribeToNotifications,
  markNotificationAsRead,
  markAllAsRead,
  handleNotificationSocketMessage,
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsError,
  selectUnreadNotificationsCount,
} from '@/features/notifications/notificationSlice';
import { useWebSocketContext } from '@/context/useWebSocketContext';
// import { Notification } from '@/types/notification';
import { AppDispatch } from '@/store/store';

// Define types for notification details
interface FileDetails {
  name: string;
  size: string;
}

interface User {
  name: string;
  avatar: string;
}

// Extended notification interface
interface NotificationItem extends Omit<Notification, 'type'> {
  id: string;
  user: User;
  action: string;
  target: string;
  timeAgo: string;
  type: 'comment' | 'file' | 'access' | 'mention' | 'completion' | 'fileAdd' | 'follow' | 'interact' | 'post' | 'topic' | 'event';
  campaign?: string;
  fileDetails?: FileDetails;
  isRead: boolean;
  notificationType?: string;
}

interface NotificationItemProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
}

const MobileNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'mentions' | 'unread'>('all');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux selectors
  const notifications = useSelector(selectNotifications) as NotificationItem[];
  const loading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);
  const unreadCount = useSelector(selectUnreadNotificationsCount);
  
  // WebSocket context
  const {
    messages,
    isConnected,
    sendMessage,
    // getMessagesByType,
    // getLatestMessage
  } = useWebSocketContext();

  // Initialize notifications and WebSocket subscription
  useEffect(() => {
    if (isConnected) {
      console.log('🔔 MobileNotifications: WebSocket connected, subscribing to notifications');
      dispatch(subscribeToNotifications());
      dispatch(fetchNotifications());
    }
  }, [isConnected, dispatch]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      console.log('🔔 Processing WebSocket message in MobileNotifications:', latestMessage);

      // Handle different types of notification messages
      if (latestMessage.type && latestMessage.type.includes('notification')) {
        dispatch(handleNotificationSocketMessage({
          type: latestMessage.type.replace('notification_', '').toUpperCase(),
          payload: latestMessage.payload
        }));
      }

      // Handle server notification format
      if (latestMessage.payload && latestMessage.payload.name === 'NOTIFICATION') {
        dispatch(handleNotificationSocketMessage({
          type: 'NEW_NOTIFICATION',
          payload: latestMessage.payload
        }));

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          const user = latestMessage.payload.User[0];
          const userName = `${user.FirstName} ${user.LastName}`;
          const notificationType = latestMessage.payload.NotificationType.NotificationType;
          
          new Notification('New Notification', {
            body: `${userName} - ${notificationType.toLowerCase()} notification`,
            icon: '/g-icon.svg',
            badge: '/g-icon.svg'
          });
        }
      }
    }
  }, [messages, dispatch]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Handle mark as read
  const handleMarkAsRead = useCallback((notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  }, [dispatch]);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    dispatch(markAllAsRead());
    
    // Send to server via WebSocket
    sendMessage('MARK_ALL_NOTIFICATIONS_READ', {
      userId: 'current_user'
    });
  }, [dispatch, sendMessage]);

  // Filter notifications based on active tab
  const filteredNotifications = React.useMemo(() => {
    switch (activeTab) {
      case 'mentions':
        return notifications.filter(n => 
          n.type === 'mention' || 
          n.action.toLowerCase().includes('mention') ||
          n.notificationType === 'INTERACT'
        );
      case 'unread':
        return notifications.filter(n => !n.isRead);
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
    const handleClick = () => {
      if (!notification.isRead) {
        onMarkAsRead(notification.id);
      }
    };

    const getNotificationIcon = (type: string) => {
      switch (type) {
        case 'follow':
          return '👤';
        case 'interact':
        case 'comment':
          return '💬';
        case 'post':
          return '📝';
        case 'topic':
          return '🏷️';
        case 'event':
          return '📅';
        case 'file':
        case 'fileAdd':
          return '📎';
        default:
          return '🔔';
      }
    };

    return (
      <div 
        className={`py-4 px-4 border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
          !notification.isRead ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
        }`}
        onClick={handleClick}
      >
        <div className="flex gap-3">
          <div className="relative">
            <img
              src={notification.user.avatar}
              alt=""
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="absolute -bottom-1 -right-1 text-xs">
              {getNotificationIcon(notification.type)}
            </div>
            {!notification.isRead && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-semibold">{notification.user.name}</span>{' '}
              <span className="text-gray-600">{notification.action}</span>{' '}
              <span className="font-medium">
                <span className="truncate inline">{notification.target}</span>
              </span>
              {notification.campaign && (
                <span className="text-gray-600"> for {notification.campaign}</span>
              )}
            </p>

            {notification.fileDetails && (
              <div className="mt-2 bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {notification.fileDetails.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {notification.fileDetails.size}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{notification.timeAgo}</span>
              {notification.notificationType && (
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {notification.notificationType}
                </span>
              )}
            </div>

            {notification.type === 'access' && (
              <div className="flex gap-2 mt-2">
                <button 
                  className="px-3 py-1 text-xs bg-[#B43E8F] text-white rounded-md hover:bg-gray-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    sendMessage('APPROVE_ACCESS_REQUEST', {
                      notificationId: notification.id,
                      action: 'approve'
                    });
                  }}
                >
                  Approve
                </button>
                <button 
                  className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    sendMessage('DENY_ACCESS_REQUEST', {
                      notificationId: notification.id,
                      action: 'deny'
                    });
                  }}
                >
                  Deny
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* WebSocket status indicator */}
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            
            {/* Mark all as read */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1"
              >
                Mark all read
              </button>
            )}
            
            {/* Close button */}
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => navigate(-1)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`px-4 py-2 text-xs flex items-center gap-2 ${
          isConnected ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
        }`}>
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isConnected ? 'Live notifications active' : 'Disconnected - notifications may be delayed'}
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-4 pb-2 justify-evenly">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'mentions', label: 'Mentions', count: notifications.filter(n => 
              n.type === 'mention' || n.notificationType === 'INTERACT'
            ).length },
            { key: 'unread', label: 'Unread', count: unreadCount }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`text-sm py-1 flex items-center gap-1 ${
                activeTab === tab.key
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-gray-200 text-xs px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={() => dispatch(fetchNotifications())}
            className="text-xs text-red-600 hover:text-red-800 mt-1"
          >
            Retry
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              Loading notifications...
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BellRing className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="font-medium">
              {activeTab === 'unread' ? 'No unread notifications' : 
               activeTab === 'mentions' ? 'No mentions yet' : 
               'No notifications yet'}
            </p>
            <p className="text-sm mt-1">
              {!isConnected && 'Check your connection for live updates'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))
        )}
      </div>

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mx-4 mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
          <p>Debug: Connected: {isConnected ? 'Yes' : 'No'} | 
             Notifications: {notifications.length} | 
             Unread: {unreadCount} | 
             WS Messages: {messages?.length || 0}</p>
        </div>
      )}
    </div>
  );
};

export default MobileNotifications;