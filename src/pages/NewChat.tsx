import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Search } from "lucide-react";
import { RootState } from "@/store/store"; // Ensure correct store import
import instance from "@/api/axiosConfig";
import BackNavigationTemplate from "@/components/templates/BackNavigationTemplate";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  username: string;
  avatar?: string;
}

const NewChat = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error } = useAppSelector((state: RootState) => state.chats);

  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      setIsSearching(true);
      try {
        const response = await instance.get(`/api/users/search?username=${searchTerm}`);
        setSearchResults(response.data);
      } catch (err) {
        console.error("Failed to search users:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(fetchUsers, 300); // Debounce API calls
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleCreateChat = async (userId: string) => {
    try {
      const response = await instance.post("/api/chats", { recipientId: userId });
      navigate(`/chat/${response.data.id}`);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  return (
    <BackNavigationTemplate title="New chat">
      <div className="flex flex-col h-full bg-white">
        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Search usernames"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchTerm.length < 3 && (
            <p className="text-sm text-gray-500 mt-4">
              Type at least 3 characters to search for a username.
            </p>
          )}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {isSearching && <div className="p-4 text-center text-gray-500">Searching...</div>}
          {error && <div className="p-4 text-center text-red-500">{error}</div>}

          {searchResults.map((user) => (
            <button
              key={user.id}
              onClick={() => handleCreateChat(user.id)}
              className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors border-b"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl text-gray-600">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="ml-4">
                <h3 className="font-medium text-gray-900">{user.username}</h3>
              </div>
            </button>
          ))}

          {searchTerm.length >= 3 && searchResults.length === 0 && !isSearching && (
            <div className="p-4 text-center text-gray-500">No users found</div>
          )}
        </div>
      </div>
    </BackNavigationTemplate>
  );
};

export default NewChat;
