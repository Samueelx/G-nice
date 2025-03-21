import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { HeartIcon, MessageSquare, Share2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { addJokeComment, likeComment, fetchJokeComments, addLocalComment, likeLocalComment, Comment } from "@/features/jumbotron/jokesSlice";

import { dummyJoke } from '@/data/dummyJoke';

interface CommentSectionProps {
  jokeId: string;
  open: boolean;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ jokeId, open, onClose }) => {
  const dispatch = useAppDispatch();
  const [newComment, setNewComment] = useState("");
  
  // Get current joke and state from Redux store
  const currentJoke = useAppSelector(state => state.jokes.currentJoke);
  const comments = currentJoke?.comments || dummyJoke.comments;
  const loading = useAppSelector(state => state.jokes.loading);
  const error = useAppSelector(state => state.jokes.error);
  
  // Get current user (this would come from your auth state)
  const currentUser = {
    id: "currentUser",
    name: "Current User",
    avatar: "/avatars/default.png"
  };
  
  // Fetch comments when the modal opens
  useEffect(() => {
    if (open && jokeId) {
      dispatch(fetchJokeComments(jokeId));
    }
  }, [open, jokeId, dispatch]);
  
  const handleAddComment = async () => {
    if (newComment.trim()) {
      // Validate comment length
      if (newComment.length > 500) {
        alert("Comment is too long. Maximum 500 characters allowed.");
        return;
      }
      
      // For optimistic UI updates
      const tempComment = {
        id: `temp-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        content: newComment,
        likes: 0,
        replies: 0,
        timestamp: "Just now"
      };
      
      // Update local state immediately for a responsive UI
      dispatch(addLocalComment({ comment: tempComment }));
      
      try {
        // Make the API call
        await dispatch(addJokeComment({ 
          jokeId, 
          content: newComment, 
          user: currentUser 
        })).unwrap();
        
        setNewComment("");
      } catch (error) {
        // Revert optimistic update on failure
        dispatch(likeLocalComment({ commentId: tempComment.id })); // Remove temporary comment
        console.error("Failed to add comment:", error);
        alert("Failed to add comment. Please try again.");
      }
    }
  };
  
  const handleLike = async (commentId: string) => {
    // Optimistic update
    dispatch(likeLocalComment({ commentId }));
    
    try {
      // Make the API call
      await dispatch(likeComment({ jokeId, commentId })).unwrap();
    } catch (error) {
      // Revert optimistic update on failure
      dispatch(likeLocalComment({ commentId }));
      console.error("Failed to like comment:", error);
    }
  };
  
  // If we have no joke data yet
  if (!currentJoke && !loading) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Comments</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="h-8 w-8 p-0"
              aria-label="Close comments"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {loading ? (
          <div className="py-4 text-center">Loading comments...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">{error}</div>
        ) : comments.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No comments yet. Be the first to comment!</div>
        ) : (
          <div className="max-h-80 overflow-y-auto mb-4">
            {comments.map((comment: Comment) => (
              <div key={comment.id} className="mb-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{comment.authorName}</h4>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    
                    <p className="text-sm mt-1">{comment.content}</p>
                    
                    <div className="flex items-center mt-2 gap-4">
                      <button 
                        className="flex items-center gap-1 text-xs text-gray-600"
                        onClick={() => handleLike(comment.id)}
                        aria-label={`Like comment by ${comment.authorName}`}
                      >
                        <HeartIcon size={16} className={comment.likes > 0 ? "text-red-500 fill-red-500" : ""} />
                        <span>{comment.likes}</span>
                      </button>
                      
                      <button 
                        className="flex items-center gap-1 text-xs text-gray-600"
                        aria-label={`Reply to comment by ${comment.authorName}`}
                      >
                        <MessageSquare size={16} />
                        <span>{comment.replies}</span>
                      </button>
                      
                      <button 
                        className="flex items-center text-xs text-gray-600 ml-auto"
                        aria-label={`Share comment by ${comment.authorName}`}
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <Input
            placeholder="Write Comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            aria-label="Write a comment"
          />
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              aria-label="Schedule comment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </Button>
            
            <Button 
              onClick={handleAddComment}
              size="icon" 
              className="rounded-full bg-primary text-white"
              disabled={!newComment.trim()}
              aria-label="Send comment"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentSection;