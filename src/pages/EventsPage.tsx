import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { fetchEvents, eventAdded, eventUpdated, setEventsError, setEvents, Event } from '@/features/events/eventsSlice';
import { useWebSocketContext } from '@/context/useWebSocketContext';
import BackNavigationTemplate from '@/components/templates/BackNavigationTemplate';

// Server response structure (from your actual server response)
interface ServerEvent {
  EventID: number;
  EventTitle: string;
  EventDescription: string;
  EventPin: string | null;
  EventDate: string; // Format: "23-05-2025:12:00:00"
  DatePosted: string;
  Clips: Array<any>;
  Posters: Array<any>;
  Posts: Array<any>;
  CanceledImages: any;
  CanceledClips: any;
  EventVenue: string;
  PostedBy: {
    Username: string;
    Email: string | null;
    UserId: number;
    UserSecurity: any;
    Contacts: number;
    FirstName: string | null;
    LastName: string | null;
    Verified: boolean;
    Posts: any;
    CategoriesFollowing: any;
    TopicsFollowing: any;
    Cancel: boolean;
  };
  canceled: boolean;
  postedBy: {
    Username: string;
    Email: string | null;
    UserId: number;
    UserSecurity: any;
    Contacts: number;
    FirstName: string | null;
    LastName: string | null;
    Verified: boolean;
    Posts: any;
    CategoriesFollowing: any;
    TopicsFollowing: any;
    Cancel: boolean;
  };
  IsCanceled: boolean;
}

// Expected server response structure
interface EventsResponse {
  Events: ServerEvent[];
  ResultCode: number;
  ResultMessage: string;
  ResultId: number;
  Searchable: number;
}

