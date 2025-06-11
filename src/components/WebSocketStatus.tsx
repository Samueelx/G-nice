import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { WebSocketStatus } from '../features/websocket/websocketSlice';

interface WebSocketStatusProps {
  wsUrl: string;
  showDetails?: boolean;
  className?: string;
}

export const WebSocketStatusComponent: React.FC<WebSocketStatusProps> = ({
  wsUrl,
  showDetails = false,
  className = '',
}) => {
  const { status, error, connect, disconnect, isConnected, lastHeartbeat } = useWebSocket({
    url: wsUrl,
    enabled: true,
  });

  const getStatusColor = () => {
    switch (status) {
      case WebSocketStatus.CONNECTED:
        return 'bg-green-500';
      case WebSocketStatus.CONNECTING:
      case WebSocketStatus.RECONNECTING:
        return 'bg-yellow-500';
      case WebSocketStatus.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case WebSocketStatus.CONNECTED:
        return <Wifi className="h-4 w-4" />;
      case WebSocketStatus.CONNECTING:
      case WebSocketStatus.RECONNECTING:
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case WebSocketStatus.ERROR:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case WebSocketStatus.CONNECTED:
        return 'Connected';
      case WebSocketStatus.CONNECTING:
        return 'Connecting...';
      case WebSocketStatus.RECONNECTING:
        return 'Reconnecting...';
      case WebSocketStatus.ERROR:
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-sm text-muted-foreground">{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Badge variant={isConnected ? 'default' : 'secondary'} className="flex items-center space-x-1">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </Badge>
        
        <div className="flex space-x-2">
          {!isConnected && (
            <Button
              size="sm"
              variant="outline"
              onClick={connect}
              disabled={status === WebSocketStatus.CONNECTING}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reconnect
            </Button>
          )}
          
          {isConnected && (
            <Button
              size="sm"
              variant="outline"
              onClick={disconnect}
            >
              <WifiOff className="h-3 w-3 mr-1" />
              Disconnect
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showDetails && isConnected && lastHeartbeat && (
        <div className="text-xs text-muted-foreground">
          Last heartbeat: {new Date(lastHeartbeat).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};