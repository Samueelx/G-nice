import { useEffect, useRef, useCallback } from 'react';
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

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        dispatch(connectionEstablished());
        reconnectCount.current = 0;
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        dispatch(connectionLost());
        
        if (reconnectCount.current < reconnectAttempts) {
          setTimeout(() => {
            reconnectCount.current += 1;
            dispatch(incrementReconnectAttempts());
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        dispatch(connectionError('WebSocket connection error'));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      dispatch(connectionError('Failed to establish WebSocket connection'));
    }
  }, [url, reconnectAttempts, reconnectInterval, dispatch, onMessage]);

  /**Send message to send data to the server. */
  const sendMessage = useCallback((data: any) => {
    /**Only send if connection is open */
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  /**Manage the connection lifecycle */
  useEffect(() => {
    connect();  //Connect when the component mounts
    return () => {
      if (ws.current) {
        ws.current.close(); //Clean up connection when component unmounts
      }
    };
  }, [connect]);

  return { sendMessage }; //Return function to send messages
};