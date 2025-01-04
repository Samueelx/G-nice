import { MoreVertical, Heart, MessageCircle } from 'lucide-react';

// Types for our props
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
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 max-w-xl">
      {/* Header section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img
            src={author.avatar}
            alt={`${author.name}'s avatar`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium text-gray-900">{author.name}</h3>
            <p className="text-gray-500 text-sm">{timestamp}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded-full">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content section */}
      <div className="mb-3">
        <p className="text-gray-800 whitespace-pre-line">
          {content}
          {taggedUsers.length > 0 && (
            <span className="text-blue-500">
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
        <div className={`grid gap-2 mb-3 ${
          images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        }`}>
          {images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={image.alt}
              className="rounded-lg w-full h-48 object-cover"
            />
          ))}
        </div>
      )}

      {/* Engagement section */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-4">
          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <Heart className="w-5 h-5" />
            <span className="text-sm">{likes}</span>
          </button>
          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{comments}</span>
          </button>
        </div>
        <button className="text-sm text-gray-500 hover:text-gray-700">
          Set Reaction
        </button>
      </div>
    </div>
  );
};

export default SocialPost;