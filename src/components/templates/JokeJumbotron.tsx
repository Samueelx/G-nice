import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share, ThumbsUp, MessageCircle } from 'lucide-react'; // Import MessageCircle

interface JokeJumbotronProps {
  joke: {
    setup?: string;
    punchline?: string;
    author?: string;
    date?: string;
    likes?: number;
    comments?: number;
  };
  onShare?: () => void;
  onLike?: () => void;
  onComment?: () => void; // Ensure onComment is defined in the props
}

const JokeJumbotron: React.FC<JokeJumbotronProps> = ({
  joke,
  onShare,
  onLike,
  onComment // Destructure onComment
}) => {
  return (
    <Card className="w-full max-w-xl bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          {/* <h2 className="text-xl font-bold text-purple-800">Joke of the Day</h2> */}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {joke.setup && (
          <p className="text-md font-medium text-gray-800">{joke.setup}</p>
        )}
        <p className="text-xl font-semibold text-gray-900">{joke.punchline}</p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t border-gray-300 pt-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{joke.likes || 0}</span>
            </Button>
            {/* Add the comments button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onComment} // Trigger onComment when clicked
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{joke.comments || 0}</span>
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="flex items-center gap-2"
          >
            <Share className="w-4 h-4" />
            Share
          </Button>
        </div>
        {joke.author && (
          <p className="text-sm text-gray-600 w-full text-left">
            Powered by {joke.author}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default JokeJumbotron;