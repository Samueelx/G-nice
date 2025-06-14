import React, { useEffect, useState, useCallback } from "react";
import SocialPost from "@/components/common/SocialPost";
import data from "@/data.json";
import JokeJumbotron from "@/components/templates/JokeJumbotron";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Menu, Wifi, WifiOff, Bell, BellOff } from "lucide-react";

// WebSocket configuration
const WS_URL = 'ws://localhost:8090';

interface LandingPageProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setIsSidebarOpen }) => {
  const [posts, setPosts] = useState(data); // Initialize with static data
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [notifications, setNotifications] = useState(true);

  // Initialize WebSocket connection
  const {
    messages,
    send,
    isConnected,
    error,
    status
  } = useWebSocket({
    url: WS_URL,
    enabled: true,
    heartbeatInterval: 30000,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  });

  // Send initial connection message
  useEffect(() => {
    if (isConnected && send) {
      console.log("WebSocket Connected - Subscribing to posts feed");
      send({
        type: 'subscribe_posts',
        payload: {
          userId: 'current_user', // Replace with actual user ID
          timestamp: Date.now(),
        }
      });
    }
  }, [isConnected, send]);

  // Process incoming WebSocket messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      console.log('Processing WebSocket message:', latestMessage);

      switch (latestMessage.type) {
        case 'new_post':
          // Add new post to the top of the feed
          if (latestMessage.payload && latestMessage.payload.post) {
            setPosts(prevPosts => [latestMessage.payload.post, ...prevPosts]);
            setNewPostsCount(prev => prev + 1);
            
            // Show notification if enabled
            if (notifications && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('New Post Available!', {
                body: `New post from ${latestMessage.payload.post.author || 'Unknown'}`,
                icon: '/g-icon.svg'
              });
            }
          }
          break;

        case 'post_update':
          // Update existing post
          if (latestMessage.payload && latestMessage.payload.postId) {
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.id === latestMessage.payload.postId 
                  ? { ...post, ...latestMessage.payload.updates }
                  : post
              )
            );
          }
          break;

        case 'post_deleted':
          // Remove deleted post
          if (latestMessage.payload && latestMessage.payload.postId) {
            setPosts(prevPosts => 
              prevPosts.filter(post => post.id !== latestMessage.payload.postId)
            );
          }
          break;

        case 'posts_sync':
          // Full posts synchronization
          if (latestMessage.payload && latestMessage.payload.posts) {
            setPosts(latestMessage.payload.posts);
          }
          break;

        default:
          console.log('Unhandled message type:', latestMessage.type);
      }
    }
  }, [messages, notifications]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Toggle connection status visibility
  const toggleConnectionStatus = useCallback(() => {
    setShowConnectionStatus(prev => !prev);
  }, []);

  // Toggle notifications
  const toggleNotifications = useCallback(() => {
    setNotifications(prev => !prev);
  }, []);

  // Clear new posts indicator
  const clearNewPostsIndicator = useCallback(() => {
    setNewPostsCount(0);
  }, []);

  // Send interaction to server
  const handlePostInteraction = useCallback((postId: string, action: string, data?: any) => {
    if (isConnected && send) {
      send({
        type: 'post_interaction',
        payload: {
          postId,
          action,
          data,
          timestamp: Date.now()
        }
      });
    }
  }, [isConnected, send]);

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
                aria-label="Open sidebar"
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

              {/* Right side controls */}
              <div className="flex items-center gap-1">
                {/* New posts indicator */}
                {newPostsCount > 0 && (
                  <button
                    onClick={clearNewPostsIndicator}
                    className="relative px-2 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
                  >
                    {newPostsCount} new
                  </button>
                )}

                {/* Notifications toggle */}
                <button
                  onClick={toggleNotifications}
                  className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
                  title={notifications ? 'Disable notifications' : 'Enable notifications'}
                >
                  {notifications ? (
                    <Bell className="w-4 h-4 text-purple-600" />
                  ) : (
                    <BellOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* WebSocket status */}
                <button
                  onClick={toggleConnectionStatus}
                  className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
                  title={isConnected ? 'Connected to live feed' : 'Disconnected from live feed'}
                >
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                </button>

                {/* Profile for mobile */}
                <div className="relative ml-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-200">
                    <img
                      className="w-full h-full object-cover"
                      src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      alt="Profile"
                    />
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Connection Status Panel */}
        {showConnectionStatus && (
          <div className="border-t border-purple-100 bg-white/90 p-3">
            <div className="max-w-2xl mx-auto">
              <div className={`p-3 rounded-lg border text-sm ${
                isConnected 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Live Feed: {isConnected ? 'Connected ✅' : 'Disconnected ❌'}
                    </p>
                    <p className="text-xs opacity-75">
                      Status: {status} | Messages: {messages?.length || 0}
                    </p>
                  </div>
                  {error && (
                    <p className="text-xs text-red-600">Error: {error}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full px-3 py-4">
        {/* Jumbotron - Made responsive */}
        <div className="mb-6 max-w-2xl mx-auto">
          <JokeJumbotron />
        </div>

        {/* Live Feed Status */}
        {isConnected && (
          <div className="mb-4 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">Live feed active</span>
                <span className="text-gray-600">• Real-time updates enabled</span>
              </div>
            </div>
          </div>
        )}

        {/* Posts Grid - Single column on mobile, centered on desktop */}
        <div className="grid gap-4 grid-cols-1 max-w-2xl mx-auto">
          {posts.map((post, index) => (
            <div key={post.id || index} className="relative">
              {/* New post indicator */}
              {index < newPostsCount && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    New!
                  </div>
                </div>
              )}
              
              <SocialPost 
                {...post}
                onInteraction={(action, data) => handlePostInteraction(post.id || `post-${index}`, action, data)}
              />
            </div>
          ))}
        </div>

        {/* No posts message */}
        {posts.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No posts available</p>
              <p className="text-sm">
                {isConnected ? 'Waiting for new posts...' : 'Connect to see live posts'}
              </p>
            </div>
          </div>
        )}

        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p>Debug: Posts: {posts.length} | WS Messages: {messages?.length || 0} | Connected: {isConnected ? 'Yes' : 'No'}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;