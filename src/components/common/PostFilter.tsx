import { useState } from 'react';

const PostFilter = () => {
  const [activeTab, setActiveTab] = useState<'recents' | 'friends' | 'popular'>('friends');

  const handleTabClick = (tab: 'recents' | 'friends' | 'popular') => {
    setActiveTab(tab);
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 rounded-full p-1 w-2/3 max-w-sm mx-auto">
      <button
        onClick={() => handleTabClick('recents')}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
          activeTab === 'recents'
            ? 'bg-white shadow text-black'
            : 'text-gray-500 hover:text-black'
        }`}
      >
        Recents
      </button>
      <button
        onClick={() => handleTabClick('friends')}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
          activeTab === 'friends'
            ? 'bg-white shadow text-black'
            : 'text-gray-500 hover:text-black'
        }`}
      >
        Friends
      </button>
      <button
        onClick={() => handleTabClick('popular')}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
          activeTab === 'popular'
            ? 'bg-white shadow text-black'
            : 'text-gray-500 hover:text-black'
        }`}
      >
        Popular
      </button>
    </div>
  );
};

export default PostFilter;
