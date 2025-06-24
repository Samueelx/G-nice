import BackNavigationTemplate from '@/components/templates/BackNavigationTemplate';
import { Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { fetchEvents, eventAdded, eventUpdated, setEventsError, Event } from '@/features/events/eventsSlice';
import { useWebSocketContext } from '@/context/useWebSocketContext';

// WebSocket Event Message Interface
interface WebSocketEventMessage {
  name: string;
  EventId: number;
  EventTitle: string;
  EventDescription: string;
  EventPin: string;
  EventVenue: string;
  EventDate: string;
  Posters: Array<{
    ImageId: number;
    ImagePath: string;
    ImageTitle: string;
    IsCanceled: boolean;
  }>;
  Clips: Array<{
    ClipID: number;
    ClipPath: string;
    ClipTitle: string;
    Canceled: boolean;
  }>;
  Posts: Array<any>;
  User: {
    UserId: number;
    Email: string;
    Username: string;
    Contacts: number;
    Verified: boolean;
    LastName: string;
    FirstName: string;
    Posts: Array<any>;
    Cancel: boolean;
    TopicsFollowing: Array<any>;
    CategoriesFollowing: Array<any>;
    UserSecurity: Array<any>;
  };
  CanceledImages: Array<any>;
  CanceledClips: Array<any>;
  IsCanceled: boolean;
}

const EventsPage = () => {
  const dispatch = useAppDispatch();
  const { items: events = [] } = useAppSelector((state) => state.events || { items: [] });
  const { messages, isConnected, sendMessage } = useWebSocketContext();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  // Function to transform WebSocket event message to your Event interface
  const transformWebSocketEvent = (wsEvent: WebSocketEventMessage): Event => {
    // Parse the date string (assuming format DD/MM/YYYY)
    const [day, month] = wsEvent.EventDate.split('/');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthName = monthNames[parseInt(month) - 1] || 'JAN';
    
    // Get the first poster image or use a default
    const imageUrl = wsEvent.Posters && wsEvent.Posters.length > 0 
      ? wsEvent.Posters[0].ImagePath 
      : '/default-event-image.jpg';

    return {
      id: wsEvent.EventId.toString(),
      title: wsEvent.EventTitle,
      location: wsEvent.EventVenue,
      time: '7:00 PM', // Default time since it's not in WebSocket message
      date: {
        day: parseInt(day),
        month: monthName,
      },
      price: 25.00, // Default price since it's not in WebSocket message
      imageUrl: imageUrl,
      description: wsEvent.EventDescription,
    };
  };

  useEffect(() => {
    // Initial fetch of events
    dispatch(fetchEvents());
  }, [dispatch]);

  // Subscribe to events when WebSocket connects
  useEffect(() => {
    if (isConnected) {
      console.log('🎟️ EventsPage: Subscribing to events feed');
      sendMessage('subscribe_events', {
        userId: 'current_user', // Replace with actual user ID from auth state
        timestamp: Date.now(),
      });
    }
  }, [isConnected, sendMessage]);

  // Process WebSocket messages for events
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Process the latest message
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage && latestMessage.name === 'EVENT') {
      try {
        const wsEvent: WebSocketEventMessage = latestMessage;
        
        // Skip if event is canceled
        if (wsEvent.IsCanceled) {
          console.log('Event canceled:', wsEvent.EventId);
          // TODO: You might want to dispatch an action to remove the event from state
          return;
        }

        // Transform the WebSocket event to your Event format
        const transformedEvent = transformWebSocketEvent(wsEvent);
        
        // Check if event already exists in current events
        const existingEvent = events.find(e => e.id === transformedEvent.id);
        
        if (existingEvent) {
          // Update existing event
          dispatch(eventUpdated(transformedEvent));
          console.log('Event updated:', transformedEvent.title);
        } else {
          // Add new event
          dispatch(eventAdded(transformedEvent));
          console.log('New event added:', transformedEvent.title);
        }
      } catch (error) {
        console.error('Error processing WebSocket event message:', error);
        dispatch(setEventsError('Failed to process real-time event update'));
      }
    }
  }, [messages, events, dispatch]);

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handlePrev = () => {
    if (!events || events.length === 0) return;
    setCurrentIndex((current) => (current === 0 ? events.length - 1 : current - 1));
  };

  const handleNext = () => {
    if (!events || events.length === 0) return;
    setCurrentIndex((current) => (current === events.length - 1 ? 0 : current + 1));
  };

  // If events is undefined or empty, show a loading state
  if (!events || events.length === 0) {
    return (
      <BackNavigationTemplate title="Events">
        <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
          <p className="text-xl text-gray-500">Loading events...</p>
        </div>
      </BackNavigationTemplate>
    );
  }

  return (
    <BackNavigationTemplate title="Events">
      <div className="p-4 bg-gray-50 min-h-screen">
        {/* Desktop Carousel Section */}
        <div className="hidden md:block mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top picks from our staff</h2>
          <div className="relative w-full">
            <div ref={carouselRef} className="relative overflow-hidden rounded-lg">
              {events.map((event: Event, index: number) => (
                <div
                  key={event.id}
                  className={`${index === currentIndex ? 'block' : 'hidden'} transition-all duration-300`}
                >
                  <div className="grid md:grid-cols-2 gap-6 bg-white rounded-lg overflow-hidden shadow">
                    <div className="flex flex-col justify-between p-6">
                      <div>
                        <div className="flex items-start mb-4">
                          <div className="bg-white w-16 h-20 rounded-lg mr-4 text-center flex flex-col justify-center shadow">
                            <div className="text-gray-500 text-sm font-semibold">{event.date?.month?.toUpperCase() || ''}</div>
                            <div className="text-black text-2xl font-bold">{event.date?.day || ''}</div>
                          </div>
                          <h3 className="text-2xl font-bold mt-2">{event.title || ''}</h3>
                        </div>
                        <div className="mb-4">
                          <div className="flex items-center mb-2 text-[#B43E8F]">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{event.location || ''}</span>
                          </div>
                          <div className="flex items-center text-[#B43E8F]">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>{event.time || ''}</span>
                          </div>
                        </div>
                        <p className="text-base mb-8">{event.description || 'Join us for this exciting event!'}</p>
                        <div className="text-[#B43E8F] font-bold mb-4">${(event.price || 0).toFixed(2)}</div>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEventClick(event.id)}
                          className="bg-[#B43E8F] hover:bg-[#9a3277] text-white font-bold py-2 px-4 rounded inline-block min-w-32 text-center"
                        >
                          GET TICKETS
                        </button>
                      </div>
                    </div>
                    <div className="relative h-64 md:h-auto overflow-hidden">
                      <img src={event.imageUrl || ''} alt={event.title || ''} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow-lg z-10 hover:bg-gray-100"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {events.map((_, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-[#B43E8F]' : 'bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Section */}
        <div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Upcoming events</h1>
              <button className="text-[#B43E8F] font-medium">See All</button>
            </div>
            <div className="flex gap-3 justify-center overflow-x-auto pb-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#B43E8F] text-white whitespace-nowrap">
                <Circle className="w-4 h-4" />
                <span>Mine</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                <Circle className="w-4 h-4" />
                <span>Food</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                <Circle className="w-4 h-4" />
                <span>Concerts</span>
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event: Event) => (
              <div
                key={event.id}
                className="relative bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleEventClick(event.id)}
              >
                <div className="relative">
                  <img src={event.imageUrl || ''} alt={event.title || ''} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2 text-sm opacity-80 shadow">
                    <div className="font-bold">{event.date?.day || ''}</div>
                    <div className="text-gray-500">{event.date?.month || ''}</div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{event.title || ''}</h3>
                  <div className="flex justify-between items-center">
                    <div className="text-[#B43E8F]">
                      {event.location || ''} - {event.time || ''}
                    </div>
                    <div className="font-bold text-[#B43E8F]">${(event.price || 0).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BackNavigationTemplate>
  );
};

export default EventsPage;