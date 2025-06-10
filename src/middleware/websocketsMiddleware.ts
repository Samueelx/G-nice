/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action, isAction, Middleware, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchEvents,
  setEvents,
  setEventsError,
  setEventDetails,
} from '@/features/events/eventsSlice';
import { handleTopicSocketMessage } from '@/features/topics/topicSlice';
import { handleNotificationSocketMessage } from '@/features/notifications/notificationSlice';
import {
  safeHandleChatSocketMessage,
  ChatSocketMessage,
} from '@/features/chats/handleChatSocketMessages';
import {
  fetchChats,
  setChatsLoading,
  setConnectionStatus,
  setConnectionError,
} from '@/features/chats/chatsSlice';

// WebSocket action types
interface WebSocketConnectAction extends PayloadAction<{ url: string; userId?: string }> {
  type: 'ws/connect';
}
interface WebSocketSendAction extends PayloadAction<any> {
  type: 'ws/send';
}
interface WebSocketDisconnectAction extends Action {
  type: 'ws/disconnect';
}
interface WebSocketReconnectAction extends Action {
  type: 'ws/reconnect';
}
type WebSocketAction =
  | WebSocketConnectAction
  | WebSocketSendAction
  | WebSocketDisconnectAction
  | WebSocketReconnectAction;

// Message types
interface TopicMessage {
  type: 'TOPIC_DATA' | 'NEW_TOPIC_POST';
  payload: any;
}
interface NotificationMessage {
  type: 'NOTIFICATIONS_DATA' | 'NEW_NOTIFICATION';
  payload: any;
}
interface EventsMessage {
  type: 'EVENTS_DATA' | 'EVENTS_ERROR' | 'EVENT_DETAILS_DATA';
  payload: any;
}
type SocketMessage = TopicMessage | NotificationMessage | EventsMessage | ChatSocketMessage;

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let reconnectTimeout: NodeJS.Timeout | null = null;
let currentUserId: string | undefined = undefined;
let currentUser: { id: string; username: string } | undefined = undefined;
let websocketUrl = '';

const CHAT_MESSAGE_TYPES = [
  'CHATS_LIST',
  'CHATS_ERROR',
  'CHATS_LOADING',
  'NEW_CHAT',
  'NEW_MESSAGE',
  'MESSAGE_UPDATE',
  'USER_ONLINE',
  'USER_OFFLINE',
  'USERS_STATUS',
  'CONNECTION_STATUS',
  'CONNECTION_ERROR',
];

const sendPresence = (type: 'USER_ONLINE' | 'USER_OFFLINE') => {
  if (socket?.readyState === WebSocket.OPEN && currentUser) {
    const payload = {
      type,
      payload: {
        userId: currentUser.id,
        username: currentUser.username,
        timestamp: new Date().toISOString(),
      },
    };
    try {
      socket.send(JSON.stringify(payload));
      console.log(`[WebSocket] Sent presence: ${type}`, payload);
    } catch (err) {
      console.error('[WebSocket] Failed to send presence:', err);
    }
  }
};

