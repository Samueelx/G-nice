import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, ArrowLeft } from 'lucide-react';

interface EventDetails {
  id: string;
  title: string;
  performers: string[];
  location: string;
  date: {
    day: number;
    month: string;
    weekday: string;
    startTime: string;
    endTime: string;
  };
  prices: {
    phase: string;
    amount: number;
    status: string;
  }[];
  imageUrl: string;
  about: string;
  organizer: string;
}

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = React.useState(false);

  // Mock event data
  const eventDetails: EventDetails = {
    id: '1',
    title: 'DESCENDANTS',
    performers: ['ATMOS BLAQ', 'GOLDMAX DRUMETIC BOYZ', 'MEDY', 'PIZZI', 'COCO EM', 'TINA APOOR', 'HIRIBAE'],
    location: 'MUZE Club, Nairobi',
    date: {
      day: 5,
      month: 'April',
      weekday: 'Saturday',
      startTime: '09:00 PM',
      endTime: '07:00 AM',
    },
    prices: [
      { phase: 'Phase 3', amount: 3000, status: 'Available' },
      { phase: 'Phase 1', amount: 2000, status: 'Sold Out' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    about: 'DESCENDANTS makes their highly anticipated Nairobi debut on April 5th at the legendary MUZE. The New York-based experience has been championing African artists across the globe between cities like New York, London, and now Nairobi.',
    organizer: 'MUZE Club',
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleGetTicket = () => {
    console.log('Getting ticket for event:', id);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header Image Section */}
      <div className="relative h-[300px]">
        <img
          src={eventDetails.imageUrl}
          alt={eventDetails.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 py-6">
        {/* Title and Performers Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{eventDetails.title}</h1>
          <div className="text-gray-600">
            {eventDetails.performers.join(' - ')}
          </div>
        </div>

        {/* Date and Location Section */}
        <div className="mb-6">
          <div className="text-gray-600">
            <span className="font-medium">{eventDetails.date.weekday}, {eventDetails.date.day} {eventDetails.date.month}</span>
            <span className="block">{eventDetails.date.startTime} - {eventDetails.date.endTime}</span>
            <span className="block">{eventDetails.location}</span>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">ABOUT</h2>
          <p className="text-gray-600">{eventDetails.about}</p>
        </div>

        {/* Tickets Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">TICKETS</h2>
          {eventDetails.prices.map((ticket, index) => (
            <div key={index} className="flex justify-between items-center border-b border-gray-200 py-3">
              <div>
                <span className="font-medium">{ticket.phase}</span>
                <span className="block text-gray-600">KES {ticket.amount}</span>
              </div>
              <span className={`text-sm ${ticket.status === 'Sold Out' ? 'text-red-500' : 'text-green-500'}`}>
                {ticket.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center gap-4">
        <button
          onClick={handleFavorite}
          className="p-3 rounded-full border border-gray-200 hover:bg-gray-50"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-6 h-6 ${isFavorite ? 'fill-[#B43E8F] text-[#B43E8F]' : 'text-gray-600'}`}
          />
        </button>
        <button
          onClick={handleGetTicket}
          className="flex-1 bg-[#B43E8F] text-white py-3 px-6 rounded-full font-medium hover:bg-[#A03580] transition-colors"
        >
          Get a Ticket
        </button>
      </div>
    </div>
  );
};

export default EventDetailsPage;