import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
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
  
  // Use refs to track connection state and prevent multiple connections
  const isConnectingRef = useRef(false);
  const serviceRef = useRef<WebSocketService | null>(null);

  const connect = useCallback(() => {
    console.log('🔌 WebSocket connect called', {
      token: token ? 'present' : 'missing',
      isAuthenticated,
      isConnecting: isConnectingRef.current,
      url: options.url,
      currentStatus: websocketState.status
    });

    if (!token || !isAuthenticated) {
      console.warn('❌ Cannot connect WebSocket: User not authenticated');
      return;
    }

    if (isConnectingRef.current || websocketState.status === WebSocketStatus.CONNECTED) {
      console.log('⚠️ WebSocket already connecting or connected, skipping');
      return;
    }

    try {
      isConnectingRef.current = true;
      
      // Disconnect existing service if any
      const existingService = getWebSocketService();
      if (existingService) {
        console.log('🔄 Disconnecting existing WebSocket service');
        existingService.disconnect();
      }

      console.log('🚀 Creating new WebSocket service');
      const service = createWebSocketService(dispatch, {
        url: options.url,
        token,
        protocols: options.protocols,
        reconnectInterval: options.reconnectInterval || 3000,
        maxReconnectAttempts: options.maxReconnectAttempts || 5,
        heartbeatInterval: options.heartbeatInterval || 30000,
      });

      serviceRef.current = service;
      service.connect();
      
    } catch (error) {
      console.error('❌ Error creating WebSocket service:', error);
      isConnectingRef.current = false;
    }
  }, [dispatch, token, isAuthenticated, options, websocketState.status]);

  const disconnect = useCallback(() => {
    console.log('🔌 WebSocket disconnect called');
    
    isConnectingRef.current = false;
    
    const service = getWebSocketService() || serviceRef.current;
    if (service) {
      console.log('🔚 Disconnecting WebSocket service');
      service.disconnect();
      serviceRef.current = null;
    } else {
      console.log('⚠️ No WebSocket service found to disconnect');
    }
  }, []);

  const send = useCallback((message: any): boolean => {
    const service = getWebSocketService() || serviceRef.current;
    if (service && websocketState.status === WebSocketStatus.CONNECTED) {
      console.log('📤 Sending WebSocket message:', message);
      return service.send(message);
    }
    
    console.warn('❌ Cannot send message: WebSocket not connected', {
      serviceExists: !!service,
      status: websocketState.status
    });
    return false;
  }, [websocketState.status]);

  const clearMessages = useCallback(() => {
    console.log('🧹 Clearing WebSocket messages');
    dispatch(resetWebSocket());
  }, [dispatch]);

  // Reset connecting flag when status changes
  useEffect(() => {
    if (websocketState.status === WebSocketStatus.CONNECTED || 
        websocketState.status === WebSocketStatus.DISCONNECTED ||
        websocketState.status === WebSocketStatus.ERROR) {
      isConnectingRef.current = false;
    }
  }, [websocketState.status]);

  // Auto-connect when authenticated and enabled
  useEffect(() => {
    console.log('🔄 Auto-connect effect triggered', {
      enabled: options.enabled,
      isAuthenticated,
      hasToken: !!token,
      currentStatus: websocketState.status
    });

    if (options.enabled && isAuthenticated && token) {
      // Add a small delay to ensure auth state is stable
      const timer = setTimeout(() => {
        connect();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [options.enabled, isAuthenticated, token, connect]);

  // Cleanup on unmount or when disabled
  useEffect(() => {
    return () => {
      if (options.enabled) {
        console.log('🧹 Cleanup: Disconnecting WebSocket on unmount');
        disconnect();
      }
    };
  }, [options.enabled, disconnect]);

  // Disconnect when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🚪 User logged out, disconnecting WebSocket');
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