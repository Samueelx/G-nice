import { useState } from 'react';
import MobileSidebar from '../common/MobileSidebar';

const HamburgerSwap = () => {

    const recentCommunities = [
        {
          id: '1',
          name: 'r/programming',
          memberCount: 4200000,
          isSubscribed: true,
          avatar: '/path/to/avatar.png'
        },
        // ... more communities
      ];
      
      const subscribedCommunities = [
        {
          id: '2',
          name: 'r/react',
          memberCount: 300000,
          isSubscribed: true,
          avatar: '/path/to/avatar.png'
        },
        // ... more communities
      ];


  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      {/* Hamburger Button */}
      <button
        className="btn btn-ghost lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {/* Hamburger Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <MobileSidebar recentCommunities={recentCommunities} 
        subscribedCommunities={subscribedCommunities} 
        onCommunityClick={(communityId) => {console.log('Selected communuty: ', communityId)}}/>
      )}
    </div>
  );
};

export default HamburgerSwap;
