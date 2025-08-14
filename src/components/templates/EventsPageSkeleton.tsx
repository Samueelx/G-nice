
const EventsPageSkeleton = () => {
  return (
    <div className="p-4 bg-gray-50 min-h-screen animate-pulse">
      {/* Desktop Carousel Skeleton */}
      <div className="hidden md:block mb-12">
        <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
        
        <div className="bg-white rounded-lg overflow-hidden shadow">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="bg-gray-200 w-16 h-20 rounded-lg mr-4"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
              
              <div className="mb-8">
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
              
              <div className="h-6 bg-gray-300 rounded w-20 mb-4"></div>
              
              <div className="h-10 bg-gray-300 rounded w-32"></div>
            </div>
            
            <div className="h-64 md:h-auto bg-gray-300"></div>
          </div>
        </div>
      </div>

      {/* Events List Section Skeleton */}
      <div>
        {/* Header Section Skeleton */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="h-8 bg-gray-300 rounded w-48"></div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
          </div>

          {/* Category Pills Skeleton */}
          <div className="flex gap-3 justify-center overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200"
              >
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Image Skeleton */}
              <div className="relative">
                <div className="w-full h-48 bg-gray-300"></div>
                <div className="absolute top-3 right-3 bg-white rounded-full p-2 w-16 h-16">
                  <div className="h-4 bg-gray-300 rounded mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
              </div>

              {/* Content Skeleton */}
              <div className="p-4">
                <div className="h-6 bg-gray-300 rounded w-5/6 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPageSkeleton;