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
  isSearching: boolean;
  error: string | null;
  searchError: string | null;
}

// Initial state
const initialState: ChatsState = {
  chats: [],
  searchResults: [],
  isLoading: false,
  isSearching: false,
  error: null,
  searchError: null,
};

// Async thunks
export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get the token from the auth state
      const token = (getState() as any).auth?.token;
      
      // Make the request with the Authorization header
      const response = await instance.get('/api/chats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const searchUsers = createAsyncThunk(
  'chats/searchUsers',
  async (searchTerm: string, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as any).auth?.token;
      
      const response = await instance.get(`/api/users/search?username=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search users');
    }
  }
);

export const createChat = createAsyncThunk(
  'chats/createChat',
  async (recipientId: string, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as any).auth?.token;
      
      const response = await instance.post('/api/chats', 
        { recipientId }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
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
    setOnlineStatus: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean }>
    ) => {
      const chat = state.chats.find((c) => c.recipientId === action.payload.userId);
      if (chat) {
        chat.isOnline = action.payload.isOnline;
      }
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Chats
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
      
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isSearching = false;
        state.searchError = action.payload as string;
      })
      
      // Create Chat
      .addCase(createChat.fulfilled, (state, action: PayloadAction<Chat>) => {
        // Add the new chat to the top of the list if it doesn't exist
        if (!state.chats.find(chat => chat.id === action.payload.id)) {
          state.chats.unshift(action.payload);
        }
      });
  },
});

// Actions
export const {
  updateChatLastMessage,
  setOnlineStatus,
  clearSearchResults,
} = chatsSlice.actions;

// Selectors
export const selectAllChats = (state: { chats: ChatsState }) => state.chats.chats;
export const selectChatById = (state: { chats: ChatsState }, chatId: string) =>
  state.chats.chats.find((chat) => chat.id === chatId);
export const selectSearchResults = (state: { chats: ChatsState }) => state.chats.searchResults;
export const selectChatsLoading = (state: { chats: ChatsState }) => state.chats.isLoading;
export const selectSearchLoading = (state: { chats: ChatsState }) => state.chats.isSearching;

export default chatsSlice.reducer;
export type { ChatsState };