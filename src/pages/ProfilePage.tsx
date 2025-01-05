import { useState } from 'react';
import { Pencil, MapPin, Calendar, Briefcase, Users } from 'lucide-react';

type UserProfile = {
  username: string;
  handle: string;
  avatar: string;
  bio?: string;
  location?: string;
  occupation?: string;
  joinDate: string;
  followers: number;
  following: number;
};

type Post = {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
};

type Comment = {
  id: string;
  content: string;
  postTitle: string;
  timestamp: string;
};

type ProfileProps = {
  user: UserProfile;
  posts: Post[];
  comments: Comment[];
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
};

const ProfilePage = ({
  user,
  posts,
  comments,
  isOwnProfile = false,
  onEditProfile,
}: ProfileProps) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'about'>('posts');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={`${user.username}'s avatar`}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{user.handle}</p>
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
                    <button className="flex items-center gap-1 text-red-500">
                      ↑ {post.likes}
                    </button>
                    <button className="flex items-center gap-1">
                      💬 {post.comments}
                    </button>
                  </div>
                  <p className="flex items-center gap-1">
                    👁 {Math.round(post.likes * 1.5)} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'comments':
        return (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="text-sm text-gray-500 mb-2">
                  Commented on: {comment.postTitle}
                </p>
                <p className="text-gray-800">{comment.content}</p>
                <p className="text-sm text-gray-500 mt-2">{comment.timestamp}</p>
              </div>
            ))}
          </div>
        );
      case 'about':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            {user.bio && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Bio</h3>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}
            <div className="space-y-4">
              {user.location && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.occupation && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Briefcase className="w-5 h-5" />
                  <span>{user.occupation}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Joined {user.joinDate}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="w-5 h-5" />
                <span>
                  <strong>{user.followers}</strong> followers ·{' '}
                  <strong>{user.following}</strong> following
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gray-900 pb-32 pt-8">
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Avatar and Status */}
          <div className="absolute -bottom-16">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
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
            <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-600">{user.handle}</p>
          </div>
          {isOwnProfile && (
            <button
              onClick={onEditProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            {(['posts', 'comments', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
