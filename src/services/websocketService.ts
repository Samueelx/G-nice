import { Dispatch } from '@reduxjs/toolkit';
import {
  setStatus,
  setError,
  addMessage,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  updateHeartbeat,
  WebSocketStatus,
} from '@/features/websocket/websocketSlice';

export interface WebSocketConfig {
  url: string;
  token: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private dispatch: Dispatch;
  private config: WebSocketConfig;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;

  constructor(dispatch: Dispatch, config: WebSocketConfig) {
    this.dispatch = dispatch;
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isManualDisconnect = false;
    this.dispatch(setStatus(WebSocketStatus.CONNECTING));
    this.dispatch(setError(null));

    try {
      // Include auth token in URL or headers
    //   const wsUrl = `${this.config.url}${this.config.url.includes('?') ? '&' : '?'}token=${this.config.token}`;
        const wsUrl = `${this.config.url}`;

      
      this.ws = new WebSocket(wsUrl, this.config.protocols);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      this.dispatch(setError('Failed to create WebSocket connection'));
      this.dispatch(setStatus(WebSocketStatus.ERROR));
    }
  }

  disconnect(): void {
    this.isManualDisconnect = true;
    this.cleanup();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.dispatch(setStatus(WebSocketStatus.DISCONNECTED));
  }

  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const messageWithId = {
          id: this.generateMessageId(),
          timestamp: Date.now(),
          ...message,
        };
        
        this.ws.send(JSON.stringify(messageWithId));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.dispatch(setError('Failed to send message'));
        return false;
      }
    }
    return false;
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.dispatch(setStatus(WebSocketStatus.CONNECTED));
    this.dispatch(resetReconnectAttempts());
    this.dispatch(setError(null));
    
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Handle heartbeat/ping messages
      if (data.type === 'ping') {
        this.send({ type: 'pong', timestamp: Date.now() });
        return;
      }

      if (data.type === 'pong') {
        this.dispatch(updateHeartbeat(Date.now()));
        return;
      }

      // Dispatch regular messages to the store
      this.dispatch(addMessage({
        id: data.id || this.generateMessageId(),
        type: data.type,
        payload: data.payload || data,
        timestamp: data.timestamp || Date.now(),
      }));
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      this.dispatch(setError('Failed to parse incoming message'));
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    
    this.cleanup();

    if (!this.isManualDisconnect && event.code !== 1000) {
      this.dispatch(setStatus(WebSocketStatus.RECONNECTING));
      this.scheduleReconnect();
    } else {
      this.dispatch(setStatus(WebSocketStatus.DISCONNECTED));
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.dispatch(setError('WebSocket connection error'));
    this.dispatch(setStatus(WebSocketStatus.ERROR));
  }

  private scheduleReconnect(): void {
    this.dispatch(incrementReconnectAttempts());
    
    // Get current reconnect attempts from store or track locally
    const reconnectAttempts = this.getReconnectAttempts();
    
    if (reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      this.dispatch(setError('Max reconnection attempts reached'));
      this.dispatch(setStatus(WebSocketStatus.ERROR));
      return;
    }

    const delay = Math.min(
      (this.config.reconnectInterval || 5000) * Math.pow(2, reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.reconnectTimer = setTimeout(() => {
      if (!this.isManualDisconnect) {
        this.connect();
      }
    }, delay);
  }

  private startHeartbeat(): void {
    if (this.config.heartbeatInterval) {
      this.heartbeatTimer = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.send({ type: 'ping', timestamp: Date.now() });
        }
      }, this.config.heartbeatInterval);
    }
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getReconnectAttempts(): number {
    // This would ideally get the value from the Redux store
    // For simplicity, you might want to pass this as a parameter
    // or access the store directly
    return 0; // Placeholder
  }

  getStatus(): WebSocketStatus {
    if (!this.ws) return WebSocketStatus.DISCONNECTED;
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return WebSocketStatus.CONNECTING;
      case WebSocket.OPEN:
        return WebSocketStatus.CONNECTED;
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return WebSocketStatus.DISCONNECTED;
      default:
        return WebSocketStatus.ERROR;
    }
  }
}

// Singleton instance
let websocketServiceInstance: WebSocketService | null = null;

export const createWebSocketService = (dispatch: Dispatch, config: WebSocketConfig): WebSocketService => {
  if (websocketServiceInstance) {
    websocketServiceInstance.disconnect();
  }
  
  websocketServiceInstance = new WebSocketService(dispatch, config);
  return websocketServiceInstance;
};

export const getWebSocketService = (): WebSocketService | null => {
  return websocketServiceInstance;
};