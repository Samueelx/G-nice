import { useEffect, useState } from "react";
import { ChevronDown, Users, Clock, Star, Settings, ChevronRight, X } from "lucide-react";

type Community = {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
  isSubscribed: boolean;
};

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  recentCommunities: Community[];
  subscribedCommunities: Community[];
  onCommunityClick: (communityId: string) => void;
};

const MobileSidebar = ({
  isOpen,
  onClose,
  recentCommunities = [],
  subscribedCommunities = [],
  onCommunityClick,
}: SidebarProps) => {
  const [showRecent, setShowRecent] = useState(false);
  const [showSubscribed, setShowSubscribed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop with blur effect */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Communities</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {/* Recent Communities Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => setShowRecent(!showRecent)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">Recent</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  showRecent ? "rotate-180" : ""
                }`}
              />
            </button>

            {showRecent && (
              <div className="px-3 pb-2 space-y-1">
                {recentCommunities.map((community) => (
                  <button
                    key={community.id}
                    onClick={() => onCommunityClick(community.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    {community.avatar ? (
                      <img
                        src={community.avatar}
                        alt={community.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                        <Users className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">{community.name}</p>
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
          <div className="border-b border-gray-100">
            <button
              onClick={() => setShowSubscribed(!showSubscribed)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-gray-700">Your Communities</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  showSubscribed ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSubscribed && (
              <div className="px-3 pb-2 space-y-1">
                {subscribedCommunities.map((community) => (
                  <button
                    key={community.id}
                    onClick={() => onCommunityClick(community.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    {community.avatar ? (
                      <img
                        src={community.avatar}
                        alt={community.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-sm">
                        <Users className="w-5 h-5 text-yellow-500" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">{community.name}</p>
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
          <button className="w-full px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Community Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;