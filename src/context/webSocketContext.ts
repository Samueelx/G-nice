// webSocketContext.ts (UPDATED - extend your existing interface)
import { createContext, useContext } from "react";

interface WebSocketContextType {
  sendMessage: (data: any) => boolean; // Updated return type
  isConnected: boolean; // NEW
  connectionStatus: 'disconnected' | 'connecting' | 'connected'; // NEW
  disconnect: () => void; // NEW
  reconnect: () => void; // NEW
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};

