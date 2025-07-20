import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, MessageCircle, Share, MoreHorizontal, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react';
import { RootState } from '@/store/store';
import { useWebSocketContext } from '@/context/useWebSocketContext';
import { formatPostData } from '@/utils/postUtils';

const PostDetails: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentPostWithReplies, isLoading, error } = useSelector((state: RootState) => state.posts);
  const { isConnected, sendPostInteraction } = useWebSocketContext();
  
  const [post, setPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);

  // Update local state when currentPostWithReplies changes
  useEffect(() => {
    if (currentPostWithReplies) {
      const formattedPost = formatPostData(currentPostWithReplies);
      setPost(formattedPost);
      setReplies(formattedPost.replies || []);
    }
  }, [currentPostWithReplies]);

  // Handle post interactions
  const handleInteraction = (action: string, data?: any) => {
    if (post && sendPostInteraction) {
      sendPostInteraction(post.id || post.PostId.toString(), action, data);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      // Handle the format "23-05-2025-10:23:23"
      if (dateString.includes('-') && dateString.split('-').length === 4) {
        const parts = dateString.split('-');
        const timePart = parts[3];
        const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${timePart}`);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-800">Loading post details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <p className="text-lg font-medium">Error loading post</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-lg font-medium text-gray-600 mb-4">Post not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-purple-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Post Details</h1>
              <p className="text-sm text-gray-600">
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Original Post */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {/* Post Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
              {post.User?.Username?.[0]?.toUpperCase() || post.author?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800">
                  {post.User?.Username || post.author || 'Unknown User'}
                </h3>
                {post.User?.Verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.Created || post.createdAt || '')}</span>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Post Content */}
          <div className="mb-6">
            <p className="text-gray-800 text-lg leading-relaxed">
              {post.Comment || post.content}
            </p>
          </div>

          {/* Post Stats */}
          <div className="flex items-center gap-6 py-3 border-t border-gray-100">
            <button
              onClick={() => handleInteraction('upvote')}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="font-medium">{post.Upvotes || post.upvotes || 0}</span>
            </button>
            <button
              onClick={() => handleInteraction('downvote')}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <ThumbsDown className="w-5 h-5" />
              <span className="font-medium">{post.Downvotes || post.downvotes || 0}</span>
            </button>
            <button
              onClick={() => handleInteraction('reply')}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{replies.length}</span>
            </button>
            <button
              onClick={() => handleInteraction('share')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Share className="w-5 h-5" />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Replies Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Replies ({replies.length})
          </h2>

          {replies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No replies yet</p>
              <p className="text-gray-400">Be the first to reply to this post!</p>
            </div>
          ) : (
            replies.map((reply, index) => (
              <div key={reply.PostId || index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Reply Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                    {reply.User?.Username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">
                        {reply.User?.Username || 'Unknown User'}
                      </h4>
                      {reply.User?.Verified && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(reply.Created || '')}
                    </p>
                  </div>
                </div>

                {/* Reply Content */}
                <div className="mb-4">
                  <p className="text-gray-800 leading-relaxed">
                    {reply.Comment}
                  </p>
                </div>

                {/* Reply Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleInteraction('upvote_reply', { replyId: reply.PostId })}
                    className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{reply.Upvotes || 0}</span>
                  </button>
                  <button
                    onClick={() => handleInteraction('downvote_reply', { replyId: reply.PostId })}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{reply.Downvotes || 0}</span>
                  </button>
                  <button
                    onClick={() => handleInteraction('reply_to_reply', { replyId: reply.PostId })}
                    className="text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800 font-medium">
              ⚠️ Not connected to live feed. Interactions may not work properly.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PostDetails;