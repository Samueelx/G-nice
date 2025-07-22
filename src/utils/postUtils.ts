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

interface PostDetailsRequest {
  GetType: {
    GetType: "POST";
  };
  PostsWithReplies: Array<{
    PostId: number;
  }>;
}

type SendMessageFunction = (message: PostDetailsRequest | any) => boolean;

/**
 * Validates if a post object has the necessary data to fetch details
 */
export const isValidPostForDetails = (post: any): boolean => {
  if (!post) {
    console.warn('Invalid post: post is null or undefined');
    return false;
  }
  
  // Check if we have a valid post ID
  const hasValidId = (
    (post.PostId !== undefined && post.PostId !== null && post.PostId > 0) ||
    (post.id !== undefined && post.id !== null && (
      (typeof post.id === 'string' && post.id.trim() !== '') ||
      (typeof post.id === 'number' && post.id > 0)
    ))
  );
  
  // For debugging
  console.log('Validating post for details:', {
    post,
    hasValidId,
    PostId: post.PostId,
    id: post.id,
    PostIdType: typeof post.PostId,
    idType: typeof post.id
  });
  
  return hasValidId;
};

/**
 * Extracts post ID from various possible formats and ensures it's a valid number
 */
export const getPostId = (post: any): number | null => {
  if (!post) {
    console.warn('Cannot get PostId: post is null or undefined');
    return null;
  }
  
  let postId: number | null = null;
  
  // Try PostId first (should be number)
  if (post.PostId !== undefined && post.PostId !== null) {
    if (typeof post.PostId === 'number' && post.PostId > 0) {
      postId = post.PostId;
    } else if (typeof post.PostId === 'string') {
      const parsed = parseInt(post.PostId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        postId = parsed;
      }
    }
  }
  
  // Fallback to id field
  if (postId === null && post.id !== undefined && post.id !== null) {
    if (typeof post.id === 'number' && post.id > 0) {
      postId = post.id;
    } else if (typeof post.id === 'string') {
      const parsed = parseInt(post.id, 10);
      if (!isNaN(parsed) && parsed > 0) {
        postId = parsed;
      }
    }
  }
  
  console.log('Extracted PostId:', {
    input: post,
    extractedId: postId,
    originalPostId: post.PostId,
    originalId: post.id
  });
  
  return postId;
};

/**
 * Fetches post details by sending a WebSocket message
 */
export const fetchPostDetails = (post: any, sendMessage: SendMessageFunction): boolean => {
  console.log('🔍 Fetching post details for:', post);
  
  if (!isValidPostForDetails(post)) {
    console.error('❌ Invalid post provided for details fetch:', post);
    return false;
  }
  
  const postId = getPostId(post);
  
  if (postId === null || postId <= 0) {
    console.error('❌ No valid PostId found in post:', post);
    return false;
  }

  // Construct the message in the format the server expects
  const message: PostDetailsRequest = {
    "GetType": {
      "GetType": "POST"
    },
    "PostsWithReplies": [
      {
        "PostId": postId
      }
    ]
  };

  console.log('📤 Sending post details request:', message);
  console.log('📤 Request will be sent as JSON:', JSON.stringify(message));
  
  try {
    const success = sendMessage(message);
    
    if (success) {
      console.log('✅ Post details request sent successfully');
    } else {
      console.error('❌ Failed to send post details request');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error sending post details request:', error);
    return false;
  }
};

/**
 * Formats post data from server response to a consistent format
 */
export const formatPostData = (serverPost: any) => {
  if (!serverPost) {
    console.warn('Cannot format post data: serverPost is null or undefined');
    return null;
  }

  console.log('📝 Formatting server post data:', serverPost);

  // Handle the case where serverPost might be an array (from PostsWithReplies)
  const post = Array.isArray(serverPost) ? serverPost[0] : serverPost;
  
  if (!post) {
    console.warn('Cannot format post data: extracted post is null or undefined');
    return null;
  }

  const formattedPost = {
    // ID fields - ensure consistency
    id: post.PostId?.toString() || post.id?.toString() || '',
    PostId: post.PostId || (post.id ? parseInt(post.id.toString(), 10) : 0),
    
    // Content fields
    content: post.Comment || post.content || '',
    Comment: post.Comment || post.content || '',
    
    // Date fields
    createdAt: post.Created || post.createdAt || '',
    Created: post.Created || post.createdAt || '',
    
    // Vote fields
    upvotes: post.Upvotes || post.upvotes || 0,
    Upvotes: post.Upvotes || post.upvotes || 0,
    downvotes: post.Downvotes || post.downvotes || 0,
    Downvotes: post.Downvotes || post.downvotes || 0,
    
    // User fields
    author: post.User?.Username || post.author || '',
    User: {
      Username: post.User?.Username || post.author || '',
      UserId: post.User?.UserId || post.User?.userId || 0,
      Verified: post.User?.Verified || false,
      Contacts: post.User?.Contacts || 0,
      Cancel: post.User?.Cancel || false
    },
    
    // Reply fields
    replies: post.Replys || post.replies || [],
    Replys: post.Replys || post.replies || [],
    
    // Additional fields that might be present
    Categories: post.Categories || null,
    CanceledCategories: post.CanceledCategories || null,
    Cancel: post.Cancel || false
  };

  console.log('✅ Formatted post data:', formattedPost);
  return formattedPost;
};

/**
 * Creates a consistent user object from various formats
 */
export const formatUserData = (user: any) => {
  if (!user) {
    console.warn('Cannot format user data: user is null or undefined');
    return null;
  }
  
  const formattedUser = {
    username: user.Username || user.username || '',
    userId: user.UserId || user.userId || user.id || 0,
    verified: user.Verified || user.verified || false,
    contacts: user.Contacts || user.contacts || 0,
    cancel: user.Cancel || user.cancel || false
  };

  console.log('👤 Formatted user data:', formattedUser);
  return formattedUser;
};

/**
 * Formats date strings consistently
 */
export const formatDate = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    console.warn('Invalid date string provided:', dateString);
    return '';
  }
  
  try {
    // Handle the format "DD-MM-YYYY:HH:mm:ss" (your server format)
    if (dateString.includes('-') && dateString.includes(':')) {
      const parts = dateString.split(':');
      if (parts.length >= 3) {
        // Split the date and time parts
        const dateTimeParts = dateString.split(':');
        const datePart = dateTimeParts[0]; // "DD-MM-YYYY"
        const timePart = dateTimeParts.slice(1).join(':'); // "HH:mm:ss"
        
        // Parse date part "DD-MM-YYYY"
        const dateComponents = datePart.split('-');
        if (dateComponents.length === 3) {
          const [day, month, year] = dateComponents;
          
          // Construct ISO format: YYYY-MM-DDTHH:mm:ss
          const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`;
          
          console.log('📅 Parsing date:', {
            original: dateString,
            isoString: isoString
          });
          
          const date = new Date(isoString);
          
          if (!isNaN(date.getTime())) {
            const formatted = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            console.log('✅ Formatted date:', formatted);
            return formatted;
          }
        }
      }
    }
    
    // Try parsing as a standard ISO date string
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const formatted = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      console.log('✅ Formatted standard date:', formatted);
      return formatted;
    }
    
    // If all parsing fails, return the original string
    console.warn('Could not parse date, returning original:', dateString);
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return dateString;
  }
};

/**
 * Validates if a server response contains valid post details
 */
export const isValidPostDetailsResponse = (response: any): boolean => {
  if (!response) {
    console.warn('Invalid response: response is null or undefined');
    return false;
  }
  
  const hasValidStructure = (
    response.ResultCode !== undefined &&
    (response.postWithReplies || response.PostWithReplies || response.Posts)
  );
  
  console.log('Validating post details response:', {
    response,
    hasValidStructure,
    ResultCode: response.ResultCode,
    hasPostWithReplies: !!response.postWithReplies,
    hasPostWithRepliesCapital: !!response.PostWithReplies,
    hasPosts: !!response.Posts
  });
  
  return hasValidStructure;
};

/**
 * Extracts post with replies from server response
 */
export const extractPostWithReplies = (response: any): any | null => {
  if (!isValidPostDetailsResponse(response)) {
    console.warn('Cannot extract post with replies: invalid response');
    return null;
  }
  
  // Try different possible response formats
  let postWithReplies = null;
  
  if (response.postWithReplies && Array.isArray(response.postWithReplies)) {
    postWithReplies = response.postWithReplies[0];
    console.log('📖 Extracted from postWithReplies (lowercase)');
  } else if (response.PostWithReplies && Array.isArray(response.PostWithReplies)) {
    postWithReplies = response.PostWithReplies[0];
    console.log('📖 Extracted from PostWithReplies (uppercase)');
  } else if (response.Posts && Array.isArray(response.Posts)) {
    // Check if the first post has replies (indicating it's a post details response)
    const firstPost = response.Posts[0];
    if (firstPost && ('Replys' in firstPost || 'replies' in firstPost)) {
      postWithReplies = firstPost;
      console.log('📖 Extracted from Posts array (with replies)');
    }
  }
  
  console.log('📖 Extracted post with replies:', postWithReplies);
  return postWithReplies;
};