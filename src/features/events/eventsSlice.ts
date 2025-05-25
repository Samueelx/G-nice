import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Ticket {
  section: string;
  phase: string;
  amount: number;
  status: string;
  purchaseUrl: string;
}

interface BaseEvent {
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

// Extended event interface for detailed view
interface DetailedEvent extends BaseEvent {
  performers?: string[];
  date: {
    day: number;
    month: string;
    weekday?: string;
    startTime?: string;
    endTime?: string;
  };
  tickets?: Ticket[];
  about?: string;
  organizer?: string;
}

// Union type to handle both basic and detailed events
type Event = BaseEvent | DetailedEvent;

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
    // New action to update event with detailed information
    setEventDetails: (state, action: PayloadAction<DetailedEvent>) => {
      const index = state.items.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        // Merge the detailed information with existing event
        state.items[index] = { ...state.items[index], ...action.payload };
      } else {
        // Add as new event if not found
        state.items.push(action.payload);
      }
    },
  },
});

export const { 
  fetchEvents, 
  setEvents, 
  setEventsError, 
  eventAdded, 
  eventUpdated, 
  setEventDetails 
} = eventsSlice.actions;

export default eventsSlice.reducer;

// Export types for use in components
export type { Event, BaseEvent, DetailedEvent, Ticket };