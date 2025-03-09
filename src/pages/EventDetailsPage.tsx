import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, ArrowLeft } from 'lucide-react';

interface Ticket {
  section: string;
  phase: string;
  amount: number;
  status: string;
}

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
  tickets: Ticket[];
  imageUrl: string;
  about: string;
  organizer: string;
}

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = React.useState(false);

  // Mock event data with ticket sections
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
    tickets: [
      { section: 'VIP', phase: 'Phase 3', amount: 5000, status: 'Available' },
      { section: 'VIP', phase: 'Phase 1', amount: 4000, status: 'Sold Out' },
      { section: 'Regular', phase: 'Phase 3', amount: 3000, status: 'Available' },
      { section: 'Regular', phase: 'Phase 1', amount: 2000, status: 'Sold Out' },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fA%3D%3D',
    about: 'DESCENDANTS makes their highly anticipated Nairobi debut on April 5th at the legendary MUZE.',
    organizer: 'MUZE Club',
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
        <div className="text-gray-600 mb-6">{eventDetails.performers.join(' - ')}</div>
        <div className="text-gray-600 mb-6">
          <span className="font-medium">{eventDetails.date.weekday}, {eventDetails.date.day} {eventDetails.date.month}</span>
          <span className="block">{eventDetails.date.startTime} - {eventDetails.date.endTime}</span>
          <span className="block">{eventDetails.location}</span>
        </div>
        <h2 className="text-lg font-semibold mb-2">ABOUT</h2>
        <p className="text-gray-600 mb-6">{eventDetails.about}</p>
        <h2 className="text-lg font-semibold mb-4">TICKETS</h2>
        <div className="space-y-4">
          {['VIP', 'Regular'].map((section) => (
            <div key={section}>
              <h3 className="text-md font-semibold text-gray-800 mb-2">{section} Section</h3>
              {eventDetails.tickets
                .filter((ticket) => ticket.section === section)
                .map((ticket, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-md p-4 flex justify-between items-center border-l-4 border-[#B43E8F]"
                  >
                    <div>
                      <span className="text-lg font-medium">{ticket.phase}</span>
                      <span className="block text-gray-600">KES {ticket.amount}</span>
                    </div>
                    <span className={`text-sm font-semibold ${ticket.status === 'Sold Out' ? 'text-red-500' : 'text-green-500'}`}>
                      {ticket.status}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
