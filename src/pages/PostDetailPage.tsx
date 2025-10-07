import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Send, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { AppDispatch, RootState } from "@/store/store";
import { 
  fetchPostById, 
  fetchComments, 
  createComment, 
  clearSelectedPost, 
  Comment
} from "@/features/posts/postsSlice";

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { 
    selectedPost, 
    comments, 
    isLoadingPost, 
    isLoadingComments, 
    error 
  } = useSelector((state: RootState) => state.posts);

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId));
      dispatch(fetchComments(postId));
    }

    return () => {
      dispatch(clearSelectedPost());
    };
  }, [postId, dispatch]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim() || !postId) return;

    setIsSubmittingComment(true);
    try {
      await dispatch(createComment({
        postId,
        body: commentBody.trim()
      })).unwrap();
      setCommentBody("");
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
        <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-purple-100">
          <div className="p-3">
            <nav className="w-full">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/feeds`)}
                  className="p-2 hover:bg-purple-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <ArrowLeft className="w-6 h-6 text-purple-600" />
                </button>
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
                <div className="w-8 h-8"></div>
              </div>
            </nav>
          </div>
        </header>
        <main className="w-full px-3 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Post Not Found</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigate("/feeds")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Back to Feed
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 overflow-x-hidden">
      {/* Header with back navigation */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-purple-100">
        <div className="p-3">
          <nav className="w-full">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <ArrowLeft className="w-6 h-6 text-purple-600" />
              </button>
              
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
              
              <div className="w-8 h-8"></div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 py-4">
        <div className="max-w-2xl mx-auto">
          {/* Loading state for post */}
          {isLoadingPost ? (
            <div className="bg-white rounded-lg border border-purple-100 p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ) : selectedPost ? (
            <>
              {/* Post Display */}
              <div className="bg-white rounded-lg border border-purple-100 mb-6 overflow-hidden shadow-sm">
                {/* Post Header */}
                <div className="p-4 border-b border-purple-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200">
                        <img
                          className="w-full h-full object-cover"
                          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                          alt="User Avatar"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Amanda Haydenson</h3>
                        <p className="text-sm text-gray-500">{formatTimeAgo(selectedPost.createdAt)}</p>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <p className="text-gray-800 mb-4">{selectedPost.body}</p>
                  {/* Updated to handle imageUrls array */}
                  {selectedPost.imageUrls && selectedPost.imageUrls.length > 0 && (
                    <div className="rounded-lg overflow-hidden mb-4">
                      <img
                        src={selectedPost.imageUrls[0]}
                        alt="Post content"
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-purple-50">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-medium">{selectedPost.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{selectedPost.comments}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-lg border border-purple-100 overflow-hidden shadow-sm">
                {/* Comments Header */}
                <div className="p-4 border-b border-purple-50">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Comments ({selectedPost.comments})
                  </h2>
                </div>

                {/* Comment Input */}
                <div className="p-4 border-b border-purple-50">
                  <form onSubmit={handleSubmitComment} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-200 flex-shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        alt="Your Avatar"
                      />
                    </div>
                    <div className="flex-1 relative">
                      <textarea
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full px-4 py-3 border border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                        disabled={isSubmittingComment}
                      />
                      <button
                        type="submit"
                        disabled={!commentBody.trim() || isSubmittingComment}
                        className="absolute bottom-3 right-3 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Comments List */}
                <div className="divide-y divide-purple-50">
                  {isLoadingComments ? (
                    <div className="p-4">
                      <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : comments.length > 0 ? (
                    comments.map((comment: Comment) => (
                      <div key={comment.id} className="p-4 hover:bg-purple-25 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-200 flex-shrink-0">
                            <img
                              className="w-full h-full object-cover"
                              src={comment.userAvatar || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                              alt={`${comment.userName}'s avatar`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {comment.userName}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-800 text-sm leading-relaxed">
                              {comment.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No comments yet.</p>
                      <p className="text-gray-400 text-sm">Be the first to comment!</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default PostDetailPage;