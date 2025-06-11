import React, { useEffect, useState } from "react";
import SocialPost from "@/components/common/SocialPost";
import data from "@/data.json";
import JokeJumbotron from "@/components/templates/JokeJumbotron";
import { WebSocketStatusComponent } from "@/components/WebSocketStatus";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Menu, Wifi, WifiOff } from "lucide-react";

// WebSocket configuration
const WS_URL = 'ws://localhost:8080/Memefest-SNAPSHOT-01/feeds';

interface LandingPageProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setIsSidebarOpen }) => {
  const [posts, setPosts] = useState(data); // Make posts state-managed for real-time updates
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);

  // Initialize WebSocket connection
  const {
    messages,
    send,
    isConnected,
    // status,
    error
  } = useWebSocket({
    url: WS_URL,
    enabled: true,
    heartbeatInterval: 30000,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  });

  const sendRandomTestData = () => {
  if (isConnected) {
    const randomId = Math.floor(Math.random() * 100000);
    const testPayload = {
      type: 'test_message',
      payload: {
        id: randomId,
        message: `Hello from client - ${randomId}`,
        timestamp: Date.now(),
      }
    };
    console.log("Sending test data:", testPayload);
    send(testPayload);
  } else {
    console.warn("WebSocket not connected");
  }
};


  // Handle incoming WebSocket messages
  useEffect(() => {
    messages.forEach((message) => {
      console.log('Received WebSocket message:', message);
      
      switch (message.type) {
        case 'new_post':
          // Add new post to the beginning of the feed
          setPosts(prevPosts => [message.payload, ...prevPosts]);
          break;
          
        case 'post_update':
          // Update existing post (likes, comments, etc.)
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === message.payload.id 
                ? { ...post, ...message.payload }
                : post
            )
          );
          break;
          
        case 'post_delete':
          // Remove deleted post
          setPosts(prevPosts => 
            prevPosts.filter(post => post.id !== message.payload.postId)
          );
          break;
          
        case 'feed_refresh':
          // Complete feed refresh
          if (message.payload.posts) {
            setPosts(message.payload.posts);
          }
          break;
          
        case 'user_activity':
          // Handle user activity updates (online status, etc.)
          console.log('User activity:', message.payload);
          break;
          
        case 'notification':
          // Handle real-time notifications
          console.log('Notification received:', message.payload);
          // You can integrate with a toast notification system here
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    });
  }, [messages]);

  // Send user activity when component mounts
  useEffect(() => {
    if (isConnected) {
      send({
        type: 'user_activity',
        payload: {
          action: 'view_feed',
          timestamp: Date.now(),
        }
      });
    }
  }, [isConnected, send]);
  
  useEffect(() => {
  if (!isConnected) return;

  const interval = setInterval(() => {
    sendRandomTestData();
  }, 2000); // every 5 seconds

  return () => clearInterval(interval);
}, [isConnected, sendRandomTestData]);


  // Handle post interactions via WebSocket
  const handlePostInteraction = (postId: string, action: string, data?: any) => {
    if (isConnected) {
      send({
        type: 'post_interaction',
        payload: {
          postId,
          action, // 'like', 'unlike', 'comment', 'share', etc.
          data,
          timestamp: Date.now(),
        }
      });
    }
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
                  Gnice
                </h1>
              </div>
              
              {/* Connection status and profile */}
              <div className="flex items-center gap-2">
                {/* WebSocket connection indicator */}
                <button
                  onClick={() => setShowConnectionStatus(!showConnectionStatus)}
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
            </div>
          </nav>
        </div>
        
        {/* WebSocket status detail (collapsible) */}
        {showConnectionStatus && (
          <div className="border-t border-purple-100 bg-white/90 p-3">
            <WebSocketStatusComponent 
              wsUrl={WS_URL} 
              showDetails={true}
              className="max-w-2xl mx-auto"
            />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full px-3 py-4">
        {/* Jumbotron - Made responsive */}
        <div className="mb-6 max-w-2xl mx-auto">
          <JokeJumbotron />
        </div>

        {/* Real-time feed indicator */}
        {isConnected && (
          <div className="max-w-2xl mx-auto mb-4">
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg py-2 px-4 border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live feed active</span>
            </div>
          </div>
        )}

        {/* Connection error indicator */}
        {error && (
          <div className="max-w-2xl mx-auto mb-4">
            <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg py-2 px-4 border border-red-200">
              <WifiOff className="w-4 h-4" />
              <span>Live feed disconnected: {error}</span>
            </div>
          </div>
        )}

        {/* Posts Grid - Single column on mobile, centered on desktop */}
        <div className="grid gap-4 grid-cols-1 max-w-2xl mx-auto">
          {posts.map((post, index) => (
            <SocialPost 
              key={post.id || index} 
              {...post}
              // Pass WebSocket interaction handler to posts if SocialPost supports it
              onInteraction={(action: string, data?: any) => 
                handlePostInteraction(post.id || index.toString(), action, data)
              }
            />
          ))}
        </div>

        {/* Empty state when no posts */}
        {posts.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-sm">
                {isConnected 
                  ? "Waiting for new posts to arrive..." 
                  : "Connect to the live feed to see real-time updates"
                }
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;