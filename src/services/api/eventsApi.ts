import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/api/axiosBaseQuery";

// Backend types (matching the new standard REST API contract)
export interface BackendEvent {
  id: number;
  title: string;
  description?: string;
  location: string;
  date: string; // ISO 8601 string
  price?: number;
  category?: string;
  image_url?: string;
  author?: {
    id: number;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  created_at?: string;
}

export interface BackendEventsQueryParams {
  page?: number;
  page_size?: number;
  category?: string;
  search?: string;
  sort_by?: "date" | "price" | "title";
  sort_order?: "asc" | "desc";
  featured?: boolean;
}

// Frontend types (matching what EventsPage expects)
export interface Event {
  id: string; 
  title: string; 
  location: string; 
  time: string; 
  date: { 
    day: string;
    month: string;
  };
  price: number;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl: string; 
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
  featured?: boolean;
}

// Transformation functions
const transformBackendEventToFrontend = (backendEvent: BackendEvent): Event => {
  let time = 'TBD';
  let dateObj = { day: '1', month: 'Jan' };

  try {
    if (backendEvent.date) {
      const parsedDate = new Date(backendEvent.date);
      if (!isNaN(parsedDate.getTime())) {
        time = parsedDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        dateObj = {
          day: parsedDate.getDate().toString(),
          month: parsedDate.toLocaleDateString('en-US', { month: 'short' })
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse date:', backendEvent.date, e);
  }

  return {
    id: backendEvent.id.toString(), 
    title: backendEvent.title, 
    location: backendEvent.location, 
    time, 
    date: dateObj, 
    price: backendEvent.price || 0, 
    description: backendEvent.description,
    category: backendEvent.category,
    createdAt: backendEvent.created_at,
    imageUrl: backendEvent.image_url || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2000&auto=format&fit=crop',
  };
};

const transformFrontendParamsToBackend = (frontendParams: EventsQueryParams): BackendEventsQueryParams => {
  return {
    page: frontendParams.page,
    page_size: frontendParams.limit,
    category: frontendParams.category,
    search: frontendParams.search,
    sort_by: frontendParams.sortBy,
    sort_order: frontendParams.sortOrder,
    featured: frontendParams.featured,
  };
};

export const eventsApi = createApi({
  reducerPath: "eventsApi",
  baseQuery: axiosBaseQuery({
    baseUrl: "", // Base URL is handled by axiosInstance
  }),
  tagTypes: ["Event"],
  endpoints: (builder) => ({
    // Get all events with optional filtering
    getEvents: builder.query<EventsResponse, EventsQueryParams | void>({
      query: (params: EventsQueryParams = {}) => {
        const backendParams = transformFrontendParamsToBackend(params);
        const searchParams = new URLSearchParams();

        if (backendParams.page) searchParams.append("page", backendParams.page.toString());
        if (backendParams.page_size) searchParams.append("page_size", backendParams.page_size.toString());
        if (backendParams.category) searchParams.append("category", backendParams.category);
        if (backendParams.search) searchParams.append("search", backendParams.search);
        if (backendParams.sort_by) searchParams.append("sort_by", backendParams.sort_by);
        if (backendParams.sort_order) searchParams.append("sort_order", backendParams.sort_order);
        if (backendParams.featured) searchParams.append("featured", "true");

        return {
          url: `/events`,
          params: Object.fromEntries(searchParams)
        };
      },
      transformResponse: (response: any): EventsResponse => {
        const envelope = response.data ?? response;
        const items = envelope.items || envelope.events || envelope.data || [];
        return {
          events: items.map(transformBackendEventToFrontend),
          total: envelope.total || items.length,
          page: envelope.page || 1,
          limit: envelope.page_size || envelope.limit || items.length,
        };
      },
      providesTags: ["Event"],
    }),

    // Get a single event by ID
    getEventById: builder.query<Event, string>({
      query: (id) => ({ url: `/events/${id}` }), 
      transformResponse: (response: any): Event => {
        const envelope = response.data ?? response;
        return transformBackendEventToFrontend(envelope);
      },
      providesTags: (_result, _error, id) => [{ type: "Event", id }],
    }),

    // Get featured/top picks events
    getFeaturedEvents: builder.query<Event[], void>({
      query: () => ({ url: "/events", params: { featured: "true" } }),
      transformResponse: (response: any): Event[] => {
        const envelope = response.data ?? response;
        const items = envelope.items || envelope.events || envelope.data || [];
        return items.map(transformBackendEventToFrontend);
      },
      providesTags: ["Event"],
    }),

    // Get events by category
    getEventsByCategory: builder.query<
      EventsResponse,
      { category: string; limit?: number }
    >({
      query: ({ category, limit = 10 }) => ({ url: `/events`, params: { category, page_size: limit } }),
      transformResponse: (response: any): EventsResponse => {
        const envelope = response.data ?? response;
        const items = envelope.items || envelope.events || envelope.data || [];
        return {
          events: items.map(transformBackendEventToFrontend),
          total: envelope.total || items.length,
          page: envelope.page || 1,
          limit: envelope.page_size || envelope.limit || items.length,
        };
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