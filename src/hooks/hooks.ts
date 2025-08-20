import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { Chat } from '@/features/chats/chatsSlice';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for specific features
export const useAuth = () => useAppSelector((state) => state.auth);
export const useUser = () => useAppSelector((state) => state.user);
export const useChats = () => useAppSelector((state) => state.chats);
export const usePosts = () => useAppSelector((state) => state.posts);
export const useProfile = () => useAppSelector((state) => state.profile);

// Example of a more specific chat hook
export const useChatById = (chatId: string) => 
    useAppSelector((state) => 
      state.chats.chats.find((chat: Chat) => chat.id === chatId)
    );
  
  // Example of a combined hook for chat-related data
  // export const useChatData = () => {
  //   const chats = useAppSelector((state) => state.chats);
  //   const dispatch = useAppDispatch();
  
  //   return {
  //     chats: chats.chats,
  //     searchResults: chats.searchResults,
  //     isLoading: chats.isLoading,
  //     isSearching: chats.isSearching,
  //     error: chats.error,
  //     searchError: chats.searchError,
  //     dispatch,
  //   };
  // };