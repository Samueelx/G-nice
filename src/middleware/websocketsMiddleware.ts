import { Middleware } from '@reduxjs/toolkit';
import {
  fetchEvents,
  setEvents,
  setEventsError,
} from '@/features/events/eventsSlice';
import { handleTopicSocketMessage } from '@/features/topics/topicSlice';
import { handleNotificationSocketMessage } from '@/features/notifications/notificationSlice';

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

          // Handle topic messages
          if (['TOPIC_DATA', 'NEW_TOPIC_POST'].includes(message.type)) {
            storeAPI.dispatch(handleTopicSocketMessage(message));
          }

          // Handle notification messages
          else if (['NOTIFICATIONS_DATA', 'NEW_NOTIFICATION'].includes(message.type)) {
            storeAPI.dispatch(handleNotificationSocketMessage(message));
          }

          // ✅ Handle events messages
          else if (message.type === 'EVENTS_DATA') {
            storeAPI.dispatch(setEvents(message.payload));
          } else if (message.type === 'EVENTS_ERROR') {
            storeAPI.dispatch(setEventsError(message.payload));
          }

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

    // ✅ Handle fetchEvents action by sending request
    case fetchEvents.type:
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'GET_EVENTS' }));
      } else {
        console.warn('[WebSocket] Cannot fetch events, socket not open.');
      }
      break;

    default:
      break;
  }

  return next(action);
};
