// utils/postUtils.ts
interface Post {
  PostId?: number;
  id?: string;
  Comment?: string;
  content?: string;
  Created?: string;
  createdAt?: string;
  Upvotes?: number;
  upvotes?: number;
  Downvotes?: number;
  downvotes?: number;
  User?: {
    Username?: string;
    UserId?: number;
    Verified?: boolean;
  };
  author?: string;
  Replys?: any[];
  replies?: any[];
}

/**
 * Validates if a post object has the necessary data to fetch details
 */
export const isValidPostForDetails = (post: any): boolean => {
  if (!post) return false;
  
  // Check if we have a valid post ID
  const hasValidId = post.PostId !== undefined || post.id !== undefined;
  
  // For debugging
  console.log('Validating post for details:', {
    post,
    hasValidId,
    PostId: post.PostId,
    id: post.id
  });
  
  return hasValidId;
};

/**
 * Fetches post details by sending a WebSocket message
 */
export const fetchPostDetails = (post: Post, sendMessage: (message: any) => void) => {
  if (!isValidPostForDetails(post)) {
    console.error('Invalid post data for fetching details:', post);
    return;
  }

  // Get the post ID (prioritize PostId over id)
  const postId = post.PostId ?? (post.id ? parseInt(post.id) : 0);
  
  // Create the request message based on your server's expected format
  const requestMessage = {
    EditableType: {
      EditableType: "POST"
    },
    PostsWithReplys: [{
      PostId: postId,
      Comment: post.Comment || post.content || "",
      Created: post.Created || post.createdAt || "",
      Upvotes: post.Upvotes || post.upvotes || 0,
      Downvotes: post.Downvotes || post.downvotes || 0,
      Cancel: false,
      User: {
        UserId: post.User?.UserId || 0,
        Username: post.User?.Username || post.author || "",
        Contacts: 0,
        Cancel: false,
        Verified: post.User?.Verified || false
      },
      Replys: [] // Empty array as we're requesting the full data
    }]
  };

  console.log('📤 Sending post details request:', requestMessage);
  sendMessage(requestMessage);
};

/**
 * Formats post data from server response to a consistent format
 */
export const formatPostData = (serverPost: any) => {
  if (!serverPost) return null;

  console.log('Formatting server post data:', serverPost);

  // Handle the case where serverPost might be an array (from PostsWithReplys)
  const post = Array.isArray(serverPost) ? serverPost[0] : serverPost;
  
  if (!post) return null;

  const formattedPost = {
    id: post.PostId?.toString() || post.id,
    PostId: post.PostId || (post.id ? parseInt(post.id) : undefined),
    content: post.Comment || post.content,
    Comment: post.Comment || post.content,
    createdAt: post.Created || post.createdAt,
    Created: post.Created || post.createdAt,
    upvotes: post.Upvotes || post.upvotes || 0,
    Upvotes: post.Upvotes || post.upvotes || 0,
    downvotes: post.Downvotes || post.downvotes || 0,
    Downvotes: post.Downvotes || post.downvotes || 0,
    author: post.User?.Username || post.author,
    User: {
      Username: post.User?.Username || post.author,
      UserId: post.User?.UserId || post.User?.userId || 0,
      Verified: post.User?.Verified || false,
      Contacts: post.User?.Contacts || 0
    },
    replies: post.Replys || post.replies || [],
    Replys: post.Replys || post.replies || []
  };

  console.log('✅ Formatted post data:', formattedPost);
  return formattedPost;
};

/**
 * Extracts post ID from various possible formats
 */
export const getPostId = (post: any): string | null => {
  if (!post) return null;
  
  if (post.PostId !== undefined) return post.PostId.toString();
  if (post.id !== undefined) return post.id.toString();
  
  return null;
};

/**
 * Creates a consistent user object from various formats
 */
export const formatUserData = (user: any) => {
  if (!user) return null;
  
  return {
    username: user.Username || user.username,
    userId: user.UserId || user.userId || user.id,
    verified: user.Verified || user.verified || false,
    contacts: user.Contacts || user.contacts || 0
  };
};

/**
 * Formats date strings consistently
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Handle the format "23-05-2025-10:23:23" (DD-MM-YYYY-HH:mm:ss)
    if (dateString.includes('-') && dateString.split('-').length >= 3) {
      const parts = dateString.split('-');
      if (parts.length === 4) {
        // Format: DD-MM-YYYY-HH:mm:ss
        const [day, month, year, time] = parts;
        const isoString = `${year}-${month}-${day}T${time}`;
        const date = new Date(isoString);
        
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
      }
    }
    
    // Try parsing as a standard date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // If all else fails, return the original string
    return dateString;
  } catch (error) {
    console.warn('Error formatting date:', dateString, error);
    return dateString;
  }
};