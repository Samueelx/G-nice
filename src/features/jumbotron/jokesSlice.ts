import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import instance from '@/api/axiosConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Comment {
  commentId: string;
  user: {
    userId: string;
    userName: string;
    avatar: string;
  };
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
}

export interface Sponsor {
  name: string;
  logo_url?: string | null;
  website_url?: string | null;
}

export interface Joke {
  id: string;
  joke: string;
  /** Null when there is no paying sponsor for this entry. */
  sponsor: Sponsor | null;
  date: string;
  likes: number;
  comments: Comment[];
}

interface JokeState {
  currentJoke: Joke | null;
  jokeHistory: Joke[];
  loading: boolean;
  error: string | null;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: JokeState = {
  currentJoke: null,
  jokeHistory: [],
  loading: false,
  error: null,
};

// ─── Async thunks ─────────────────────────────────────────────────────────────

/** Map a raw API joke object to the frontend Joke shape. */
function mapApiJoke(raw: any): Joke {
  // The API returns sponsor as flat fields on the joke object,
  // not as a nested { name, logo_url, website_url } object.
  const sponsor: Joke['sponsor'] = raw.sponsor_name
    ? {
        name: raw.sponsor_name,
        logo_url: raw.sponsor_logo_url ?? null,
        website_url: raw.sponsor_website_url ?? null,
      }
    : (raw.sponsor ?? null);          // fall back to nested shape if present

  return {
    id: String(raw.id),
    joke: raw.content ?? raw.joke ?? '',
    sponsor,
    date: raw.active_date ?? raw.date ?? new Date().toISOString(),
    likes: raw.likes_count ?? raw.likes ?? 0,
    // API returns comments_count (number), not a comments array.
    // The full list is fetched separately via fetchJokeComments.
    comments: Array.isArray(raw.comments) ? raw.comments : [],
  };
}

/** Fetch today's Joke of the Day */
export const fetchJokeOfTheDay = createAsyncThunk<Joke, void, { rejectValue: string }>(
  'jokes/fetchJokeOfTheDay',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get('/jokes/today');
      // Unwrap standard API envelope: { success, data: Joke }
      const raw = response.data?.data ?? response.data;
      // If the backend returns null (no joke today), reject gracefully
      if (!raw) return rejectWithValue('No joke scheduled for today');
      return mapApiJoke(raw);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch joke of the day'
        );
      }
      return rejectWithValue('Failed to fetch joke of the day');
    }
  }
);

