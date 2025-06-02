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
  enablePresence?: boolean;
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
  const prevAuthState = useRef(authState.isAuthenticated);
  const hasUserPresenceBeenSent = useRef(false);

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
        hasUserPresenceBeenSent.current = type === 'USER_ONLINE';
      } catch (error) {
        console.error(`❌ Failed to send ${type}:`, error);
      }
    }
  }, [authState.isAuthenticated, authState.user, enablePresence]);

  // Stable connect function using useRef
  const connectRef = useRef<() => void>();
  connectRef.current = () => {
    if (!url || !authState.isAuthenticated) {
      console.log('🔌 Skipping WebSocket connection (missing URL or auth)');
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
        sendUserPresence('USER_ONLINE');
      };

      ws.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected', { code: event.code, reason: event.reason });
        dispatch(connectionLost());
        setIsConnected(false);
        setConnectionStatus('disconnected');
        hasUserPresenceBeenSent.current = false;

        if (shouldReconnect.current && reconnectCount.current < reconnectAttempts && authState.isAuthenticated) {
          console.log(`🔄 Reconnecting ${reconnectCount.current + 1}/${reconnectAttempts}`);
          setTimeout(() => {
            reconnectCount.current += 1;
            dispatch(incrementReconnectAttempts());
            connectRef.current?.();
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
          if (onMessage) onMessage(data);
        } catch (err) {
          console.error('❌ Failed to parse WebSocket message:', err);
        }
      };
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      dispatch(connectionError('Failed to establish WebSocket connection'));
      setConnectionStatus('disconnected');
    }
  };

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

  const disconnectRef = useRef<() => void>();
  disconnectRef.current = () => {
    shouldReconnect.current = false;

    if (hasUserPresenceBeenSent.current) {
      sendUserPresence('USER_OFFLINE');
    }

    if (ws.current) {
      ws.current.close(1000, 'User initiated disconnect');
      ws.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  // Handle authentication state changes
  useEffect(() => {
    const wasAuthenticated = prevAuthState.current;
    const isNowAuthenticated = authState.isAuthenticated;

    if (!wasAuthenticated && isNowAuthenticated) {
      console.log('🔐 User authenticated, establishing WebSocket connection');
      shouldReconnect.current = true;
      reconnectCount.current = 0;
      connectRef.current?.();
    } else if (wasAuthenticated && !isNowAuthenticated) {
      console.log('🔓 User logged out, disconnecting WebSocket');
      disconnectRef.current?.();
    }

    prevAuthState.current = isNowAuthenticated;
  }, [authState.isAuthenticated]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      disconnectRef.current?.();
    };
  }, []);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasUserPresenceBeenSent.current) {
        sendUserPresence('USER_OFFLINE');
      } else if (!document.hidden && isConnected && authState.isAuthenticated) {
        sendUserPresence('USER_ONLINE');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sendUserPresence, isConnected, authState.isAuthenticated]);

  // Handle tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUserPresenceBeenSent.current) {
        const offlinePayload = {
          type: "USER_OFFLINE",
          payload: {
            userId: isAuthenticatedUser(authState.user) ? authState.user.id : null,
            username: isAuthenticatedUser(authState.user) ? authState.user.username : null,
            timestamp: new Date().toISOString(),
          },
        };

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
    disconnect: () => disconnectRef.current?.(),
    reconnect: () => connectRef.current?.(),
    reconnectCount: reconnectCount.current,
  };
};
