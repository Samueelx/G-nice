import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosConfig"; // Import your configured axios instance

// Types
interface Post {
  id: string;
  body: string;
  imageUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
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
  image?: File;
}

interface CreateCommentData {
  postId: string;
  body: string;
}

// Updated interface for API payload
interface CreatePostPayload {
  body: string;
  image?: string; // base64 encoded string
  imageType?: string; // MIME type of the image
}

interface PostsState {
  posts: Post[];
  userPosts: Post[];
  selectedPost: Post | null;
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
      // Remove the data URL prefix (data:image/jpeg;base64,) and keep only base64 string
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Async thunks
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData: CreatePostData, { rejectWithValue }) => {
    try {
      const payload: CreatePostPayload = {
        body: postData.body,
      };

      // Convert image to base64 if provided
      if (postData.image) {
        const base64Image = await fileToBase64(postData.image);
        payload.image = base64Image;
        payload.imageType = postData.image.type;
      }

      // Use your configured axios instance instead of raw axios
      const response = await axiosInstance.post("/api/posts", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      return response.data;
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
      // Use your configured axios instance
      const response = await axiosInstance.get("/api/posts");
      return response.data;
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
      // Use your configured axios instance
      const response = await axiosInstance.get(`/api/posts/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user posts"
      );
    }
  }
);

// New: Fetch single post by ID
export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/posts/${postId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch post"
      );
    }
  }
);

// New: Fetch comments for a specific post
export const fetchComments = createAsyncThunk(
  "posts/fetchComments",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/posts/${postId}/comments`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments"
      );
    }
  }
);

// New: Create a comment
export const createComment = createAsyncThunk(
  "posts/createComment",
  async (commentData: CreateCommentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/api/posts/${commentData.postId}/comments`,
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
    // Create Post
    builder
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
        state.userPosts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch User Posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchUserPosts.fulfilled,
        (state, action: PayloadAction<Post[]>) => {
          state.isLoading = false;
          state.userPosts = action.payload;
        }
      )
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Post By ID
      .addCase(fetchPostById.pending, (state) => {
        state.isLoadingPost = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action: PayloadAction<Post>) => {
        state.isLoadingPost = false;
        state.selectedPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoadingPost = false;
        state.error = action.payload as string;
      })
      // Fetch Comments
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
      // Create Comment
      .addCase(createComment.pending, (state) => {
        state.isLoadingComments = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        state.isLoadingComments = false;
        state.comments.push(action.payload);
        // Update comment count in selected post if it exists
        if (state.selectedPost) {
          state.selectedPost.comments += 1;
        }
        // Update comment count in posts array if the post exists there
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