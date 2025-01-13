import BackNavigationTemplate from '@/components/templates/BackNavigationTemplate';
import { Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  location: string;
  time: string;
  date: {
    day: number;
    month: string;
  };
  price: number;
  imageUrl: string;
}

const EventsPage = () => {
  const navigate = useNavigate();

  // Sample data - in a real app, this would come from Redux store
  const events: Event[] = [
    {
      id: '1',
      title: 'Oliver Tree Concert',
      location: 'Kahawa Sukari, Nairobi',
      time: '10:00 PM',
      date: {
        day: 29,
        month: 'Jan'
      },
      price: 500,
      imageUrl: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      id: '2',
      title: 'St. Francis Vigil',
      location: "Murang'a Town, Murang'a",
      time: '7:00 PM',
      date: {
        day: 19,
        month: 'Feb'
      },
      price: 0.0,
      imageUrl: 'https://images.unsplash.com/photo-1546718876-2d05e6e23046?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      id: '3',
      title: 'Space Ya Magari',
      location: "Imara Daima, Nairobi",
      time: '11:00 AM',
      date: {
        day: 21,
        month: 'Feb'
      },
      price: 350.0,
      imageUrl: 'https://images.unsplash.com/photo-1506469717960-433cebe3f181?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      id: '4',
      title: 'Power Electronics 101',
      location: "Online",
      time: '9:00 PM',
      date: {
        day: 19,
        month: 'Jan'
      },
      price: 30.0,
      imageUrl: 'https://plus.unsplash.com/premium_photo-1667238252716-0c38a5638947?q=80&w=1982&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ];

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <BackNavigationTemplate title='Events'>
      <div className="p-4 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Upcoming events</h1>
            <button className="text-[#B43E8F] font-medium">See All</button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-3 justify-center">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#B43E8F] text-white">
              <Circle className="w-4 h-4" />
              <span>Mine</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
              <Circle className="w-4 h-4" />
              <span>Food</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
              <Circle className="w-4 h-4" />
              <span>Concerts</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="relative bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleEventClick(event.id)}
            >
              <div className="relative">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-white rounded-full p-2 text-sm opacity-60">
                  <div className="font-bold">{event.date.day}</div>
                  <div className="text-gray-500">{event.date.month}</div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {event.title}
                </h3>
                <div className="flex justify-between items-center">
                  <div className="text-[#B43E8F]">
                    {event.location} - {event.time}
                  </div>
                  <div className="font-bold text-[#B43E8F]">
                    ${event.price.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BackNavigationTemplate>
  );
};

export default EventsPage;