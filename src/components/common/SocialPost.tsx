import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, HeartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SocialPostProps {
  id?: string;
  author?: string;
  avatar?: string;
  timestamp?: string;
  content?: string;
  image?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  isLiked?: boolean;
  onInteraction?: (action: string, data?: any) => void;
}

const SocialPost: React.FC<SocialPostProps> = ({
  id,
  author = "Anonymous",
  avatar = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
  timestamp = "now",
  content = "",
  image,
  likes = 0,
  comments = 0,
  shares = 0,
  isLiked = false,
  onInteraction
}) => {
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentIsLiked, setCurrentIsLiked] = useState(isLiked);
  const [currentComments, setCurrentComments] = useState(comments);
  const [currentShares, setCurrentShares] = useState(shares);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLike = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const newIsLiked = !currentIsLiked;
    const newLikesCount = newIsLiked ? currentLikes + 1 : currentLikes - 1;
    
    // Optimistic update
    setCurrentIsLiked(newIsLiked);
    setCurrentLikes(newLikesCount);
    
    // Send WebSocket message
    if (onInteraction) {
      onInteraction(newIsLiked ? 'like' : 'unlike', {
        postId: id,
        newLikesCount,
        isLiked: newIsLiked
      });
    }
    
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleComment = () => {
    if (onInteraction) {
      onInteraction('comment_open', { postId: id });
    }
    // Here you would typically open a comment modal or navigate to post detail
  };

  const handleShare = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const newSharesCount = currentShares + 1;
    
    // Optimistic update
    setCurrentShares(newSharesCount);
    
    if (onInteraction) {
      onInteraction('share', {
        postId: id,
        newSharesCount
      });
    }
    
    setTimeout(() => setIsProcessing(false), 500);
  };

  return (
    <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border border-purple-100">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200">
              <img
                className="w-full h-full object-cover"
                src={avatar}
                alt={`${author}'s avatar`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{author}</h3>
              <p className="text-xs text-gray-500">{timestamp}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* Post Content */}
        {content && (
          <div className="mb-3">
            <p className="text-gray-800 text-sm leading-relaxed">{content}</p>
          </div>
        )}

        {/* Post Image */}
        {image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              className="w-full h-auto object-cover"
              src={image}
              alt="Post content"
            />
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {currentLikes > 0 && (
              <span className="flex items-center gap-1">
                <HeartIcon className="w-3 h-3 fill-red-500 text-red-500" />
                {currentLikes}
              </span>
            )}
            {currentComments > 0 && (
              <span>{currentComments} comment{currentComments !== 1 ? 's' : ''}</span>
            )}
          </div>
          {currentShares > 0 && (
            <span>{currentShares} share{currentShares !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 hover:bg-red-50 transition-colors ${
              currentIsLiked ? 'text-red-600' : 'text-gray-600'
            }`}
            onClick={handleLike}
            disabled={isProcessing}
          >
            <Heart 
              className={`h-4 w-4 transition-all duration-200 ${
                currentIsLiked ? 'fill-red-600 text-red-600 scale-110' : ''
              }`} 
            />
            <span className="text-sm">Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            onClick={handleComment}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
            onClick={handleShare}
            disabled={isProcessing}
          >
            <Share className="h-4 w-4" />
            <span className="text-sm">Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialPost;