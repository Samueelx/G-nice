import React from 'react';
import { Home, Search, PlusSquare, Bell, CalendarCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, isActive = false, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 p-2 ${
      isActive ? 'text-blue-600' : 'text-gray-600'
    } hover:text-blue-600 transition-colors`}
  >
    <div className="w-6 h-6">{icon}</div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const MobileFooterNav = () => {
  const [activeTab, setActiveTab] = React.useState('home');
  const navigate = useNavigate();

  const onClickNotifications = () => {
    setActiveTab('notifications');
    navigate('/notifications');
  }
  
  const onClickHome = () => {
    setActiveTab('home');
    navigate('/feeds');
  }

  const onClickCalendar = () => {
    setActiveTab('events');
    navigate('/events');
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 sm:px-6">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <NavItem
          icon={<Home className={activeTab === 'home' ? 'fill-current' : ''} />}
          label="Home"
          isActive={activeTab === 'home'}
          onClick={() => onClickHome()}
        />
        <NavItem
          icon={<Search />}
          label="Search"
          isActive={activeTab === 'search'}
          onClick={() => setActiveTab('search')}
        />
        <NavItem
          icon={<PlusSquare />}
          label="Create"
          isActive={activeTab === 'create'}
          onClick={() => setActiveTab('create')}
        />
        <NavItem
          icon={<CalendarCog />}
          label="Events"
          isActive={activeTab === 'events'}
          onClick={() => onClickCalendar()}
        />
        <NavItem
          icon={<Bell />}
          label="Notifications"
          isActive={activeTab === 'notifications'}
          onClick={() => onClickNotifications()}
        />
      </div>
    </nav>
  );
};

export default MobileFooterNav;