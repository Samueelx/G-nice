import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {
  fetchProfile,
  fetchUserByUsername,
  updateProfile,
  clearProfile,
  clearError
} from '@/features/profile/profileSlice';
import { fetchUserPosts } from '@/features/posts/postsSlice';
import { useCallback, useEffect } from 'react';

export const useProfileData = (userId?: string) => {
  const dispatch = useAppDispatch();
  const { profile, loading, error } = useAppSelector((state) => state.profile);
  const { userPosts: posts, comments } = useAppSelector((state) => state.posts);

  // Fetch complete profile data for the authenticated user (token-based)
  const fetchCompleteProfile = useCallback(async () => {
    try {
      const resultAction = await dispatch(fetchProfile());
      if (fetchProfile.fulfilled.match(resultAction)) {
        await dispatch(fetchUserPosts({ username: resultAction.payload.username }));
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  }, [dispatch]);

  // Fetch another user's profile by username
  const fetchUserProfile = useCallback(async (username: string) => {
    try {
      const resultAction = await dispatch(fetchUserByUsername(username));
      if (fetchUserByUsername.fulfilled.match(resultAction)) {
        await dispatch(fetchUserPosts({ username }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [dispatch]);

  // Individual fetch functions
  const fetchProfileData = useCallback(() => dispatch(fetchProfile()), [dispatch]);

  const fetchPosts = useCallback(
    (username: string) => dispatch(fetchUserPosts({ username })),
    [dispatch]
  );

  const fetchComments = useCallback(() => {
    // Comments on profile are not explicitly defined in the UI yet
  }, []);

  const updateProfileData = useCallback(
    (data: Parameters<typeof updateProfile>[0]) => dispatch(updateProfile(data)),
    [dispatch]
  );

  const clearProfileData = useCallback(() => dispatch(clearProfile()), [dispatch]);
  const clearErrorMessage = useCallback(() => dispatch(clearError()), [dispatch]);

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
    commentsByPost: [], // Handled elsewhere or not needed
    loading,
    error,

    // Actions
    fetchCompleteProfile,
    fetchUserProfile,
    fetchProfileData,
    fetchPosts,
    fetchComments,
    updateProfileData,
    clearProfileData,
    clearErrorMessage,
  };
};