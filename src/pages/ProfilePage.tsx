import { useState, useEffect } from 'react';
import { Pencil, MapPin, Calendar, Briefcase, Users, ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData'; // Adjust import path
import {Comment, Post} from '@/features/profile/profileSlice';

type ProfilePageProps = {
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
};

const ProfilePage = ({ isOwnProfile = false, onEditProfile }: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'about'>('posts');
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  
  const {
    profile,
    posts,
    comments,
    loading,
    error,
    clearErrorMessage
  } = useProfileData(userId);

  useEffect(() => {
    // Clear any previous errors when component mounts
    if (error) {
      clearErrorMessage();
    }
  }, [clearErrorMessage, error]);

  // Loading state
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No profile data
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {loading && posts.length === 0 ? (
              <div className="text-center py-8">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No posts yet</p>
              </div>
            ) : (
              posts.map((post: Post) => (
                <div
                  key={post.id}
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.avatar}
                        alt={`${profile.username}'s avatar`}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{profile.handle}</p>
                        <p className="text-xs text-gray-500">{post.timestamp}</p>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">⋮</button>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-900">{post.content}</p>

                  {/* Post Footer */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors">
                        ↑ {post.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                        💬 {post.comments}
                      </button>
                    </div>
                    <p className="flex items-center gap-1">
                      👁 {Math.round(post.likes * 1.5)} views
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      
      case 'comments':
        return (
          <div className="space-y-4">
            {loading && comments.length === 0 ? (
              <div className="text-center py-8">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No comments yet</p>
              </div>
            ) : (
              comments.map((comment: Comment) => (
                <div key={comment.id} className="bg-white p-4 rounded-lg shadow-md">
                  <p className="text-sm text-gray-500 mb-2">
                    Commented on: <span className="font-medium">{comment.postTitle}</span>
                  </p>
                  <p className="text-gray-800">{comment.content}</p>
                  <p className="text-sm text-gray-500 mt-2">{comment.timestamp}</p>
                </div>
              ))
            )}
          </div>
        );
      
      case 'about':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            {profile.bio && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Bio</h3>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}
            <div className="space-y-4">
              {profile.location && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.occupation && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Briefcase className="w-5 h-5" />
                  <span>{profile.occupation}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Joined {profile.joinDate}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="w-5 h-5" />
                <span>
                  <strong>{profile.followers}</strong> followers ·{' '}
                  <strong>{profile.following}</strong> following
                </span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
            <button
              onClick={clearErrorMessage}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-gray-900 pb-32 pt-8">
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <div className="absolute -top-8 left-1 p-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          </div>
          
          {/* Avatar and Status */}
          <div className="absolute -bottom-16 right-4">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-32 h-32 rounded-full border-4 border-white"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* User Info */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
            <p className="text-gray-600">{profile.handle}</p>
          </div>
          {isOwnProfile && (
            <button
              onClick={onEditProfile}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Pencil className="w-4 h-4" />
              )}
              Edit Profile
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8 justify-evenly">
            {(['posts', 'comments', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {/* Show count badges */}
                {tab === 'posts' && posts.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {posts.length}
                  </span>
                )}
                {tab === 'comments' && comments.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {comments.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-12">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ProfilePage;