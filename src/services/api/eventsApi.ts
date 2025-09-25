// src/services/api/eventsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Backend types (matching your actual backend response)
export interface BackendEvent {
  eventId: number;
  title: string;
  venue: string; // Changed to camelCase
  timestamp: string;
  description?: string;
  createdAt?: string;
  postedBy?: {
    username: string;
    userId: number;
  };
  // Optional fields that might not be in backend
  price?: number;
  imageUrl?: string[];
  videoUrl?: string[];
  category?: string;
  updatedAt?: string;
}

export interface BackendEventsQueryParams {
  page?: number;
  limit?: number;
  category?: string[];
  Title?: string;
  sortBy?: "date" | "price" | "title";
  sortOrder?: "asc" | "desc";
}

// Frontend types (matching what EventsPage expects)
export interface Event {
  id: string; // EventsPage expects 'id'
  title: string; // EventsPage expects 'title'
  location: string; // EventsPage expects 'location'
  time: string; // EventsPage expects 'time'
  date: { // EventsPage expects parsed date object
    day: string;
    month: string;
  };
  price: number;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl: string; // EventsPage expects single string, not array
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

export interface EventsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: "date" | "price" | "title";
  sortOrder?: "asc" | "desc";
}

// Helper function to parse timestamp and extract time/date
const parseTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    const day = date.getDate().toString();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    
    return { time, date: { day, month } };
  } catch (error) {
    // Fallback if timestamp parsing fails
    return {
      time: 'TBD',
      date: { day: '1', month: 'Jan' }
    };
  }
};

// Transformation functions
const transformBackendEventToFrontend = (backendEvent: BackendEvent): Event => {
  const { time, date } = parseTimestamp(backendEvent.timestamp);
  
  return {
    id: backendEvent.eventId.toString(), // Convert to string and use 'id'
    title: backendEvent.title, // Keep title
    location: backendEvent.venue, // Map venue to location (now camelCase)
    time, // Parsed time from timestamp
    date, // Parsed date object with day/month
    price: backendEvent.price || 0, // Default to 0 if not provided
    description: backendEvent.description,
    category: backendEvent.category,
    createdAt: backendEvent.createdAt,
    updatedAt: backendEvent.updatedAt,
    imageUrl: backendEvent.imageUrl?.[0] || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2000&auto=format&fit=crop',
  };
};

const transformFrontendParamsToBackend = (frontendParams: EventsQueryParams): BackendEventsQueryParams => {
  return {
    page: frontendParams.page,
    limit: frontendParams.limit,
    category: frontendParams.category ? [frontendParams.category] : undefined,
    Title: frontendParams.search,
    sortBy: frontendParams.sortBy,
    sortOrder: frontendParams.sortOrder,
  };
};

export const eventsApi = createApi({
  reducerPath: "eventsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.API_BASE_URL || "http://localhost:8080/Memefest-SNAPSHOT-01/resources",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("content-type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Event"],
  endpoints: (builder) => ({
    // Get all events with optional filtering
    getEvents: builder.query<EventsResponse, EventsQueryParams | void>({
      query: (params: EventsQueryParams = {}) => {
        const backendParams = transformFrontendParamsToBackend(params);
        const searchParams = new URLSearchParams();
        
        if (backendParams.page) searchParams.append("page", backendParams.page.toString());
        if (backendParams.limit) searchParams.append("limit", backendParams.limit.toString());
        if (backendParams.category) {
          backendParams.category.forEach(cat => searchParams.append("category", cat));
        }
        if (backendParams.Title) searchParams.append("Title", backendParams.Title);
        if (backendParams.sortBy) searchParams.append("sortBy", backendParams.sortBy);
        if (backendParams.sortOrder) searchParams.append("sortOrder", backendParams.sortOrder);
        
        return `/Event?${searchParams.toString()}`;
      },
      transformResponse: (response: BackendEvent[] | { events: BackendEvent[]; total: number; page: number; limit: number }): EventsResponse => {
        if (Array.isArray(response)) {
          return {
            events: response.map(transformBackendEventToFrontend),
            total: response.length,
            page: 1,
            limit: response.length,
          };
        } else {
          return {
            events: response.events.map(transformBackendEventToFrontend),
            total: response.total,
            page: response.page,
            limit: response.limit,
          };
        }
      },
      providesTags: ["Event"],
    }),

    // Get a single event by ID
    getEventById: builder.query<Event, string>({
      query: (id) => `/Event/${id}`, // Updated to match your backend pattern
      transformResponse: (response: BackendEvent): Event => transformBackendEventToFrontend(response),
      providesTags: (_result, _error, id) => [{ type: "Event", id }],
    }),

    // Get featured/top picks events
    getFeaturedEvents: builder.query<Event[], void>({
      query: () => "/Event/featured", // Updated to match your backend pattern
      transformResponse: (response: BackendEvent[]): Event[] => response.map(transformBackendEventToFrontend),
      providesTags: ["Event"],
    }),

    // Get events by category
    getEventsByCategory: builder.query<
      EventsResponse,
      { category: string; limit?: number }
    >({
      query: ({ category, limit = 10 }) =>
        `/Event/category/${category}?limit=${limit}`, // Updated to match your backend pattern
      transformResponse: (response: BackendEvent[] | { events: BackendEvent[]; total: number; page: number; limit: number }): EventsResponse => {
        if (Array.isArray(response)) {
          return {
            events: response.map(transformBackendEventToFrontend),
            total: response.length,
            page: 1,
            limit: response.length,
          };
        } else {
          return {
            events: response.events.map(transformBackendEventToFrontend),
            total: response.total,
            page: response.page,
            limit: response.limit,
          };
        }
      },
      providesTags: ["Event"],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useGetFeaturedEventsQuery,
  useGetEventsByCategoryQuery,
} = eventsApi;