import { useState, useEffect, useRef } from "react";
import {
  Pencil,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  ArrowLeft,
  AlertCircle,
  Loader,
  MoreVertical,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useProfileData } from "../hooks/useProfileData";
import AdvancedProfileSkeleton from "@/components/templates/AdvancedProfileSkeleton";
import type { Comment } from "@/features/profile/profileSlice";

type ProfilePageProps = {
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
};

const ProfilePage = ({
  isOwnProfile = false,
  onEditProfile,
}: ProfilePageProps) => {
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "about">(
    "posts"
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const {
    profile,
    posts,
    comments,
    //commentsByPost,
    loading,
    error,
    clearErrorMessage,
  } = useProfileData(userId);

  useEffect(() => {
    if (error) {
      clearErrorMessage();
    }
  }, [clearErrorMessage, error]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffMs / 2592000000);

    if (diffMins < 60) return `${diffMins}mo`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}d`;
    return `${diffMonths}mo`;
  };

  if (loading && !profile) {
    return <AdvancedProfileSkeleton />;
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Profile Not Found
          </h2>
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  const handleEditProfileClick = () => {
    setShowDropdown(false);
    if (onEditProfile) {
      onEditProfile();
    }
  };

  // Render individual comment
  const renderComment = (comment: Comment) => (
    <div key={comment.id} className="bg-white p-3 rounded-md">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <img
          src={comment.userAvatar || profile.avatar}
          alt={comment.userName}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
            <span className="font-medium text-gray-900">
              {comment.userName}
            </span>
            <span>•</span>
            <span>{formatTime(comment.createdAt)}</span>
          </div>

          {/* Comment Body */}
          <p className="text-gray-800 text-sm mb-2">{comment.body}</p>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">👍 {comment.likes}</span>
            <span className="flex items-center gap-1">
              💬 {comment.comments?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
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
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.avatar}
                        alt={`${profile.username}'s avatar`}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {profile.handle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.timestamp}
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-gray-700">
                      ⋮
                    </button>
                  </div>

                  <p className="text-gray-900">{post.content}</p>

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

      case "comments":
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
              // Group comments by post
              (() => {
                const grouped = new Map<string, Comment[]>();
                comments.forEach((comment) => {
                  if (!grouped.has(comment.postId)) {
                    grouped.set(comment.postId, []);
                  }
                  grouped.get(comment.postId)!.push(comment);
                });

                return Array.from(grouped.entries()).map(
                  ([postId, postComments]) => {
                    return (
                      <div
                        key={postId}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                      >
                        {/* "Commented on:" label */}
                        <div className="px-4 pt-3 pb-2">
                          <p className="text-sm text-gray-500">
                            Commented on:{" "}
                            <span className="font-medium">Post Title Here</span>
                          </p>
                        </div>

                        {/* User's Comments - directly after the label, no post preview */}
                        <div className="px-4 py-3 space-y-3 border-t border-gray-200">
                          {postComments.map(renderComment)}
                        </div>
                      </div>
                    );
                  }
                );
              })()
            )}
          </div>
        );

      case "about":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6 relative">
            {isOwnProfile && (
              <div className="absolute top-4 right-4" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleEditProfileClick}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Profile Details
                    </button>
                  </div>
                )}
              </div>
            )}

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
                  <strong>{profile.followers}</strong> followers ·{" "}
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

      <div className="bg-gray-900 pb-32 pt-8">
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="absolute -top-8 left-1 p-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          </div>

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

      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.username}
            </h1>
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

        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8 justify-evenly">
            {(["posts", "comments", "about"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "posts" && posts.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {posts.length}
                  </span>
                )}
                {tab === "comments" && comments.length > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {comments.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="pb-12">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ProfilePage;
