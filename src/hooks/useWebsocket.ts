import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  connectionEstablished,
  connectionLost,
  connectionError,
  incrementReconnectAttempts,
} from '../features/websocket/websocketSlice';
import { RootState } from '../store/store'; // <-- Adjust path if needed

interface UseWebSocketOptions {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (data: any) => void;
}

export const useWebSocket = ({
  url,
  reconnectAttempts = 5,
  reconnectInterval = 3000,
  onMessage,
}: UseWebSocketOptions) => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const shouldReconnect = useRef(true);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    try {
      if (!url) {
        console.log('No WebSocket URL provided, skipping connection');
        return;
      }
      
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        dispatch(connectionEstablished());
        reconnectCount.current = 0;
        setIsConnected(true);

        // 👇 Send USER_ONLINE when connected
        if (authState.isAuthenticated && authState.user && ws.current) {
          const onlinePayload = {
            type: "USER_ONLINE",
            payload: {
              userId: authState.user.id,
              username: authState.user.username,
            },
          };
          ws.current.send(JSON.stringify(onlinePayload));
          console.log('📡 Sent USER_ONLINE:', onlinePayload);
        }
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');

        // 👇 Send USER_OFFLINE before closing
        if (authState.isAuthenticated && authState.user && ws.current && ws.current.readyState === WebSocket.OPEN) {
          const offlinePayload = {
            type: "USER_OFFLINE",
            payload: {
              userId: authState.user.id,
              username: authState.user.username,
            },
          };
          ws.current.send(JSON.stringify(offlinePayload));
          console.log('📡 Sent USER_OFFLINE:', offlinePayload);
        }

        dispatch(connectionLost());
        setIsConnected(false);

        if (shouldReconnect.current && reconnectCount.current < reconnectAttempts) {
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
    }
  }, [url, reconnectAttempts, reconnectInterval, dispatch, onMessage, authState]);

  const sendMessage = useCallback((data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.error('❗ WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    shouldReconnect.current = true;
    if (url) {
      connect();
    }

    return () => {
      shouldReconnect.current = false;
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect, url]);

  // 👇 Handle window/tab close to send USER_OFFLINE
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (authState.isAuthenticated && authState.user && ws.current && ws.current.readyState === WebSocket.OPEN) {
        const offlinePayload = {
          type: "USER_OFFLINE",
          payload: {
            userId: authState.user.id,
            username: authState.user.username,
          },
        };
        ws.current.send(JSON.stringify(offlinePayload));
        console.log('📡 Sent USER_OFFLINE before tab close:', offlinePayload);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [authState]);

  return { sendMessage, isConnected };
};