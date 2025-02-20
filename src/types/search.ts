// types/search.ts
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: "active" | "offline";
  lastSeen?: string;
}

export interface Topic {
  id: string;
  name: string;
  memberCount: number;
  isJoined: boolean;
  description?: string;
}

export interface Meme {
  id: string;
  title: string;
  category: string;
  likes: number;
  imageUrl?: string;
  author: {
    id: string;
    name: string;
  };
}

export type SearchCategory = "all" | "people" | "topics" | "memes";

export interface SearchState {
  query: string;
  activeCategory: SearchCategory;
  isLoading: boolean;
  error: string | null;
  results: {
    people: User[];
    topics: Topic[];
    memes: Meme[];
  };
}
