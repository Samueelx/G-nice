import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SocialPost from "@/components/common/SocialPost";
import JokeJumbotron from "@/components/templates/JokeJumbotron";
import { useWebSocketContext } from "@/context/useWebSocketContext";
import { useWebSocketPostsHandler } from "@/features/posts/useWebSocketPostsHandler";
import { isValidPostForDetails } from "@/utils/postUtils"; // Remove fetchPostDetails import
import { Menu, Wifi, WifiOff, Bell, BellOff, Eye } from "lucide-react";
import { 
  fetchPosts,
  fetchPostDetails // Add this import for the Redux thunk
} from "@/features/posts/postsSlice";
import { RootState } from "@/store/store";

interface LandingPageProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get posts from Redux store
  const { posts, isLoading, error, currentPostWithReplies, isLoadingPostDetails } = useSelector((state: RootState) => state.posts);
  
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [notifications, setNotifications] = useState(true);
  const [loadingPostDetails, setLoadingPostDetails] = useState<string | null>(null);

  // Use WebSocket context - add sendRaw
  const {
    isConnected,
    error: wsError,
    status,
    sendPostInteraction,
    sendMessage,
    sendRaw // Add this
  } = useWebSocketContext();

  // Use the WebSocket posts handler hook
  useWebSocketPostsHandler();

  console.log('Full Redux state:', {
    posts: posts,
    isLoading: isLoading,
    error: error,
    currentPostWithReplies: currentPostWithReplies,
    isLoadingPostDetails: isLoadingPostDetails,
    fullState: useSelector((state: RootState) => state.posts)
  });

  // Fetch posts when component mounts
  useEffect(() => {
    if (isConnected) {
      console.log("🚀 Fetching posts on component mount");
      dispatch(fetchPosts({ sendMessage }));
    }
  }, [isConnected, dispatch, sendMessage]);

  // Listen for post with replies updates
  useEffect(() => {
    if (currentPostWithReplies && loadingPostDetails) {
      console.log('📍 Post details loaded, navigating to post page');
      setLoadingPostDetails(null);
      
      navigate(`/post/${currentPostWithReplies.post.id}`);
    }
  }, [currentPostWithReplies, loadingPostDetails, navigate]);

  // Listen for posts count changes to show notifications
  useEffect(() => {
    const currentPostsCount = posts.length;
    
    if (currentPostsCount > 0 && !isLoading) {
      if (notifications && 'Notification' in window && Notification.permission === 'granted') {
        const latestPost = posts[0];
        if (latestPost && latestPost.author) {
          new Notification('New Post Available!', {
            body: `New post from ${latestPost.author}`,
            icon: '/g-icon.svg'
          });
        }
      }
    }
  }, [posts.length, isLoading, notifications, posts]);

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

  // Handle post interactions
  const handlePostInteraction = useCallback((postId: string, action: string, data?: any) => {
    sendPostInteraction(postId, action, data);
  }, [sendPostInteraction]);

  // Handle post click to view details - UPDATED to use Redux thunk
  const handlePostClick = useCallback((post: any) => {
    if (!isConnected) {
      console.warn('Cannot fetch post details: WebSocket not connected');
      return;
    }

    if (!isValidPostForDetails(post)) {
      console.warn('Invalid post data for fetching details:', post);
      return;
    }

    const postId = parseInt(post.PostId?.toString() || post.id);
    console.log('👁️ User clicked on post:', postId);
    
    setLoadingPostDetails(postId.toString());
    
    // Use Redux thunk with sendRaw
    dispatch(fetchPostDetails({ 
      postId, 
      sendRaw 
    }));
  }, [isConnected, sendRaw, dispatch]);

  // Refresh posts manually
  const refreshPosts = useCallback(() => {
    if (isConnected) {
      console.log("🔄 Manually refreshing posts");
      dispatch(fetchPosts({ sendMessage }));
    }
  }, [isConnected, dispatch, sendMessage]);

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

                {/* Refresh button */}
                <button
                  onClick={refreshPosts}
                  className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
                  title="Refresh posts"
                  disabled={isLoading}
                >
                  <svg className={`w-4 h-4 text-purple-600 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

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
                      Status: {status} | Posts: {posts.length}
                    </p>
                  </div>
                  {(wsError || error) && (
                    <p className="text-xs text-red-600">Error: {wsError || error}</p>
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

        {/* Loading State */}
        {isLoading && posts.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className="text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">Loading posts...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && posts.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className="text-red-500">
              <p className="text-lg font-medium mb-2">Error loading posts</p>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={refreshPosts}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 && (
          <div className="grid gap-4 grid-cols-1 max-w-2xl mx-auto">
            {posts.map((post, index) => {
              const postId = post.PostId?.toString() || post.id;
              const isLoadingDetails = loadingPostDetails === postId || isLoadingPostDetails;
              
              return (
                <div key={post.id || index} className="relative group">
                  {/* New post indicator */}
                  {index < newPostsCount && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        New!
                      </div>
                    </div>
                  )}
                  
                  {/* View Details Button Overlay */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePostClick(post);
                      }}
                      disabled={isLoadingDetails || !isConnected}
                      className={`
                        flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all
                        ${isLoadingDetails 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white/90 text-purple-600 hover:bg-purple-100 hover:text-purple-700 shadow-sm'
                        }
                      `}
                      title={isLoadingDetails ? 'Loading post details...' : 'View post details'}
                    >
                      {isLoadingDetails ? (
                        <>
                          <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Make the entire post clickable */}
                  <div 
                    className="cursor-pointer transform transition-transform duration-200 hover:scale-[1.02]"
                    onClick={() => handlePostClick(post)}
                  >
                    <SocialPost 
                      {...post}
                      onInteraction={(action, data) => handlePostInteraction(post.id || `post-${index}`, action, data)}
                    />
                  </div>
                </div>
              );
            })}
            
            {/* Loading indicator at the bottom if loading more posts */}
            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            )}
          </div>
        )}

        {/* No posts message */}
        {!isLoading && posts.length === 0 && !error && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No posts available</p>
              <p className="text-sm">
                {isConnected ? 'Be the first to create a post!' : 'Connect to see posts'}
              </p>
            </div>
          </div>
        )}

        {/* Post details loading indicator - Updated to use Redux state */}
        {(loadingPostDetails || isLoadingPostDetails) && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-800 mb-2">Loading Post Details</p>
                <p className="text-sm text-gray-600">Fetching post and replies...</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p>Debug: Posts: {posts.length} | Loading: {isLoading ? 'Yes' : 'No'} | Connected: {isConnected ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'} | WS Error: {wsError || 'None'}</p>
            <p>Loading Post Details: {loadingPostDetails || 'None'} | Redux Loading: {isLoadingPostDetails ? 'Yes' : 'No'}</p>
            <p>Current Post: {currentPostWithReplies ? 'Loaded' : 'None'}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;