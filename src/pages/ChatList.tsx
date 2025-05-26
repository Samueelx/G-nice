import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Search, MessageSquarePlus, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { 
  fetchChats, 
  markChatAsRead,
  selectAllChats,
  selectChatsLoading,
  selectConnectionStatus,
  selectConnectionError,
  selectUnreadChatsCount
} from "@/features/chats/chatsSlice";
import { Chat } from "@/features/chats/chatsSlice";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import BackNavigationTemplate from "@/components/templates/BackNavigationTemplate";
import { connectWebSocket, disconnectWebSocket } from "@/middleware/websocketsMiddleware";

const ChatList = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Enhanced selectors
  const chats = useAppSelector(selectAllChats);
  const isLoading = useAppSelector(selectChatsLoading);
  const isConnected = useAppSelector(selectConnectionStatus);
  const connectionError = useAppSelector(selectConnectionError);
  const totalUnreadCount = useAppSelector(selectUnreadChatsCount);

  // Get current user (you'll need to adjust this based on your auth state)
  const currentUser = useAppSelector((state) => state.auth?.user); // Adjust path as needed

  // Filter chats based on search term
  const filteredChats = chats.filter(chat =>
    chat.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Initialize WebSocket connection if user is authenticated
    if (currentUser?.id) {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
      dispatch(connectWebSocket(wsUrl, currentUser.id));
    }

    // Fetch chats (will use WebSocket if connected, HTTP as fallback)
    dispatch(fetchChats()).unwrap()
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load chats",
          variant: "destructive",
        });
      });

    // Cleanup WebSocket on unmount
    return () => {
      dispatch(disconnectWebSocket());
    };
  }, [dispatch, toast, currentUser?.id]);

  // Show connection error toast
  useEffect(() => {
    if (connectionError) {
      toast({
        title: "Connection Error",
        description: connectionError,
        variant: "destructive",
      });
    }
  }, [connectionError, toast]);

  const handleNewChat = () => {
    navigate("/new-chat");
  };

  const handleChatClick = (chat: Chat) => {
    // Mark chat as read if it has unread messages
    if (chat.unreadCount && chat.unreadCount > 0) {
      dispatch(markChatAsRead(chat.id));
    }
    navigate(`/chat/${chat.id}`);
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "N/A";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, "p"); // Just time for today
    } else if (diffInHours < 168) { // Less than a week
      return format(date, "EEE"); // Day of week
    } else {
      return format(date, "MMM d"); // Month and day
    }
  };

  if (isLoading && chats.length === 0) {
    return (
      <BackNavigationTemplate title="Chats">
        <div className="max-w-2xl mx-auto p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </BackNavigationTemplate>
    );
  }

  return (
    <BackNavigationTemplate 
      title={
        <div className="flex items-center gap-2">
          <span>Chats</span>
          {/* Connection status indicator */}
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          {/* Total unread count */}
          {totalUnreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </div>
      }
    >
      <div className="relative min-h-screen">
        <div className="max-w-2xl mx-auto p-4">
          {/* Search bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Chat list */}
          <div className="space-y-2">
            {filteredChats.map((chat: Chat) => (
              <Card
                key={chat.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors relative"
                onClick={() => handleChatClick(chat)}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={chat.avatarUrl || "/images/default-avatar.png"}
                      alt={chat.recipientName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        chat.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>

                  {/* Chat preview content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold truncate ${
                          chat.unreadCount && chat.unreadCount > 0 
                            ? "text-gray-900" 
                            : "text-gray-700"
                        }`}>
                          {chat.recipientName}
                        </h3>
                        {chat.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatTimestamp(chat.timestamp)}
                        </span>
                        {chat.unreadCount && chat.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs min-w-[20px] h-5 flex items-center justify-center">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm truncate ${
                      chat.unreadCount && chat.unreadCount > 0 
                        ? "text-gray-600 font-medium" 
                        : "text-gray-500"
                    }`}>
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Show message if no chats found */}
          {filteredChats.length === 0 && chats.length > 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p>No chats found matching "{searchTerm}"</p>
            </div>
          )}

          {/* Show message if no chats exist */}
          {chats.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 mt-8">
              <MessageSquarePlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No conversations yet</p>
              <p className="text-sm">
                Start your first conversation using the button below
              </p>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 right-6">
          <Button
            onClick={handleNewChat}
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-blue-500 hover:bg-blue-600 hover:scale-105"
          >
            <MessageSquarePlus className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </BackNavigationTemplate>
  );
};

export default ChatList;