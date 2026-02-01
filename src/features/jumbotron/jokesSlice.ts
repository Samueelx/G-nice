import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import instance from '@/api/axiosConfig';

// Types
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

interface Joke {
  id: string;
  joke: string;
  sponsor: {
    name: string;
  };
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

// Initial state
const initialState: JokeState = {
  currentJoke: null,
  jokeHistory: [],
  loading: false,
  error: null
};

// Async thunks
export const fetchJokeOfTheDay = createAsyncThunk<Joke, void, { rejectValue: string }>(
  'jokes/fetchJokeOfTheDay',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get(`/Joke`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch joke of the day');
      }
      return rejectWithValue('Failed to fetch joke of the day');
    }
  }
);

export const fetchJokeComments = createAsyncThunk<{ jokeId: string; comments: Comment[] }, string, { rejectValue: string }>(
  'jokes/fetchJokeComments',
  async (jokeId: string, { rejectWithValue }) => {
    try {
      const response = await instance.get(`/jokes/${jokeId}/comments`);
      return { jokeId, comments: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch joke comments');
      }
      return rejectWithValue('Failed to fetch joke comments');
    }
  }
);

export const addJokeComment = createAsyncThunk<{ jokeId: string; comment: Comment }, { jokeId: string; content: string; user: any }, { rejectValue: string }>(
  'jokes/addJokeComment',
  async ({ jokeId, content, user }, { rejectWithValue }) => {
    try {
      const commentData = {
        userId: user.id,
        userName: user.name,
        avatar: user.avatar,
        content,
      };
      
      const response = await instance.post(`/jokes/${jokeId}/comments`, commentData);
      return { jokeId, comment: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
      }
      return rejectWithValue('Failed to add comment');
    }
  }
);

export const likeJoke = createAsyncThunk<Joke, string, { rejectValue: string }>(
  'jokes/likeJoke',
  async (jokeId: string, { rejectWithValue }) => {
    try {
      const response = await instance.post(`/jokes/${jokeId}/like`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to like joke');
      }
      return rejectWithValue('Failed to like joke');
    }
  }
);

export const likeComment = createAsyncThunk<{ jokeId: string; commentId: string; data: any }, { jokeId: string; commentId: string }, { rejectValue: string }>(
  'jokes/likeComment',
  async ({ jokeId, commentId }, { rejectWithValue }) => {
    try {
      const response = await instance.post(`/comments/${commentId}/like`);
      return { jokeId, commentId, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to like comment');
      }
      return rejectWithValue('Failed to like comment');
    }
  }
);

// Slice
const jokeSlice = createSlice({
  name: 'jokes',
  initialState,
  reducers: {
    setCurrentJoke: (state, action: PayloadAction<Joke>) => {
      state.currentJoke = action.payload;
    },
    addLocalComment: (state, action: PayloadAction<{ comment: Comment }>) => {
      if (state.currentJoke) {
        state.currentJoke.comments.unshift(action.payload.comment);
      }
    },
    likeLocalComment: (state, action: PayloadAction<{ commentId: string }>) => {
      if (state.currentJoke) {
        const comment = state.currentJoke.comments.find(c => c.commentId === action.payload.commentId);
        if (comment) {
          comment.likes += 1;
        }
      }
    },
    likeLocalJoke: (state) => {
      if (state.currentJoke) {
        state.currentJoke.likes += 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJokeOfTheDay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJokeOfTheDay.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJoke = action.payload;
        if (!state.jokeHistory.some(joke => joke.id === action.payload.id)) {
          state.jokeHistory.push(action.payload);
        }
      })
      .addCase(fetchJokeOfTheDay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
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
        
        const jokeInHistory = state.jokeHistory.find(joke => joke.id === jokeId);
        if (jokeInHistory) {
          jokeInHistory.comments = comments;
        }
      })
      .addCase(fetchJokeComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addJokeComment.fulfilled, (state, action) => {
        const { jokeId, comment } = action.payload;
        
        if (state.currentJoke && state.currentJoke.id === jokeId) {
          state.currentJoke.comments.unshift(comment);
        }
        
        const jokeInHistory = state.jokeHistory.find(joke => joke.id === jokeId);
        if (jokeInHistory) {
          jokeInHistory.comments.unshift(comment);
        }
      })
      .addCase(likeJoke.fulfilled, (state, action) => {
        const updatedJoke = action.payload;
        
        if (state.currentJoke && state.currentJoke.id === updatedJoke.id) {
          state.currentJoke.likes = updatedJoke.likes;
        }
        
        const jokeInHistory = state.jokeHistory.find(joke => joke.id === updatedJoke.id);
        if (jokeInHistory) {
          jokeInHistory.likes = updatedJoke.likes;
        }
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        const { jokeId, commentId } = action.payload;
        
        if (state.currentJoke && state.currentJoke.id === jokeId) {
          const comment = state.currentJoke.comments.find(c => c.commentId === commentId);
          if (comment) {
            comment.likes += 1;
          }
        }
        
        const jokeInHistory = state.jokeHistory.find(joke => joke.id === jokeId);
        if (jokeInHistory) {
          const comment = jokeInHistory.comments.find(c => c.commentId === commentId);
          if (comment) {
            comment.likes += 1;
          }
        }
      });
  }
});

export const { setCurrentJoke, addLocalComment, likeLocalComment, likeLocalJoke } = jokeSlice.actions;
export default jokeSlice.reducer;
export type { JokeState, Joke };