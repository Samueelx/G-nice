import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WebSocketState {
    connected: boolean;
    connecting: boolean;
    error: null | string;
    reconnectAttempts: number;
}

const initialState: WebSocketState = {
    connected: false,
    connecting: false,
    error: null,
    reconnectAttempts: 0,
};

const webSocketSlice = createSlice({
    name: 'websocket',
    initialState,
    reducers: {
        connectionInitiated: (state) => {
            state.connecting = true;
            state.error = null;
        },
        connectionEstablished: (state) => {
            state.connected = true;
            state.connecting = false;
            state.error = null;
            state.reconnectAttempts = 0;
        },
        connectionLost: (state) => {
            state.connected = false;
            state.connecting = false;
        },
        connectionError: (state, action: PayloadAction<string>) => {
            state.connected = false;
            state.connecting = false;
            state.error = action.payload;
        },
        incrementReconnectAttempts: (state) => {
            state.reconnectAttempts += 1;
        },
    },
});

export const {connectionEstablished, connectionLost, connectionError, incrementReconnectAttempts} = webSocketSlice.actions;
export default webSocketSlice.reducer;