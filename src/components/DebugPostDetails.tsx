// components/DebugPostDetails.tsx - Temporary debugging component
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const DebugPostDetails: React.FC = () => {
  const { currentPostWithReplies, isLoading, error } = useSelector((state: RootState) => state.posts);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg max-w-sm text-xs z-50">
      <h3 className="font-bold mb-2">Debug: Post Details State</h3>
      <div className="space-y-1">
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>Current Post: {currentPostWithReplies ? 'Loaded' : 'None'}</p>
        {currentPostWithReplies && (
          <div className="mt-2 p-2 bg-gray-800 rounded">
            <p>Post ID: {currentPostWithReplies.PostId}</p>
            <p>Comment: {currentPostWithReplies.Comment?.substring(0, 50)}...</p>
            <p>Replies: {currentPostWithReplies.Replys?.length || 0}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Add this to your LandingPage component temporarily:
// import { DebugPostDetails } from '@/components/DebugPostDetails';
// 
// And add <DebugPostDetails /> at the end of your LandingPage return statement