/** Map a raw API comment object to the frontend Comment shape. */
function mapApiComment(raw: any): Comment {
  return {
    commentId: String(raw.id ?? raw.commentId),
    user: {
      userId: String(raw.author?.id ?? raw.user?.userId ?? ''),
      userName: raw.author?.display_name ?? raw.author?.username ?? raw.user?.userName ?? 'Unknown',
      avatar:
        raw.author?.avatar_url ??
        raw.user?.avatar ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          raw.author?.display_name ?? raw.author?.username ?? 'U'
        )}&background=9333ea&color=fff&bold=true`,
    },
    content: raw.content ?? '',
    likes: raw.likes_count ?? raw.likes ?? 0,
    replies: raw.replies_count ?? raw.replies ?? 0,
    timestamp: raw.created_at
      ? new Date(raw.created_at).toLocaleString()
      : raw.timestamp ?? '',
  };
}

/** Fetch comments for a specific joke (paginated list) */
export const fetchJokeComments = createAsyncThunk<
  { jokeId: string; comments: Comment[] },
  string,
  { rejectValue: string }
>(
  'jokes/fetchJokeComments',
  async (jokeId: string, { rejectWithValue }) => {
    try {
      const response = await instance.get(`/jokes/${jokeId}/comments`);
      // Unwrap standard paginated envelope: { success, data: { items: [...] } }
      const envelope = response.data;
      const rawComments: any[] =
        envelope.data?.items ??
        envelope.data?.data ??
        envelope.data ??
        envelope;
      const comments = Array.isArray(rawComments)
        ? rawComments.map(mapApiComment)
        : [];
      return { jokeId, comments };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to fetch joke comments'
        );
      }
      return rejectWithValue('Failed to fetch joke comments');
    }
  }
);

/** Post a new comment on a joke.
 *  The backend derives the author from the JWT — only content is needed in the body. */
export const addJokeComment = createAsyncThunk<
  { jokeId: string; comment: Comment },
  { jokeId: string; content: string },
  { rejectValue: string }
>(
  'jokes/addJokeComment',
  async ({ jokeId, content }, { rejectWithValue }) => {
    try {
      const response = await instance.post(`/jokes/${jokeId}/comments`, { content });
      const raw = response.data?.data ?? response.data;
      const comment: Comment = mapApiComment(raw);
      return { jokeId, comment };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to add comment'
        );
      }
      return rejectWithValue('Failed to add comment');
    }
  }
);

/** Toggle like on a joke.
 *  Backend returns { liked: boolean, likes_count: number } — NOT a full Joke object. */
export const likeJoke = createAsyncThunk<
  { jokeId: string; liked: boolean; likes_count: number },
  string,
  { rejectValue: string }
>(
  'jokes/likeJoke',
  async (jokeId: string, { rejectWithValue }) => {
    try {
      const response = await instance.post(`/jokes/${jokeId}/like`);
      const result = response.data?.data ?? response.data;
      return {
        jokeId,
        liked: result.liked as boolean,
        likes_count: result.likes_count as number,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to like joke'
        );
      }
      return rejectWithValue('Failed to like joke');
    }
  }
);

/** Toggle like on a joke comment. */
export const likeComment = createAsyncThunk<
  { jokeId: string; commentId: string; liked: boolean; likes_count: number },
  { jokeId: string; commentId: string },
  { rejectValue: string }
>(
  'jokes/likeComment',
  async ({ jokeId, commentId }, { rejectWithValue }) => {
    try {
      const response = await instance.post(`/joke-comments/${commentId}/like`);
      const result = response.data?.data ?? response.data;
      return {
        jokeId,
        commentId,
        liked: result.liked as boolean,
        likes_count: result.likes_count as number,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to like comment'
        );
      }
      return rejectWithValue('Failed to like comment');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const jokeSlice = createSlice({
  name: 'jokes',
  initialState,
  reducers: {
    setCurrentJoke: (state, action: PayloadAction<Joke>) => {
      state.currentJoke = action.payload;
    },

    /** Optimistically prepend a temp comment. */
    addLocalComment: (state, action: PayloadAction<{ comment: Comment }>) => {
      if (state.currentJoke) {
        state.currentJoke.comments.unshift(action.payload.comment);
      }
    },

    /** Remove a comment by ID — used to roll back a failed optimistic add. */
    removeLocalComment: (state, action: PayloadAction<{ commentId: string }>) => {
      if (state.currentJoke) {
        state.currentJoke.comments = state.currentJoke.comments.filter(
          (c) => c.commentId !== action.payload.commentId
        );
      }
    },

    /** Optimistically increment a comment's like count. */
    likeLocalComment: (state, action: PayloadAction<{ commentId: string }>) => {
      if (state.currentJoke) {
        const comment = state.currentJoke.comments.find(
          (c) => c.commentId === action.payload.commentId
        );
        if (comment) {
          comment.likes += 1;
        }
      }
    },

    /** Optimistically set the joke's like count (used for instant UI feedback). */
    setLocalJokeLikes: (state, action: PayloadAction<{ likes: number }>) => {
      if (state.currentJoke) {
        state.currentJoke.likes = action.payload.likes;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ── fetchJokeOfTheDay ──
      .addCase(fetchJokeOfTheDay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJokeOfTheDay.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJoke = action.payload;
        if (
          action.payload &&
          !state.jokeHistory.some((j) => j.id === action.payload.id)
        ) {
          state.jokeHistory.push(action.payload);
        }
      })
      .addCase(fetchJokeOfTheDay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── fetchJokeComments ──
      .addCase(fetchJokeComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJokeComments.fulfilled, (state, action) => {
        state.loading = false;
        const { jokeId, comments } = action.payload;

        if (state.currentJoke && state.currentJoke.id === jokeId) {
          state.currentJoke.comments = comments;
        }
        const jokeInHistory = state.jokeHistory.find((j) => j.id === jokeId);
        if (jokeInHistory) {
          jokeInHistory.comments = comments;
        }
      })
      .addCase(fetchJokeComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── addJokeComment ──
      .addCase(addJokeComment.fulfilled, (state, action) => {
        const { jokeId, comment } = action.payload;

        if (state.currentJoke && state.currentJoke.id === jokeId) {
          // Replace the matching temp comment if it exists, otherwise prepend
          const tempIdx = state.currentJoke.comments.findIndex((c) =>
            c.commentId.startsWith('temp-')
          );
          if (tempIdx !== -1) {
            state.currentJoke.comments[tempIdx] = comment;
          } else {
            state.currentJoke.comments.unshift(comment);
          }
        }
        const jokeInHistory = state.jokeHistory.find((j) => j.id === jokeId);
        if (jokeInHistory) {
          jokeInHistory.comments.unshift(comment);
        }
      })

      // ── likeJoke ──
      .addCase(likeJoke.fulfilled, (state, action) => {
        const { jokeId, likes_count } = action.payload;
        if (state.currentJoke && state.currentJoke.id === jokeId) {
          state.currentJoke.likes = likes_count;
        }
        const jokeInHistory = state.jokeHistory.find((j) => j.id === jokeId);
        if (jokeInHistory) {
          jokeInHistory.likes = likes_count;
        }
      })

      // ── likeComment ──
      .addCase(likeComment.fulfilled, (state, action) => {
        const { jokeId, commentId, likes_count } = action.payload;

        const updateComment = (joke: Joke) => {
          const comment = joke.comments.find((c) => c.commentId === commentId);
          if (comment) {
            comment.likes = likes_count;
          }
        };

        if (state.currentJoke && state.currentJoke.id === jokeId) {
          updateComment(state.currentJoke);
        }
        const jokeInHistory = state.jokeHistory.find((j) => j.id === jokeId);
        if (jokeInHistory) {
          updateComment(jokeInHistory);
        }
      });
  },
});

export const {
  setCurrentJoke,
  addLocalComment,
  removeLocalComment,
  likeLocalComment,
  setLocalJokeLikes,
} = jokeSlice.actions;

export default jokeSlice.reducer;
export type { JokeState };