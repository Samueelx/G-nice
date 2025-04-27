import { useWebSocket } from "../hooks/useWebsocket";
import { WebSocketContext } from "./webSocketContext";

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { sendMessage } = useWebSocket({
    url: "ws://localhost:8080/Memefest-SNAPSHOT-01/wsocket", // Adjust your server WebSocket URL
  });

  return (
    <WebSocketContext.Provider value={{ sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};
