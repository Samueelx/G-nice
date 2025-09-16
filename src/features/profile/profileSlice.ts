import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "@/api/axiosConfig"; // Import your configured axios instance

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
};

export type Post = {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
};

export type Comment = {
  id: string;
  content: string;
  postTitle: string;
  timestamp: string;
};

// Edit Profile Form Data Type
export type EditProfileData = {
  firstName: string;
  lastName: string;
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
  posts: Post[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
  // Loading states for different operations
  updating: boolean;
  uploadingAvatar: boolean;
}

const initialState: ProfileState = {
  profile: null,
  posts: [],
  comments: [],
  loading: false,
  error: null,
  updating: false,
  uploadingAvatar: false,
};

// New async thunk for fetching user by username (for avatar clicks)
export const fetchUserByUsername = createAsyncThunk(
  'profile/fetchUserByUsername',
  async (username: string, { rejectWithValue }) => {
    try {
      // This matches your requirement: GET request to https://domain.com/users/username
      const response = await axiosInstance.get(`/users/${username}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk for fetching profile data
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Use your configured axios instance (baseURL already set in axiosConfig)
      const response = await axiosInstance.get(`/api/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk for fetching user posts
export const fetchUserPosts = createAsyncThunk(
  'profile/fetchUserPosts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}/posts`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk for fetching user comments
export const fetchUserComments = createAsyncThunk(
  'profile/fetchUserComments',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}/comments`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk for updating profile (original - kept for backward compatibility)
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/users/${profileData.id}/profile`, profileData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// New async thunk for updating profile with edit form data
export const updateProfileWithFormData = createAsyncThunk(
  'profile/updateProfileWithFormData',
  async ({ userId, formData }: { userId: string; formData: EditProfileData }, { rejectWithValue }) => {
    try {
      // Create FormData for multipart/form-data if avatar is a file
      const requestData = new FormData();
      
      // Add all form fields to FormData
      requestData.append('firstName', formData.firstName);
      requestData.append('lastName', formData.lastName);
      requestData.append('username', formData.username);
      requestData.append('email', formData.email);
      requestData.append('phoneNumber', formData.phoneNumber);
      requestData.append('dateOfBirth', formData.dateOfBirth);
      requestData.append('bio', formData.bio);
      requestData.append('location', formData.location);
      requestData.append('occupation', formData.occupation);
      
      // Add avatar file if it's a File object
      if (formData.avatar && formData.avatar instanceof File) {
        requestData.append('avatar', formData.avatar);
      }

      const response = await axiosInstance.put(`/api/users/${userId}/profile`, requestData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk for uploading avatar separately
export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async ({ userId, avatarFile }: { userId: string; avatarFile: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await axiosInstance.post(`/api/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.avatarUrl;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
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
      state.posts = [];
      state.comments = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(post => post.id !== action.payload);
    },
    // New reducer for optimistic updates
    updateProfileOptimistic: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch User By Username (for avatar clicks)
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
    
    // Fetch User Posts
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    
    // Fetch User Comments
    builder
      .addCase(fetchUserComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchUserComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    
    // Update Profile (original)
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
    
    // Update Profile with Form Data (new)
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
  addPost, 
  updatePost, 
  deletePost,
  updateProfileOptimistic
} = profileSlice.actions;

export default profileSlice.reducer;
export type { ProfileState };