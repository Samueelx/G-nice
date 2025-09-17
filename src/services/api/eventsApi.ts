// src/services/api/eventsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Backend types (matching your backend exactly)
export interface BackendEvent {
  EventId: string;
  Title: string;
  Venue: string;
  timestamp: string;
  price: number;
  imageUrl?: string[];
  videoUrl?: string[];
  description?: string;
  category?: string;
  createdAt?: string;
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

// Frontend types (your current UI-friendly structure)
export interface Event {
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
  category?: string;
  createdAt?: string;
  updatedAt?: string;
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

// Transformation functions
const transformBackendEventToFrontend = (backendEvent: BackendEvent): Event => {
  // Parse timestamp to create date object
  const date = new Date(backendEvent.timestamp);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const time = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return {
    id: backendEvent.EventId,
    title: backendEvent.Title,
    location: backendEvent.Venue,
    time: time,
    date: { day, month },
    price: backendEvent.price,
    imageUrl: backendEvent.imageUrl?.[0] || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2000&auto=format&fit=crop', // Use first image or fallback
    description: backendEvent.description,
    category: backendEvent.category,
    createdAt: backendEvent.createdAt,
    updatedAt: backendEvent.updatedAt,
  };
};

const transformFrontendParamsToBackend = (frontendParams: EventsQueryParams): BackendEventsQueryParams => {
  return {
    page: frontendParams.page,
    limit: frontendParams.limit,
    category: frontendParams.category ? [frontendParams.category] : undefined, // Convert string to array
    Title: frontendParams.search, // Map search to Title
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
          // Handle category array - append each category separately or as comma-separated
          backendParams.category.forEach(cat => searchParams.append("category", cat));
        }
        if (backendParams.Title) searchParams.append("Title", backendParams.Title);
        if (backendParams.sortBy) searchParams.append("sortBy", backendParams.sortBy);
        if (backendParams.sortOrder) searchParams.append("sortOrder", backendParams.sortOrder);
        
        return `/Event?${searchParams.toString()}`;
      },
      transformResponse: (response: { events: BackendEvent[]; total: number; page: number; limit: number }): EventsResponse => ({
        events: response.events.map(transformBackendEventToFrontend),
        total: response.total,
        page: response.page,
        limit: response.limit,
      }),
      providesTags: ["Event"],
    }),

    // Get a single event by ID
    getEventById: builder.query<Event, string>({
      query: (id) => `/events/${id}`,
      transformResponse: (response: BackendEvent): Event => transformBackendEventToFrontend(response),
      providesTags: (_result, _error, id) => [{ type: "Event", id }],
    }),

    // Get featured/top picks events
    getFeaturedEvents: builder.query<Event[], void>({
      query: () => "/events/featured",
      transformResponse: (response: BackendEvent[]): Event[] => response.map(transformBackendEventToFrontend),
      providesTags: ["Event"],
    }),

    // Get events by category
    getEventsByCategory: builder.query<
      EventsResponse,
      { category: string; limit?: number }
    >({
      query: ({ category, limit = 10 }) =>
        `/events/category/${category}?limit=${limit}`,
      transformResponse: (response: { events: BackendEvent[]; total: number; page: number; limit: number }): EventsResponse => ({
        events: response.events.map(transformBackendEventToFrontend),
        total: response.total,
        page: response.page,
        limit: response.limit,
      }),
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