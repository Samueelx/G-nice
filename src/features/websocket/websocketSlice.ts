import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum WebSocketStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

interface WebSocketState {
  status: WebSocketStatus;
  error: string | null;
  messages: WebSocketMessage[];
  reconnectAttempts: number;
  lastHeartbeat: number | null;
}

const initialState: WebSocketState = {
  status: WebSocketStatus.DISCONNECTED,
  error: null,
  messages: [],
  reconnectAttempts: 0,
  lastHeartbeat: null,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<WebSocketStatus>) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addMessage: (state, action: PayloadAction<WebSocketMessage>) => {
      state.messages.push(action.payload);
      // Keep only last 100 messages to prevent memory issues
      if (state.messages.length > 100) {
        state.messages = state.messages.slice(-100);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },
    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    },
    updateHeartbeat: (state, action: PayloadAction<number>) => {
      state.lastHeartbeat = action.payload;
    },
    reset: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setStatus,
  setError,
  addMessage,
  clearMessages,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  updateHeartbeat,
  reset,
} = websocketSlice.actions;

export default websocketSlice.reducer;