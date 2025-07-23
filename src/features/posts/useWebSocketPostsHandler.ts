import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/hooks/hooks';
import { useWebSocketContext } from '@/context/useWebSocketContext';
import { getWebSocketService } from '@/services/websocketService';
import {
  handlePostCreated,
  handlePostCreationError,
  handlePostsFetched,
  handleUserPostsFetched,
  handlePostsError,
  handleNewPostReceived,
  handlePostUpdated,
  handlePostDetailsFetched,
  handlePostDetailsError
} from '@/features/posts/postsSlice';

interface ServerResponse {
  Posts?: any[];
  PostWithReplies?: any[];
  postWithReplies?: any[];
  ResultCode: number;
  ResultMessage: string;
  ResultId?: number;
  EditableType?: number;
  Getable?: number;
}

// Interface that matches exactly what the slice expects
interface ServerPostDetailsResponse {
  ResultCode: number;
  ResultMessage: string;
  postWithReplies: any[]; // This matches your slice's ServerPostDetailsResponse
  ResultId: number;
  Getable: number;
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

  // Function to fetch post details
  const fetchPostDetails = (postId: number) => {
    const websocketService = getWebSocketService();
    if (!websocketService) {
      console.error('WebSocket service not available');
      dispatch(handlePostDetailsError('WebSocket connection not available'));
      return;
    }

    const request = {
      "GetType": {
        "GetType": "POST"
      },
      "PostsWithReplies": [
        {
          "PostId": postId
        }
      ]
    };

    console.log('🔍 Sending post details request:', request);
    
    // Use sendRaw to avoid adding WebSocket metadata
    const success = websocketService.sendPostDetailsRequest(postId);
    
    if (!success) {
      console.error('Failed to send post details request');
      dispatch(handlePostDetailsError('Failed to send request'));
    }
  };

  return {
    fetchPostDetails
  };
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
      // PRIORITY 1: Handle PostWithReplies (capital P) - this matches your server response
      if (serverResponse.PostWithReplies && Array.isArray(serverResponse.PostWithReplies)) {
        console.log('📝 Processing post with replies (PostWithReplies):', serverResponse.PostWithReplies);
        
        // Convert to expected format with lowercase 'p' to match slice interface
        const payload: ServerPostDetailsResponse = {
          ResultCode: serverResponse.ResultCode,
          ResultMessage: serverResponse.ResultMessage,
          postWithReplies: serverResponse.PostWithReplies, // Convert to lowercase
          ResultId: serverResponse.ResultId || 0,
          Getable: serverResponse.Getable || 1
        };
        
        console.log('📤 Dispatching formatted payload to slice:', payload);
        dispatch(handlePostDetailsFetched(payload));
        console.log('✅ Post details fetched successfully (PostWithReplies):', serverResponse.PostWithReplies[0]);
        return;
      }
      
      // PRIORITY 2: Handle postWithReplies (lowercase 'p') - backup format
      if (serverResponse.postWithReplies && Array.isArray(serverResponse.postWithReplies)) {
        console.log('📝 Processing post with replies (postWithReplies):', serverResponse.postWithReplies);
        
        // This already matches the slice interface
        const payload: ServerPostDetailsResponse = {
          ResultCode: serverResponse.ResultCode,
          ResultMessage: serverResponse.ResultMessage,
          postWithReplies: serverResponse.postWithReplies,
          ResultId: serverResponse.ResultId || 0,
          Getable: serverResponse.Getable || 1
        };
        
        console.log('📤 Dispatching payload to slice (postWithReplies):', payload);
        dispatch(handlePostDetailsFetched(payload));
        console.log('✅ Post details fetched successfully (postWithReplies):', serverResponse.postWithReplies[0]);
        return;
      }
      
      // PRIORITY 3: Handle Posts array with replies (fallback)
      if (serverResponse.Posts && Array.isArray(serverResponse.Posts) && serverResponse.Posts.length > 0) {
        // Check if this is a post details response disguised as Posts (with Replys property)
        const firstPost = serverResponse.Posts[0];
        if (firstPost && ('Replys' in firstPost || 'replies' in firstPost) && serverResponse.Getable === 1) {
          console.log('📝 Processing post with replies from Posts array:', firstPost);
          
          // Convert Posts format to postWithReplies format that matches slice interface
          const payload: ServerPostDetailsResponse = {
            ResultCode: serverResponse.ResultCode,
            ResultMessage: serverResponse.ResultMessage,
            postWithReplies: serverResponse.Posts,
            ResultId: serverResponse.ResultId || 0,
            Getable: serverResponse.Getable
          };
          
          console.log('📤 Dispatching formatted payload to slice (from Posts):', payload);
          dispatch(handlePostDetailsFetched(payload));
          console.log('✅ Post details fetched successfully (from Posts):', firstPost);
          return;
        }
        
        // Regular posts response handling
        if (serverResponse.EditableType === 1) {
          // This is a post creation response
          dispatch(handlePostCreated(serverResponse));
          console.log('✅ Post created successfully:', serverResponse.Posts[0]);
        } else if (serverResponse.Getable !== 1) {
          // This is likely a fetch posts response (not post details)
          dispatch(handlePostsFetched(serverResponse));
          console.log('✅ Posts fetched successfully:', serverResponse.Posts.length, 'posts');
        }
      } else if (serverResponse.Posts && Array.isArray(serverResponse.Posts) && serverResponse.Posts.length === 0) {
        // Handle empty posts array
        if (serverResponse.Getable === 1) {
          // This looks like a post details request that returned no results
          dispatch(handlePostDetailsError('Post not found or has no replies'));
          console.log('📝 Post details request returned empty results');
          return;
        } else {
          // Empty posts fetch
          dispatch(handlePostsFetched(serverResponse));
          console.log('✅ Posts fetched successfully (empty)');
        }
      } else {
        console.log('📝 Server response with no recognizable data structure:', serverResponse);
      }
    } else {
      const errorMessage = serverResponse.ResultMessage || 'Server error occurred';
      
      // Better detection for post details request failures
      // The key indicator is Getable === 1, which seems to be set for post details requests
      if (serverResponse.Getable === 1) {
        dispatch(handlePostDetailsError(errorMessage));
        console.error('❌ Post details fetch error:', errorMessage, 'Code:', serverResponse.ResultCode);
        return;
      }
      
      // For post creation errors (EditableType indicates post operation)
      if (serverResponse.EditableType === 1) {
        dispatch(handlePostCreationError(errorMessage));
        console.error('❌ Post creation error:', errorMessage, 'Code:', serverResponse.ResultCode);
      } else {
        // General posts error
        dispatch(handlePostsError(errorMessage));
        console.error('❌ Posts fetch error:', errorMessage, 'Code:', serverResponse.ResultCode);
      }
    }
    return;
  }

  // Handle legacy messages (keep existing logic)
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

    case 'post_details_fetched':
    case 'post_with_replies_fetched':
      if (message.success && message.data) {
        // Convert legacy format to expected server response format
        const payload = {
          ResultCode: 200,
          ResultMessage: 'success',
          postWithReplies: Array.isArray(message.data) ? message.data : [message.data],
          ResultId: 0,
          Getable: 1
        };
        dispatch(handlePostDetailsFetched(payload));
        console.log('✅ Post details fetched successfully (legacy):', message.data);
      } else {
        dispatch(handlePostDetailsError(message.error || 'Failed to fetch post details'));
        console.error('❌ Post details fetch failed (legacy):', message.error);
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
      } else if (message.context === 'post_details' || message.context === 'post_with_replies') {
        dispatch(handlePostDetailsError(message.message || 'An error occurred'));
        console.error('❌ Post details error (legacy):', message.message);
      }
      break;

    default:
      if (message.type.includes('post')) {
        console.log('🤷 Unhandled post-related message (legacy):', message.type, message);
      }
      break;
  }
};