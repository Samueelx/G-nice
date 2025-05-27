import { useDispatch } from 'react-redux';
import { useWebSocket } from '../hooks/useWebsocket';
import { WebSocketContext } from './webSocketContext';
import { handleEventSocketMessages } from '../features/events/handleEventSocketMessages';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const dispatch = useDispatch();

  const { sendMessage } = useWebSocket({
    url: 'ws://localhost:8080/memefest-snapshot-01/feeds',
    onMessage: (data) => {
      switch (data.type) {
        case 'EVENTS_LIST':
        case 'EVENTS_ERROR':
          handleEventSocketMessages(data, dispatch);
          break;

        // add other handlers here later (e.g., for chat, notifications, etc.)

        default:
          console.warn('Unhandled WebSocket message:', data);
      }
    },
  });

  return (
    <WebSocketContext.Provider value={{ sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};
