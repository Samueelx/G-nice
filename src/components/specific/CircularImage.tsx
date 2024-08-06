// src/components/CircularImage.tsx
import React from 'react';

interface CircularImageProps {
  src: string;
  size: string;
  style: React.CSSProperties;
  mobileSize: string;
}

const CircularImage: React.FC<CircularImageProps> = ({src, size, style, mobileSize}) => {
  return (
    <div className={`${mobileSize} md:${size} rounded-full overflow-hidden flex items-center justify-center`} style={style}>
      <img src={src} alt="circular" className='w-full h-full object-cover'/>
    </div>
  );
}

export default CircularImage;
