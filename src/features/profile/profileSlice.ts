import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = 'http://localhost:3000'; // Adjust this to your API base URL

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

interface ProfileState {
  profile: UserProfile | null;
  posts: Post[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  posts: [],
  comments: [],
  loading: false,
  error: null,
};

// Async thunk for fetching profile data
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/${userId}/profile`);
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
      const response = await axios.get(`${BASE_URL}/api/users/${userId}/posts`);
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
      const response = await axios.get(`${BASE_URL}/api/users/${userId}/comments`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk for updating profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/api/users/${profileData.id}/profile`, profileData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
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
  },
  extraReducers: (builder) => {
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
    
    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
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
  deletePost 
} = profileSlice.actions;

export default profileSlice.reducer;