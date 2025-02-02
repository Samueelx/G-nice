import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Image, Link } from 'lucide-react';

const CreatePost = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    try {
      // You would replace this with your actual Redux action
      // await dispatch(createPost({ title, body }));
      setTitle('');
      setBody('');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting || !title.trim() || !body.trim()}
            className="px-6"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePost;