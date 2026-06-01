import React from 'react';
import { Link } from 'react-router-dom';

interface RenderWithMentionsProps {
  text: string;
  className?: string;
}

export const RenderWithMentions: React.FC<RenderWithMentionsProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split the text by mentions (e.g., @username)
  // The regex captures the @username, including the @ symbol
  const parts = text.split(/(@[A-Za-z0-9_]+)/g);

  return (
    <span className={`whitespace-pre-line ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('@') && part.length > 1) {
          const username = part.substring(1); // Remove the @
          return (
            <Link
              key={index}
              to={`/profile/${username}`}
              className="text-purple-600 hover:text-purple-800 hover:underline font-medium transition-colors"
              onClick={(e) => e.stopPropagation()} // Prevent triggering parent click events like opening a post
            >
              {part}
            </Link>
          );
        }
        // Return normal text
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
