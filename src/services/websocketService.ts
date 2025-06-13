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
  private connectionTimeout: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;
  private connectionStartTime: number = 0;
  private reconnectAttempts: number = 0;

  constructor(dispatch: Dispatch, config: WebSocketConfig) {
    this.dispatch = dispatch;
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping...');
      return;
    }

    this.isManualDisconnect = false;
    this.connectionStartTime = Date.now();
    this.dispatch(setStatus(WebSocketStatus.CONNECTING));
    this.dispatch(setError(null));

    const wsUrl = `${this.config.url}`;
    console.log('=== WebSocket Connection Attempt ===');
    console.log('URL:', wsUrl);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Protocols:', this.config.protocols);

    try {
      // Create WebSocket with proper protocol handling
      if (this.config.protocols && this.config.protocols.length > 0) {
        console.log('Creating WebSocket with protocols:', this.config.protocols);
        this.ws = new WebSocket(wsUrl, this.config.protocols);
      } else {
        console.log('Creating WebSocket without protocols');
        this.ws = new WebSocket(wsUrl);
      }

      console.log('WebSocket object created:', {
        url: this.ws.url,
        readyState: this.ws.readyState,
        protocol: this.ws.protocol,
        extensions: this.ws.extensions
      });

      // Set up event handlers with enhanced logging
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        const elapsed = Date.now() - this.connectionStartTime;
        console.log(`Connection timeout after ${elapsed}ms`);
        
        if (this.ws?.readyState === WebSocket.CONNECTING) {
          console.log('Forcing close due to timeout, current state:', this.ws.readyState);
          this.ws.close(1000, 'Connection timeout');
        }
        
        this.dispatch(setError('Connection timeout - server may not be responding to WebSocket upgrade'));
        this.dispatch(setStatus(WebSocketStatus.ERROR));
      }, 15000); // 15 second timeout

    } catch (error) {
      const elapsed = Date.now() - this.connectionStartTime;
      console.error('Exception during WebSocket creation:', {
        error,
        elapsed,
        url: wsUrl
      });
      this.dispatch(setError(`Failed to create WebSocket: ${error}`));
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
    const elapsed = Date.now() - this.connectionStartTime;
    console.log('=== WebSocket Connection Opened ===');
    console.log('Time to connect:', elapsed + 'ms');
    console.log('WebSocket details:', {
      url: this.ws?.url,
      protocol: this.ws?.protocol,
      extensions: this.ws?.extensions,
      readyState: this.ws?.readyState
    });

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    this.dispatch(setStatus(WebSocketStatus.CONNECTED));
    this.dispatch(resetReconnectAttempts());
    this.dispatch(setError(null));
    this.reconnectAttempts = 0;
    
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
    const elapsed = Date.now() - this.connectionStartTime;
    console.log('=== WebSocket Connection Closed ===');
    console.log('Time since connection start:', elapsed + 'ms');
    console.log('Close event details:', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      timeStamp: event.timeStamp
    });

    // Detailed close code analysis
    const closeCodeInfo = this.getCloseCodeInfo(event.code);
    console.log('Close code analysis:', closeCodeInfo);

    // Check if this was immediate closure (connection never established)
    if (elapsed < 1000) {
      console.warn('⚠️  Connection closed very quickly - possible server rejection');
      console.warn('This suggests:');
      console.warn('1. Server doesn\'t support WebSocket upgrade');
      console.warn('2. Server is rejecting the connection immediately');
      console.warn('3. Network/firewall issue blocking WebSocket');
      console.warn('4. Server authentication/validation failure');
    }
    
    this.cleanup();

    if (!this.isManualDisconnect && event.code !== 1000) {
      this.dispatch(setStatus(WebSocketStatus.RECONNECTING));
      this.scheduleReconnect();
    } else {
      this.dispatch(setStatus(WebSocketStatus.DISCONNECTED));
    }
  }

  private handleError(error: Event): void {
    const elapsed = Date.now() - this.connectionStartTime;
    console.error('=== WebSocket Error Event ===');
    console.error('Time since connection start:', elapsed + 'ms');
    console.error('Error event details:', {
      type: error.type,
      timeStamp: error.timeStamp,
      target: error.target
    });

    if (this.ws) {
      console.error('WebSocket state during error:', {
        url: this.ws.url,
        readyState: this.ws.readyState,
        protocol: this.ws.protocol,
        extensions: this.ws.extensions
      });
    }

    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    this.dispatch(setError('WebSocket error occurred'));
    this.dispatch(setStatus(WebSocketStatus.ERROR));
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    this.dispatch(incrementReconnectAttempts());
    
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      this.dispatch(setError('Max reconnection attempts reached'));
      this.dispatch(setStatus(WebSocketStatus.ERROR));
      return;
    }

    const delay = Math.min(
      (this.config.reconnectInterval || 5000) * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      if (!this.isManualDisconnect) {
        console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`);
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

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCloseCodeInfo(code: number): object {
    const codeMap = {
      1000: { name: 'Normal Closure', description: 'Connection closed normally' },
      1001: { name: 'Going Away', description: 'Endpoint going away (page unload/server shutdown)' },
      1002: { name: 'Protocol Error', description: 'Protocol error in WebSocket communication' },
      1003: { name: 'Unsupported Data', description: 'Unsupported data type received' },
      1005: { name: 'No Status Received', description: 'No status code provided' },
      1006: { name: 'Abnormal Closure', description: 'Connection lost without proper close frame - SERVER LIKELY ISSUE' },
      1007: { name: 'Invalid Data', description: 'Invalid UTF-8 data received' },
      1008: { name: 'Policy Violation', description: 'Message violates endpoint policy' },
      1009: { name: 'Message Too Big', description: 'Message too large to process' },
      1010: { name: 'Mandatory Extension', description: 'Expected extension not negotiated' },
      1011: { name: 'Internal Error', description: 'Server internal error' },
      1012: { name: 'Service Restart', description: 'Server restarting' },
      1013: { name: 'Try Again Later', description: 'Temporary server condition' },
      1014: { name: 'Bad Gateway', description: 'Invalid response from upstream server' },
      1015: { name: 'TLS Handshake', description: 'TLS handshake failure' }
    };

    return codeMap[code] || { 
      name: 'Unknown', 
      description: `Unknown close code: ${code}` 
    };
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

  // Get current reconnect attempts
  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  // Reset reconnect attempts manually
  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
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