import { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  connectionEstablished,
  connectionLost,
  connectionError,
  incrementReconnectAttempts,
} from '../features/websocket/websocketSlice';

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
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const shouldReconnect = useRef(true); // control reconnection behavior
  const [isConnected, setIsConnected] = useState(false); // optional: expose connection status

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        dispatch(connectionEstablished());
        reconnectCount.current = 0;
        setIsConnected(true);
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
  }, [url, reconnectAttempts, reconnectInterval, dispatch, onMessage]);

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
