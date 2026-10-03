import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';

export default function EventsList() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mocked data
  const events = [
    { 
      id: '1', 
      title: 'Tech Symposium 2026', 
      date: '2026-10-15T10:00:00Z', 
      venue: 'Main Auditorium',
      capacity: 200,
      registered: 150,
      isRegistered: false,
      status: 'PUBLISHED'
    },
    { 
      id: '2', 
      title: 'Hackathon Orientation', 
      date: '2026-10-20T14:00:00Z', 
      venue: 'Lab 4',
      capacity: 50,
      registered: 50,
      isRegistered: true,
      status: 'PUBLISHED'
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Campus Events</h1>
          <p className="text-slate-500 mt-1 font-medium">Discover and register for upcoming events.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full md:w-64"
            />
          </div>
          <button className="flex items-center justify-center h-10 w-10 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const isFull = event.registered >= event.capacity;
          
          return (
            <Link 
              key={event.id} 
              to={`/events/${event.id}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group flex flex-col"
            >
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col justify-end relative">
                {event.isRegistered && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/30">
                    Registered
                  </div>
                )}
                <h2 className="text-xl font-bold text-white line-clamp-2">{event.title}</h2>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-slate-600 font-medium">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    {new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 font-medium">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    {event.venue}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 font-medium">
                    <Users className="h-4 w-4 mr-2 text-slate-400" />
                    {event.registered} / {event.capacity} seats filled
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-sm font-bold ${isFull ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isFull ? 'Registration Full' : 'Seats Available'}
                  </span>
                  <span className="text-sm font-bold text-primary group-hover:text-[#4338CA] transition-colors">
                    View Details &rarr;
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
