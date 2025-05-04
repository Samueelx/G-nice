import { Middleware } from '@reduxjs/toolkit';
import { handleTopicSocketMessage } from '@/features/topics/topicSlice';

let socket: WebSocket | null = null;

export const websocketMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  switch (action.type) {
    case 'ws/connect':
      if (socket !== null) {
        socket.close();
      }

      socket = new WebSocket(action.payload.url);

      socket.onopen = () => {
        console.log('[WebSocket] Connected');
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          storeAPI.dispatch(handleTopicSocketMessage(message));
        } catch (error) {
          console.error('[WebSocket] Invalid JSON:', event.data);
        }
      };

      socket.onclose = () => {
        console.log('[WebSocket] Disconnected');
      };

      socket.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      break;

    case 'ws/send':
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(action.payload));
      } else {
        console.warn('[WebSocket] Cannot send message, socket not open.');
      }
      break;

    case 'ws/disconnect':
      if (socket) {
        socket.close();
        socket = null;
      }
      break;

    default:
      break;
  }

  return next(action);
};
