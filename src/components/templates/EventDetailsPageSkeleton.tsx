import React from 'react';
import { ArrowLeft, Share2 } from 'lucide-react';

const EventDetailsPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header Image Skeleton */}
      <div className="relative h-[300px] bg-gray-300 animate-pulse">
        {/* Navigation Skeleton */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <ArrowLeft className="w-6 h-6 text-white/50" />
          </div>
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Share2 className="w-6 h-6 text-white/50" />
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content Skeleton */}
      <div className="px-4 py-6">
        {/* Category and Title Skeleton */}
        <div className="mb-6">
          {/* Category Badge Skeleton */}
          <div className="inline-block w-20 h-6 bg-gray-200 rounded-full mb-2 animate-pulse"></div>
          
          {/* Title Skeleton */}
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded-md w-4/5 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded-md w-3/5 animate-pulse"></div>
          </div>
        </div>

        {/* Event Details Skeleton */}
        <div className="space-y-4 mb-6">
          {/* Date Skeleton */}
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-200 rounded mr-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* Time Skeleton */}
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-200 rounded mr-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>

          {/* Location Skeleton */}
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-200 rounded mr-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>

        {/* Price Card Skeleton */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="w-24 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Description Section Skeleton */}
        <div className="mb-6">
          {/* Section Title */}
          <div className="h-6 bg-gray-200 rounded w-40 mb-3 animate-pulse"></div>
          
          {/* Description Text */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-11/12 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-9/12 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>

        {/* Additional Info Skeleton */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPageSkeleton;