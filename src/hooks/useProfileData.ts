import { useAppDispatch, useAppSelector } from '@/hooks/hooks'; // Update path to your hooks file
import { 
  fetchProfile, 
  fetchUserPosts, 
  fetchUserComments, 
  updateProfile,
  clearProfile,
  clearError
} from '@/features/profile/profileSlice'; // Adjust import path to match your structure
import { useCallback, useEffect } from 'react';

export const useProfileData = (userId?: string) => {
  const dispatch = useAppDispatch();
  const { profile, posts, comments, loading, error } = useAppSelector(
    (state) => state.profile
  );

  // Fetch complete profile data
  const fetchCompleteProfile = useCallback(
    async (id: string) => {
      try {
        await Promise.all([
          dispatch(fetchProfile(id)).unwrap(),
          dispatch(fetchUserPosts(id)).unwrap(),
          dispatch(fetchUserComments(id)).unwrap(),
        ]);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    },
    [dispatch]
  );

  // Individual fetch functions
  const fetchProfileData = useCallback(
    (id: string) => dispatch(fetchProfile(id)),
    [dispatch]
  );

  const fetchPosts = useCallback(
    (id: string) => dispatch(fetchUserPosts(id)),
    [dispatch]
  );

  const fetchComments = useCallback(
    (id: string) => dispatch(fetchUserComments(id)),
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

  // Auto-fetch profile data when userId changes
  useEffect(() => {
    if (userId) {
      fetchCompleteProfile(userId);
    }
  }, [userId, fetchCompleteProfile]);

  // Separate cleanup effect to avoid clearing data on every userId change
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
    fetchCompleteProfile,
    fetchProfileData,
    fetchPosts,
    fetchComments,
    updateProfileData,
    clearProfileData,
    clearErrorMessage,
  };
};