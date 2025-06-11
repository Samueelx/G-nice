import React, { useState, useEffect } from "react";
import { WebSocketStatusComponent } from "@/components/WebSocketStatus";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Menu, Wifi, WifiOff } from "lucide-react";

// WebSocket configuration
const WS_URL = 'ws://localhost:8080/Memefest-SNAPSHOT-01/resources/feeds';

interface LandingPageProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setIsSidebarOpen }) => {
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);

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

  useEffect(() => {
    if (isConnected) {
      send({
        type: 'user_activity',
        payload: {
          action: 'view_feed',
          timestamp: Date.now(),
        }
      });
    }
  }, [isConnected, send]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 overflow-x-hidden">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 border-b border-purple-100">
        <div className="p-3">
          <nav className="w-full">
            <div className="flex items-center justify-between gap-2">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-purple-100 rounded-full">
                <Menu className="w-6 h-6 text-purple-600" />
              </button>

              <div className="flex items-center gap-2">
                <img className="w-8 h-8" src="/g-icon.svg" alt="G Icon" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Gnice
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setShowConnectionStatus(!showConnectionStatus)} className="p-1.5 hover:bg-purple-100 rounded-full">
                  {isConnected ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                </button>

                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-purple-200">
                    <img className="w-full h-full object-cover" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt="Profile" />
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {showConnectionStatus && (
          <div className="border-t border-purple-100 bg-white/90 p-3">
            <WebSocketStatusComponent wsUrl={WS_URL} showDetails={true} className="max-w-2xl mx-auto" />
          </div>
        )}
      </header>

      <main className="w-full px-3 py-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          {isConnected ? (
            <div className="text-green-600">✅ WebSocket Connected!</div>
          ) : (
            <div className="text-red-600">❌ Not connected.</div>
          )}
        </div>

        {error && (
          <div className="max-w-2xl mx-auto text-center text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            Error: {error}
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;
