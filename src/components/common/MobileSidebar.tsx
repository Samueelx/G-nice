import { useState } from 'react';
import { ChevronDown, Users, Clock, Star, Settings, ChevronRight } from 'lucide-react';

type Community = {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
  isSubscribed: boolean;
};

type SidebarProps = {
  recentCommunities: Community[];
  subscribedCommunities: Community[];
  onCommunityClick: (communityId: string) => void;
};

const MobileSidebar = ({
  recentCommunities = [],
  subscribedCommunities = [],
  onCommunityClick,
}: SidebarProps) => {
  const [showRecent, setShowRecent] = useState(true);
  const [showSubscribed, setShowSubscribed] = useState(true);

  return (
    <div className="w-full max-w-md bg-white h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Communities</h2>
      </div>

      {/* Recent Communities Section */}
      <div className="border-b">
        <button
          onClick={() => setShowRecent(!showRecent)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Recent</span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform ${
              showRecent ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {showRecent && (
          <div className="px-2">
            {recentCommunities.map((community) => (
              <button
                key={community.id}
                onClick={() => onCommunityClick(community.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg"
              >
                {community.avatar ? (
                  <img
                    src={community.avatar}
                    alt={community.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="font-medium">{community.name}</p>
                  <p className="text-sm text-gray-500">
                    {community.memberCount.toLocaleString()} members
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Your Communities Section */}
      <div className="border-b">
        <button
          onClick={() => setShowSubscribed(!showSubscribed)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Your Communities</span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform ${
              showSubscribed ? 'rotate-180' : ''
            }`}
          />
        </button>
        
        {showSubscribed && (
          <div className="px-2">
            {subscribedCommunities.map((community) => (
              <button
                key={community.id}
                onClick={() => onCommunityClick(community.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg"
              >
                {community.avatar ? (
                  <img
                    src={community.avatar}
                    alt={community.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="font-medium">{community.name}</p>
                  <p className="text-sm text-gray-500">
                    {community.memberCount.toLocaleString()} members
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings Button */}
      <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50">
        <Settings className="w-5 h-5 text-gray-500" />
        <span className="font-medium">Community Settings</span>
      </button>
    </div>
  );
};

export default MobileSidebar;