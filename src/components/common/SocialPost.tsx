import { useState } from 'react';
import { MoreVertical, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

type PostImage = {
  url: string;
  alt: string;
};

type UserTag = {
  username: string;
  displayName: string;
};

type PostProps = {
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  images?: PostImage[];
  timestamp: string;
  likes: number;
  comments: number;
  taggedUsers?: UserTag[];
};

const SocialPost = ({
  author,
  content,
  images = [],
  timestamp,
  likes,
  comments,
  taggedUsers = [],
}: PostProps) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-75 blur transition duration-200" />
              <Avatar className="relative w-10 h-10 border-2 border-white">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{author.name}</h3>
              <p className="text-sm text-purple-600">{timestamp}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {/* Content section */}
        <div className="mb-4">
          <p className="text-gray-800 text-base whitespace-pre-line">
            {content}
            {taggedUsers.length > 0 && (
              <span className="text-purple-500 font-medium">
                {taggedUsers.map((user, index) => (
                  <span key={user.username}>
                    {' '}
                    @{user.displayName}
                    {index < taggedUsers.length - 1 ? ',' : ''}
                  </span>
                ))}
              </span>
            )}
          </p>
        </div>

        {/* Images grid */}
        {images.length > 0 && (
          <div className={`grid gap-2 mb-4 ${
            images.length === 1 ? 'grid-cols-1' : 
            images.length === 2 ? 'grid-cols-2' :
            'grid-cols-2 md:grid-cols-3'
          }`}>
            {images.map((image, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1.5 ${
                isLiked ? 'text-pink-500 hover:text-pink-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{comments}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SocialPost;