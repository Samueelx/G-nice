import React, { useState, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Video, Link, X, Upload } from 'lucide-react';
import { createPost } from '@/features/posts/postsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { useToast } from '@/hooks/use-toast';
import { useWebSocketContext } from '@/context/useWebSocketContext';
import { useWebSocketPostsHandler } from '@/features/posts/useWebSocketPostsHandler';

const CreatePost = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { createPost: createPostWS, isConnected } = useWebSocketContext();
  const isLoading = useAppSelector((state) => state.posts.isLoading);
  const error = useAppSelector((state) => state.posts.error);
  
  // Initialize WebSocket posts handler
  useWebSocketPostsHandler();
  
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for images
        toast({
          title: 'Error',
          description: 'Image size should be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Clear video if image is selected (only one media type at a time)
      if (video) {
        setVideo(null);
        setVideoPreview(null);
        if (videoInputRef.current) {
          videoInputRef.current.value = '';
        }
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
        toast({
          title: 'Error',
          description: 'Video size should be less than 50MB',
          variant: 'destructive',
        });
        return;
      }

      // Clear image if video is selected (only one media type at a time)
      if (image) {
        setImage(null);
        setImagePreview(null);
        if (imageInputRef.current) {
          imageInputRef.current.value = '';
        }
      }

      setVideo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!body.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some content for your post.',
        variant: 'destructive',
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: 'Connection Error',
        description: 'Not connected to server. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const currentUser = {
        UserId: 1, // Replace with actual user ID
        Username: "lando", // Replace with actual username
        Contacts: 0,
        Cancel: false,
        Verified: false
      };

      await dispatch(createPost({ 
        postData: { 
          body,
          image, 
          video 
        }, 
        createPost: createPostWS,
        currentUser
      })).unwrap();
      
      // Clear form on successful dispatch
      setBody('');
      setImage(null);
      setVideo(null);
      setImagePreview(null);
      setVideoPreview(null);
      
      // Clear file inputs
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      
      toast({
        title: 'Sending...',
        description: 'Your post is being created.',
      });
    } catch (error) {
      console.error('Create post error:', error);
      toast({
        title: 'Error',
        description: error as string,
        variant: 'destructive',
      });
    }
  };

  // Show error toast when error state changes
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Get media preview info for display
  const getMediaInfo = () => {
    if (image) {
      return {
        type: 'image',
        name: image.name,
        size: (image.size / (1024 * 1024)).toFixed(2) + ' MB'
      };
    }
    if (video) {
      return {
        type: 'video',
        name: video.name,
        size: (video.size / (1024 * 1024)).toFixed(2) + ' MB'
      };
    }
    return null;
  };

  const mediaInfo = getMediaInfo();

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-4">
          {!isConnected && (
            <div className="text-sm text-red-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Not connected to server
            </div>
          )}
        </CardHeader>
       
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[200px] text-lg"
            maxLength={40000}
            disabled={isLoading || !isConnected}
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-96 w-full object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeImage}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
              {mediaInfo && (
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  {mediaInfo.name} ({mediaInfo.size})
                </div>
              )}
            </div>
          )}

          {/* Video Preview */}
          {videoPreview && (
            <div className="relative">
              <video 
                src={videoPreview} 
                controls
                className="max-h-96 w-full rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeVideo}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
              {mediaInfo && (
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  {mediaInfo.name} ({mediaInfo.size})
                </div>
              )}
            </div>
          )}

          {/* File Upload Progress/Info */}
          {(image || video) && !imagePreview && !videoPreview && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
              <Upload className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                Processing {mediaInfo?.type}... ({mediaInfo?.size})
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            {/* Image Upload */}
            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading || !isConnected}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`text-gray-500 hover:text-gray-700 disabled:opacity-50 ${
                image ? 'text-blue-500 hover:text-blue-600' : ''
              }`}
              onClick={handleImageClick}
              disabled={isLoading || !isConnected}
              title="Add image"
            >
              <Image className="w-5 h-5" />
            </Button>

            {/* Video Upload */}
            <input
              type="file"
              ref={videoInputRef}
              className="hidden"
              accept="video/*"
              onChange={handleVideoChange}
              disabled={isLoading || !isConnected}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`text-gray-500 hover:text-gray-700 disabled:opacity-50 ${
                video ? 'text-blue-500 hover:text-blue-600' : ''
              }`}
              onClick={handleVideoClick}
              disabled={isLoading || !isConnected}
              title="Add video"
            >
              <Video className="w-5 h-5" />
            </Button>

            {/* Link Button (placeholder for future functionality) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={isLoading || !isConnected}
              title="Add link (coming soon)"
            >
              <Link className="w-5 h-5" />
            </Button>
          </div>
         
          <Button
            type="submit"
            disabled={isLoading || !isConnected || !body.trim()}
            className="px-6"
          >
            {isLoading ? 'Creating...' : 'Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePost;