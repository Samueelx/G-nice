import React from 'react';
import { Bell } from 'lucide-react';
import { useGetUnreadCountQuery } from '@/services/api/notificationsApi';

interface NotificationBadgeProps {
  onClick?: () => void;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  onClick, 
  className = '' 
}) => {
  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.count || 0;

  return (
    <button
      onClick={onClick}
      className={`relative p-2 hover:bg-gray-100 rounded-full transition-colors ${className}`}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBadge;