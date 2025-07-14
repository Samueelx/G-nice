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
    typeof message.type === 'string' &&
    message.type !== 'undefined'
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

  // Extract the actual server response from the message wrapper
  let serverResponse = message;
  
  // Check if the server response is nested in payload, rawData, or at root level
  if (message.payload && typeof message.payload === 'object') {
    serverResponse = message.payload;
    console.log('📦 Using payload as server response');
  } else if (message.rawData && typeof message.rawData === 'object') {
    serverResponse = message.rawData;
    console.log('📦 Using rawData as server response');
  }

  console.log('🎯 Server response to process:', serverResponse);

  // Handle server responses (new format)
  if (isServerResponse(serverResponse)) {
    console.log('✅ Recognized as server response');
    const isSuccess = serverResponse.ResultCode === 200;
    
    if (isSuccess) {
      if (serverResponse.Posts && serverResponse.Posts.length > 0) {
        // Check EditableType to determine the operation
        // Based on your server response, EditableType: 1 seems to be for POST creation
        if (serverResponse.EditableType === 1) {
          // This is a post creation response
          dispatch(handlePostCreated(serverResponse));
          console.log('✅ Post created successfully:', serverResponse.Posts[0]);
        } else {
          // This is likely a fetch posts response
          dispatch(handlePostsFetched(serverResponse));
          console.log('✅ Posts fetched successfully:', serverResponse.Posts.length, 'posts');
        }
      } else {
        console.log('📝 Server response with no posts:', serverResponse);
      }
    } else {
      const errorMessage = serverResponse.ResultMessage || 'Server error occurred';
      // For post creation errors, use the specific error handler
      if (serverResponse.EditableType === 1) {
        dispatch(handlePostCreationError(errorMessage));
      } else {
        dispatch(handlePostsError(errorMessage));
      }
      console.error('❌ Server error:', errorMessage, 'Code:', serverResponse.ResultCode);
    }
    return;
  }

  // Handle legacy messages (check the wrapper message for legacy format)
  if (isLegacyMessage(message)) {
    console.log('✅ Recognized as legacy message');
    handleLegacyMessage(message, dispatch);
    return;
  }

  // Also check if the payload/rawData is a legacy message
  if (message.payload && isLegacyMessage(message.payload)) {
    console.log('✅ Recognized as legacy message in payload');
    handleLegacyMessage(message.payload, dispatch);
    return;
  }

  if (message.rawData && isLegacyMessage(message.rawData)) {
    console.log('✅ Recognized as legacy message in rawData');
    handleLegacyMessage(message.rawData, dispatch);
    return;
  }

  console.log('🤷 Unrecognized message format:', serverResponse);
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