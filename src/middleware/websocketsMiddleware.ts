import { Action, isAction, Middleware, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchEvents,
  setEvents,
  setEventsError,
  setEventDetails, // Add this import
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
  type: 'EVENTS_DATA' | 'EVENTS_ERROR' | 'EVENT_DETAILS_DATA'; // Add EVENT_DETAILS_DATA
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
        // Optionally fetch events when connection opens
        // socket.send(JSON.stringify({ type: 'GET_EVENTS' }));
      };
      
      socket.onmessage = (event) => {
        try {
          const message: SocketMessage = JSON.parse(event.data);
          console.log('[WebSocket] Received message:', message); // Debug log
          
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
            console.log('[WebSocket] Setting events:', message.payload);
            storeAPI.dispatch(setEvents(message.payload));
          } 
          else if (message.type === 'EVENTS_ERROR') {
            console.log('[WebSocket] Events error:', message.payload);
            storeAPI.dispatch(setEventsError(message.payload));
          }
          // Handle event details messages
          else if (message.type === 'EVENT_DETAILS_DATA') {
            console.log('[WebSocket] Setting event details:', message.payload);
            storeAPI.dispatch(setEventDetails(message.payload));
          }
          else {
            console.log('[WebSocket] Unhandled message type:', message.type);
          }
        } catch (error) {
          console.error('[WebSocket] Invalid JSON:', event.data, error);
        }
      };
      
      socket.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
      };
      
      socket.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };
      break;
      
    case 'ws/send':
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Ensure action has payload
        if ('payload' in action) {
          console.log('[WebSocket] Sending message:', action.payload);
          socket.send(JSON.stringify(action.payload));
        } else {
          console.warn('[WebSocket] Cannot send message, no payload provided.');
        }
      } else {
        console.warn('[WebSocket] Cannot send message, socket not open. ReadyState:', socket?.readyState);
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
        console.log('[WebSocket] Fetching events');
        socket.send(JSON.stringify({ type: 'GET_EVENTS' }));
      } else {
        console.warn('[WebSocket] Cannot fetch events, socket not open. ReadyState:', socket?.readyState);
        // Optionally dispatch loading state
        storeAPI.dispatch(fetchEvents());
      }
      break;
      
    default:
      break;
  }
  
  return next(action);
};