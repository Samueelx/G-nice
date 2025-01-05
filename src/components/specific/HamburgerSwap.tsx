import { useState } from "react";
import MobileSidebar from "../common/MobileSidebar";

const HamburgerSwap = () => {
  const recentCommunities = [
    {
      id: "1",
      name: "r/programming",
      memberCount: 4200000,
      isSubscribed: true,
      avatar: "https://plus.unsplash.com/premium_photo-1683120974913-1ef17fdec2a8?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    // ... more communities
  ];

  const subscribedCommunities = [
    {
      id: "2",
      name: "r/react",
      memberCount: 300000,
      isSubscribed: true,
      avatar: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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

      {/* Sidebar */}
      <MobileSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        recentCommunities={recentCommunities}
        subscribedCommunities={subscribedCommunities}
        onCommunityClick={(communityId) => {
          console.log("Selected community: ", communityId);
        }}
      />
    </div>
  );
};

export default HamburgerSwap;
