import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Image, Link } from 'lucide-react';
import { createPost } from '@/features/posts/postsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { useToast } from '@/hooks/use-toast';

const CreatePost = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const isLoading = useAppSelector((state) => state.posts.isLoading);
//   const error = useAppSelector((state) => state.posts.error);
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    try {
      await dispatch(createPost({ title, body })).unwrap();
      setTitle('');
      setBody('');
      toast({
        title: 'Success',
        description: 'Post created successfully!',
      });
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
        <CardHeader className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold"
            maxLength={300}
          />
        </CardHeader>
        
        <CardContent>
          <Textarea
            placeholder="What's on your mind?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[150px]"
            maxLength={40000}
          />
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="text-gray-500 hover:text-gray-700"
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
            disabled={isLoading || !title.trim() || !body.trim()}
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