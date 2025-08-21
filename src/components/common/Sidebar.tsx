import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Users2,
  UserRound,
  Film,
  Settings,
  X,
  LucideIcon
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userHandle?: string;
  avatarUrl?: string;
}

interface MenuItem {
  icon: LucideIcon;
  label: string;
  count: number;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen,
  onClose,
  userName = "Night Wing",
  userHandle = "@knightwing",
  avatarUrl = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
}) => {
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { icon: UserRound, label: 'Profile', count: 0, path: '/profile' },
    { icon: MessageCircle, label: 'Chat', count: 1, path: '/chats' },
    { icon: Users2, label: 'Forums', count: 0, path: '/forums' },
    { icon: UserRound, label: 'Friends', count: 3, path: '/friends' },
    { icon: Film, label: 'Media', count: 0, path: '/media' },
    { icon: Settings, label: 'Settings', count: 0, path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) {
      onClose(); // Close sidebar on mobile after navigation
    }
  };

  return (
    <>
      <div
        className={`
          fixed top-0 left-0 h-full bg-white z-40 w-64
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:h-screen
          border-r border-gray-200
          shadow-lg md:shadow-none
        `}
      >
        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-50"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={avatarUrl}
              alt={`${userName}'s profile`}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">{userName}</h2>
              <p className="text-sm text-gray-500 truncate">{userHandle}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <li key={index}>
                  <button
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={() => handleNavigation(item.path)}
                    aria-label={`Navigate to ${item.label}`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent 
                        size={20} 
                        className="text-gray-600 group-hover:text-gray-800 transition-colors" 
                      />
                      <span className="font-medium text-gray-900 group-hover:text-gray-800">
                        {item.label}
                      </span>
                    </div>
                    {item.count > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                        {item.count > 99 ? '99+' : item.count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;