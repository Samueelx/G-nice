import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/hooks';
import { useWebSocketContext } from '@/context/useWebSocketContext';
import { 
  handlePostCreated,
  handlePostCreationError,
  handlePostsFetched,
  handleUserPostsFetched,
  handlePostsError,
  handleNewPostReceived,
  handlePostUpdated
} from '@/features/posts/postsSlice';

export const useWebSocketPostsHandler = () => {
  const dispatch = useAppDispatch();
  const { messages } = useWebSocketContext();

  useEffect(() => {
    if (messages.length === 0) return;

    // Get the latest message
    const latestMessage = messages[messages.length - 1];
    
    if (!latestMessage || !latestMessage.type) return;

    console.log('🔄 Processing WebSocket message:', latestMessage.type, latestMessage);

    switch (latestMessage.type) {
      case 'post_created':
        if (latestMessage.success) {
          dispatch(handlePostCreated(latestMessage.data));
          console.log('✅ Post created successfully:', latestMessage.data);
        } else {
          dispatch(handlePostCreationError(latestMessage.error || 'Failed to create post'));
          console.error('❌ Post creation failed:', latestMessage.error);
        }
        break;

      case 'posts_fetched':
        if (latestMessage.success) {
          dispatch(handlePostsFetched(latestMessage.data));
          console.log('✅ Posts fetched successfully:', latestMessage.data.length, 'posts');
        } else {
          dispatch(handlePostsError(latestMessage.error || 'Failed to fetch posts'));
          console.error('❌ Posts fetch failed:', latestMessage.error);
        }
        break;

      case 'user_posts_fetched':
        if (latestMessage.success) {
          dispatch(handleUserPostsFetched(latestMessage.data));
          console.log('✅ User posts fetched successfully:', latestMessage.data.length, 'posts');
        } else {
          dispatch(handlePostsError(latestMessage.error || 'Failed to fetch user posts'));
          console.error('❌ User posts fetch failed:', latestMessage.error);
        }
        break;

      case 'new_post_broadcast':
        // This handles real-time posts from other users
        if (latestMessage.success && latestMessage.data) {
          dispatch(handleNewPostReceived(latestMessage.data));
          console.log('📡 New post received from another user:', latestMessage.data);
        }
        break;

      case 'post_updated':
        // Handle post updates (likes, comments, etc.)
        if (latestMessage.success && latestMessage.data) {
          dispatch(handlePostUpdated(latestMessage.data));
          console.log('🔄 Post updated:', latestMessage.data);
        }
        break;

      case 'post_interaction_response':
        // Handle responses to post interactions (likes, comments)
        if (latestMessage.success && latestMessage.data) {
          dispatch(handlePostUpdated(latestMessage.data));
          console.log('👍 Post interaction processed:', latestMessage.data);
        }
        break;

      case 'error':
        // Handle general errors
        if (latestMessage.context === 'posts') {
          dispatch(handlePostsError(latestMessage.message || 'An error occurred'));
          console.error('❌ Posts error:', latestMessage.message);
        }
        break;

      default:
        // Log unhandled message types for debugging
        if (latestMessage.type.includes('post')) {
          console.log('🤷 Unhandled post-related message:', latestMessage.type, latestMessage);
        }
        break;
    }
  }, [messages, dispatch]);

  return null; // This is a hook, not a component
};