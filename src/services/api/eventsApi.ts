// src/services/api/eventsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

export const eventsApi = createApi({
  reducerPath: "eventsApi",
  baseQuery: fetchBaseQuery({
    // Fixed for Vite - use import.meta.env instead of process.env
    baseUrl: import.meta.env.API_BASE_URL || "http://localhost:3001/api",
    prepareHeaders: (headers, { getState }) => {
      // Add auth token if available
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
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", params.page.toString());
        if (params.limit) searchParams.append("limit", params.limit.toString());
        if (params.category) searchParams.append("category", params.category);
        if (params.search) searchParams.append("search", params.search);
        if (params.sortBy) searchParams.append("sortBy", params.sortBy);
        if (params.sortOrder)
          searchParams.append("sortOrder", params.sortOrder);

        return `/events?${searchParams.toString()}`;
      },
      providesTags: ["Event"],
    }),

    // Get a single event by ID
    getEventById: builder.query<Event, string>({
      query: (id) => `/events/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Event", id }],
    }),

    // Get featured/top picks events
    getFeaturedEvents: builder.query<Event[], void>({
      query: () => "/events/featured",
      providesTags: ["Event"],
    }),

    // Get events by category
    getEventsByCategory: builder.query<
      EventsResponse,
      { category: string; limit?: number }
    >({
      query: ({ category, limit = 10 }) =>
        `/events/category/${category}?limit=${limit}`,
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
