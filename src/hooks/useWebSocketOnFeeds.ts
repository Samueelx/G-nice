import { useEffect } from 'react';
import { useWebSocketContext } from '../context/webSocketContext';
import { useAppSelector } from './hooks';

export const useWebSocketOnFeeds = () => {
  const { isConnected, connectionStatus, reconnect } = useWebSocketContext();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user && !isConnected) {
      console.log('🔄 Feeds page loaded, ensuring WebSocket connection...');
      // The WebSocketProvider should handle connection automatically,
      // but we can trigger reconnect if needed
      reconnect();
    }
  }, [isAuthenticated, user, isConnected, reconnect]);

  return {
    isConnected,
    connectionStatus,
    isAuthenticated
  };
};