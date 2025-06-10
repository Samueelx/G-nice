import { createContext, useContext } from "react";

interface WebSocketContextType {
  sendMessage: (data: any) => boolean;
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  disconnect: () => void;
  reconnect: () => void;
}

// Fix: Provide default value or make it possibly undefined
export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};