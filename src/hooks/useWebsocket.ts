import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  connectionEstablished,
  connectionLost,
  connectionError,
  incrementReconnectAttempts,
} from '../features/websocket/websocketSlice';
import { RootState } from '../store/store'; // import RootState to access auth state

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
  const authState = useSelector((state: RootState) => state.auth); // 👈 Get user and token from Redux

  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const shouldReconnect = useRef(true);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        dispatch(connectionEstablished());
        reconnectCount.current = 0;
        setIsConnected(true);

        // 👇 After connection, send "USER_ONLINE" if authenticated
        if (authState.isAuthenticated && authState.user) {
          const onlinePayload = {
            type: "USER_ONLINE",
            payload: {
              userId: authState.user.id,        // Adjust if your user object has a different field
              username: authState.user.username, // Adjust if needed
            },
          };
          ws.current?.send(JSON.stringify(onlinePayload));
          console.log('📡 Sent USER_ONLINE:', onlinePayload);
        }
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
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
  }, [url, reconnectAttempts, reconnectInterval, dispatch, onMessage, authState]); // 👈 include authState in dependency array!

  /** Send message to the server */
  const sendMessage = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.error('❗ WebSocket is not connected');
    }
  }, []);

  /** Manage the WebSocket connection lifecycle */
  useEffect(() => {
    shouldReconnect.current = true;
    connect();

    return () => {
      shouldReconnect.current = false;
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return { sendMessage, isConnected };
};
