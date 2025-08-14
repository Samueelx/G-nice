import BackNavigationTemplate from '@/components/templates/BackNavigationTemplate';
import { Circle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useGetEventsQuery, useGetFeaturedEventsQuery } from '@/services/api/eventsApi';
import { Alert, AlertDescription } from '@/components/ui/alert';


const EventsPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('mine');
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch events data using RTK Query
  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrorDetails,
  } = useGetEventsQuery({
    page: 1,
    limit: 20,
    category: selectedCategory === 'mine' ? undefined : selectedCategory,
  });

  // Fetch featured events for carousel
  const {
    data: featuredEvents,
    isLoading: featuredLoading,
    isError: featuredError,
  } = useGetFeaturedEventsQuery();

  const events = eventsData?.events || [];
  const carouselEvents = featuredEvents || events.slice(0, 4); // Fallback to first 4 events if no featured events

  const categories = [
    { id: 'mine', label: 'Mine' },
    { id: 'food', label: 'Food' },
    { id: 'concerts', label: 'Concerts' },
    { id: 'sports', label: 'Sports' },
    { id: 'arts', label: 'Arts' },
  ];

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePrev = () => {
    setCurrentIndex(current => 
      current === 0 ? carouselEvents.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex(current => 
      current === carouselEvents.length - 1 ? 0 : current + 1
    );
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-[#B43E8F]" />
      <span className="ml-2 text-gray-600">Loading events...</span>
    </div>
  );

  // Error component
  const ErrorMessage = ({ message }: { message: string }) => (
    <Alert className="mb-6">
      <AlertDescription>
        {message || 'Failed to load events. Please try again later.'}
      </AlertDescription>
    </Alert>
  );

  return (
    <BackNavigationTemplate title='Events'>
      <div className="p-4 bg-gray-50 min-h-screen">
        {/* Desktop Carousel Section */}
        {!featuredLoading && !featuredError && carouselEvents.length > 0 && (
          <div className="hidden md:block mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top picks from our staff</h2>
            
            <div className="relative w-full">
              <div 
                ref={carouselRef}
                className="relative overflow-hidden rounded-lg"
              >
                {carouselEvents.map((event, index) => (
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
              
              {carouselEvents.length > 1 && (
                <>
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
                    {carouselEvents.map((_, index) => (
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
                </>
              )}
            </div>
          </div>
        )}

        {/* Events List Section */}
        <div>
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Upcoming events</h1>
              <button className="text-[#B43E8F] font-medium">See All</button>
            </div>

            {/* Category Pills */}
            <div className="flex gap-3 justify-center overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-[#B43E8F] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Circle className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {eventsLoading && <LoadingSpinner />}

          {/* Error State */}
          {eventsError && (
            <ErrorMessage 
              message={
                'status' in eventsErrorDetails! 
                  ? `Error ${eventsErrorDetails.status}: Failed to load events`
                  : 'Network error: Please check your connection'
              } 
            />
          )}

          {/* Empty State */}
          {!eventsLoading && !eventsError && events.length === 0 && (
            <div className="text-center py-12">
              <Circle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">
                {selectedCategory === 'mine' 
                  ? 'No events available at the moment' 
                  : `No events found in ${selectedCategory} category`
                }
              </p>
            </div>
          )}

          {/* Events Grid */}
          {!eventsLoading && !eventsError && events.length > 0 && (
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
                      onError={(e) => {
                        // Fallback image on error
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2000&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-white rounded-full p-2 text-sm opacity-90 shadow">
                      <div className="font-bold">{event.date.day}</div>
                      <div className="text-gray-500">{event.date.month}</div>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {event.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div className="text-[#B43E8F] text-sm truncate flex-1 mr-2">
                        {event.location} - {event.time}
                      </div>
                      <div className="font-bold text-[#B43E8F] whitespace-nowrap">
                        {event.price === 0 ? 'FREE' : `$${event.price.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BackNavigationTemplate>
  );
};

export default EventsPage;