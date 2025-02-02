import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Newspaper,
  MessageCircle, 
  Users2,
  UserRound,
  Film,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userHandle?: string;
  avatarUrl?: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  count: number;
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
    { icon: <div onClick={() => navigate('/profile')}><Newspaper size={24}/></div>, label: 'Profile', count: 0 },
    { icon: <div onClick={() => navigate('/chats')}><MessageCircle size={24} /></div>, label: 'Chat', count: 1 },
    { icon: <Users2 size={24} />, label: 'Forums', count: 0 },
    { icon: <UserRound size={24} />, label: 'Friends', count: 3 },
    { icon: <Film size={24} />, label: 'Media', count: 0 },
    { icon: <Settings size={24} />, label: 'Settings', count: 0 },
  ];

  return (
    <>
      <div
        className={`
          fixed top-0 left-0 h-full bg-white z-40 w-64
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:h-screen
          border-r border-gray-200
          shadow-lg
        `}
      >
        {/* Close button - mobile only */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={24} />
        </button>

        {/* Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="font-semibold text-gray-900">{userName}</h2>
              <p className="text-sm text-gray-500">{userHandle}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onClose(); // Close on mobile
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">{item.icon}</span>
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
