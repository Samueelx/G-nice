// src/components/CircularImage.tsx
import React from 'react';

interface CircularImageProps {
  src: string;
  size: string;
  style: React.CSSProperties;
}

const CircularImage: React.FC<CircularImageProps> = ({ src, size, style }) => {
  return (
    <div className={`rounded-full overflow-hidden ${size}`} style={style}>
      <img src={src} alt="User" className="object-cover w-full h-full" />
    </div>
  );
};

export default CircularImage;
