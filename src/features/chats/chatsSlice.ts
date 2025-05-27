/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import instance from '@/api/axiosConfig';

// Types
export interface Chat {
  id: string;
  recipientId: string;
  recipientName: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl?: string;
  isOnline: boolean;
  unreadCount?: number;
}


interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface ChatsState {
  chats: Chat[];
  searchResults: User[];
  isLoading: boolean;
  isSearching: boolean; // Add this line
  error: string | null;
  isConnected: boolean;
  connectionError: string | null;
}

// Initial state
const initialState: ChatsState = {
  chats: [],
  searchResults: [],
  isLoading: false,
  isSearching: false, // Add this line
  error: null,
  isConnected: false,
  connectionError: null,
};

// Async thunks
export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get('/api/chats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const createChat = createAsyncThunk(
  'chats/createChat',
  async (recipientId: string, { rejectWithValue }) => {
    try {
      const response = await instance.post('/api/chats', { recipientId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat');
    }
  }
);

// Slice
const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    // WebSocket connection status
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.connectionError = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.connectionError = action.payload;
      state.isConnected = false;
    },
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },

    // Real-time chat updates from WebSocket
    addNewChat: (state, action: PayloadAction<Chat>) => {
      const existingChat = state.chats.find(chat => chat.id === action.payload.id);
      if (!existingChat) {
        state.chats.unshift(action.payload);
      }
    },

    updateChatLastMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: string; timestamp: string }>
    ) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        chat.lastMessage = action.payload.message;
        chat.timestamp = action.payload.timestamp;

        // Move the updated chat to the top of the list
        state.chats = [
          chat,
          ...state.chats.filter((c) => c.id !== action.payload.chatId),
        ];
      }
    },

    handleIncomingMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: string;
        timestamp: string;
        senderId: string;
        currentUserId: string;
      }>
    ) => {
      const { chatId, message, timestamp, senderId, currentUserId } = action.payload;
      const chat = state.chats.find((c) => c.id === chatId);
      
      if (chat) {
        chat.lastMessage = message;
        chat.timestamp = timestamp;
        
        if (senderId !== currentUserId) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
        }

        state.chats = [
          chat,
          ...state.chats.filter((c) => c.id !== chatId),
        ];
      }
    },

    markChatAsRead: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find((c) => c.id === action.payload);
      if (chat) {
        chat.unreadCount = 0;
      }
    },

    setOnlineStatus: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean }>
    ) => {
      const chat = state.chats.find((c) => c.recipientId === action.payload.userId);
      if (chat) {
        chat.isOnline = action.payload.isOnline;
      }
    },

    updateMultipleOnlineStatus: (
      state,
      action: PayloadAction<Array<{ userId: string; isOnline: boolean }>>
    ) => {
      action.payload.forEach(({ userId, isOnline }) => {
        const chat = state.chats.find((c) => c.recipientId === userId);
        if (chat) {
          chat.isOnline = isOnline;
        }
      });
    },

    clearSearchResults: (state) => {
      state.searchResults = [];
    },

    setSearchResults: (state, action: PayloadAction<User[]>) => {
      state.searchResults = action.payload;
    },

    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    setChatsError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    setChatsLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    resetChatsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action: PayloadAction<Chat[]>) => {
        state.isLoading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createChat.fulfilled, (state, action: PayloadAction<Chat>) => {
        if (!state.chats.find(chat => chat.id === action.payload.id)) {
          state.chats.unshift(action.payload);
        }
      });
  },
});

// Actions
export const {
  setConnectionStatus,
  setConnectionError,
  addNewChat,
  updateChatLastMessage,
  handleIncomingMessage,
  markChatAsRead,
  setOnlineStatus,
  updateMultipleOnlineStatus,
  clearSearchResults,
  setSearchResults,
  setSearchLoading,
  setChats,
  setChatsError,
  setChatsLoading,
  resetChatsState,
} = chatsSlice.actions;

// Selectors
export const selectAllChats = (state: { chats: ChatsState }) => state.chats.chats;
export const selectChatById = (state: { chats: ChatsState }, chatId: string) =>
  state.chats.chats.find((chat) => chat.id === chatId);
export const selectSearchResults = (state: { chats: ChatsState }) => state.chats.searchResults;
export const selectChatsLoading = (state: { chats: ChatsState }) => state.chats.isLoading;
export const selectConnectionStatus = (state: { chats: ChatsState }) => state.chats.isConnected;
export const selectConnectionError = (state: { chats: ChatsState }) => state.chats.connectionError;
export const selectUnreadChatsCount = (state: { chats: ChatsState }) => 
  state.chats.chats.reduce((count, chat) => count + (chat.unreadCount || 0), 0);

export default chatsSlice.reducer;
export const selectSearchLoading = (state: { chats: ChatsState }) => state.chats.isSearching;