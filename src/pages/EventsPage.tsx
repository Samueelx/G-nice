import BackNavigationTemplate from '@/components/templates/BackNavigationTemplate';
import { Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';

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
  description?: string;
}

const EventsPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Sample data - in a real app, this would come from Redux store
  const events: Event[] = [
    {
      id: '1',
      title: 'Voices in Bloom',
      location: 'LA CUEVA, Nairobi',
      time: '05:00 PM - 10:00 PM',
      date: {
        day: 9,
        month: 'Mar'
      },
      price: 500,
      imageUrl: 'https://images.unsplash.com/photo-1522158637959-30385a09e0da?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Come celebrate Ugandan women in music! This Women\'s Month, join us for Voices in Bloom, a soulful evening dedicated to honouring the strength, evolution, and beauty of women in Ugandan music.'
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
      imageUrl: 'https://images.unsplash.com/photo-1546718876-2d05e6e23046?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Join us for an evening of prayer and reflection at the annual St. Francis Vigil.'
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
      imageUrl: 'https://images.unsplash.com/photo-1506469717960-433cebe3f181?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'The biggest car show in East Africa featuring the latest models and vintage collections.'
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
      imageUrl: 'https://plus.unsplash.com/premium_photo-1667238252716-0c38a5638947?q=80&w=1982&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      description: 'Learn the fundamentals of power electronics in this virtual workshop.'
    }
  ];

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handlePrev = () => {
    setCurrentIndex(current => (current === 0 ? events.length - 1 : current - 1));
  };

  const handleNext = () => {
    setCurrentIndex(current => (current === events.length - 1 ? 0 : current + 1));
  };

  return (
    <BackNavigationTemplate title='Events'>
      <div className="p-4 bg-gray-50 min-h-screen">
        {/* Desktop Carousel Section */}
        <div className="hidden md:block mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top picks from our staff</h2>
          
          <div className="relative w-full">
            <div 
              ref={carouselRef}
              className="relative overflow-hidden rounded-lg"
            >
              {events.map((event, index) => (
                <div 
                  key={event.id}
                  className={`${index === currentIndex ? 'block' : 'hidden'} transition-all duration-300`}
                >
                  <div className="grid md:grid-cols-2 gap-6 bg-white rounded-lg overflow-hidden shadow">
                    <div className="flex flex-col justify-between p-6">
                      <div>
                        <div className="flex items-start mb-4">
                          <div className="bg-white w-16 h-20 rounded-lg mr-4 text-center flex flex-col justify-center shadow">
                            <div className="text-gray-500 text-sm font-semibold">{event.date.month.toUpperCase()}</div>
                            <div className="text-black text-2xl font-bold">{event.date.day}</div>
                          </div>
                          <h3 className="text-2xl font-bold mt-2">{event.title}</h3>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center mb-2 text-[#B43E8F]">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center text-[#B43E8F]">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{event.time}</span>
                          </div>
                        </div>
                        
                        <p className="text-base mb-8">{event.description || 'Join us for this exciting event!'}</p>
                        
                        <div className="text-[#B43E8F] font-bold mb-4">
                          ${event.price.toFixed(2)}
                        </div>
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
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
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
              {events.map((_, index) => (
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

        {/* Original Mobile-friendly Events List */}
        <div>
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Upcoming events</h1>
              <button className="text-[#B43E8F] font-medium">See All</button>
            </div>

            {/* Category Pills */}
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
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2 text-sm opacity-80 shadow">
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
      </div>
    </BackNavigationTemplate>
  );
};

export default EventsPage;