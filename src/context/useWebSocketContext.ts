import React, { useContext } from "react";
import { WebSocketContextType, WebSocketContext } from "./WebSocketProvider";

// Custom hook to use WebSocket context
export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

// Optional: Hook for specific message types
export const useWebSocketMessages = (messageType?: string) => {
  const { messages } = useWebSocketContext();
  
  const filteredMessages = React.useMemo(() => {
    if (!messageType) return messages;
    return messages.filter(msg => msg.type === messageType);
  }, [messages, messageType]);

  const latestMessage = React.useMemo(() => {
    return filteredMessages[filteredMessages.length - 1] || null;
  }, [filteredMessages]);

  return {
    messages: filteredMessages,
    latestMessage,
    count: filteredMessages.length
  };
};