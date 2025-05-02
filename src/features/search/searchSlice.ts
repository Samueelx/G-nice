import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
    },
    searchStarted: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    searchResultsReceived: (
      state,
      action: PayloadAction<{ people: any[]; topics: any[]; memes: any[] }>
    ) => {
      state.isLoading = false;
      state.results = action.payload;
    },
    searchFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    }
  }
});

export const {
  setQuery,
  setCategory,
  clearSearch,
  searchStarted,
  searchResultsReceived,
  searchFailed
} = searchSlice.actions;

export default searchSlice.reducer;
