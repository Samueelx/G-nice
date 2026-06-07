import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Users, Hash, Calendar, Loader2, MessageSquare, ThumbsUp } from 'lucide-react';
import { AppDispatch, RootState } from '@/store/store';
import { searchContent, setQuery, setCategory } from '@/features/search/searchSlice';
import { SearchCategory, SearchUser, SearchPost, SearchEvent } from '@/types/search';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { debounce } from 'lodash';

const SearchInterface: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { query, activeCategory, results, isLoading, error } = useSelector(
    (state: RootState) => state.search
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, category: SearchCategory) => {
      if (searchQuery.trim()) {
        dispatch(searchContent({ query: searchQuery, category }));
      }
    }, 300),
    [dispatch]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    dispatch(setQuery(newQuery));
    debouncedSearch(newQuery, activeCategory);
  };

  // Handle category change
  const handleCategoryChange = (category: SearchCategory) => {
    dispatch(setCategory(category));
    if (query.trim()) {
      dispatch(searchContent({ query, category }));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
      {/* Search Input */}
      <div className="p-3 border-b">
        <div className="relative">
          {isLoading ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          )}
          <Input 
            type="text"
            placeholder="Search users, posts, or events..."
            value={query}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-white/50 border-purple-100 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
          />
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 p-3 border-b overflow-x-auto scrollbar-hide">
        {(['all', 'users', 'posts', 'events'] as const).map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange(category)}
            className="flex-shrink-0"
          >
            {category === 'users' && <Users className="w-4 h-4 mr-2" />}
            {category === 'posts' && <Hash className="w-4 h-4 mr-2" />}
            {category === 'events' && <Calendar className="w-4 h-4 mr-2" />}
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Results Sections */}
      <div className="divide-y">
        {/* Users Results */}
        {(activeCategory === 'all' || activeCategory === 'users') && results.users.length > 0 && (
          <div className="p-3">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Users</h2>
            <div className="space-y-3">
              {results.users.map((user: SearchUser) => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{(user.display_name || user.username).charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.display_name || user.username}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${user.username}`); }}>View Profile</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Results */}
        {(activeCategory === 'all' || activeCategory === 'posts') && results.posts.length > 0 && (
          <div className="p-3">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Posts</h2>
            <div className="space-y-3">
              {results.posts.map((post: SearchPost) => (
                <div key={post.id} className="flex flex-col gap-2 p-3 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-purple-100" onClick={() => navigate(`/post/${post.id}`)}>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={post.author?.avatar_url || undefined} />
                      <AvatarFallback>{(post.author?.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900">{post.author?.display_name || post.author?.username}</span>
                    <span className="text-xs text-gray-500">• {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-gray-500 text-xs mt-1">
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likes_count}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Results */}
        {(activeCategory === 'all' || activeCategory === 'events') && results.events.length > 0 && (
          <div className="p-3">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Events</h2>
            <div className="space-y-3">
              {results.events.map((event: SearchEvent) => (
                <div key={event.id} className="flex flex-col p-3 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 line-clamp-1">{event.title}</h3>
                      <p className="text-xs text-purple-600 font-medium">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {query && !isLoading && 
          Object.values(results).every((arr) => arr.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInterface;