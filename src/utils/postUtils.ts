// utils/postUtils.ts

export interface PostDetailsRequest {
  EditableType: {
    EditableType: string;
  };
  PostsWithReplys: Array<{
    PostId: number;
    Comment: string;
    Created: string;
    Upvotes: number;
    Downvotes: number;
    Cancel: boolean;
    User: {
      UserId: number;
      Username: string;
      Contacts: number;
      Cancel: boolean;
      Verified: boolean;
    };
    Replys: Array<{
      PostId: number;
      Comment: string;
      Created: string;
      Upvotes: number;
      Downvotes: number;
      Cancel: boolean;
      User: {
        UserId: number;
        Username: string;
        Contacts: number;
        Cancel: boolean;
        Verified: boolean;
      };
    }>;
  }>;
}

export interface Post {
  id?: string;
  PostId?: number;
  Comment?: string;
  content?: string;
  Created?: string;
  createdAt?: string;
  Upvotes?: number;
  upvotes?: number;
  Downvotes?: number;
  downvotes?: number;
  User?: {
    UserId: number;
    Username: string;
    Contacts: number;
    Cancel: boolean;
    Verified: boolean;
  };
  author?: string;
  Cancel?: boolean;
  Replys?: any[];
}

/**
 * Creates a WebSocket request to fetch a specific post with its replies
 * @param post - The post object to fetch details for
 * @returns The formatted request object for the WebSocket
 */
export const createPostDetailsRequest = (post: Post): PostDetailsRequest => {
  // Extract post ID - could be in different fields
  const postId = post.PostId || parseInt(post.id || '0');
  
  // Extract other fields with fallbacks
  const comment = post.Comment || post.content || '';
  const created = post.Created || post.createdAt || new Date().toISOString();
  const upvotes = post.Upvotes || post.upvotes || 0;
  const downvotes = post.Downvotes || post.downvotes || 0;
  
  // Extract user info
  const user = post.User || {
    UserId: 0,
    Username: post.author || 'Unknown',
    Contacts: 0,
    Cancel: false,
    Verified: false
  };

  const request: PostDetailsRequest = {
    EditableType: {
      EditableType: "POST"
    },
    PostsWithReplys: [
      {
        PostId: postId,
        Comment: comment,
        Created: created,
        Upvotes: upvotes,
        Downvotes: downvotes,
        Cancel: false,
        User: {
          UserId: user.UserId,
          Username: user.Username,
          Contacts: user.Contacts || 0,
          Cancel: user.Cancel || false,
          Verified: user.Verified || false
        },
        Replys: post.Replys || []
      }
    ]
  };

  return request;
};

/**
 * Sends a request to fetch post details with replies via WebSocket
 * @param post - The post to fetch details for
 * @param sendMessage - The WebSocket send function
 */
export const fetchPostDetails = (post: Post, sendMessage: (message: any) => void) => {
  const request = createPostDetailsRequest(post);
  
  console.log('🔍 Fetching post details for post:', post.PostId || post.id);
  console.log('📤 Sending post details request:', request);
  
  sendMessage(request);
};

/**
 * Utility to check if a post object has the minimum required fields
 * @param post - The post object to validate
 * @returns boolean indicating if the post is valid for fetching details
 */
export const isValidPostForDetails = (post: Post): boolean => {
  const hasId = !!(post.PostId || post.id);
  const hasContent = !!(post.Comment || post.content);
  
  return hasId && hasContent;
};

/**
 * Helper to format post data for display
 * @param post - Raw post data from server
 * @returns Formatted post object
 */
export const formatPostData = (post: any) => {
  return {
    id: post.PostId?.toString() || post.id,
    PostId: post.PostId,
    content: post.Comment || post.content,
    Comment: post.Comment,
    author: post.User?.Username || post.author,
    User: post.User,
    createdAt: post.Created || post.createdAt,
    Created: post.Created,
    upvotes: post.Upvotes || post.upvotes || 0,
    Upvotes: post.Upvotes,
    downvotes: post.Downvotes || post.downvotes || 0,
    Downvotes: post.Downvotes,
    replies: post.Replys || post.replies || [],
    Replys: post.Replys,
    verified: post.User?.Verified || false
  };
};