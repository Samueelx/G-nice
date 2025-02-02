import { Card } from '@/components/ui/card';
import { Search, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatPreview {
  id: string;
  recipientName: string;
  lastMessage: string;
  timestamp: string;
  avatarUrl?: string;
}

const ChatList = () => {
  // This would typically come from your Redux store or API
  const chats: ChatPreview[] = [
    {
      id: '1',
      recipientName: 'John Smith',
      lastMessage: 'Thanks for the update!',
      timestamp: '09:34 PM',
      avatarUrl: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c9349?q=80&w=2041&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ];

  const handleNewChat = () => {
    // Handle new chat creation
    console.log('Create new chat');
  };

  return (
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
          {chats.map((chat) => (
            <Card 
              key={chat.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={chat.avatarUrl || '/api/placeholder/32/32'}
                    alt={chat.recipientName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>

                {/* Chat preview content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chat.recipientName}
                    </h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {chat.timestamp}
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
  );
};

export default ChatList;