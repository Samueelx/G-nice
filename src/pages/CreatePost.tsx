import React, { useState, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Image, Link, X } from 'lucide-react';
import { createPost } from '@/features/posts/postsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { useToast } from '@/hooks/use-toast';
import { useWebSocketContext } from '@/context/useWebSocketContext';
import { useWebSocketPostsHandler } from '@/features/posts/useWebSocketPostsHandler';

const CreatePost = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { sendMessage, isConnected } = useWebSocketContext();
  const isLoading = useAppSelector((state) => state.posts.isLoading);
  const error = useAppSelector((state) => state.posts.error);
  
  // Initialize WebSocket posts handler
  useWebSocketPostsHandler();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'Error',
          description: 'Image size should be less than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    // Check WebSocket connection
    if (!isConnected) {
      toast({
        title: 'Connection Error',
        description: 'Not connected to server. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await dispatch(createPost({ 
        postData: { title, body, image }, 
        sendMessage 
      })).unwrap();
      
      // Clear form on successful dispatch (actual success handled by WebSocket)
      setTitle('');
      setBody('');
      setImage(null);
      setImagePreview(null);
      
      // Success toast will be shown when WebSocket confirms post creation
      toast({
        title: 'Sending...',
        description: 'Your post is being created.',
      });
    } catch (error) {
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

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold"
            maxLength={300}
            disabled={isLoading || !isConnected}
          />
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
            className="min-h-[150px]"
            maxLength={40000}
            disabled={isLoading || !isConnected}
          />

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
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading || !isConnected}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              onClick={handleImageClick}
              disabled={isLoading || !isConnected}
            >
              <Image className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={isLoading || !isConnected}
            >
              <Link className="w-5 h-5" />
            </Button>
          </div>
         
          <Button
            type="submit"
            disabled={isLoading || !isConnected || !title.trim() || !body.trim()}
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