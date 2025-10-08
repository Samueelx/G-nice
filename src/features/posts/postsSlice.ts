import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosConfig";

// Types matching backend response
interface Post {
  id: string;
  body: string;
  imageUrls?: string[]; // Changed to match backend (array of URLs)
  user: {
    UserId: string; // Backend uses capital U
    Username: string; // Backend uses capital U
    displayName?: string; // Backend provides displayName
  };
  createdAt: string;
  likes?: number; // Made optional
  comments?: number; // Made optional
}

// Normalized Post for frontend use
interface NormalizedPost {
  id: string;
  body: string;
  imageUrls?: string[];
  userId: string; // Flattened from user.UserId
  username: string; // Flattened from user.Username
  displayName: string; // Flattened from user.displayName
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePostData {
  body: string;
  image?: File | null;
}

interface CreateCommentData {
  postId: string;
  body: string;
}

// Updated interface matching backend expectations
interface CreatePostPayload {
  body: string;
  images?: Array<{
    image: string; // base64 encoded string
    imageType: string; // MIME type
  }>;
}

interface PostsState {
  posts: NormalizedPost[];
  userPosts: NormalizedPost[];
  selectedPost: NormalizedPost | null;
  comments: Comment[];
  isLoading: boolean;
  isLoadingPost: boolean;
  isLoadingComments: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  userPosts: [],
  selectedPost: null,
  comments: [],
  isLoading: false,
  isLoadingPost: false,
  isLoadingComments: false,
  error: null,
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to normalize backend post to frontend format
const normalizePost = (post: Post): NormalizedPost => ({
  id: post.id,
  body: post.body,
  imageUrls: post.imageUrls,
  userId: post.user.UserId,
  username: post.user.Username,
  displayName: post.user.displayName || post.user.Username, // Use displayName or fallback to Username
  createdAt: post.createdAt,
  likes: post.likes ?? 0, // Default to 0 if undefined
  comments: post.comments ?? 0, // Default to 0 if undefined
});

// Async thunks
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData: CreatePostData, { rejectWithValue }) => {
    try {
      const payload: CreatePostPayload = {
        body: postData.body,
      };

      // Convert image to base64 if provided - wrap in images array
      if (postData.image) {
        const base64Image = await fileToBase64(postData.image);
        payload.images = [
          {
            image: base64Image,
            imageType: postData.image.type,
          },
        ];
      }

      const response = await axiosInstance.post<Post>("/Post", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      return normalizePost(response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create post"
      );
    }
  }
);

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      // Updated to match backend endpoint
      const response = await axiosInstance.get<Post[]>("/Posts");
      return response.data.map(normalizePost);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch posts"
      );
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<Post[]>(`/Post/user/${userId}`);
      return response.data.map(normalizePost);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user posts"
      );
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<Post>(`/Post/${postId}`);
      return normalizePost(response.data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch post"
      );
    }
  }
);

export const fetchComments = createAsyncThunk(
  "posts/fetchComments",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<Comment[]>(`/Post/${postId}/Comments`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments"
      );
    }
  }
);

export const createComment = createAsyncThunk(
  "posts/createComment",
  async (commentData: CreateCommentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<Comment>(
        `/Post/${commentData.postId}/Comments`,
        { body: commentData.body },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create comment"
      );
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
    clearSelectedPost: (state) => {
      state.selectedPost = null;
      state.comments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action: PayloadAction<NormalizedPost>) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
        state.userPosts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<NormalizedPost[]>) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action: PayloadAction<NormalizedPost[]>) => {
        state.isLoading = false;
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPostById.pending, (state) => {
        state.isLoadingPost = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action: PayloadAction<NormalizedPost>) => {
        state.isLoadingPost = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoadingPost = false;
        state.error = action.payload as string;
      })
      .addCase(fetchComments.pending, (state) => {
        state.isLoadingComments = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
        state.isLoadingComments = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoadingComments = false;
        state.error = action.payload as string;
      })
      .addCase(createComment.pending, (state) => {
        state.isLoadingComments = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        state.isLoadingComments = false;
        state.comments.push(action.payload);
        if (state.selectedPost) {
          state.selectedPost.comments += 1;
        }
        const postIndex = state.posts.findIndex(post => post.id === action.payload.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].comments += 1;
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoadingComments = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetPosts, clearSelectedPost } = postsSlice.actions;
export default postsSlice.reducer;
export type { PostsState, NormalizedPost };