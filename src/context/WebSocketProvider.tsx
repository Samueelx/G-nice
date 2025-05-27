// WebSocketProvider.tsx (UPDATED - replaces your existing one)
import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  connectWebSocket, 
  disconnectWebSocket, 
  sendWebSocketMessage 
} from '@/middleware/websocketsMiddleware';
import { WebSocketContext } from './webSocketContext'; // Import your existing context

interface WebSocketProviderProps {
  children: React.ReactNode;
  url: string;
  enablePresence?: boolean;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  url, 
  enablePresence = true 
}) => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const connectionStatus = useSelector((state: RootState) => state.chats.connectionStatus);
  const prevAuthState = useRef(authState.isAuthenticated);
  const hasUserPresenceBeenSent = useRef(false);

  // Type guard for authenticated user
  const isAuthenticatedUser = (user: unknown): user is { id: string | number; username: string } => {
    return user !== null && 
           typeof user === 'object' && 
           'id' in (user as any) && 
           'username' in (user as any);
  };

  const sendUserPresence = useCallback((type: 'USER_ONLINE' | 'USER_OFFLINE') => {
    if (!enablePresence || !authState.isAuthenticated || !isAuthenticatedUser(authState.user)) {
      return;
    }

    const presencePayload = {
      type,
      payload: {
        userId: authState.user.id,
        username: authState.user.username,
        timestamp: new Date().toISOString(),
      },
    };
    
    dispatch(sendWebSocketMessage(presencePayload));
    
    if (type === 'USER_ONLINE') {
      hasUserPresenceBeenSent.current = true;
    } else {
      hasUserPresenceBeenSent.current = false;
    }
  }, [enablePresence, authState.isAuthenticated, authState.user, dispatch]);

  const sendMessage = (data: any): boolean => {
    dispatch(sendWebSocketMessage(data));
    return connectionStatus; // Return current connection status
  };

  const disconnect = useCallback(() => {
    if (hasUserPresenceBeenSent.current) {
      sendUserPresence('USER_OFFLINE');
    }
    dispatch(disconnectWebSocket());
  }, [sendUserPresence, dispatch]);

  const reconnect = useCallback(() => {
    if (authState.isAuthenticated && isAuthenticatedUser(authState.user)) {
      dispatch(connectWebSocket(url, String(authState.user.id)));
    }
  }, [authState.isAuthenticated, authState.user, dispatch, url]);

  // Handle authentication state changes
  useEffect(() => {
    const wasAuthenticated = prevAuthState.current;
    const isNowAuthenticated = authState.isAuthenticated;

    if (!wasAuthenticated && isNowAuthenticated && isAuthenticatedUser(authState.user)) {
      // User just logged in - establish connection
      console.log('🔐 User authenticated, establishing WebSocket connection');
      dispatch(connectWebSocket(url, String(authState.user.id)));
    } else if (wasAuthenticated && !isNowAuthenticated) {
      // User just logged out - disconnect
      console.log('🔓 User logged out, disconnecting WebSocket');
      disconnect();
    }

    prevAuthState.current = isNowAuthenticated;
  }, [authState.isAuthenticated, dispatch, url, authState.user, disconnect]);

  // Send presence when connection is established
  useEffect(() => {
    if (connectionStatus && authState.isAuthenticated && !hasUserPresenceBeenSent.current) {
      sendUserPresence('USER_ONLINE');
    }
  }, [connectionStatus, authState.isAuthenticated, sendUserPresence]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasUserPresenceBeenSent.current) {
        sendUserPresence('USER_OFFLINE');
      } else if (!document.hidden && connectionStatus && authState.isAuthenticated) {
        sendUserPresence('USER_ONLINE');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectionStatus, authState.isAuthenticated, sendUserPresence]);

  // Handle window/tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUserPresenceBeenSent.current && isAuthenticatedUser(authState.user)) {
        const offlinePayload = {
          type: "USER_OFFLINE",
          payload: {
            userId: authState.user.id,
            username: authState.user.username,
            timestamp: new Date().toISOString(),
          },
        };

        // Try sendBeacon first (more reliable)
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(offlinePayload)], { type: 'application/json' });
          const httpUrl = url.replace('ws://', 'http://').replace('wss://', 'https://');
          navigator.sendBeacon(`${httpUrl}/offline`, blob);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [authState.user, url]);

  const contextValue: WebSocketContextType = {
    sendMessage,
    isConnected: connectionStatus,
    connectionStatus: connectionStatus ? 'connected' : 'disconnected',
    disconnect,
    reconnect
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
