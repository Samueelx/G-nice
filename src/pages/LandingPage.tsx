import React, { useEffect } from "react";
import SocialPost from "@/components/common/SocialPost";
import JokeJumbotron from "@/components/templates/JokeJumbotron";
import { Menu, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchPosts } from "@/features/posts/postsSlice";

interface LandingPageProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get posts from Redux store
  const { posts, isLoading, error } = useAppSelector((state) => state.posts);

  // Fetch posts on component mount
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
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
          <JokeJumbotron />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">Failed to load posts: {error}</p>
            </div>
          </div>
        )}

        {/* Posts Grid - Single column on mobile, centered on desktop */}
        {!isLoading && !error && (
          <div className="grid gap-4 grid-cols-1 max-w-2xl mx-auto">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} onClick={() => handlePostClick(post.id)} className="cursor-pointer">
                  <SocialPost
                    author={{
                      name: post.displayName,
                      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(post.displayName)}&background=9333ea&color=fff&bold=true`,
                      username: post.username,
                    }}
                    content={post.body}
                    images={post.imageUrls?.map((url, index) => ({
                      url,
                      alt: `Image ${index + 1}`,
                    }))}
                    timestamp={post.createdAt}
                    likes={post.likes}
                    comments={post.comments}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;