import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Briefcase, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdvancedProfileSkeleton = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'about'>('posts');
  const navigate = useNavigate();

  const renderTabContentSkeleton = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                {/* Post Header Skeleton */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-300 rounded w-20 animate-pulse" />
                      <div className="h-3 bg-gray-300 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
                </div>

                {/* Post Content Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
                  {index === 2 && (
                    <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse" />
                  )}
                </div>

                {/* Post Footer Skeleton */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-red-300 rounded animate-pulse" />
                      <div className="h-4 bg-gray-300 rounded w-6 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
                      <div className="h-4 bg-gray-300 rounded w-6 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
                    <div className="h-4 bg-gray-300 rounded w-12 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'comments':
        return (
          <div className="space-y-4">
            {[1, 2].map((index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                <div className="h-4 bg-gray-300 rounded w-48 mb-2 animate-pulse" />
                <div className="space-y-2 mb-3">
                  <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse" />
                </div>
                <div className="h-3 bg-gray-300 rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
        );
      
      case 'about':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            {/* Bio Section */}
            <div>
              <div className="h-6 bg-gray-300 rounded w-12 mb-2 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-300 rounded w-4/5 animate-pulse" />
                <div className="h-4 bg-gray-300 rounded w-3/5 animate-pulse" />
              </div>
            </div>

            {/* Info Items */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className="h-4 bg-gray-300 rounded w-32 animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div className="h-4 bg-gray-300 rounded w-28 animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div className="h-4 bg-gray-300 rounded w-40 animate-pulse" />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gray-900 pb-32 pt-8">
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Back Button */}
          <div className="absolute -top-8 left-1 p-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          </div>
          
          {/* Avatar Skeleton */}
          <div className="absolute -bottom-16 right-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 animate-pulse" />
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-gray-400 border-4 border-white animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        {/* User Info Skeleton */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-3">
            <div className="h-9 bg-gray-300 rounded-md w-56 animate-pulse" />
            <div className="h-5 bg-gray-300 rounded-md w-32 animate-pulse" />
          </div>
          <div className="h-10 bg-blue-300 rounded-full w-36 animate-pulse flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-400 rounded animate-pulse" />
          </div>
        </div>

        {/* Interactive Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8 justify-evenly">
            {(['posts', 'comments', 'about'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Skeleton */}
        <div className="pb-12">{renderTabContentSkeleton()}</div>
      </div>
    </div>
  );
};

export default AdvancedProfileSkeleton;