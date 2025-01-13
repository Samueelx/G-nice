import React, { useState } from 'react';
import SocialPost from "@/components/common/SocialPost";
import data from '@/data.json';
import PostFilter from "@/components/common/PostFilter";
import HamburgerSwap from "@/components/specific/HamburgerSwap";
import Sidebar from '@/components/common/Sidebar'; // Adjust import path as needed

const LandingPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        avatarUrl="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
      />

      {/* Main Content */}
      <main className="flex-1">
        <header className="p-2 mb-2 md:p-8 static top-0 z-10 shadow-sm bg-white">
          <nav>
            <div className="flex items-center justify-between pb-4">
              {/* Sidebar Trigger (Avatar) */}
              <div>
                <img
                  className="rounded-full shadow-md hover:cursor-pointer w-16 h-16 md:w-20 md:h-20 object-cover"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  onClick={() => setIsSidebarOpen(true)}
                  alt="Avatar"
                />
              </div>

              {/* Center Icon */}
              <div>
                <img
                  className="w-16 h-16 md:w-20 md:h-20"
                  src="/g-icon.svg"
                  alt="G Icon"
                />
              </div>

              {/* Hamburger Menu */}
              <div>
                <HamburgerSwap />
              </div>
            </div>
          </nav>
        </header>

        {/* Feeds Section */}
        <section className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold px-2">Feeds</h2>
            <PostFilter />
          </div>
          <div className="space-y-4">
            {data.map((post, index) => (
              <SocialPost key={index} {...post} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