const EventsPage = () => {
  const dispatch = useAppDispatch();
  const { items: events = [], loading } = useAppSelector((state) => state.events || { items: [], loading: false });
  const { messages, isConnected, createPost } = useWebSocketContext();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasRequestedEvents, setHasRequestedEvents] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Function to parse date string from server format "23-05-2025:12:00:00"
  const parseEventDate = (dateString: string) => {
    try {
      const [datePart, timePart] = dateString.split(':');
      const [day, month] = datePart.split('-');
      const [hour, minute] = timePart.split(':').slice(0, 2);
      
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                         'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const monthName = monthNames[parseInt(month) - 1] || 'JAN';
      
      // Create time string
      const timeString = `${hour}:${minute}`;
      
      return {
        day: parseInt(day),
        month: monthName,
        time: timeString
      };
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return {
        day: 1,
        month: 'JAN',
        time: '12:00'
      };
    }
  };


  // Function to check if a message is an events response
  const isEventsResponse = (message: any): message is EventsResponse => {
    return message && 
           typeof message === 'object' && 
           'Events' in message && 
           'ResultCode' in message && 
           'ResultMessage' in message &&
           Array.isArray(message.Events);
  };

  // Function to check if a message is a single event update
  const isSingleEventUpdate = (message: any): message is ServerEvent => {
    return message && 
           typeof message === 'object' && 
           'EventID' in message && 
           'EventTitle' in message &&
           'EventDate' in message;
  };

  // Request events from server when component mounts and WebSocket connects
  useEffect(() => {
    if (isConnected && !hasRequestedEvents) {
      console.log('🎟️ EventsPage: Requesting events from server');
      dispatch(fetchEvents()); // Set loading state
      
      // Send the exact message format your backend expects
      const eventSearchMessage = {
        SearchType: {
          SearchType: "EVENT"
        }
      };
      
      const success = createPost(eventSearchMessage);
      
      if (success) {
        setHasRequestedEvents(true);
        console.log('✅ EventsPage: Event search message sent successfully');
      } else {
        console.error('❌ EventsPage: Failed to send event search message');
        dispatch(setEventsError('Failed to request events from server'));
      }
    }
  }, [isConnected, hasRequestedEvents, dispatch, createPost]);

  // Reset request flag when WebSocket disconnects
  useEffect(() => {
    if (!isConnected) {
      setHasRequestedEvents(false);
    }
  }, [isConnected]);

  // Process WebSocket messages for events
  // Process WebSocket messages for events
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Move transformServerEvent inside useEffect to avoid dependency issues
    const transformServerEvent = (serverEvent: ServerEvent): Event => {
      const dateInfo = parseEventDate(serverEvent.EventDate);
      
      // Get image from posters array or use default
      const imageUrl = serverEvent.Posters && serverEvent.Posters.length > 0 
        ? serverEvent.Posters[0].ImagePath || '/default-event-image.jpg'
        : '/default-event-image.jpg';

      return {
        id: serverEvent.EventID.toString(),
        title: serverEvent.EventTitle,
        location: serverEvent.EventVenue,
        time: dateInfo.time,
        date: {
          day: dateInfo.day,
          month: dateInfo.month,
        },
        price: 25.00, // Default price since not provided by server
        imageUrl: imageUrl,
        description: serverEvent.EventDescription || 'Join us for this exciting event!',
      };
    };

    const latestMessage = messages[messages.length - 1];
    console.log('🔍 EventsPage: Processing message:', latestMessage);

    // Handle events response from server
    if (isEventsResponse(latestMessage)) {
      try {
        console.log('🎉 EventsPage: Received events response from server');
        
        if (latestMessage.ResultCode === 0 && latestMessage.ResultMessage === 'Success') {
          // Transform all events to frontend format
          const transformedEvents = latestMessage.Events
            .filter(serverEvent => !serverEvent.IsCanceled && !serverEvent.canceled) // Filter out canceled events
            .map(transformServerEvent);
          
          dispatch(setEvents(transformedEvents));
          console.log(`✅ EventsPage: Successfully processed ${transformedEvents.length} events`);
        } else {
          console.error('❌ EventsPage: Server returned error:', latestMessage.ResultMessage);
          dispatch(setEventsError(latestMessage.ResultMessage || 'Failed to fetch events'));
        }
      } catch (error) {
        console.error('❌ EventsPage: Error processing events response:', error);
        dispatch(setEventsError('Failed to process events response'));
      }
    }
    // Handle single event updates (real-time updates)
    else if (isSingleEventUpdate(latestMessage)) {
      try {
        console.log('🔄 EventsPage: Received single event update');
        
        // Skip if event is canceled
        if (latestMessage.IsCanceled || latestMessage.canceled) {
          console.log('🚫 EventsPage: Skipping canceled event:', latestMessage.EventID);
          // TODO: You might want to remove the event from state if it was previously added
          return;
        }

        const transformedEvent = transformServerEvent(latestMessage);
        
        // Check if event already exists
        const existingEvent = events.find((e: Event) => e.id === transformedEvent.id);
        
        if (existingEvent) {
          dispatch(eventUpdated(transformedEvent));
          console.log('✅ EventsPage: Updated existing event:', transformedEvent.title);
        } else {
          dispatch(eventAdded(transformedEvent));
          console.log('✅ EventsPage: Added new event:', transformedEvent.title);
        }
      } catch (error) {
        console.error('❌ EventsPage: Error processing single event update:', error);
        dispatch(setEventsError('Failed to process event update'));
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

  // Show loading state or no events message
  if (loading || (!events || events.length === 0)) {
    return (
      <BackNavigationTemplate title="Events">
        <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B43E8F] mx-auto mb-4"></div>
            <p className="text-xl text-gray-500">
              {loading ? 'Loading events...' : 'No events available'}
            </p>
            {!isConnected && (
              <p className="text-sm text-red-500 mt-2">WebSocket disconnected</p>
            )}
          </div>
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
                <span>All</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                <Circle className="w-4 h-4" />
                <span>Music</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                <Circle className="w-4 h-4" />
                <span>Sports</span>
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
                    <div className="text-[#B43E8F] text-sm">
                      {event.location || ''} • {event.time || ''}
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