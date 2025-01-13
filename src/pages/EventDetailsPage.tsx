import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, ArrowLeft } from 'lucide-react';

interface EventDetails {
  id: string;
  title: string;
  type: string;
  location: string;
  date: {
    day: number;
    month: string;
    weekday: string;
    time: string;
  };
  price: number;
  imageUrl: string;
  about: string;
  description: string[];
  rating: number;
}

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    throw new Error("Event ID is required");
  }

  const navigate = useNavigate();

  // In a real app, this would come from your Redux store
  const eventDetails: EventDetails = {
    id: '1',
    title: 'Oliver Tree',
    type: 'Concert',
    location: 'Kahawa Sukari, Nairobi',
    date: {
      day: 29,
      month: 'January',
      weekday: 'Tuesday',
      time: '10:00 PM - End',
    },
    price: 45.9,
    imageUrl: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    about: 'When the concert Oliver Tree will be on stage in 10:00. List of songs: Forget It, When I\'m Down, All That and Life Goes On which will be sung on the Bung Karno surge stage.',
    description: [
      'Oliver Tree singing is Dec 29th at 10:00 PM',
      'Meet and greet with Oliver Tree on Dec 30th',
    ],
    rating: 4.8,
  };

  return (
    <div className="min-h-screen bg-white">
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
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {eventDetails.title}
          </h1>
          <div className="flex items-center text-gray-600">
            <span>{eventDetails.type}: {eventDetails.location}</span>
          </div>
        </div>

        {/* Date Section */}
        <div className="flex items-start gap-6 mb-6">
          <div>
            <div className="text-2xl font-bold">{eventDetails.date.day}</div>
            <div className="text-gray-600">{eventDetails.date.month}</div>
          </div>
          <div>
            <div className="font-medium">{eventDetails.date.weekday}</div>
            <div className="text-gray-600">{eventDetails.date.time}</div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">About this event:</h2>
          <p className="text-gray-600">{eventDetails.about}</p>
        </div>

        {/* Description Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <span className="text-yellow-400">★</span>
            <span>{eventDetails.rating}</span>
          </div>
          {eventDetails.description?.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-600 mb-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex items-center gap-4">
          <button className="p-3 border rounded-full">
            <Heart className="w-6 h-6 text-gray-600" />
          </button>
          <button className="flex-1 bg-red-500 text-white py-3 px-6 rounded-full font-medium">
            Get a Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
