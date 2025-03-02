export const dummyJoke = {
    id: "1",
    setup: "Why don't scientists trust atoms?",
    punchline: "Because they make up everything!",
    author: "Anonymous",
    likes: 42,
    comments: [
      {
        id: "comment-1",
        authorId: "user-1",
        authorName: "John Doe",
        authorAvatar: "/avatars/user1.jpg",
        content: "This joke is hilarious!",
        likes: 10,
        replies: 2,
        timestamp: "2 hours ago",
      },
      {
        id: "comment-2",
        authorId: "user-2",
        authorName: "Jane Smith",
        authorAvatar: "/avatars/user2.jpg",
        content: "I don't get it...",
        likes: 2,
        replies: 0,
        timestamp: "1 hour ago",
      },
    ],
  };