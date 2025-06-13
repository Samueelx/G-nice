import React, { useEffect, useState } from "react";
import { WebSocketStatusComponent } from "@/components/WebSocketStatus";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Menu, Wifi, WifiOff } from "lucide-react";

// WebSocket configuration
const WS_URL = 'ws://127.0.0.1:8090';

interface LandingPageProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setIsSidebarOpen }) => {
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<any>(null);

  // Initialize WebSocket connection
  const {
    messages,
    send,
    isConnected,
    error
  } = useWebSocket({
    url: WS_URL,
    enabled: true,
    heartbeatInterval: 30000,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  });

  // Debug logs
  console.log('LandingPage render - messages length:', messages?.length, 'isConnected:', isConnected);

  // Test WebSocket connection on mount
  useEffect(() => {
    if (isConnected && send) {
      console.log('Sending test message...');
      send({
        type: 'test_connection',
        payload: {
          message: 'Hello from client',
          timestamp: Date.now(),
        }
      });
    }
  }, [isConnected, send]);

  // Just log messages without processing them
  useEffect(() => {
    console.log('Messages effect triggered. Messages array:', messages);
    if (messages && messages.length > 0) {
      setMessageCount(messages.length);
      setLastMessage(messages[messages.length - 1]);
    }
  }, [messages?.length, messages]); // Only depend on length

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50">
      {/* Minimal header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-purple-100">
        <div className="p-3">
          <nav className="w-full">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-purple-100 rounded-full transition-colors"
              >
                <Menu className="w-6 h-6 text-purple-600" />
              </button>
              
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 transition-transform duration-200 hover:rotate-12"
                  src="/g-icon.svg"
                  alt="G Icon"
                />
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Gnice - WebSocket Test
                </h1>
              </div>
              
              <button
                onClick={() => setShowConnectionStatus(!showConnectionStatus)}
                className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
                title={isConnected ? 'Connected' : 'Disconnected'}
              >
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </button>
            </div>
          </nav>
        </div>
        
        {showConnectionStatus && (
          <div className="border-t border-purple-100 bg-white/90 p-3">
            <WebSocketStatusComponent 
              wsUrl={WS_URL} 
              showDetails={true}
              className="max-w-2xl mx-auto"
            />
          </div>
        )}
      </header>

      {/* Main Content - Just WebSocket Testing */}
      <main className="w-full px-3 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Connection Status */}
          <div className={`p-4 rounded-lg border ${
            isConnected 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <h2 className="font-semibold mb-2">WebSocket Status</h2>
            <p>Connection: {isConnected ? 'Connected ✅' : 'Disconnected ❌'}</p>
            {error && <p>Error: {error}</p>}
          </div>

          {/* Message Stats */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold mb-2">Message Statistics</h2>
            <p>Total messages received: {messageCount}</p>
            <p>Messages array length: {messages?.length || 0}</p>
          </div>

          {/* Last Message */}
          {lastMessage && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h2 className="font-semibold mb-2">Last Message Received</h2>
              <pre className="text-sm bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(lastMessage, null, 2)}
              </pre>
            </div>
          )}

          {/* Test Controls */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="font-semibold mb-2">Test Controls</h2>
            <button
              onClick={() => {
                if (isConnected && send) {
                  send({
                    type: 'ping',
                    payload: { timestamp: Date.now() }
                  });
                }
              }}
              disabled={!isConnected}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Send Ping
            </button>
          </div>

          {/* Debug Info */}
          <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
            <h2 className="font-semibold mb-2">Debug Info</h2>
            <p className="text-sm text-gray-600">
              Check the browser console for detailed logs about re-renders and message processing.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;