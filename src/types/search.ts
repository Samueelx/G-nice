export interface SearchUser {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio?: string;
  followers_count?: number;
}

export interface SearchPost {
  id: number;
  content: string;
  media_url: string | null;
  media_type: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author: SearchUser;
}

export interface SearchEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  // Extrapolating typical event fields; can be adjusted once backend is ready
}

export type SearchCategory = "all" | "users" | "posts" | "events";

export interface SearchState {
  query: string;
  activeCategory: SearchCategory;
  isLoading: boolean;
  error: string | null;
  results: {
    users: SearchUser[];
    posts: SearchPost[];
    events: SearchEvent[];
  };
}
