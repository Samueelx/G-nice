import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Updated types to match new backend format
interface User {
  UserId: number;
  Username: string;
  Email?: string | null;
  Contacts: number;
  FirstName?: string | null;
  LastName?: string | null;
  UserSecurity?: any | null;
  Verified: boolean;
  Posts?: any[] | null;
  CategoriesFollowing?: any[] | null;
  TopicsFollowing?: any[] | null;
  Cancel: boolean;
}

interface Post {
  PostId: number;
  Comment: string;
  Created: string;
  Upvotes: number;
  Downvotes: number;
  Cancel: boolean;
  User: User;
  // Media fields
  ImageUrl?: string;
  VideoUrl?: string;
  ImageData?: string; // base64 data for upload
  VideoData?: string; // base64 data for upload
}

interface EditableType {
  EditableType: string;
}

// Updated interface to match actual server response
interface ServerPostResponse {
  Posts: Post[];
  ResultCode: number;
  ResultMessage: string;
  ResultId: number;
  EditableType: number; // Server sends number, not string
}

// Legacy interface for backwards compatibility
interface PostResponse {
  EditableType: EditableType;
  Posts: Post[];
}

// Legacy interface for backwards compatibility in component
interface LegacyPost {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  videoUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
}

interface CreatePostData {
  title?: string;
  body: string;
  image?: File;
  video?: File;
}

interface PostsState {
  posts: LegacyPost[];
  userPosts: LegacyPost[];
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

// Helper function to format current date in the required format
const formatCurrentDate = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${day}-${month}-${year}-${hours}:${minutes}:${seconds}`;
};

// Helper function to convert new format to legacy format for component compatibility
const convertPostToLegacy = (post: Post): LegacyPost => {
  return {
    id: post.PostId.toString(),
    title: '', // Title is now part of Comment, you might want to extract first line
    body: post.Comment,
    imageUrl: post.ImageUrl,
    videoUrl: post.VideoUrl,
    userId: post.User.UserId.toString(),
    createdAt: post.Created,
    updatedAt: post.Created,
    likes: post.Upvotes,
    comments: 0, // You might need to track this separately
  };
};

// Define the expected return type for async thunks
interface AsyncThunkReturn {
  pending: boolean;
}

// Updated WebSocket-based createPost thunk
export const createPost = createAsyncThunk<
  AsyncThunkReturn,
  { 
    postData: CreatePostData; 
    createPost: (payload: any) => void;
    currentUser?: User;
  },
  { rejectValue: string }
>(
  "posts/createPost",
  async ({ postData, createPost: createPostWS, currentUser }, { rejectWithValue }) => {
    try {
      let imageBase64: string | undefined;
      let videoBase64: string | undefined;
      
      // Convert image to base64 if present
      if (postData.image) {
        // Validate image size (5MB limit)
        if (postData.image.size > 5 * 1024 * 1024) {
          throw new Error('Image size should be less than 5MB');
        }
        imageBase64 = await fileToBase64(postData.image);
      }

      // Convert video to base64 if present
      if (postData.video) {
        // Validate video size (50MB limit)
        if (postData.video.size > 50 * 1024 * 1024) {
          throw new Error('Video size should be less than 50MB');
        }
        videoBase64 = await fileToBase64(postData.video);
      }

      // Create the post object that will go inside the Posts array
      const postObject: Post = {
        PostId: 0, // Server will assign real ID
        Comment: postData.body,
        Created: formatCurrentDate(),
        Upvotes: 0,
        Downvotes: 0,
        Cancel: false,
        User: currentUser || {
          UserId: 0,
          Username: "anonymous",
          Contacts: 0,
          Cancel: false,
          Verified: false
        }
      };

      // Add media data if present
      if (imageBase64) {
        postObject.ImageData = imageBase64;
      }
      if (videoBase64) {
        postObject.VideoData = videoBase64;
      }

      // Create the final payload matching the exact expected format
      const payload = {
        EditableType: {
          EditableType: "POST"
        },
        Posts: [postObject]
      };

      console.log('Sending post payload:', JSON.stringify(payload, null, 2));

      // Send post creation message via WebSocket
      createPostWS(payload);

      return { pending: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create post";
      return rejectWithValue(errorMessage);
    }
  }
);

// Updated fetch thunks to handle new format
export const fetchPosts = createAsyncThunk<
  AsyncThunkReturn,
  { sendMessage: (payload: any) => void },
  { rejectValue: string }
>(
  "posts/fetchPosts",
  async ({ sendMessage }, { rejectWithValue }) => {
    try {
      const payload = {
        EditableType: {
          EditableType: "GET_POSTS"
        },
        timestamp: Date.now()
      };
      
      sendMessage(payload);
      return { pending: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch posts";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserPosts = createAsyncThunk<
  AsyncThunkReturn,
  { userId: string; sendMessage: (payload: any) => void },
  { rejectValue: string }
>(
  "posts/fetchUserPosts",
  async ({ userId, sendMessage }, { rejectWithValue }) => {
    try {
      const payload = {
        EditableType: {
          EditableType: "GET_USER_POSTS"
        },
        userId,
        timestamp: Date.now()
      };
      
      sendMessage(payload);
      return { pending: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch user posts";
      return rejectWithValue(errorMessage);
    }
  }
);

// Updated type guard functions for better type safety
const isServerPostResponse = (payload: unknown): payload is ServerPostResponse => {
  return typeof payload === 'object' && 
         payload !== null && 
         'ResultCode' in payload && 
         'Posts' in payload &&
         'ResultMessage' in payload;
};

const isPostResponse = (payload: unknown): payload is PostResponse => {
  return typeof payload === 'object' && 
         payload !== null && 
         'EditableType' in payload && 
         'Posts' in payload &&
         typeof (payload as any).EditableType === 'object';
};

const isLegacyPost = (payload: unknown): payload is LegacyPost => {
  return typeof payload === 'object' && 
         payload !== null && 
         'id' in payload && 
         'title' in payload && 
         'body' in payload;
};

const isLegacyPostArray = (payload: unknown): payload is LegacyPost[] => {
  return Array.isArray(payload) && 
         (payload.length === 0 || isLegacyPost(payload[0]));
};

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
    // Updated reducers for handling WebSocket responses with new format
    handlePostCreated: (state, action: PayloadAction<ServerPostResponse | PostResponse | LegacyPost>) => {
      state.isLoading = false;
      state.error = null;
      
      // Handle server response format (new)
      if (isServerPostResponse(action.payload)) {
        const newPosts = action.payload.Posts.map(convertPostToLegacy);
        state.posts.unshift(...newPosts);
        state.userPosts.unshift(...newPosts);
      }
      // Handle old PostResponse format
      else if (isPostResponse(action.payload)) {
        const newPosts = action.payload.Posts.map(convertPostToLegacy);
        state.posts.unshift(...newPosts);
        state.userPosts.unshift(...newPosts);
      }
      // Handle legacy format
      else if (isLegacyPost(action.payload)) {
        state.posts.unshift(action.payload);
        state.userPosts.unshift(action.payload);
      }
    },
    handlePostCreationError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    handlePostsFetched: (state, action: PayloadAction<ServerPostResponse | PostResponse | LegacyPost[]>) => {
      state.isLoading = false;
      state.error = null;
      
      // Handle legacy array format
      if (isLegacyPostArray(action.payload)) {
        state.posts = action.payload;
      }
      // Handle server response format (new)
      else if (isServerPostResponse(action.payload)) {
        state.posts = action.payload.Posts.map(convertPostToLegacy);
      }
      // Handle old PostResponse format
      else if (isPostResponse(action.payload)) {
        state.posts = action.payload.Posts.map(convertPostToLegacy);
      }
    },
    handleUserPostsFetched: (state, action: PayloadAction<ServerPostResponse | PostResponse | LegacyPost[]>) => {
      state.isLoading = false;
      state.error = null;
      
      // Handle legacy array format
      if (isLegacyPostArray(action.payload)) {
        state.userPosts = action.payload;
      }
      // Handle server response format (new)
      else if (isServerPostResponse(action.payload)) {
        state.userPosts = action.payload.Posts.map(convertPostToLegacy);
      }
      // Handle old PostResponse format
      else if (isPostResponse(action.payload)) {
        state.userPosts = action.payload.Posts.map(convertPostToLegacy);
      }
    },
    handlePostsError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Handle real-time post updates from other users
    handleNewPostReceived: (state, action: PayloadAction<ServerPostResponse | PostResponse | LegacyPost>) => {
      // Handle server response format (new)
      if (isServerPostResponse(action.payload)) {
        const newPosts = action.payload.Posts.map(convertPostToLegacy);
        newPosts.forEach(post => {
          const exists = state.posts.some(existingPost => existingPost.id === post.id);
          if (!exists) {
            state.posts.unshift(post);
          }
        });
      }
      // Handle old PostResponse format
      else if (isPostResponse(action.payload)) {
        const newPosts = action.payload.Posts.map(convertPostToLegacy);
        newPosts.forEach(post => {
          const exists = state.posts.some(existingPost => existingPost.id === post.id);
          if (!exists) {
            state.posts.unshift(post);
          }
        });
      }
      // Handle legacy format
      else if (isLegacyPost(action.payload)) {
        const exists = state.posts.some(post => post.id === action.payload.id);
        if (!exists) {
          state.posts.unshift(action.payload);
        }
      }
    },
    // Handle post updates (likes, comments, etc.)
    handlePostUpdated: (state, action: PayloadAction<Partial<LegacyPost> & { id: string }>) => {
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
      .addCase(createPost.fulfilled, () => {
        // Don't change loading state here - wait for WebSocket response
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
      .addCase(fetchPosts.fulfilled, () => {
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
      .addCase(fetchUserPosts.fulfilled, () => {
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