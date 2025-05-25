import { Action, isAction, Middleware, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchEvents,
  setEvents,
  setEventsError,
} from '@/features/events/eventsSlice';
import { handleTopicSocketMessage } from '@/features/topics/topicSlice';
import { handleNotificationSocketMessage } from '@/features/notifications/notificationSlice';

// Define WebSocket action types
interface WebSocketConnectAction extends PayloadAction<{ url: string }> {
  type: 'ws/connect';
}

interface WebSocketSendAction extends PayloadAction<any> {
  type: 'ws/send';
}

interface WebSocketDisconnectAction extends Action {
  type: 'ws/disconnect';
}

type WebSocketAction = WebSocketConnectAction | WebSocketSendAction | WebSocketDisconnectAction;

// Define message types for better type safety
interface TopicMessage {
  type: 'TOPIC_DATA' | 'NEW_TOPIC_POST';
  payload: any;
}

interface NotificationMessage {
  type: 'NOTIFICATIONS_DATA' | 'NEW_NOTIFICATION';
  payload: any;
}

interface EventsMessage {
  type: 'EVENTS_DATA' | 'EVENTS_ERROR';
  payload: any;
}

type SocketMessage = TopicMessage | NotificationMessage | EventsMessage;

let socket: WebSocket | null = null;

export const websocketMiddleware: Middleware = (storeAPI) => (next) => (action: unknown) => {
  if (!isAction(action)) return next(action);
  
  let protocols: string[] | undefined;
  let token: string | null;
  
  switch (action.type) {
    case 'ws/connect':
      if (socket !== null) {
        socket.close();
      }
      
      token = localStorage.getItem('accessTkn'); // or 'authToken', depending on your naming
      protocols = token ? [token] : undefined;
      
      // Type guard to ensure action has the correct payload structure
      if ('payload' in action && action.payload && typeof action.payload === 'object' && 'url' in action.payload) {
        const connectAction = action as WebSocketConnectAction;
        socket = new WebSocket(connectAction.payload.url, protocols);
      } else {
        console.error('Invalid action payload: url is required for ws/connect');
        break;
      }
      
      socket.onopen = () => {
        console.log('[WebSocket] Connected');
      };
      
      socket.onmessage = (event) => {
        try {
          const message: SocketMessage = JSON.parse(event.data);
          
          // Handle topic messages
          if (['TOPIC_DATA', 'NEW_TOPIC_POST'].includes(message.type)) {
            storeAPI.dispatch(handleTopicSocketMessage(message));
          }
          // Handle notification messages
          else if (['NOTIFICATIONS_DATA', 'NEW_NOTIFICATION'].includes(message.type)) {
            storeAPI.dispatch(handleNotificationSocketMessage(message));
          }
          // Handle events messages
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
        // Ensure action has payload
        if ('payload' in action) {
          socket.send(JSON.stringify(action.payload));
        } else {
          console.warn('[WebSocket] Cannot send message, no payload provided.');
        }
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
      
    // Handle fetchEvents action by sending request
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