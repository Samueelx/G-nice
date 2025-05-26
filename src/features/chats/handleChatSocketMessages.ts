import { Dispatch } from '@reduxjs/toolkit';
import { 
  setChats, 
  setChatsError, 
  setChatsLoading,
  addNewChat,
  updateChatLastMessage,
  handleIncomingMessage,
  setOnlineStatus,
  updateMultipleOnlineStatus,
  setConnectionStatus,
  setConnectionError,
  Chat 
} from './chatsSlice';

export interface ChatSocketMessage {
  type: 
    | 'CHATS_LIST' 
    | 'CHATS_ERROR'
    | 'CHATS_LOADING'
    | 'NEW_CHAT'
    | 'NEW_MESSAGE'
    | 'MESSAGE_UPDATE'
    | 'USER_ONLINE'
    | 'USER_OFFLINE'
    | 'USERS_STATUS'
    | 'CONNECTION_STATUS'
    | 'CONNECTION_ERROR';
  payload: any;
  meta?: {
    chatId?: string;
    userId?: string;
    currentUserId?: string;
    timestamp?: string;
  };
}

// Message payload interfaces for type safety
interface NewMessagePayload {
  chatId: string;
  message: string;
  senderId: string;
  timestamp: string;
}

interface MessageUpdatePayload {
  chatId: string;
  message: string;
  timestamp: string;
}

interface UserStatusPayload {
  userId: string;
  isOnline: boolean;
}

interface UsersStatusPayload {
  users: Array<{
    userId: string;
    isOnline: boolean;
  }>;
}

export function handleChatSocketMessages(
  message: ChatSocketMessage,
  dispatch: Dispatch,
  currentUserId?: string
) {
  console.log('Received chat socket message:', message.type, message.payload);

  switch (message.type) {
    case 'CHATS_LIST':
      dispatch(setChats(message.payload as Chat[]));
      break;

    case 'CHATS_ERROR':
      dispatch(setChatsError(message.payload as string));
      break;

    case 'CHATS_LOADING':
      dispatch(setChatsLoading());
      break;

    case 'NEW_CHAT':
      dispatch(addNewChat(message.payload as Chat));
      break;

    case 'NEW_MESSAGE': {
      const payload = message.payload as NewMessagePayload;
      if (currentUserId) {
        dispatch(handleIncomingMessage({
          chatId: payload.chatId,
          message: payload.message,
          timestamp: payload.timestamp,
          senderId: payload.senderId,
          currentUserId: currentUserId
        }));
      }
      break;
    }

    case 'MESSAGE_UPDATE': {
      const payload = message.payload as MessageUpdatePayload;
      dispatch(updateChatLastMessage({
        chatId: payload.chatId,
        message: payload.message,
        timestamp: payload.timestamp
      }));
      break;
    }

    case 'USER_ONLINE': {
      const payload = message.payload as UserStatusPayload;
      dispatch(setOnlineStatus({
        userId: payload.userId,
        isOnline: true
      }));
      break;
    }

    case 'USER_OFFLINE': {
      const payload = message.payload as UserStatusPayload;
      dispatch(setOnlineStatus({
        userId: payload.userId,
        isOnline: false
      }));
      break;
    }

    case 'USERS_STATUS': {
      const payload = message.payload as UsersStatusPayload;
      dispatch(updateMultipleOnlineStatus(payload.users));
      break;
    }

    case 'CONNECTION_STATUS':
      dispatch(setConnectionStatus(message.payload as boolean));
      break;

    case 'CONNECTION_ERROR':
      dispatch(setConnectionError(message.payload as string));
      break;

    default:
      console.warn('Unknown chat socket message type:', message.type);
      break;
  }
}

// Helper function to create typed socket messages
export function createChatSocketMessage(
  type: ChatSocketMessage['type'],
  payload: any,
  meta?: ChatSocketMessage['meta']
): ChatSocketMessage {
  return { type, payload, meta };
}

// Message type guards for better type safety
export function isNewMessagePayload(payload: any): payload is NewMessagePayload {
  return payload && 
    typeof payload.chatId === 'string' &&
    typeof payload.message === 'string' &&
    typeof payload.senderId === 'string' &&
    typeof payload.timestamp === 'string';
}

export function isUserStatusPayload(payload: any): payload is UserStatusPayload {
  return payload && 
    typeof payload.userId === 'string' &&
    typeof payload.isOnline === 'boolean';
}

// Error handling wrapper
export function safeHandleChatSocketMessage(
  message: ChatSocketMessage,
  dispatch: Dispatch,
  currentUserId?: string
) {
  try {
    handleChatSocketMessages(message, dispatch, currentUserId);
  } catch (error) {
    console.error('Error handling chat socket message:', error);
    dispatch(setConnectionError('Failed to process socket message'));
  }
}