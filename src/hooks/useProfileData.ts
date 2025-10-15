import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { 
  fetchProfile, 
  fetchUserPosts, 
  fetchUserComments,
  fetchUserByUsername,
  updateProfile,
  clearProfile,
  clearError
} from '@/features/profile/profileSlice';
import { useCallback, useEffect } from 'react';

export const useProfileData = (userId?: string) => {
  const dispatch = useAppDispatch();
  const { profile, posts, comments, loading, error } = useAppSelector(
    (state) => state.profile
  );

  // Fetch complete profile data for the authenticated user (token-based)
  const fetchCompleteProfile = useCallback(
    async () => {
      try {
        await Promise.all([
          dispatch(fetchProfile()).unwrap(),
          dispatch(fetchUserPosts()).unwrap(),
          dispatch(fetchUserComments()).unwrap(),
        ]);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    },
    [dispatch]
  );

  // Fetch another user's profile by username
  const fetchUserProfile = useCallback(
    async (username: string) => {
      try {
        await dispatch(fetchUserByUsername(username)).unwrap();
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },
    [dispatch]
  );

  // Individual fetch functions for authenticated user (token-based)
  const fetchProfileData = useCallback(
    () => dispatch(fetchProfile()),
    [dispatch]
  );

  const fetchPosts = useCallback(
    () => dispatch(fetchUserPosts()),
    [dispatch]
  );

  const fetchComments = useCallback(
    () => dispatch(fetchUserComments()),
    [dispatch]
  );

  const updateProfileData = useCallback(
    (data: Parameters<typeof updateProfile>[0]) => dispatch(updateProfile(data)),
    [dispatch]
  );

  const clearProfileData = useCallback(
    () => dispatch(clearProfile()),
    [dispatch]
  );

  const clearErrorMessage = useCallback(
    () => dispatch(clearError()),
    [dispatch]
  );

  // Auto-fetch profile data when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      // If userId is provided, fetch that specific user's profile by username
      fetchUserProfile(userId);
    } else {
      // If no userId, fetch the authenticated user's own profile (token-based)
      fetchCompleteProfile();
    }
  }, [userId, fetchCompleteProfile, fetchUserProfile]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Only clear data when component unmounts
      clearProfileData();
    };
  }, [clearProfileData]);

  return {
    // Data
    profile,
    posts,
    comments,
    loading,
    error,
    
    // Actions
    fetchCompleteProfile,      // Fetch own profile (token-based)
    fetchUserProfile,          // Fetch another user's profile by username
    fetchProfileData,          // Fetch own profile data only
    fetchPosts,                // Fetch own posts
    fetchComments,             // Fetch own comments
    updateProfileData,
    clearProfileData,
    clearErrorMessage,
  };
};