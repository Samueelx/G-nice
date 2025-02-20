import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { SearchState, SearchCategory } from '@/types/search';

const initialState: SearchState = {
  query: '',
  activeCategory: 'all',
  isLoading: false,
  error: null,
  results: {
    people: [],
    topics: [],
    memes: []
  }
};

export const searchContent = createAsyncThunk(
  'search/searchContent',
  async ({ query, category }: { query: string; category: SearchCategory }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/search`, {
        params: { query, category }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'Search failed');
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
        state.results = action.payload;
      })
      .addCase(searchContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setQuery, setCategory, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;