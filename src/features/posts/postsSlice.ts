import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
interface Post {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
}

interface CreatePostData {
  title: string;
  body: string;
  image?: File;
}

interface PostsState {
  posts: Post[];
  userPosts: Post[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  userPosts: [],
  isLoading: false,
  error: null,
};

// Helper function to convert File to base64 for WebSocket transmission
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Define the expected return type for createPost
interface CreatePostReturn {
  pending: boolean;
}

// WebSocket-based createPost thunk
export const createPost = createAsyncThunk<
  CreatePostReturn,
  { postData: CreatePostData; sendMessage: (type: string, payload: any) => void },
  { rejectValue: string }
>(
  "posts/createPost",
  async ({ postData, sendMessage }, { rejectWithValue }) => {
    try {
      let imageData: {
        data: string;
        name: string;
        type: string;
        size: number;
      } | null = null;
      
      // Convert image to base64 if present
      if (postData.image) {
        // Validate image size (5MB limit)
        if (postData.image.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }
        
        imageData = {
          data: await fileToBase64(postData.image),
          name: postData.image.name,
          type: postData.image.type,
          size: postData.image.size
        };
      }

      // Send post creation message via WebSocket
      sendMessage('create_post', {
        title: postData.title,
        body: postData.body,
        image: imageData,
        timestamp: Date.now()
      });

      // Return a placeholder that will be replaced when WebSocket responds
      // The actual post data will come through WebSocket messages
      return { pending: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create post";
      return rejectWithValue(errorMessage);
    }
  }
);

// Keep the existing fetch thunks but update them for WebSocket
export const fetchPosts = createAsyncThunk<
  CreatePostReturn,
  { sendMessage: (type: string, payload: any) => void },
  { rejectValue: string }
>(
  "posts/fetchPosts",
  async ({ sendMessage }, { rejectWithValue }) => {
    try {
      sendMessage('fetch_posts', {
        timestamp: Date.now()
      });
      return { pending: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch posts";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserPosts = createAsyncThunk<
  CreatePostReturn,
  { userId: string; sendMessage: (type: string, payload: any) => void },
  { rejectValue: string }
>(
  "posts/fetchUserPosts",
  async ({ userId, sendMessage }, { rejectWithValue }) => {
    try {
      sendMessage('fetch_user_posts', {
        userId,
        timestamp: Date.now()
      });
      return { pending: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch user posts";
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPosts: (state) => {
      state.posts = [];
      state.userPosts = [];
      state.error = null;
      state.isLoading = false;
    },
    // New reducers for handling WebSocket responses
    handlePostCreated: (state, action: PayloadAction<Post>) => {
      state.isLoading = false;
      state.error = null;
      // Add the new post to the beginning of both arrays
      state.posts.unshift(action.payload);
      state.userPosts.unshift(action.payload);
    },
    handlePostCreationError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    handlePostsFetched: (state, action: PayloadAction<Post[]>) => {
      state.isLoading = false;
      state.error = null;
      state.posts = action.payload;
    },
    handleUserPostsFetched: (state, action: PayloadAction<Post[]>) => {
      state.isLoading = false;
      state.error = null;
      state.userPosts = action.payload;
    },
    handlePostsError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Handle real-time post updates from other users
    handleNewPostReceived: (state, action: PayloadAction<Post>) => {
      // Only add if it's not already in the posts array
      const exists = state.posts.some(post => post.id === action.payload.id);
      if (!exists) {
        state.posts.unshift(action.payload);
      }
    },
    // Handle post updates (likes, comments, etc.)
    handlePostUpdated: (state, action: PayloadAction<Partial<Post> & { id: string }>) => {
      const { id, ...updates } = action.payload;
      
      // Update in posts array
      const postIndex = state.posts.findIndex(post => post.id === id);
      if (postIndex !== -1) {
        state.posts[postIndex] = { ...state.posts[postIndex], ...updates };
      }
      
      // Update in userPosts array
      const userPostIndex = state.userPosts.findIndex(post => post.id === id);
      if (userPostIndex !== -1) {
        state.userPosts[userPostIndex] = { ...state.userPosts[userPostIndex], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    // Create Post (WebSocket-based)
    builder
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        // Don't change loading state here - wait for WebSocket response
        // The loading state will be cleared in handlePostCreated or handlePostCreationError
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Fetch Posts (WebSocket-based)
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state) => {
        // Loading state will be cleared in handlePostsFetched or handlePostsError
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Fetch User Posts (WebSocket-based)
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state) => {
        // Loading state will be cleared in handleUserPostsFetched or handlePostsError
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  resetPosts,
  handlePostCreated,
  handlePostCreationError,
  handlePostsFetched,
  handleUserPostsFetched,
  handlePostsError,
  handleNewPostReceived,
  handlePostUpdated
} = postsSlice.actions;

export default postsSlice.reducer;