const attemptReconnect = (storeAPI: any) => {
  if (reconnectAttempts < maxReconnectAttempts && websocketUrl) {
    reconnectAttempts++;
    console.log(`[WebSocket] Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);

    reconnectTimeout = setTimeout(() => {
      storeAPI.dispatch({ type: 'ws/connect', payload: { url: websocketUrl, userId: currentUserId } });
    }, Math.pow(2, reconnectAttempts) * 1000);
  } else {
    console.error('[WebSocket] Max reconnection attempts reached');
    storeAPI.dispatch(setConnectionError('Connection failed after multiple attempts'));
  }
};

export const websocketMiddleware: Middleware = (storeAPI) => {
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      const state = storeAPI.getState();
      if (!currentUser) return;

      if (document.hidden) {
        sendPresence('USER_OFFLINE');
      } else if (socket?.readyState === WebSocket.OPEN && state.auth?.isAuthenticated) {
        sendPresence('USER_ONLINE');
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (currentUser) {
        const offlinePayload = {
          type: 'USER_OFFLINE',
          payload: {
            userId: currentUser.id,
            username: currentUser.username,
            timestamp: new Date().toISOString(),
          },
        };

        const url = websocketUrl.replace(/^ws/, 'http') + '/offline';
        const blob = new Blob([JSON.stringify(offlinePayload)], { type: 'application/json' });

        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, blob);
        } else {
          sendPresence('USER_OFFLINE');
        }
      }
    });
  }

  return (next) => (action: unknown) => {
    if (!isAction(action)) return next(action);

    switch (action.type) {
      case 'ws/connect': {
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }

        if (socket !== null) {
          socket.close();
          socket = null;
        }

        const token = localStorage.getItem('accessTkn');
        const protocols = token ? [token] : undefined;

        if ('payload' in action && typeof action.payload === 'object' && action.payload && 'url' in action.payload) {
          const { url, userId } = action.payload as { url: string; userId?: string };
          websocketUrl = url;
          currentUserId = userId;

          const auth = storeAPI.getState().auth;
          if (auth?.isAuthenticated && auth.user?.id && auth.user?.username) {
            currentUser = { id: auth.user.id, username: auth.user.username };
          }

          socket = new WebSocket(websocketUrl, protocols);
        } else {
          console.error('Invalid action payload: url is required for ws/connect');
          storeAPI.dispatch(setConnectionError('Invalid connection parameters'));
          break;
        }

        socket.onopen = () => {
          console.log('[WebSocket] Connected');
          reconnectAttempts = 0;
          storeAPI.dispatch(setConnectionStatus(true));

          sendPresence('USER_ONLINE');
          socket?.send(JSON.stringify({ type: 'GET_CHATS' }));
          socket?.send(JSON.stringify({ type: 'GET_USERS_STATUS' }));
        };

        socket.onmessage = (event) => {
          try {
            const message: SocketMessage = JSON.parse(event.data);
            console.log('[WebSocket] Received message:', message);

            if (['TOPIC_DATA', 'NEW_TOPIC_POST'].includes(message.type)) {
              storeAPI.dispatch(handleTopicSocketMessage(message));
            } else if (['NOTIFICATIONS_DATA', 'NEW_NOTIFICATION'].includes(message.type)) {
              storeAPI.dispatch(handleNotificationSocketMessage(message));
            } else if (message.type === 'EVENTS_DATA') {
              storeAPI.dispatch(setEvents(message.payload));
            } else if (message.type === 'EVENTS_ERROR') {
              storeAPI.dispatch(setEventsError(message.payload));
            } else if (message.type === 'EVENT_DETAILS_DATA') {
              storeAPI.dispatch(setEventDetails(message.payload));
            } else if (CHAT_MESSAGE_TYPES.includes(message.type)) {
              safeHandleChatSocketMessage(message as ChatSocketMessage, storeAPI.dispatch, currentUserId);
            } else {
              console.log('[WebSocket] Unhandled message type:', message.type);
            }
          } catch (error) {
            console.error('[WebSocket] Invalid JSON:', event.data, error);
          }
        };

        socket.onclose = (event) => {
          console.log('[WebSocket] Disconnected:', event.code, event.reason);
          storeAPI.dispatch(setConnectionStatus(false));
          sendPresence('USER_OFFLINE');

          if (event.code !== 1000 && event.code !== 1001) {
            attemptReconnect(storeAPI);
          }
        };

        socket.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          storeAPI.dispatch(setConnectionError('WebSocket connection error'));
        };
        break;
      }

      case 'ws/send': {
        if (socket && socket.readyState === WebSocket.OPEN) {
          if ('payload' in action) {
            console.log('[WebSocket] Sending message:', action.payload);
            socket.send(JSON.stringify(action.payload));
          } else {
            console.warn('[WebSocket] Cannot send message, no payload provided.');
          }
        } else {
          console.warn('[WebSocket] Cannot send message, socket not open. ReadyState:', socket?.readyState);
          if (socket?.readyState === WebSocket.CLOSED && websocketUrl) {
            storeAPI.dispatch({ type: 'ws/connect', payload: { url: websocketUrl, userId: currentUserId } });
          }
        }
        break;
      }

      case 'ws/disconnect': {
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }

        if (socket) {
          socket.close(1000, 'Manual disconnect');
          socket = null;
        }

        reconnectAttempts = 0;
        currentUserId = undefined;
        websocketUrl = '';
        currentUser = undefined;
        storeAPI.dispatch(setConnectionStatus(false));
        break;
      }

      case 'ws/reconnect': {
        if (websocketUrl) {
          storeAPI.dispatch({ type: 'ws/connect', payload: { url: websocketUrl, userId: currentUserId } });
        }
        break;
      }

      case fetchChats.pending.type: {
        if (socket?.readyState === WebSocket.OPEN) {
          storeAPI.dispatch(setChatsLoading());
          socket.send(JSON.stringify({ type: 'GET_CHATS' }));
        } else {
          storeAPI.dispatch(fetchChats());
          console.warn('[WebSocket] Cannot fetch chats, socket not open.');
        }
        break;
      }

      case fetchEvents.type: {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'GET_EVENTS' }));
        } else {
          storeAPI.dispatch(fetchEvents());
          console.warn('[WebSocket] Cannot fetch events, socket not open.');
        }
        break;
      }

      default:
        break;
    }

    return next(action);
  };
};

export const connectWebSocket = (url: string, userId?: string) => ({
  type: 'ws/connect' as const,
  payload: { url, userId },
});

export const sendWebSocketMessage = (message: any) => ({
  type: 'ws/send' as const,
  payload: message,
});

export const disconnectWebSocket = () => ({
  type: 'ws/disconnect' as const,
});

export const reconnectWebSocket = () => ({
  type: 'ws/reconnect' as const,
});

export const sendChatMessage = (chatId: string, message: string, recipientId: string) =>
  sendWebSocketMessage({
    type: 'SEND_MESSAGE',
    payload: {
      chatId,
      message,
      recipientId,
      timestamp: new Date().toISOString(),
    },
  });

export const markChatAsRead = (chatId: string) =>
  sendWebSocketMessage({
    type: 'MARK_CHAT_READ',
    payload: { chatId },
  });
