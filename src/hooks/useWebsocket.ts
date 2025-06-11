import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store'; // Adjust import path as needed
import { WebSocketService, createWebSocketService, getWebSocketService } from '../services/websocketService';
import { WebSocketStatus, reset as resetWebSocket } from '../features/websocket/websocketSlice';

interface UseWebSocketOptions {
  url: string;
  enabled?: boolean;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface UseWebSocketReturn {
  status: WebSocketStatus;
  error: string | null;
  messages: any[];
  connect: () => void;
  disconnect: () => void;
  send: (message: any) => boolean;
  clearMessages: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  lastHeartbeat: number | null;
}

export const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const websocketState = useSelector((state: RootState) => state.websocket);

  const connect = useCallback(() => {
    if (!token || !isAuthenticated) {
      console.warn('Cannot connect WebSocket: User not authenticated');
      return;
    }

    const service = createWebSocketService(dispatch, {
      url: options.url,
      token,
      protocols: options.protocols,
      reconnectInterval: options.reconnectInterval,
      maxReconnectAttempts: options.maxReconnectAttempts,
      heartbeatInterval: options.heartbeatInterval,
    });

    service.connect();
  }, [dispatch, token, isAuthenticated, options]);

  const disconnect = useCallback(() => {
    const service = getWebSocketService();
    if (service) {
      service.disconnect();
    }
  }, []);

  const send = useCallback((message: any): boolean => {
    const service = getWebSocketService();
    if (service) {
      return service.send(message);
    }
    return false;
  }, []);

  const clearMessages = useCallback(() => {
    dispatch(resetWebSocket());
  }, [dispatch]);

  // Auto-connect when authenticated and enabled
  useEffect(() => {
    if (options.enabled && isAuthenticated && token) {
      connect();
    }

    return () => {
      if (options.enabled) {
        disconnect();
      }
    };
  }, [options.enabled, isAuthenticated, token, connect, disconnect]);

  // Disconnect when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      disconnect();
      dispatch(resetWebSocket());
    }
  }, [isAuthenticated, disconnect, dispatch]);

  return {
    status: websocketState.status,
    error: websocketState.error,
    messages: websocketState.messages,
    connect,
    disconnect,
    send,
    clearMessages,
    isConnected: websocketState.status === WebSocketStatus.CONNECTED,
    isConnecting: websocketState.status === WebSocketStatus.CONNECTING,
    lastHeartbeat: websocketState.lastHeartbeat,
  };
};