import React from "react";
import SocialPost from "@/components/common/SocialPost";
import data from "@/data.json";
import JokeJumbotron from "@/components/templates/JokeJumbotron";
// import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react"; // Removed Sparkles import

interface LandingPageProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setIsSidebarOpen }) => {
  const joke = {
    setup: "Why don't programmers like nature?",
    punchline: "It has too many bugs!",
    author: "John Doe",
    date: "2025-02-18",
    likes: 42,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 overflow-x-hidden">
      {/* Mobile-optimized header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-purple-100">
        {/* Main header content */}
        <div className="p-3">
          <nav className="w-full">
            <div className="flex items-center justify-between gap-2">
              {/* Menu trigger for mobile */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Menu className="w-6 h-6 text-purple-600" />
              </button>

              {/* Center Logo - Simplified for mobile */}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 transition-transform duration-200 hover:rotate-12"
                  src="/g-icon.svg"
                  alt="G Icon"
                />
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  GiggleHub
                </h1>
              </div>

              {/* Profile for mobile */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-200">
                  <img
                    className="w-full h-full object-cover"
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    alt="Profile"
                  />
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 py-4">
        {/* Jumbotron - Made responsive */}
        <div className="mb-6 max-w-2xl mx-auto">
          <JokeJumbotron joke={joke} onShare={() => console.log("Share Clicked!")}/>
        </div>

        {/* Posts Grid - Single column on mobile, centered on desktop */}
        <div className="grid gap-4 grid-cols-1 max-w-2xl mx-auto">
          {data.map((post, index) => (
            <SocialPost key={index} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;