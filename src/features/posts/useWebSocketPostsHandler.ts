import { useEffect, useRef } from 'react';
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

interface ServerResponse {
  Posts?: any[];
  ResultCode: number;
  ResultMessage: string;
  ResultId: number;
  EditableType: number;
}

interface LegacyMessage {
  type: string;
  success?: boolean;
  data?: any;
  error?: string;
  context?: string;
  message?: string;
}

const isServerResponse = (message: any): message is ServerResponse => {
  return (
    typeof message === 'object' &&
    message !== null &&
    'ResultCode' in message &&
    'ResultMessage' in message &&
    typeof message.ResultCode === 'number'
  );
};

const isLegacyMessage = (message: any): message is LegacyMessage => {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    typeof message.type === 'string'
  );
};

export const useWebSocketPostsHandler = () => {
  const dispatch = useAppDispatch();
  const { messages } = useWebSocketContext();
  const processedMessageIds = useRef(new Set<string>());

  useEffect(() => {
    if (messages.length === 0) return;

    // Process only new messages to avoid duplicates
    const newMessages = messages.filter((message, index) => {
      const messageId = `${index}-${JSON.stringify(message)}`;
      if (processedMessageIds.current.has(messageId)) {
        return false;
      }
      processedMessageIds.current.add(messageId);
      return true;
    });

    // Clean up old processed message IDs to prevent memory leaks
    if (processedMessageIds.current.size > 1000) {
      processedMessageIds.current.clear();
    }

    newMessages.forEach((message) => {
      processMessage(message, dispatch);
    });
  }, [messages, dispatch]);

  return null;
};

const processMessage = (message: any, dispatch: any) => {
  console.log('🔄 Processing WebSocket message:', message);

  // Handle server responses (new format)
  if (isServerResponse(message)) {
    const isSuccess = message.ResultCode === 200;
    
    if (isSuccess) {
      if (message.Posts && message.Posts.length > 0) {
        // Determine operation type based on context
        const isCreation = message.Posts.length === 1 && 
                          (message.ResultMessage === 'success' || message.ResultMessage.includes('created'));
        
        if (isCreation) {
          dispatch(handlePostCreated(message));
          console.log('✅ Post created successfully:', message.Posts[0]);
        } else {
          dispatch(handlePostsFetched(message));
          console.log('✅ Posts fetched successfully:', message.Posts.length, 'posts');
        }
      } else {
        console.log('📝 Server response with no posts:', message);
      }
    } else {
      const errorMessage = message.ResultMessage || 'Server error occurred';
      dispatch(handlePostCreationError(errorMessage));
      console.error('❌ Server error:', errorMessage, 'Code:', message.ResultCode);
    }
    return;
  }

  // Handle legacy messages
  if (isLegacyMessage(message)) {
    handleLegacyMessage(message, dispatch);
    return;
  }

  console.log('🤷 Unrecognized message format:', message);
};

const handleLegacyMessage = (message: LegacyMessage, dispatch: any) => {
  switch (message.type) {
    case 'post_created':
      if (message.success) {
        dispatch(handlePostCreated(message.data));
        console.log('✅ Post created successfully (legacy):', message.data);
      } else {
        dispatch(handlePostCreationError(message.error || 'Failed to create post'));
        console.error('❌ Post creation failed (legacy):', message.error);
      }
      break;

    case 'posts_fetched':
      if (message.success) {
        dispatch(handlePostsFetched(message.data));
        console.log('✅ Posts fetched successfully (legacy):', message.data?.length, 'posts');
      } else {
        dispatch(handlePostsError(message.error || 'Failed to fetch posts'));
        console.error('❌ Posts fetch failed (legacy):', message.error);
      }
      break;

    case 'user_posts_fetched':
      if (message.success) {
        dispatch(handleUserPostsFetched(message.data));
        console.log('✅ User posts fetched successfully (legacy):', message.data?.length, 'posts');
      } else {
        dispatch(handlePostsError(message.error || 'Failed to fetch user posts'));
        console.error('❌ User posts fetch failed (legacy):', message.error);
      }
      break;

    case 'new_post_broadcast':
      if (message.success && message.data) {
        dispatch(handleNewPostReceived(message.data));
        console.log('📡 New post received from another user (legacy):', message.data);
      }
      break;

    case 'post_updated':
    case 'post_interaction_response':
      if (message.success && message.data) {
        dispatch(handlePostUpdated(message.data));
        console.log('🔄 Post updated (legacy):', message.data);
      }
      break;

    case 'error':
      if (message.context === 'posts') {
        dispatch(handlePostsError(message.message || 'An error occurred'));
        console.error('❌ Posts error (legacy):', message.message);
      }
      break;

    default:
      if (message.type.includes('post')) {
        console.log('🤷 Unhandled post-related message (legacy):', message.type, message);
      }
      break;
  }
};