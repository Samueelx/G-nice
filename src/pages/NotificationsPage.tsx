import React from 'react';
import { X, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'comment' | 'file' | 'access' | 'mention' | 'completion' | 'fileAdd';
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
}

const jesseAvatar = 'https://plus.unsplash.com/premium_photo-1689606093808-3cb4393248d2?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const teoAvatar = 'https://plus.unsplash.com/premium_photo-1689606120599-d03635d06b12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1pbi1zYW1lLXNlcmllc3wxfHx8ZW58MHx8fHx8';
const sarahAvatar = 'https://plus.unsplash.com/premium_photo-1689604958200-ba6fe6f43695?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D';

const MobileNotifications = () => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'mentions' | 'archive'>('all');
  const navigate = useNavigate();

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'comment',
      user: { name: 'Jessie Joee', avatar: jesseAvatar },
      action: 'comment in',
      target: 'Facebook Campaign',
      timeAgo: '12 minutes ago'
    },
    {
      id: '2',
      type: 'fileAdd',
      user: { name: 'Teo Le', avatar: teoAvatar },
      action: 'added file to',
      target: 'WhatsApp Ads Campaign',
      timeAgo: '44 minutes ago',
      fileDetails: {
        name: 'LezatkaFoods_MarketingAssets_Sept2024.zip',
        size: '3.1 MB'
      }
    },
    {
      id: '3',
      type: 'access',
      user: { name: 'Sarah', avatar: sarahAvatar },
      action: 'requested access to',
      target: 'Instagram Ads',
      campaign: 'Lezatos',
      timeAgo: '56 minutes ago'
    }
  ];

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    return (
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
              <span className="font-medium">{notification.target}</span>
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
  };

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-lg font-semibold">Notification</h1>
          <button className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" onClick={() => navigate(-1)}/>
          </button>
        </div>
        
        <div className="flex px-4 gap-4 pb-2 justify-evenly">
          {['View All', 'Mentions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '') as any)}
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
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
};

export default MobileNotifications;