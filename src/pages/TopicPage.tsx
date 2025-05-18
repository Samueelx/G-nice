import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  ArrowLeft,
  Bell,
  Info,
  MessageSquare,
  TrendingUp,
  Settings,
  Bookmark,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {
  selectCurrentTopic,
  selectTopicPosts,
  selectTopicEvents,
  fetchTopicData,
} from '@/features/topics/topicSlice';
import { Post } from '@/types/topic';

const TopicPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const topic = useAppSelector(selectCurrentTopic);
  const posts = useAppSelector(selectTopicPosts);
  const events = useAppSelector(selectTopicEvents);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'events'>('posts');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (handle) {
      dispatch(fetchTopicData(handle));
    }
  }, [dispatch, handle]);

  if (!topic) {
    return (
      <div className="text-center text-gray-600 py-20">
        <p>Loading topic...</p>
      </div>
    );
  }

  const isMember = topic.isMember;
  const isModerator = topic.isModerator;

  const handleSubscribe = () => setIsSubscribed(!isSubscribed);

  const renderTopicAction = () => {
    if (isModerator) {
      return (
        <button
          onClick={() => navigate(`/topic/${topic.handle}/settings`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Manage Topic</span>
        </button>
      );
    }

    if (isMember) {
      return (
        <div className="flex gap-2">
          <button
            onClick={handleSubscribe}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-full flex items-center gap-1 transition-colors"
          >
            <Bell className={`w-4 h-4 ${isSubscribed ? 'text-blue-600' : 'text-gray-600'}`} />
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full transition-colors"
          >
            <span className="hidden sm:inline">Joined</span>
            <span className="sm:hidden">✓</span>
          </button>
        </div>
      );
    }

    return (
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
      >
        <Users className="w-4 h-4" />
        <span className="hidden sm:inline">Join Topic</span>
        <span className="sm:hidden">+</span>
      </button>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="space-y-4">
            {posts.map((post: Post) => (
              <div
                key={post.id}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar}
                      alt={`${post.author.username}'s avatar`}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-semibold text-gray-800">{post.author.username}</p>
                        <p className="text-xs text-gray-500">· {post.timestamp}</p>
                      </div>
                      <p className="text-xs text-gray-500">in {topic.handle}</p>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700">⋮</button>
                </div>
                <p className="text-gray-900">{post.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-red-500">↑ {post.likes}</button>
                    <button className="flex items-center gap-1 hover:text-blue-500">💬 {post.comments}</button>
                    <button className="hidden sm:flex items-center gap-1 hover:text-yellow-500">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="flex items-center gap-1">👁 {Math.round(post.likes * 1.5)} views</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'about':
        return (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            {topic.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">About this topic</h3>
                <p className="text-gray-700">{topic.description}</p>
              </div>
            )}
            <div className="space-y-4">
              {topic.category && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Info className="w-5 h-5" />
                  <span>Category: {topic.category}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Created {topic.creationDate}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="w-5 h-5" />
                <span>
                  <strong>{topic.members}</strong> members
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MessageSquare className="w-5 h-5" />
                <span>
                  <strong>{topic.posts}</strong> posts
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span>Trending #{Math.floor(Math.random() * 100) + 1} today</span>
              </div>
            </div>
            {topic.isModerated && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-2">Moderation</h3>
                <p className="text-gray-700">
                  This is a moderated topic. Posts require approval before appearing to the community.
                </p>
              </div>
            )}
          </div>
        );
      case 'events':
        return (
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold text-lg text-gray-800">{event.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600 my-2">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} attending</span>
                  </div>
                  <div className="mt-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full text-sm transition-colors">
                      RSVP
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="font-medium text-gray-700">No upcoming events</h3>
                {isModerator && (
                  <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm transition-colors">
                    Create Event
                  </button>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="bg-cover bg-center pb-24 pt-8"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url(${topic.banner})`,
          backgroundColor: '#1F2937',
        }}
      >
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="absolute -top-8 left-1 p-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="mt-8">
            <div className="inline-block bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
              Topic
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative">
        <div className="absolute -top-16 left-8 sm:left-12">
          <img
            src={topic.avatar}
            alt={topic.name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg"
          />
        </div>

        <div className="pt-12 sm:pt-6 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{topic.name}</h1>
              <p className="text-gray-600">{topic.handle}</p>
            </div>
            <div className="mt-4 sm:mt-0">{renderTopicAction()}</div>
          </div>

          <div className="flex gap-4 mt-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">{topic.members}</span> members
            </div>
            <div>
              <span className="font-semibold">{topic.posts}</span> posts
            </div>
          </div>
        </div>

        {isMember && (
          <div className="mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex gap-3">
                <div className="mt-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                </div>
                <div className="flex-1">
                  <div
                    className="border border-gray-300 rounded-lg px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/topic/${topic.handle}/create-post`)}
                  >
                    Start a discussion...
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8 justify-evenly">
            {(['posts', 'about', 'events'] as const).map((tab) => (
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

        <div className="pb-12">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default TopicPage;
