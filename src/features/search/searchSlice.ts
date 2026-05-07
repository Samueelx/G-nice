import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosConfig';
import axios from 'axios';
import { SearchState, SearchCategory } from '@/types/search';

const initialState: SearchState = {
  query: '',
  activeCategory: 'all',
  isLoading: false,
  error: null,
  results: {
    users: [],
    posts: [],
    events: []
  }
};

export const searchContent = createAsyncThunk(
  'search/searchContent',
  async ({ query, category }: { query: string; category: SearchCategory }, { rejectWithValue }) => {
    try {
      // The backend expects ?q=...&type=...
      const response = await axiosInstance.get('/search', {
        params: { q: query, type: category }
      });
      
      const envelope = response.data?.data ?? response.data;
      
      // The backend paginates results under a `data` key (e.g. users.data[])
      return {
        users: envelope.users?.data ?? envelope.users?.items ?? [],
        posts: envelope.posts?.data ?? envelope.posts?.items ?? [],
        events: envelope.events?.data ?? envelope.events?.items ?? []
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.response?.data?.error || 'Search failed');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setCategory: (state, action: PayloadAction<SearchCategory>) => {
      state.activeCategory = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = initialState.results;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.isLoading = false;
        // Depending on the category searched, we might only receive some arrays.
        // We'll merge them or replace them entirely. The current UI approach replaces them.
        state.results = {
          users: action.payload.users || [],
          posts: action.payload.posts || [],
          events: action.payload.events || []
        };
      })
      .addCase(searchContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setQuery, setCategory, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;