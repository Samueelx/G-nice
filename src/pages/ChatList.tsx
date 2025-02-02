import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Search, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { fetchChats } from "@/features/chats/chatsSlice";
import { Chat } from "@/features/chats/chatsSlice";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import BackNavigationTemplate from "@/components/templates/BackNavigationTemplate";

const ChatList = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { chats = [], isLoading } = useAppSelector(
    (state) => state.chats || {}
  );

  useEffect(() => {
    dispatch(fetchChats()).unwrap()
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load chats",
          variant: "destructive",
        });
      });
  }, [dispatch, toast]);

  const handleNewChat = () => {
    navigate("/new-chat");
  };

  if (isLoading) {
    return (
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
    );
  }

  return (
    <BackNavigationTemplate title="Chats">
      <div className="relative min-h-screen">
        <div className="max-w-2xl mx-auto p-4">
          {/* Search bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search message..."
              className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Chat list */}
          <div className="space-y-2">
            {Array.isArray(chats) &&
              chats.map((chat: Chat) => (
                <Card
                  key={chat.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
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
                        <h3 className="font-semibold text-gray-900 truncate">
                          {chat.recipientName}
                        </h3>
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          {chat.timestamp
                            ? format(new Date(chat.timestamp), "p, MMM d")
                            : "N/A"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>

          {/* Show message if no chats */}
          {chats.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 mt-8">
              <p>No chats yet</p>
              <p className="text-sm">
                Start a new conversation using the button below
              </p>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 right-6">
          <Button
            onClick={handleNewChat}
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-blue-500 hover:bg-blue-600"
          >
            <MessageSquarePlus className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </BackNavigationTemplate>
  );
};

export default ChatList;
