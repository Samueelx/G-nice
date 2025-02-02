import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Chat {
  id: string;
  recipientId: string;
  recipientName: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl?: string;
  isOnline: boolean;
}

interface ChatsState {
  chats: Chat[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatsState = {
  chats: [],
  isLoading: false,
  error: null,
};

export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/chats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

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
      });
  },
});

export const { updateChatLastMessage, setOnlineStatus } = chatsSlice.actions;
export default chatsSlice.reducer;