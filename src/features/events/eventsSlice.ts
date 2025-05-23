import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Event {
  id: string;
  title: string;
  location: string;
  time: string;
  date: {
    day: number;
    month: string;
  };
  price: number;
  imageUrl: string;
  description?: string;
}

interface EventsState {
  items: Event[];
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  loading: false,
  error: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    fetchEvents: (state) => {
      state.loading = true;
      state.error = null;
    },
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    setEventsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    eventAdded: (state, action: PayloadAction<Event>) => {
      state.items.push(action.payload);
    },
    eventUpdated: (state, action: PayloadAction<Event>) => {
      const index = state.items.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

  },
});

export const { fetchEvents, setEvents, setEventsError } = eventsSlice.actions;
export default eventsSlice.reducer;
