import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Share2, ArrowLeft, Clock, MapPin, Calendar, User } from 'lucide-react';
import { useGetEventByIdQuery } from '../services/api/eventsApi';
import EventDetailsPageSkeleton from '@/components/templates/EventDetailsPageSkeleton';

const EventDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch event data using RTK Query
  const {
    data: event,
    isLoading,
    error,
    refetch
  } = useGetEventByIdQuery(id!, {
    skip: !id, // Skip query if no id
  });

  // Loading state
  if (isLoading) {
    return <EventDetailsPageSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-600 text-2xl">!</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error && 'status' in error 
                ? `Error ${error.status}: Unable to load event details`
                : 'Something went wrong while loading the event.'}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mr-2"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/events')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No event found
  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || `Check out ${event.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to copying URL
        copyToClipboard();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    });
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header Image */}
      <div className="relative h-[300px]">
        <img 
          src={event.imageUrl || 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fA%3D%3D'} 
          alt={event.title} 
          className="w-full h-full object-cover" 
        />
        
        {/* Overlay Navigation */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <button 
            onClick={handleShare}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Title and Category */}
        <div className="mb-6">
          {event.category && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-2">
              {event.category}
            </span>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
        </div>

        {/* Event Details */}
        <div className="space-y-4 mb-6">
          {/* Date */}
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-3 text-gray-400" />
            <div>
              <span className="font-medium">{event.date.day} {event.date.month}</span>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-3 text-gray-400" />
            <span>{event.time}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-3 text-gray-400" />
            <span>{event.location}</span>
          </div>
        </div>

        {/* Price */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">Starting from</span>
              <div className="text-2xl font-bold text-gray-900">
                KES {event.price.toLocaleString()}
              </div>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Buy Tickets
            </button>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">About This Event</h2>
            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-1 gap-4">
          {event.createdAt && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>Event created on {new Date(event.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;