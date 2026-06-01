import { useState, useCallback, useEffect } from 'react';
import axiosInstance from '@/api/axiosConfig';
import { SearchUser } from '@/types/search';
import { debounce } from 'lodash';

export const useUserSearch = () => {
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/search', {
        params: { q: query, type: 'users' }
      });
      const envelope = response.data?.data ?? response.data;
      const fetchedUsers = envelope.users?.data ?? envelope.users?.items ?? [];
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Failed to search users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      fetchUsers(query);
    }, 300),
    []
  );

  return { users, isLoading, error, searchUsers: debouncedSearch, clearUsers: () => setUsers([]) };
};
