import React from 'react';
import SocialPost from "@/components/common/SocialPost";
import data from '@/data.json';
import PostFilter from "@/components/common/PostFilter";

interface LandingPageProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setIsSidebarOpen }) => {
  return (
    <>
      <header className="p-4 md:p-6 static top-0 z-10 shadow-sm bg-white">
        <nav>
          <div className="flex items-center justify-between">
            {/* Sidebar Trigger (Avatar) */}
            <div>
              <img
                className="rounded-full shadow-md hover:cursor-pointer w-12 h-12 md:w-16 md:h-16 object-cover"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                onClick={() => setIsSidebarOpen(true)} // Toggle sidebar on click
                alt="Avatar"
              />
            </div>

            {/* Center Icon */}
            <div>
              <img
                className="w-12 h-12 md:w-16 md:h-16"
                src="/g-icon.svg"
                alt="G Icon"
              />
            </div>
          </div>
        </nav>
      </header>

      {/* Feeds Section */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Feeds</h2>
          <PostFilter />
        </div>
        <div className="space-y-6">
          {data.map((post, index) => (
            <SocialPost key={index} {...post} />
          ))}
        </div>
      </section>
    </>
  );
};

export default LandingPage;