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

interface Reply {
  PostId: number;
  Comment: string;
  Created: string;
  Upvotes: number;
  Downvotes: number;
  Cancel: boolean;
  User: User;
  ImageUrl?: string;
  VideoUrl?: string;
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
  // Replies field for post details
  Replys?: Reply[];
  // Categories (if needed)
  Categories?: any[] | null;
  CanceledCategories?: any[] | null;
}

interface PostWithReplies {
  PostId: number;
  Comment: string;
  Created: string;
  Upvotes: number;
  Downvotes: number;
  Cancel: boolean;
  User: User;
  ImageUrl?: string;
  VideoUrl?: string;
  Replys: Reply[];
  Categories?: any[] | null;
  CanceledCategories?: any[] | null;
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

// FIXED: Updated interface to match the exact server response format
interface ServerPostDetailsResponse {
  ResultCode: number;
  ResultMessage: string;
  postWithReplies: PostWithReplies[]; // This matches your server response (lowercase 'p')
  ResultId: number;
  Getable: number; // Required field based on your response example
}

// Legacy interface for backwards compatibility
interface PostResponse {
  EditableType: EditableType;
  Posts: Post[];
}

// Updated LegacyPost to match SocialPost component props
interface LegacyPost {
  id: string;
  title?: string;
  body: string;
  content: string; // SocialPost expects 'content' not 'body'
  author: string; // SocialPost expects 'author'
  avatar?: string;
  timestamp: string;
  imageUrl?: string;
  videoUrl?: string;
  image?: string; // SocialPost expects 'image'
  userId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  shares?: number;
  isLiked?: boolean;
}

// New interface for post details view
interface LegacyReply {
  id: string;
  content: string;
  author: string;
  avatar?: string;
  timestamp: string;
  imageUrl?: string;
  videoUrl?: string;
  userId: string;
  createdAt: string;
  likes: number;
}

interface LegacyPostDetails {
  post: LegacyPost;
  replies: LegacyReply[];
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
  currentPostDetails: LegacyPostDetails | null;
  currentPostWithReplies: LegacyPostDetails | null;
  isLoading: boolean;
  isLoadingPostDetails: boolean;
  error: string | null;
  postDetailsError: string | null;
}

const initialState: PostsState = {
  posts: [],
  userPosts: [],
  currentPostDetails: null,
  currentPostWithReplies: null,
  isLoading: false,
  isLoadingPostDetails: false,
  error: null,
  postDetailsError: null,
};

// Helper function to convert File to base64 for WebSocket transmission
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to format current date in the required format
const formatCurrentDate = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year}-${hours}:${minutes}:${seconds}`;
};

// Helper function to format timestamp for display
const formatTimestamp = (dateString: string): string => {
  try {
    // Handle null or undefined dates
    if (!dateString) return "now";
    
    // Handle different date formats that might come from server
    let date: Date;

    // Format: "23-05-2025-10:23:23" or "23-05-2025:10:23:23"
    if (
      dateString.includes("-") &&
      (dateString.match(/:/g) || []).length >= 2
    ) {
      const parts = dateString.replace(/-(\d{2}):/, ":$1:").split(/[-:]/);
      if (parts.length >= 6) {
        const [day, month, year, hours, minutes, seconds] = parts;
        date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds)
        );
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  } catch (error) {
    return "now";
  }
};

// FIXED: Helper function to convert new format to legacy format - handles null values
const convertPostToLegacy = (post: Post): LegacyPost => {
  // Handle null values from server
  const username = post.User?.Username || "Anonymous";
  const comment = post.Comment || "";
  const created = post.Created || formatCurrentDate();
  
  return {
    id: post.PostId.toString(),
    title: "", // Title is now part of Comment, you might want to extract first line
    body: comment,
    content: comment, // SocialPost expects 'content'
    author: username, // SocialPost expects 'author'
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
    timestamp: formatTimestamp(created),
    imageUrl: post.ImageUrl,
    videoUrl: post.VideoUrl,
    image: post.ImageUrl, // SocialPost expects 'image'
    userId: post.User?.UserId?.toString() || "0",
    createdAt: created,
    updatedAt: created,
    likes: post.Upvotes || 0,
    comments: post.Replys?.length || 0, // Use actual replies count
    shares: 0,
    isLiked: false,
  };
};

// FIXED: Helper function to convert reply to legacy format - handles null values
const convertReplyToLegacy = (reply: Reply): LegacyReply => {
  const username = reply.User?.Username || "Anonymous";
  const comment = reply.Comment || "";
  const created = reply.Created || formatCurrentDate();
  
  return {
    id: reply.PostId.toString(),
    content: comment,
    author: username,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
    timestamp: formatTimestamp(created),
    imageUrl: reply.ImageUrl,
    videoUrl: reply.VideoUrl,
    userId: reply.User?.UserId?.toString() || "0",
    createdAt: created,
    likes: reply.Upvotes || 0,
  };
};

// FIXED: Helper function to convert PostWithReplies to LegacyPostDetails - handles null values
const convertPostDetailsToLegacy = (
  postWithReplies: PostWithReplies
): LegacyPostDetails => {
  const post = convertPostToLegacy(postWithReplies as Post);
  const replies = (postWithReplies.Replys || []).map(convertReplyToLegacy);

  return {
    post: {
      ...post,
      comments: replies.length, // Update with actual count
    },
    replies,
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
  async (
    { postData, createPost: createPostWS, currentUser },
    { rejectWithValue }
  ) => {
    try {
      let imageBase64: string | undefined;
      let videoBase64: string | undefined;

      // Convert image to base64 if present
      if (postData.image) {
        // Validate image size (5MB limit)
        if (postData.image.size > 5 * 1024 * 1024) {
          throw new Error("Image size should be less than 5MB");
        }
        imageBase64 = await fileToBase64(postData.image);
      }

      // Convert video to base64 if present
      if (postData.video) {
        // Validate video size (50MB limit)
        if (postData.video.size > 50 * 1024 * 1024) {
          throw new Error("Video size should be less than 50MB");
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
          Verified: false,
        },
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
          EditableType: "POST",
        },
        Posts: [postObject],
      };

      console.log("Sending post payload:", JSON.stringify(payload, null, 2));

      // Send post creation message via WebSocket
      createPostWS(payload);

      return { pending: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create post";
      return rejectWithValue(errorMessage);
    }
  }
);

// Updated fetch thunks to handle new format
export const fetchPosts = createAsyncThunk<
  AsyncThunkReturn,
  { sendMessage: (payload: any) => void },
  { rejectValue: string }
>("posts/fetchPosts", async ({ sendMessage }, { rejectWithValue }) => {
  try {
    const payload = {
      EditableType: {
        EditableType: "GET_POSTS",
      },
      timestamp: Date.now(),
    };

    sendMessage(payload);
    return { pending: true };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch posts";
    return rejectWithValue(errorMessage);
  }
});

// FIXED: Updated thunk for fetching post details with sendRaw method
export const fetchPostDetails = createAsyncThunk<
  AsyncThunkReturn,
  {
    postId: number;
    sendRaw: (payload: any) => void; // Changed from sendMessage to sendRaw
  },
  { rejectValue: string }
>(
  "posts/fetchPostDetails",
  async ({ postId, sendRaw }, { rejectWithValue }) => {
    try {
      // Create the request payload matching the exact format you specified
      const payload = {
        GetType: {
          GetType: "POST"
        },
        PostsWithReplies: [
          {
            PostId: postId
          }
        ]
      };

      console.log(
        "🔍 Sending post details request:",
        JSON.stringify(payload, null, 2)
      );
      
      // Use sendRaw instead of sendMessage to send exact payload
      sendRaw(payload);
      return { pending: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch post details";
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
          EditableType: "GET_USER_POSTS",
        },
        userId,
        timestamp: Date.now(),
      };

      sendMessage(payload);
      return { pending: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user posts";
      return rejectWithValue(errorMessage);
    }
  }
);

// Updated type guard functions for better type safety
const isServerPostResponse = (
  payload: unknown
): payload is ServerPostResponse => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "ResultCode" in payload &&
    "Posts" in payload &&
    "ResultMessage" in payload
  );
};

// FIXED: Updated type guard to match exact server response format
const isServerPostDetailsResponse = (
  payload: unknown
): payload is ServerPostDetailsResponse => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "ResultCode" in payload &&
    "ResultMessage" in payload &&
    "postWithReplies" in payload && // Only check for the exact field name from server
    "ResultId" in payload &&
    "Getable" in payload
  );
};

const isPostResponse = (payload: unknown): payload is PostResponse => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "EditableType" in payload &&
    "Posts" in payload &&
    typeof (payload as any).EditableType === "object"
  );
};

const isLegacyPost = (payload: unknown): payload is LegacyPost => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "id" in payload &&
    "content" in payload &&
    "author" in payload
  );
};

const isLegacyPostArray = (payload: unknown): payload is LegacyPost[] => {
  return (
    Array.isArray(payload) && (payload.length === 0 || isLegacyPost(payload[0]))
  );
};

// Helper function to add posts without duplicates
const addPostsWithoutDuplicates = (
  existingPosts: LegacyPost[],
  newPosts: LegacyPost[],
  prepend: boolean = true
): LegacyPost[] => {
  const existingIds = new Set(existingPosts.map((post) => post.id));
  const uniqueNewPosts = newPosts.filter((post) => !existingIds.has(post.id));

  if (prepend) {
    return [...uniqueNewPosts, ...existingPosts];
  } else {
    return [...existingPosts, ...uniqueNewPosts];
  }
};

// Slice
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.postDetailsError = null;
    },
    resetPosts: (state) => {
      state.posts = [];
      state.userPosts = [];
      state.currentPostDetails = null;
      state.currentPostWithReplies = null;
      state.error = null;
      state.postDetailsError = null;
      state.isLoading = false;
      state.isLoadingPostDetails = false;
    },

    // Clear current post details
    clearPostDetails: (state) => {
      state.currentPostDetails = null;
      state.currentPostWithReplies = null;
      state.postDetailsError = null;
      state.isLoadingPostDetails = false;
    },

    // Handle post creation with proper duplicate prevention
    handlePostCreated: (
      state,
      action: PayloadAction<ServerPostResponse | PostResponse | LegacyPost>
    ) => {
      console.log("🔥 handlePostCreated called with payload:", action.payload);

      // Set loading to false when post is created
      state.isLoading = false;
      state.error = null;

      // Handle server response format (new)
      if (isServerPostResponse(action.payload)) {
        console.log("🔥 Processing server response format");
        const newPosts = action.payload.Posts.map(convertPostToLegacy);
        console.log("🔥 Converted posts:", newPosts);

        // Add posts without duplicates
        state.posts = addPostsWithoutDuplicates(state.posts, newPosts, true);
        state.userPosts = addPostsWithoutDuplicates(
          state.userPosts,
          newPosts,
          true
        );
      }
      // Handle old PostResponse format
      else if (isPostResponse(action.payload)) {
        console.log("🔥 Processing old PostResponse format");
        const newPosts = action.payload.Posts.map(convertPostToLegacy);
        state.posts = addPostsWithoutDuplicates(state.posts, newPosts, true);
        state.userPosts = addPostsWithoutDuplicates(
          state.userPosts,
          newPosts,
          true
        );
      }
      // Handle legacy format
      else if (isLegacyPost(action.payload)) {
        console.log("🔥 Processing legacy post format");
        state.posts = addPostsWithoutDuplicates(
          state.posts,
          [action.payload],
          true
        );
        state.userPosts = addPostsWithoutDuplicates(
          state.userPosts,
          [action.payload],
          true
        );
      }
    },

    handlePostCreationError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      console.error("❌ Post creation failed:", action.payload);
    },

    // Handle fetching all posts
    handlePostsFetched: (
      state,
      action: PayloadAction<ServerPostResponse | PostResponse | LegacyPost[]>
    ) => {
      state.isLoading = false;
      state.error = null;

      // Handle server response format (new)
      if (isServerPostResponse(action.payload)) {
        const newPosts = action.payload.Posts.map(convertPostToLegacy);
        state.posts = newPosts;
        console.log(
          "✅ Posts fetched (server format):",
          newPosts.length,
          "posts"
        );
      }
      // Handle old PostResponse format
      else if (isPostResponse(action.payload)) {
        const newPosts = action.payload.Posts.map(convertPostToLegacy);
        state.posts = newPosts;
        console.log("✅ Posts fetched (old format):", newPosts.length, "posts");
      }
      // Handle legacy format
      else if (isLegacyPostArray(action.payload)) {
        state.posts = action.payload;
        console.log(
          "✅ Posts fetched (legacy format):",
          action.payload.length,
          "posts"
        );
      }
    },

    // Handle user posts fetched
    handleUserPostsFetched: (
      state,
      action: PayloadAction<ServerPostResponse | PostResponse | LegacyPost[]>
    ) => {
      state.isLoading = false;
      state.error = null;

      // Handle server response format (new)
      if (isServerPostResponse(action.payload)) {
        const newPosts = action.payload.Posts.map(convertPostToLegacy);
        state.userPosts = newPosts;
        console.log(
          "✅ User posts fetched (server format):",
          newPosts.length,
          "posts"
        );
      }
      // Handle old PostResponse format
      else if (isPostResponse(action.payload)) {
        const newPosts = action.payload.Posts.map(convertPostToLegacy);
        state.userPosts = newPosts;
        console.log(
          "✅ User posts fetched (old format):",
          newPosts.length,
          "posts"
        );
      }
      // Handle legacy format
      else if (isLegacyPostArray(action.payload)) {
        state.userPosts = action.payload;
        console.log(
          "✅ User posts fetched (legacy format):",
          action.payload.length,
          "posts"
        );
      }
    },

    // Handle posts fetch error
    handlePostsError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      console.error("❌ Posts fetch failed:", action.payload);
    },

    // Handle new post received from broadcast
    handleNewPostReceived: (
      state,
      action: PayloadAction<Post | LegacyPost>
    ) => {
      let newPost: LegacyPost;

      // Convert to legacy format if needed
      if ("PostId" in action.payload) {
        newPost = convertPostToLegacy(action.payload as Post);
      } else {
        newPost = action.payload as LegacyPost;
      }

      // Add to posts without duplicates
      state.posts = addPostsWithoutDuplicates(state.posts, [newPost], true);
      console.log("📡 New post received and added:", newPost.id);
    },

    // Handle post updated
    handlePostUpdated: (state, action: PayloadAction<Post | LegacyPost>) => {
      let updatedPost: LegacyPost;

      // Convert to legacy format if needed
      if ("PostId" in action.payload) {
        updatedPost = convertPostToLegacy(action.payload as Post);
      } else {
        updatedPost = action.payload as LegacyPost;
      }

      // Update in posts array
      const postIndex = state.posts.findIndex(
        (post) => post.id === updatedPost.id
      );
      if (postIndex !== -1) {
        state.posts[postIndex] = updatedPost;
        console.log("🔄 Post updated in posts array:", updatedPost.id);
      }

      // Update in userPosts array
      const userPostIndex = state.userPosts.findIndex(
        (post) => post.id === updatedPost.id
      );
      if (userPostIndex !== -1) {
        state.userPosts[userPostIndex] = updatedPost;
        console.log("🔄 Post updated in user posts array:", updatedPost.id);
      }

      // Update in currentPostDetails if it's the same post
      if (
        state.currentPostDetails &&
        state.currentPostDetails.post.id === updatedPost.id
      ) {
        state.currentPostDetails.post = updatedPost;
        console.log("🔄 Post updated in current post details:", updatedPost.id);
      }

      // Update in currentPostWithReplies if it's the same post
      if (
        state.currentPostWithReplies &&
        state.currentPostWithReplies.post.id === updatedPost.id
      ) {
        state.currentPostWithReplies.post = updatedPost;
        console.log("🔄 Post updated in current post with replies:", updatedPost.id);
      }
    },

    // FIXED: Handle post details fetched - updated to match exact server response
    handlePostDetailsFetched: (
      state,
      action: PayloadAction<ServerPostDetailsResponse>
    ) => {
      console.log("🔍 handlePostDetailsFetched called with:", action.payload);

      state.isLoadingPostDetails = false;
      state.postDetailsError = null;

      if (isServerPostDetailsResponse(action.payload)) {
        // Get the first post from the postWithReplies array (exact server format)
        const postWithReplies = action.payload.postWithReplies?.[0];

        if (postWithReplies) {
          const legacyPostDetails = convertPostDetailsToLegacy(postWithReplies);
          state.currentPostDetails = legacyPostDetails;
          state.currentPostWithReplies = legacyPostDetails;

          console.log("✅ Post details fetched successfully:", {
            postId: postWithReplies.PostId,
            repliesCount: postWithReplies.Replys?.length || 0,
          });
        } else {
          console.error("❌ No post data found in server response");
          state.postDetailsError = "No post data found";
        }
      } else {
        console.error("❌ Invalid post details response format");
        state.postDetailsError = "Invalid response format";
      }
    },

    // Handle post details fetch error
    handlePostDetailsError: (state, action: PayloadAction<string>) => {
      state.isLoadingPostDetails = false;
      state.postDetailsError = action.payload;
      state.currentPostDetails = null;
      state.currentPostWithReplies = null;
      console.error("❌ Post details fetch failed:", action.payload);
    },
  },

  extraReducers: (builder) => {
    // Handle createPost async thunk
    builder
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        // Keep loading state - will be cleared by handlePostCreated
        console.log("📤 Post creation request sent successfully");
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create post";
        console.error("❌ Post creation request failed:", action.payload);
      });

    // Handle fetchPosts async thunk
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state) => {
        // Keep loading state - will be cleared by handlePostsFetched
        console.log("📤 Posts fetch request sent successfully");
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch posts";
        console.error("❌ Posts fetch request failed:", action.payload);
      });

    // Handle fetchPostDetails async thunk
    builder
      .addCase(fetchPostDetails.pending, (state) => {
        state.isLoadingPostDetails = true;
        state.postDetailsError = null;
      })
      .addCase(fetchPostDetails.fulfilled, (state) => {
        // Keep loading state - will be cleared by handlePostDetailsFetched
        console.log("📤 Post details fetch request sent successfully");
      })
      .addCase(fetchPostDetails.rejected, (state, action) => {
        state.isLoadingPostDetails = false;
        state.postDetailsError =
          action.payload || "Failed to fetch post details";
        console.error("❌ Post details fetch request failed:", action.payload);
      });

    // Handle fetchUserPosts async thunk
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state) => {
        // Keep loading state - will be cleared by handleUserPostsFetched
        console.log("📤 User posts fetch request sent successfully");
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch user posts";
        console.error("❌ User posts fetch request failed:", action.payload);
      });
  },
});

// Export actions
export const {
  clearError,
  resetPosts,
  clearPostDetails,
  handlePostCreated,
  handlePostCreationError,
  handlePostsFetched,
  handleUserPostsFetched,
  handlePostsError,
  handleNewPostReceived,
  handlePostUpdated,
  handlePostDetailsFetched,
  handlePostDetailsError,
} = postsSlice.actions;

// Export reducer
export default postsSlice.reducer;

// Selectors (completing the missing parts)
export const selectPosts = (state: { posts: PostsState }) => state.posts.posts;
export const selectUserPosts = (state: { posts: PostsState }) =>
  state.posts.userPosts;
export const selectCurrentPostDetails = (state: { posts: PostsState }) =>
  state.posts.currentPostDetails;
export const selectCurrentPostWithReplies = (state: { posts: PostsState }) =>
  state.posts.currentPostWithReplies;
export const selectIsLoading = (state: { posts: PostsState }) =>
  state.posts.isLoading;
export const selectIsLoadingPostDetails = (state: { posts: PostsState }) =>
  state.posts.isLoadingPostDetails;
export const selectError = (state: { posts: PostsState }) => state.posts.error;
export const selectPostDetailsError = (state: { posts: PostsState }) =>
  state.posts.postDetailsError;

// Additional utility selectors
export const selectPostById = (postId: string) => (state: { posts: PostsState }) =>
  state.posts.posts.find(post => post.id === postId);

export const selectUserPostById = (postId: string) => (state: { posts: PostsState }) =>
  state.posts.userPosts.find(post => post.id === postId);

export const selectPostsCount = (state: { posts: PostsState }) =>
  state.posts.posts.length;

export const selectUserPostsCount = (state: { posts: PostsState }) =>
  state.posts.userPosts.length;

export const selectHasError = (state: { posts: PostsState }) =>
  Boolean(state.posts.error || state.posts.postDetailsError);

export const selectIsAnyLoading = (state: { posts: PostsState }) =>
  state.posts.isLoading || state.posts.isLoadingPostDetails;