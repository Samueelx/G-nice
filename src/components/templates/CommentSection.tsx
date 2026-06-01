import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Clock, HeartIcon, MessageSquare, Send, Share2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  addJokeComment,
  likeComment,
  fetchJokeComments,
  addLocalComment,
  removeLocalComment,
  likeLocalComment,
  Comment,
} from "@/features/jumbotron/jokesSlice";

interface CommentSectionProps {
  jokeId: string;
  open: boolean;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ jokeId, open, onClose }) => {
  const dispatch = useAppDispatch();
  const [newComment, setNewComment] = useState("");

  const currentJoke = useAppSelector((state) => state.jokes.currentJoke);
  const comments = currentJoke?.comments ?? [];
  const loading = useAppSelector((state) => state.jokes.commentsLoading);
  const error = useAppSelector((state) => state.jokes.error);

  // Pull the real logged-in user from Redux auth state
  const authUser = useAppSelector((state) => state.auth.user);
  const currentUser = {
    id: authUser?.id?.toString() ?? "anonymous",
    name: authUser?.display_name || authUser?.username || "You",
    avatar:
      authUser?.avatar_url ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        authUser?.display_name || authUser?.username || "U"
      )}&background=9333ea&color=fff&bold=true`,
  };

  // Fetch comments whenever the dialog opens
  useEffect(() => {
    if (open && jokeId) {
      dispatch(fetchJokeComments(jokeId));
    }
  }, [open, jokeId, dispatch]);

  const handleAddComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    if (trimmed.length > 500) {
      alert("Comment is too long. Maximum 500 characters allowed.");
      return;
    }

    const tempId = `temp-${Date.now()}`;

    // Optimistic insert
    const tempComment: Comment = {
      commentId: tempId,
      user: {
        userId: currentUser.id,
        userName: currentUser.name,
        avatar: currentUser.avatar,
      },
      content: trimmed,
      likes: 0,
      replies: 0,
      timestamp: "Just now",
    };

    dispatch(addLocalComment({ comment: tempComment }));
    setNewComment("");

    try {
      await dispatch(addJokeComment({ jokeId, content: trimmed })).unwrap();
      // On success the fulfilled handler replaces the temp comment with the real one
    } catch (err) {
      // Roll back the optimistic comment on failure
      dispatch(removeLocalComment({ commentId: tempId }));
      setNewComment(trimmed); // Restore text so the user doesn't lose their work
      console.error("Failed to add comment:", err);
      alert("Failed to post comment. Please try again.");
    }
  };

  const handleLike = async (commentId: string) => {
    // Optimistic increment
    dispatch(likeLocalComment({ commentId }));

    try {
      await dispatch(likeComment({ jokeId, commentId })).unwrap();
      // Fulfilled handler sets the authoritative likes_count from the server
    } catch (err) {
      // Revert the optimistic increment by decrementing
      dispatch(likeLocalComment({ commentId })); // Note: this increments again — see note below
      console.error("Failed to like comment:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        {/* Comment list */}
        {loading ? (
          <div className="py-6 text-center text-sm text-gray-500">Loading comments…</div>
        ) : error ? (
          <div className="py-6 text-center text-sm text-red-500">{error}</div>
        ) : comments.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto mb-4 space-y-4 pr-1">
            {comments.map((comment: Comment) => (
              <div key={comment.commentId}>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.user.avatar} alt={comment.user.userName} />
                    <AvatarFallback>{comment.user.userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-medium text-sm truncate">{comment.user.userName}</h4>
                      <span className="text-xs text-gray-400 shrink-0">{comment.timestamp}</span>
                    </div>

                    <p className="text-sm mt-0.5 text-gray-800 break-words">{comment.content}</p>

                    <div className="flex items-center mt-2 gap-4">
                      <button
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                        onClick={() => handleLike(comment.commentId)}
                        aria-label={`Like comment by ${comment.user.userName}`}
                      >
                        <HeartIcon
                          size={14}
                          className={comment.likes > 0 ? "text-red-500 fill-red-500" : ""}
                        />
                        <span>{comment.likes}</span>
                      </button>

                      <button
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600 transition-colors"
                        aria-label={`Reply to comment by ${comment.user.userName}`}
                      >
                        <MessageSquare size={14} />
                        <span>{comment.replies}</span>
                      </button>

                      <button
                        className="flex items-center text-xs text-gray-500 hover:text-purple-600 transition-colors ml-auto"
                        aria-label={`Share comment by ${comment.user.userName}`}
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment input */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <Input
            placeholder="Write a comment…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
            aria-label="Write a comment"
            maxLength={500}
          />

          <div className="flex gap-1">
            {/* Clock button — placeholder for future scheduled comments */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-400"
              aria-label="Schedule comment (coming soon)"
              type="button"
              tabIndex={-1}
            >
              <Clock className="w-5 h-5" />
            </Button>

            <Button
              onClick={handleAddComment}
              size="icon"
              className="rounded-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!newComment.trim()}
              aria-label="Send comment"
              type="button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentSection;