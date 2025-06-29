import React, { createContext, useEffect, useCallback, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAppSelector } from '@/hooks/hooks';
import { RootState } from '@/store/store';
import { WebSocketStatus } from '@/features/websocket/websocketSlice';
import { getWebSocketService } from '@/services/websocketService';

// WebSocket configuration
const WS_URL = 'ws://localhost:8090';

export interface WebSocketContextType {
  // WebSocket state (from Redux)
  status: WebSocketStatus;
  error: string | null;
  messages: any[];
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  lastHeartbeat: number | null;
  reconnectAttempts: number;

  // WebSocket methods
  send: (message: any) => boolean;
  clearMessages: () => void;
  connect: () => void;
  disconnect: () => void;

  // Helper methods for common operations
  subscribeToFeed: (userId?: string) => void;
  sendPostInteraction: (postId: string, action: string, data?: any) => void;
  sendMessage: (type: string, payload: any) => void;
  
  // NEW: Method specifically for creating posts
  createPost: (postData: any) => void;

  // Utility methods
  getMessagesByType: (messageType: string) => any[];
  getLatestMessage: (messageType?: string) => any | null;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { isAuthenticated, token } = useAppSelector((state: RootState) => state.auth);

  // Initialize WebSocket connection
  const {
  status,
  error,
  messages,
  isConnected,
  isConnecting,
  lastHeartbeat,
  send,
  sendRaw, // NEW: Get the sendRaw method
  clearMessages,
  connect,
  disconnect
} = useWebSocket({
  url: WS_URL,
  enabled: isAuthenticated,
  heartbeatInterval: 30000,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
});

  console.log("Authenticated?", isAuthenticated, token);

  // Get additional state from Redux
  const { reconnectAttempts } = useAppSelector((state: RootState) => state.websocket);

  // Computed values
  const isReconnecting = status === WebSocketStatus.RECONNECTING;

  // Send initial connection and subscription when WebSocket connects
  useEffect(() => {
    if (isConnected && isAuthenticated) {
      console.log("🌍 WebSocket Provider: Connected - Setting up subscriptions");

      // Subscribe to posts feed
      send({
        type: 'subscribe_posts',
        payload: {
          userId: 'current_user', // Replace with actual user ID from auth state
          timestamp: Date.now(),
        }
      });

      // Subscribe to notifications
      send({
        type: 'subscribe_notifications',
        payload: {
          userId: 'current_user', // Replace with actual user ID from auth state
          timestamp: Date.now(),
        }
      });

      // Subscribe to chat updates
      send({
        type: 'subscribe_chats',
        payload: {
          userId: 'current_user', // Replace with actual user ID from auth state
          timestamp: Date.now(),
        }
      });

      // In WebSocketProvider.tsx, add this to the useEffect where you set up subscriptions:
      send({
        type: 'subscribe_events',
        payload: {
          userId: 'current_user',
          timestamp: Date.now(),
        }
      });

      console.log("✅ WebSocket Provider: All subscriptions sent");
    }
  }, [isConnected, isAuthenticated, send]);

  // Helper method to subscribe to specific feeds
  const subscribeToFeed = useCallback((userId?: string) => {
    if (isConnected) {
      send({
        type: 'subscribe_posts',
        payload: {
          userId: userId || 'current_user',
          timestamp: Date.now(),
        }
      });
    }
  }, [isConnected, send]);

  // Helper method for post interactions
  const sendPostInteraction = useCallback((postId: string, action: string, data?: any) => {
    if (isConnected) {
      send({
        type: 'post_interaction',
        payload: {
          postId,
          action,
          data,
          timestamp: Date.now()
        }
      });
    }
  }, [isConnected, send]);

  // Generic helper for sending messages
  const sendMessage = useCallback((type: string, payload: any) => {
    if (isConnected) {
      send({
        type,
        payload: {
          ...payload,
          timestamp: Date.now()
        }
      });
    }
  }, [isConnected, send]);

// Update the createPost method to use sendRaw:
const createPost = useCallback((postData: any) => {
  if (isConnected) {
    // Use sendRaw to send the post data without WebSocket metadata
    console.log('📝 Creating post with raw data:', postData);
    return sendRaw(postData);
  } else {
    console.warn('❌ Cannot create post: WebSocket not connected');
    return false;
  }
}, [isConnected, sendRaw]);

  // Log connection status changes
  useEffect(() => {
    console.log(`🔌 WebSocket Provider: Status changed to ${status}`);
  }, [status]);

  // Log incoming messages (you can remove this in production)
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      console.log('📨 WebSocket Provider: New message received:', latestMessage);
    }
  }, [messages]);

  // Utility method to get messages by type
  const getMessagesByType = useCallback((messageType: string) => {
    return messages.filter(msg => msg.type === messageType);
  }, [messages]);

  // Utility method to get latest message (optionally filtered by type)
  const getLatestMessage = useCallback((messageType?: string) => {
    if (!messageType) {
      return messages[messages.length - 1] || null;
    }
    const filteredMessages = getMessagesByType(messageType);
    return filteredMessages[filteredMessages.length - 1] || null;
  }, [messages, getMessagesByType]);

  const contextValue: WebSocketContextType = {
    // State
    status,
    error,
    messages,
    isConnected,
    isConnecting,
    isReconnecting,
    lastHeartbeat,
    reconnectAttempts,

    // Methods
    send,
    clearMessages,
    connect,
    disconnect,

    // Helper methods
    subscribeToFeed,
    sendPostInteraction,
    sendMessage,
    createPost, // NEW: Add the createPost method

    // Utility methods
    getMessagesByType,
    getLatestMessage,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};