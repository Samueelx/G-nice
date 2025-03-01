import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share, ThumbsUp, MessageCircle } from 'lucide-react';
import CommentSection from './CommentSection';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { fetchJokeOfTheDay, likeJoke, likeLocalJoke } from '@/features/jumbotron/jokesSlice';

const JokeJumbotron: React.FC = () => {
  const dispatch = useAppDispatch();
  const [commentSectionOpen, setCommentSectionOpen] = useState(false);
  
  // Get current joke from Redux store
  const { currentJoke, loading, error } = useAppSelector(state => state.jokes);
  
  // Fetch joke of the day on component mount
  useEffect(() => {
    dispatch(fetchJokeOfTheDay());
  }, [dispatch]);
  
  const handleLikeClick = () => {
    if (currentJoke) {
      // Optimistic update
      dispatch(likeLocalJoke());
      
      // API call
      dispatch(likeJoke(currentJoke.id));
    }
  };
  
  const handleCommentClick = () => {
    setCommentSectionOpen(true);
  };
  
  const handleShareClick = () => {
    // Implement share functionality
    if (navigator.share && currentJoke) {
      navigator.share({
        title: 'Joke of the Day',
        text: `${currentJoke.setup ? currentJoke.setup + ' ' : ''}${currentJoke.punchline}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      alert('Share feature not supported on this browser');
    }
  };
  
  if (loading) {
    return (
      <Card className="w-full max-w-xl bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg animate-pulse">
        <CardHeader className="space-y-1">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-gray-300 pt-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-4">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </CardFooter>
      </Card>
    );
  }
  
  if (error || !currentJoke) {
    return (
      <Card className="w-full max-w-xl bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
        <CardContent className="py-8">
          <p className="text-center text-gray-600">
            {error || "Could not load joke of the day. Please try again later."}
          </p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => dispatch(fetchJokeOfTheDay())}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="w-full max-w-xl bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            {/* Optional title here */}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentJoke.setup && (
            <p className="text-md font-medium text-gray-800">{currentJoke.setup}</p>
          )}
          <p className="text-xl font-semibold text-gray-900">{currentJoke.punchline}</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t border-gray-300 pt-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{currentJoke.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCommentClick}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{currentJoke.comments?.length || 0}</span>
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareClick}
              className="flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              Share
            </Button>
          </div>
          {currentJoke.author && (
            <p className="text-sm text-gray-600 w-full text-left">
              Powered by {currentJoke.author}
            </p>
          )}
        </CardFooter>
      </Card>
      
      {/* Comment Section Dialog */}
      <CommentSection 
        jokeId={currentJoke.id} 
        open={commentSectionOpen} 
        onClose={() => setCommentSectionOpen(false)} 
      />
    </>
  );
};

export default JokeJumbotron;