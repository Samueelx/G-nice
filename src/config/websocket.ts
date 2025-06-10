export const WEBSOCKET_CONFIG = {
  // Update these URLs to match your backend
  WEBSOCKET_URL: process.env.NODE_ENV === 'production' 
    ? 'wss://your-production-domain.com/websocket'
    : 'ws://localhost:8080/websocket',
  
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL: 1000, // Base interval in ms
  ENABLE_PRESENCE: true,
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development'
};