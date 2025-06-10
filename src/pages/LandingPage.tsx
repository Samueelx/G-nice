import React, { useEffect } from "react";
import SocialPost from "@/components/common/SocialPost";
import data from "@/data.json";
import JokeJumbotron from "@/components/templates/JokeJumbotron";
import { Menu } from "lucide-react";
import { useWebSocketOnFeeds } from '@/hooks/useWebSocketOnFeeds';
import { useWebSocketContext } from '../context/webSocketContext';

interface LandingPageProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setIsSidebarOpen }) => {
  // Use the WebSocket hook - this should initiate connection on mount
  const { isConnected, connectionStatus, connect, disconnect } = useWebSocketOnFeeds();
  const { sendMessage } = useWebSocketContext();

  // Ensure connection is established when component mounts
  useEffect(() => {
    console.log('LandingPage mounted, WebSocket status:', connectionStatus);
    
    // If not connected and not connecting, try to connect
    if (!isConnected && connectionStatus !== 'connecting') {
      console.log('Attempting to establish WebSocket connection...');
      // If your hook has a connect method, call it
      if (connect) {
        connect();
      }
    }

    // Cleanup on unmount (optional - depends on your app's needs)
    return () => {
      // Only disconnect if you want to close connection when leaving this page
      if (disconnect) {
        disconnect();
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Log connection status changes for debugging
  useEffect(() => {
    console.log('WebSocket connection status changed:', connectionStatus, 'Connected:', isConnected);
  }, [isConnected, connectionStatus]);

  // Connection indicator component
  const ConnectionIndicator = () => (
    <div className={`fixed top-4 right-4 px-3 py-1 rounded-full text-sm z-50 ${
      isConnected
        ? 'bg-green-100 text-green-800 border border-green-200'
        : connectionStatus === 'connecting'
        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {isConnected ? '🟢 Connected' : connectionStatus === 'connecting' ? '🟡 Connecting...' : '🔴 Disconnected'}
    </div>
  );

  // Manual reconnect function (useful for retry button)
  const handleReconnect = () => {
    console.log('Manual reconnect attempted');
    if (connect) {
      connect();
    }
  };

  // Example of sending a message
  const handleSendMessage = (data: any) => {
    if (isConnected) {
      sendMessage(data);
      console.log('Message sent:', data);
    } else {
      console.warn('WebSocket not connected - cannot send message');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 overflow-x-hidden">
      {/* Mobile-optimized header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-purple-100">
        <ConnectionIndicator />
        
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
                  Gnice
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
          
          {/* Debug info - remove in production */}
          <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
            <span>WebSocket Status: {connectionStatus}</span>
            {!isConnected && (
              <button
                onClick={handleReconnect}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
              >
                Retry Connection
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 py-4">
        {/* Jumbotron - Made responsive */}
        <div className="mb-6 max-w-2xl mx-auto">
          <JokeJumbotron />
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