import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
}

interface Joke {
  id: string;
  setup?: string;
  punchline: string;
  author?: string;
  date?: string;
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

// API base URL
const API_URL ='https://api.example.com';

// Async thunks
export const fetchJokeOfTheDay = createAsyncThunk(
  'jokes/fetchJokeOfTheDay',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/jokes/daily`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch joke of the day');
    }
  }
);

export const fetchJokeComments = createAsyncThunk(
  'jokes/fetchJokeComments',
  async (jokeId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/jokes/${jokeId}/comments`);
      return { jokeId, comments: response.data };
    } catch (error) {
      return rejectWithValue('Failed to fetch joke comments');
    }
  }
);

export const addJokeComment = createAsyncThunk(
  'jokes/addJokeComment',
  async ({ jokeId, content, user }: { jokeId: string, content: string, user: any }, { rejectWithValue }) => {
    try {
      const commentData = {
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        content,
      };
      
      const response = await axios.post(`${API_URL}/jokes/${jokeId}/comments`, commentData);
      return { jokeId, comment: response.data };
    } catch (error) {
      return rejectWithValue('Failed to add comment');
    }
  }
);

export const likeJoke = createAsyncThunk(
  'jokes/likeJoke',
  async (jokeId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/jokes/${jokeId}/like`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to like joke');
    }
  }
);

export const likeComment = createAsyncThunk(
  'jokes/likeComment',
  async ({ jokeId, commentId }: { jokeId: string, commentId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/comments/${commentId}/like`);
      return { jokeId, commentId, data: response.data };
    } catch (error) {
      return rejectWithValue('Failed to like comment');
    }
  }
);

// Slice
const jokeSlice = createSlice({
  name: 'jokes',
  initialState,
  reducers: {
    // For local state updates without API calls
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
        const comment = state.currentJoke.comments.find(c => c.id === action.payload.commentId);
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
      // Fetch Joke of the Day
      .addCase(fetchJokeOfTheDay.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJokeOfTheDay.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJoke = action.payload;
        // Add to history if not already there
        if (!state.jokeHistory.some(joke => joke.id === action.payload.id)) {
          state.jokeHistory.push(action.payload);
        }
      })
      .addCase(fetchJokeOfTheDay.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Joke Comments
      .addCase(fetchJokeComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJokeComments.fulfilled, (state, action) => {
        state.loading = false;
        const { jokeId, comments } = action.payload;
        
        // Update current joke if it matches
        if (state.currentJoke && state.currentJoke.id === jokeId) {
          state.currentJoke.comments = comments;
        }
        
        // Update joke in history if it exists
        const jokeInHistory = state.jokeHistory.find(joke => joke.id === jokeId);
        if (jokeInHistory) {
          jokeInHistory.comments = comments;
        }
      })
      .addCase(fetchJokeComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add Joke Comment
      .addCase(addJokeComment.fulfilled, (state, action) => {
        const { jokeId, comment } = action.payload;
        
        // Update current joke if it matches
        if (state.currentJoke && state.currentJoke.id === jokeId) {
          state.currentJoke.comments.unshift(comment);
        }
        
        // Update joke in history if it exists
        const jokeInHistory = state.jokeHistory.find(joke => joke.id === jokeId);
        if (jokeInHistory) {
          jokeInHistory.comments.unshift(comment);
        }
      })
      
      // Like Joke
      .addCase(likeJoke.fulfilled, (state, action) => {
        const updatedJoke = action.payload;
        
        // Update current joke if it matches
        if (state.currentJoke && state.currentJoke.id === updatedJoke.id) {
          state.currentJoke.likes = updatedJoke.likes;
        }
        
        // Update joke in history if it exists
        const jokeInHistory = state.jokeHistory.find(joke => joke.id === updatedJoke.id);
        if (jokeInHistory) {
          jokeInHistory.likes = updatedJoke.likes;
        }
      })
      
      // Like Comment
      .addCase(likeComment.fulfilled, (state, action) => {
        const { jokeId, commentId } = action.payload;
        
        // Update in current joke if it matches
        if (state.currentJoke && state.currentJoke.id === jokeId) {
          const comment = state.currentJoke.comments.find(c => c.id === commentId);
          if (comment) {
            comment.likes += 1;
          }
        }
        
        // Update in joke history if it exists
        const jokeInHistory = state.jokeHistory.find(joke => joke.id === jokeId);
        if (jokeInHistory) {
          const comment = jokeInHistory.comments.find(c => c.id === commentId);
          if (comment) {
            comment.likes += 1;
          }
        }
      });
  }
});

// Export actions and reducer
export const { setCurrentJoke, addLocalComment, likeLocalComment, likeLocalJoke } = jokeSlice.actions;
export default jokeSlice.reducer;