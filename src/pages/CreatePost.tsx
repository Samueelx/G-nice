import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MentionTextarea } from '@/components/common/MentionInput';
import { Image, Link, X } from 'lucide-react';
import { createPost } from '@/features/posts/postsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { useToast } from '@/hooks/use-toast';

const CreatePost = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isLoading = useAppSelector((state) => state.posts.isLoading);

  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image size should be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      // In a real flow you would upload via POST /uploads first to get the URL.
      // For now, create a local preview URL.
      const localUrl = URL.createObjectURL(file);
      setMediaUrl(localUrl);
      setMediaPreview(localUrl);
    }
  };

  const removeMedia = () => {
    setMediaUrl(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await dispatch(createPost({
        content: content.trim(),
        ...(mediaUrl && { media_url: mediaUrl, media_type: 'image' }),
        is_public: true,
      })).unwrap();
      setContent('');
      setMediaUrl(null);
      setMediaPreview(null);
      toast({
        title: 'Success',
        description: 'Post created successfully!',
      });
      navigate('/feeds');
    } catch (error) {
      toast({
        title: 'Error',
        description: error as string,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <MentionTextarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(value) => setContent(value)}
            className="min-h-[150px]"
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500">
            {content.length}/500
          </div>

          {mediaPreview && (
            <div className="relative">
              <img
                src={mediaPreview}
                alt="Preview"
                className="max-h-96 w-full object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeMedia}
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
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
              onClick={handleImageClick}
            >
              <Image className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
            >
              <Link className="w-5 h-5" />
            </Button>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="px-6"
          >
            {isLoading ? 'Posting...' : 'Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePost;