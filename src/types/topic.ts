// @/types/topic.ts

export type Topic = {
  name: string;
  handle: string;
  banner: string;
  avatar: string;
  description?: string;
  category?: string;
  creationDate: string;
  members: number;
  posts: number;
  isModerated: boolean;
};

export type Post = {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  author: {
    username: string;
    handle: string;
    avatar: string;
  };
};

export type TopicEvent = {
  id: string;
  title: string;
  date: string;
  attendees: number;
  location?: string;
};
