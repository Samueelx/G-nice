import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosConfig";

// ─── Raw backend types (new API) ─────────────────────────────────────────────

interface BackendUser {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface BackendPost {
  id: number;
  content: string;
  media_url: string | null;
  media_type: string | null; // "image" | "video" | "gif"
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  created_at: string;
  updated_at: string;
  author: BackendUser;
}

interface BackendComment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author: BackendUser;
}

// ─── Frontend-normalized types ────────────────────────────────────────────────

export interface NormalizedPost {
  id: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  isPublic: boolean;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

// ─── Input types ──────────────────────────────────────────────────────────────

interface CreatePostData {
  content: string;
  media_url?: string | null;
  media_type?: string | null; // "image" | "video" | "gif"
  is_public?: boolean;
}

interface UpdatePostData {
  postId: string;
  content?: string;
  is_public?: boolean;
}

interface CreateCommentData {
  postId: string;
  content: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

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

// ─── Normalizers ──────────────────────────────────────────────────────────────

const normalizePost = (post: BackendPost): NormalizedPost => ({
  id: post.id.toString(),
  content: post.content,
  mediaUrl: post.media_url,
  mediaType: post.media_type,
  isPublic: post.is_public,
  userId: post.author.id.toString(),
  username: post.author.username,
  displayName: post.author.display_name || post.author.username,
  avatarUrl: post.author.avatar_url,
  createdAt: post.created_at,
  likes: post.likes_count ?? 0,
  comments: post.comments_count ?? 0,
  isLiked: post.is_liked ?? false,
});

const normalizeComment = (comment: BackendComment, postId: string): Comment => ({
  id: comment.id.toString(),
  postId,
  content: comment.content,
  createdAt: comment.created_at,
  updatedAt: comment.updated_at,
  author: {
    id: comment.author.id.toString(),
    username: comment.author.username,
    displayName: comment.author.display_name || comment.author.username,
    avatarUrl: comment.author.avatar_url,
  },
});

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** GET /posts — global feed */
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (
    params: { page?: number; page_size?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get("/posts", { params });
      const envelope = response.data;
      // The backend may return a paginated envelope or a plain array
      const items = envelope.data?.items ?? envelope.data?.data ?? envelope.data ?? envelope;
      return items.map(normalizePost);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to fetch posts"
      );
    }
  }
);

/** GET /users/:username/posts */
export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async (
    { username, page = 1, page_size = 20 }: { username: string; page?: number; page_size?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(`/users/${username}/posts`, {
        params: { page, page_size },
      });
      const envelope = response.data;
      const items = envelope.data?.items ?? envelope.data?.data ?? envelope.data ?? envelope;
      return items.map(normalizePost);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to fetch user posts"
      );
    }
  }
);

/** GET /posts/:id */
export const fetchPostById = createAsyncThunk(
  "posts/fetchPostById",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/posts/${postId}`);
      const post: BackendPost = response.data?.data ?? response.data;
      return normalizePost(post);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to fetch post"
      );
    }
  }
);

/** POST /posts — create a new post */
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData: CreatePostData, { rejectWithValue }) => {
    try {
      const payload = {
        content: postData.content,
        ...(postData.media_url && { media_url: postData.media_url }),
        ...(postData.media_type && { media_type: postData.media_type }),
        is_public: postData.is_public ?? true,
      };
      const response = await axiosInstance.post("/posts", payload);
      const post: BackendPost = response.data?.data ?? response.data;
      return normalizePost(post);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to create post"
      );
    }
  }
);

/** PATCH /posts/:id — update a post */
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ postId, ...body }: UpdatePostData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/posts/${postId}`, body);
      const post: BackendPost = response.data?.data ?? response.data;
      return normalizePost(post);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to update post"
      );
    }
  }
);

/** DELETE /posts/:id */
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      return postId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to delete post"
      );
    }
  }
);

/** GET /posts/:id/comments */
export const fetchComments = createAsyncThunk(
  "posts/fetchComments",
  async (
    { postId, page = 1, page_size = 20 }: { postId: string; page?: number; page_size?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get(`/posts/${postId}/comments`, {
        params: { page, page_size },
      });
      const envelope = response.data;
      const items: BackendComment[] = envelope.data?.items ?? envelope.data?.data ?? envelope.data ?? envelope;
      return { postId, comments: items.map((c) => normalizeComment(c, postId)) };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to fetch comments"
      );
    }
  }
);

/** POST /posts/:id/comments */
export const createComment = createAsyncThunk(
  "posts/createComment",
  async ({ postId, content }: CreateCommentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/posts/${postId}/comments`, { content });
      const comment: BackendComment = response.data?.data ?? response.data;
      return normalizeComment(comment, postId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to create comment"
      );
    }
  }
);

/** POST /posts/:id/like — toggle like */
export const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/posts/${postId}/like`);
      const result = response.data?.data ?? response.data;
      return {
        postId,
        liked: result.liked as boolean,
        likes_count: result.likes_count as number,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || "Failed to toggle like"
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

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
      // ── fetchPosts ──
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

      // ── fetchUserPosts ──
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

      // ── fetchPostById ──
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

      // ── createPost ──
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

      // ── updatePost ──
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action: PayloadAction<NormalizedPost>) => {
        state.isLoading = false;
        const idx = state.posts.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.posts[idx] = action.payload;
        const uIdx = state.userPosts.findIndex((p) => p.id === action.payload.id);
        if (uIdx !== -1) state.userPosts[uIdx] = action.payload;
        if (state.selectedPost?.id === action.payload.id) {
          state.selectedPost = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── deletePost ──
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
        state.userPosts = state.userPosts.filter((p) => p.id !== action.payload);
        if (state.selectedPost?.id === action.payload) {
          state.selectedPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ── fetchComments ──
      .addCase(fetchComments.pending, (state) => {
        state.isLoadingComments = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoadingComments = false;
        state.comments = action.payload.comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoadingComments = false;
        state.error = action.payload as string;
      })

      // ── createComment ──
      .addCase(createComment.pending, (state) => {
        state.isLoadingComments = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        state.isLoadingComments = false;
        state.comments.unshift(action.payload);
        if (state.selectedPost) {
          state.selectedPost.comments += 1;
        }
        const postIndex = state.posts.findIndex((p) => p.id === action.payload.postId);
        if (postIndex !== -1) state.posts[postIndex].comments += 1;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoadingComments = false;
        state.error = action.payload as string;
      })

      // ── toggleLike ──
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked, likes_count } = action.payload;
        const update = (post: NormalizedPost) => {
          post.isLiked = liked;
          post.likes = likes_count;
        };
        const idx = state.posts.findIndex((p) => p.id === postId);
        if (idx !== -1) update(state.posts[idx]);
        const uIdx = state.userPosts.findIndex((p) => p.id === postId);
        if (uIdx !== -1) update(state.userPosts[uIdx]);
        if (state.selectedPost?.id === postId) update(state.selectedPost);
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetPosts, clearSelectedPost } = postsSlice.actions;
export default postsSlice.reducer;
export type { PostsState, NormalizedPost as Post, CreatePostData };
