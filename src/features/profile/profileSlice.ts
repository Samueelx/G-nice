import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosConfig";
import axios from "axios";

// Types matching your ProfilePage component
export type UserProfile = {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  bio?: string;
  location?: string;
  occupation?: string;
  joinDate: string;
  followers: number;
  following: number;
  // Additional fields for edit profile
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  displayName?: string; // Add displayName
};

// Edit Profile Form Data Type
export type EditProfileData = {
  displayName: string;
  username: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  bio: string;
  location: string;
  occupation: string;
  avatar?: File | string;
};

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  // Loading states for different operations
  updating: boolean;
  uploadingAvatar: boolean;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  updating: false,
  uploadingAvatar: false,
};

// Helper to transform backend user data to frontend UserProfile
const transformUserData = (data: any): UserProfile => ({
  id: data.id?.toString() || '',
  username: data.username || '',
  handle: `@${data.username || 'user'}`,
  avatar: data.avatar_url || '',
  bio: data.bio || '',
  location: data.location || '',
  occupation: data.occupation || '',
  joinDate: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Recently',
  followers: data.followers_count || 0,
  following: data.following_count || 0,
  firstName: data.firstName || '',
  lastName: data.lastName || '',
  email: data.email || '',
  phoneNumber: data.phoneNumber || '',
  dateOfBirth: data.dateOfBirth || '',
  displayName: data.display_name || '',
});

// New async thunk for fetching user by username (for avatar clicks)
export const fetchUserByUsername = createAsyncThunk(
  'profile/fetchUserByUsername',
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/users/${username}`);
      const data = response.data?.data ?? response.data;
      return transformUserData(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk for fetching profile data (token-based authentication)
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users/me');
      const data = response.data?.data ?? response.data;
      return transformUserData(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk for updating profile (token-based authentication)
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      // Map to backend schema
      const backendPayload = {
        display_name: profileData.displayName,
        bio: profileData.bio,
        avatar_url: profileData.avatar,
        // The backend might not support the rest, but we can send them just in case
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        dateOfBirth: profileData.dateOfBirth,
        location: profileData.location,
        occupation: profileData.occupation,
      };

      const response = await axiosInstance.patch('/users/me', backendPayload);
      const data = response.data?.data ?? response.data;
      return transformUserData(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk for uploading avatar separately (token-based authentication)
export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (avatarFile: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', avatarFile); // Backend expects 'file'

      const response = await axiosInstance.post('/uploads?type=avatars', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data?.data ?? response.data;
      return data.url || data.avatarUrl; // Handle different potential key names just in case
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// New async thunk for updating profile with edit form data (token-based authentication)
export const updateProfileWithFormData = createAsyncThunk(
  'profile/updateProfileWithFormData',
  async (formData: EditProfileData, { dispatch, rejectWithValue }) => {
    try {
      let avatarUrl = undefined;
      
      // Add avatar file if it's a File object
      if (formData.avatar && formData.avatar instanceof File) {
        const uploadAction = await dispatch(uploadAvatar(formData.avatar) as any);
        if (uploadAvatar.fulfilled.match(uploadAction)) {
          avatarUrl = uploadAction.payload;
        } else {
          throw new Error('Avatar upload failed');
        }
      } else if (typeof formData.avatar === 'string') {
          avatarUrl = formData.avatar;
      }

      // Map to backend schema
      const backendPayload = {
        display_name: formData.displayName,
        bio: formData.bio,
        avatar_url: avatarUrl,
        location: formData.location,
        occupation: formData.occupation,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
      };

      const response = await axiosInstance.patch('/users/me', backendPayload);
      const data = response.data?.data ?? response.data;
      return transformUserData(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
      }
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // New reducer for optimistic updates
    updateProfileOptimistic: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch User By Username
    builder
      .addCase(fetchUserByUsername.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserByUsername.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserByUsername.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })

    // Update Profile with Form Data
    builder
      .addCase(updateProfileWithFormData.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProfileWithFormData.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
      })
      .addCase(updateProfileWithFormData.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })

    // Upload Avatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        if (state.profile) {
          state.profile.avatar = action.payload;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProfile,
  clearProfile,
  clearError,
  updateProfileOptimistic
} = profileSlice.actions;

export default profileSlice.reducer;
export type { ProfileState };