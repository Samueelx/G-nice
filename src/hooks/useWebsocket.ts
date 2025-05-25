import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  connectionEstablished,
  connectionLost,
  connectionError,
  incrementReconnectAttempts,
} from '../features/websocket/websocketSlice';
import { RootState } from '../store/store';

interface AuthenticatedUser {
  id: string | number;
  username: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (data: any) => void;
  enablePresence?: boolean; // Option to disable presence tracking
}

export const useWebSocket = ({
  url,
  reconnectAttempts = 5,
  reconnectInterval = 3000,
  onMessage,
  enablePresence = true,
}: UseWebSocketOptions) => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const shouldReconnect = useRef(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  // Track previous auth state to detect changes
  const prevAuthState = useRef(authState.isAuthenticated);
  const hasUserPresenceBeenSent = useRef(false);

  // Type guard for authenticated user
  const isAuthenticatedUser = (user: unknown): user is AuthenticatedUser => {
    return user !== null && 
           typeof user === 'object' && 
           'id' in (user as any) && 
           'username' in (user as any);
  };

  const sendUserPresence = useCallback((type: 'USER_ONLINE' | 'USER_OFFLINE') => {
    if (!enablePresence || !authState.isAuthenticated || !isAuthenticatedUser(authState.user)) {
      return;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const presencePayload = {
        type,
        payload: {
          userId: authState.user.id,
          username: authState.user.username,
          timestamp: new Date().toISOString(),
        },
      };
      
      try {
        ws.current.send(JSON.stringify(presencePayload));
        console.log(`📡 Sent ${type}:`, presencePayload);
        
        if (type === 'USER_ONLINE') {
          hasUserPresenceBeenSent.current = true;
        } else {
          hasUserPresenceBeenSent.current = false;
        }
      } catch (error) {
        console.error(`❌ Failed to send ${type}:`, error);
      }
    }
  }, [authState.isAuthenticated, authState.user, enablePresence]);

  const connect = useCallback(() => {
    if (!url) {
      console.log('No WebSocket URL provided, skipping connection');
      return;
    }

    // Don't connect if not authenticated (optional: remove this check if you want anonymous connections)
    if (!authState.isAuthenticated) {
      console.log('User not authenticated, skipping WebSocket connection');
      return;
    }

    try {
      setConnectionStatus('connecting');
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        dispatch(connectionEstablished());
        reconnectCount.current = 0;
        setIsConnected(true);
        setConnectionStatus('connected');

        // Send USER_ONLINE when connected
        sendUserPresence('USER_ONLINE');
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected', { code: event.code, reason: event.reason });
        
        dispatch(connectionLost());
        setIsConnected(false);
        setConnectionStatus('disconnected');
        hasUserPresenceBeenSent.current = false;

        // Reconnect logic
        if (shouldReconnect.current && 
            reconnectCount.current < reconnectAttempts && 
            authState.isAuthenticated) {
          
          console.log(`🔄 Attempting reconnect ${reconnectCount.current + 1}/${reconnectAttempts}`);
          setTimeout(() => {
            reconnectCount.current += 1;
            dispatch(incrementReconnectAttempts());
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        dispatch(connectionError('WebSocket connection error'));
        setConnectionStatus('disconnected');
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err);
        }
      };
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      dispatch(connectionError('Failed to establish WebSocket connection'));
      setConnectionStatus('disconnected');
    }
  }, [url, reconnectAttempts, reconnectInterval, dispatch, onMessage, authState.isAuthenticated, sendUserPresence]);

  const sendMessage = useCallback((data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error);
        return false;
      }
    } else {
      console.error('❗ WebSocket is not connected', { readyState: ws.current?.readyState });
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;
    
    // Send USER_OFFLINE before disconnecting
    if (hasUserPresenceBeenSent.current) {
      sendUserPresence('USER_OFFLINE');
    }
    
    if (ws.current) {
      ws.current.close(1000, 'User initiated disconnect');
      ws.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, [sendUserPresence]);

  // Handle authentication state changes
  useEffect(() => {
    const wasAuthenticated = prevAuthState.current;
    const isNowAuthenticated = authState.isAuthenticated;

    if (!wasAuthenticated && isNowAuthenticated) {
      // User just logged in - establish connection
      console.log('🔐 User authenticated, establishing WebSocket connection');
      shouldReconnect.current = true;
      reconnectCount.current = 0;
      connect();
    } else if (wasAuthenticated && !isNowAuthenticated) {
      // User just logged out - disconnect
      console.log('🔓 User logged out, disconnecting WebSocket');
      disconnect();
    }

    prevAuthState.current = isNowAuthenticated;
  }, [authState.isAuthenticated, connect, disconnect]);

  // Initial connection setup
  useEffect(() => {
    if (authState.isAuthenticated && url) {
      shouldReconnect.current = true;
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, authState.isAuthenticated, connect, disconnect]); // Only depend on URL changes

  // Handle page visibility changes (more reliable than beforeunload)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasUserPresenceBeenSent.current) {
        // Page is hidden, send offline status
        sendUserPresence('USER_OFFLINE');
      } else if (!document.hidden && isConnected && authState.isAuthenticated) {
        // Page is visible again, send online status
        sendUserPresence('USER_ONLINE');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sendUserPresence, isConnected, authState.isAuthenticated]);

  // Handle window/tab close - keep this as fallback
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUserPresenceBeenSent.current) {
        // Use sendBeacon for more reliable delivery
        const offlinePayload = {
          type: "USER_OFFLINE",
          payload: {
            userId: isAuthenticatedUser(authState.user) ? authState.user.id : null,
            username: isAuthenticatedUser(authState.user) ? authState.user.username : null,
            timestamp: new Date().toISOString(),
          },
        };

        // Try sendBeacon first (more reliable), fallback to WebSocket
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(offlinePayload)], { type: 'application/json' });
          navigator.sendBeacon(`${url.replace('ws://', 'http://').replace('wss://', 'https://')}/offline`, blob);
        } else {
          sendUserPresence('USER_OFFLINE');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [authState.user, url, sendUserPresence]);

  return { 
    sendMessage, 
    isConnected, 
    connectionStatus,
    disconnect,
    reconnect: connect,
    reconnectCount: reconnectCount.current 
  };
};