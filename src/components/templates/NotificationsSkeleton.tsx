import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsSkeleton = () => {
  const navigate = useNavigate();

  const SkeletonNotificationItem = () => (
    <div className="py-4 px-4 border-b border-gray-100 last:border-0">
      <div className="flex gap-3">
        {/* Avatar skeleton */}
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 animate-pulse" />
        
        <div className="flex-1 min-w-0 space-y-2">
          {/* Main text skeleton */}
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
          
          {/* File details skeleton (randomly show on some items) */}
          {Math.random() > 0.6 && (
            <div className="mt-2 bg-gray-50 rounded-lg p-3 flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4" />
              </div>
            </div>
          )}
          
          {/* Time skeleton */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
          </div>

          {/* Action buttons skeleton (randomly show on some items) */}
          {Math.random() > 0.8 && (
            <div className="flex gap-2 mt-2">
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
            {/* Badge skeleton */}
            <div className="w-6 h-4 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <button className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" onClick={() => navigate(-1)}/>
          </button>
        </div>
        
        {/* Tabs skeleton */}
        <div className="flex px-4 gap-4 pb-2 justify-evenly">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
        </div>
      </div>

      {/* Loading shimmer effect */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        
        {/* Skeleton notification items */}
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonNotificationItem key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSkeleton;