import React, { useEffect } from 'react';
import { X, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  selectNotifications,
  selectNotificationsLoading,
} from '@/features/notifications/notificationSlice';
import { Notification } from '@/types/notification';
import { AppDispatch } from '@/store/store'; // Add this import for TypeScript dispatch

// Define types for notification details
interface FileDetails {
  name: string;
  size: string;
}

interface User {
  name: string;
  avatar: string;
}

// Extend Notification interface with required properties
// Assuming the Notification interface has a specific union type for 'type'
// Let's properly handle it in our extended interface
interface NotificationItem extends Omit<Notification, 'type'> {
  id: string;
  user: User;
  action: string;
  target: string;
  timeAgo: string;
  type: 'comment' | 'file' | 'access' | 'mention' | 'completion' | 'fileAdd';
  campaign?: string;
  fileDetails?: FileDetails;
}

interface NotificationItemProps {
  notification: NotificationItem;
}

const MobileNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'mentions' | 'archive'>('all');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(selectNotifications) as NotificationItem[];
  const loading = useSelector(selectNotificationsLoading);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => (
    <div className="py-4 px-4 border-b border-gray-100 last:border-0">
      <div className="flex gap-3">
        <img
          src={notification.user.avatar}
          alt=""
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
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
          </div>

          {notification.type === 'access' && (
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1 text-xs bg-[#B43E8F] text-white rounded-md hover:bg-gray-800">
                Approve
              </button>
              <button className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50">
                Deny
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-lg font-semibold">Notification</h1>
          <button className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" onClick={() => navigate(-1)} />
          </button>
        </div>

        <div className="flex px-4 gap-4 pb-2 justify-evenly">
          {['View All', 'Mentions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '') as 'all' | 'mentions' | 'archive')}
              className={`text-sm py-1 ${
                activeTab === tab.toLowerCase().replace(' ', '')
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </div>
  );
};

export default MobileNotifications;