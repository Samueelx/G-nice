import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { ArrowLeft, Share2 } from 'lucide-react';
import { DetailedEvent } from '@/features/events/eventsSlice'; // Import the type from slice
import { Ticket } from '@/features/events/eventsSlice'; // Import the type from slice

const EventDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Add defensive checks for the events state
  const event = useSelector((state: RootState) => {
    // Check if events slice exists and has items array
    if (!state.events || !state.events.items || !Array.isArray(state.events.items)) {
      console.warn('Events state structure is not as expected:', state.events);
      return null;
    }
    return state.events.items.find((e: DetailedEvent) => e.id === id);
  });

  // Type guard to check if event has detailed information
  const isDetailedEvent = (event: any): event is DetailedEvent => {
    return event && (event.performers || event.tickets || event.about);
  };

  // Optional: Add loading and error states from Redux
  const eventsLoading = useSelector((state: RootState) => 
    state.events?.loading || false
  );
  
  const eventsError = useSelector((state: RootState) => 
    state.events?.error || null
  );

  useEffect(() => {
    if (id) {
      dispatch({ type: 'ws/send', payload: { type: 'GET_EVENT_DETAILS', payload: { id } } });
    }
  }, [id, dispatch]);

  // Show loading state
  if (eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading event details...</p>
      </div>
    );
  }

  // Show error state
  if (eventsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading events: {eventsError}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Event not found or still loading...</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Handle both basic and detailed events
  const eventDetails = isDetailedEvent(event) ? event : {
    ...event,
    performers: [],
    date: {
      ...event.date,
      weekday: '',
      startTime: event.time,
      endTime: ''
    },
    tickets: [],
    about: event.description || 'No description available.',
    organizer: ''
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="relative h-[300px]">
        <img src={eventDetails.imageUrl} alt={eventDetails.title} className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{eventDetails.title}</h1>
        <div className="text-gray-600 mb-6">{eventDetails.performers?.length > 0 ? eventDetails.performers.join(' - ') : 'No performers listed'}</div>
        <div className="text-gray-600 mb-6">
          <span className="font-medium">
            {eventDetails.date.weekday && `${eventDetails.date.weekday}, `}
            {eventDetails.date.day} {eventDetails.date.month}
          </span>
          {eventDetails.date.startTime && (
            <span className="block">
              {eventDetails.date.startTime}
              {eventDetails.date.endTime && ` - ${eventDetails.date.endTime}`}
            </span>
          )}
          <span className="block">{eventDetails.location}</span>
        </div>
        <h2 className="text-lg font-semibold mb-2">ABOUT</h2>
        <p className="text-gray-600 mb-6">{eventDetails.about}</p>
        
        {eventDetails.tickets && eventDetails.tickets.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-4">TICKETS</h2>
            <div className="space-y-4">
              {['VIP', 'Regular'].map((section) => {
                const sectionTickets = eventDetails.tickets?.filter((ticket: Ticket) => ticket.section === section) || [];
                
                if (sectionTickets.length === 0) return null;
                
                return (
                  <div key={section}>
                    <h3 className="text-md font-semibold text-gray-800 mb-2">{section} Section</h3>
                    {sectionTickets.map((ticket: Ticket, index: number) => (
                      <a
                        key={index}
                        href={ticket.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-md p-4 flex justify-between items-center border-l-4 border-[#B43E8F] hover:bg-gray-100 transition block mb-2"
                      >
                        <div>
                          <span className="text-lg font-medium">{ticket.phase}</span>
                          <span className="block text-gray-600">KES {ticket.amount}</span>
                        </div>
                        <span className={`text-sm font-semibold ${ticket.status === 'Sold Out' ? 'text-red-500' : 'text-green-500'}`}>
                          {ticket.status}
                        </span>
                      </a>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {(!eventDetails.tickets || eventDetails.tickets.length === 0) && (
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-gray-600">Ticket information not available</p>
            <p className="text-sm text-gray-500">Price: KES {event.price}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPage;