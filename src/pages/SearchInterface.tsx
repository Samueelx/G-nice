import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Users, Hash, Image, Loader2 } from 'lucide-react';
import { AppDispatch, RootState } from '@/store/store';
import { searchContent, setQuery, setCategory } from '@/features/search/searchSlice';
import { Meme, SearchCategory, Topic, User } from '@/types/search';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {debounce} from 'lodash';

const SearchInterface: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
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
            placeholder="Search..."
            value={query}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-white/50 border-purple-100 focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
          />
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 p-3 border-b overflow-x-auto scrollbar-hide">
        {(['all', 'people', 'topics', 'memes'] as const).map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange(category)}
            className="flex-shrink-0"
          >
            {category === 'people' && <Users className="w-4 h-4 mr-2" />}
            {category === 'topics' && <Hash className="w-4 h-4 mr-2" />}
            {category === 'memes' && <Image className="w-4 h-4 mr-2" />}
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Results Sections */}
      <div className="divide-y">
        {/* People Results */}
        {(activeCategory === 'all' || activeCategory === 'people') && results!.people.length > 0 && (
          <div className="p-3">
            <h2 className="text-sm font-medium text-gray-500 mb-2">People</h2>
            <div className="space-y-3">
              {results.people.map((person: User) => (
                <div key={person.id} className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded-lg transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-500">
                      {person.status === 'active' ? 'Active now' : `Last seen ${person.lastSeen}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics Results */}
        {(activeCategory === 'all' || activeCategory === 'topics') && results.topics.length > 0 && (
          <div className="p-3">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Topics</h2>
            <div className="space-y-3">
              {results.topics.map((topic: Topic) => (
                <div key={topic.id} className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-purple-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">{topic.name}</h3>
                      <p className="text-sm text-gray-500">{topic.memberCount.toLocaleString()} members</p>
                    </div>
                  </div>
                  <Button 
                    variant={topic.isJoined ? "secondary" : "outline"}
                    size="sm"
                  >
                    {topic.isJoined ? 'Joined' : 'Join'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memes Results */}
        {(activeCategory === 'all' || activeCategory === 'memes') && results.memes.length > 0 && (
          <div className="p-3">
            <h2 className="text-sm font-medium text-gray-500 mb-2">Memes</h2>
            <div className="space-y-3">
              {results.memes.map((meme: Meme) => (
                <div key={meme.id} className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Image className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{meme.title}</h3>
                      <p className="text-sm text-gray-500">
                        {meme.category} • {meme.likes.toLocaleString()} likes
                      </p>
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