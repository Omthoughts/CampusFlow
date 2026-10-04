import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Search, Sparkles, CheckCircle2, ArrowRight, X, Plus, Shield } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';

interface CampusEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  isRegistered: boolean;
  registrationDeadline?: string;
}

export default function EventsList() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canCreate = user?.role === 'ADMIN' || user?.role === 'FACULTY';
  const isStudent = user?.role === 'STUDENT';

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'registered'>('all');
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);

  const fallbackEvents: CampusEvent[] = [
    { 
      id: '1', 
      title: 'Campus Tech Symposium 2026', 
      description: 'Annual technical symposium featuring keynote talks on Cloud Architecture, AI in Production, and a competitive project exhibition.',
      date: '2026-10-15T10:00:00Z', 
      venue: 'Main Auditorium',
      capacity: 200,
      registeredCount: 150,
      isRegistered: false,
      registrationDeadline: '2026-10-10T18:00:00Z'
    },
    { 
      id: '2', 
      title: '36-Hour Hackathon Orientation', 
      description: 'Orientation session for college-wide hackathon. Track briefing, mentor introductions, and team formation support.',
      date: '2026-10-20T14:00:00Z', 
      venue: 'Lab 4 (Computer Center)',
      capacity: 60,
      registeredCount: 60,
      isRegistered: true,
      registrationDeadline: '2026-10-18T23:59:00Z'
    },
    { 
      id: '3', 
      title: 'Career & Internship Readiness Workshop', 
      description: 'Interactive session on technical interview preparation, GitHub portfolios, and resume engineering by alumni mentors.',
      date: '2026-10-28T11:00:00Z', 
      venue: 'Seminar Hall 2',
      capacity: 100,
      registeredCount: 42,
      isRegistered: false,
      registrationDeadline: '2026-10-27T17:00:00Z'
    }
  ];

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events');
      return res.data;
    }
  });

  const events: CampusEvent[] = (apiResponse?.data && Array.isArray(apiResponse.data)) 
    ? apiResponse.data 
    : fallbackEvents;

  const toggleRegistration = async (id: string, currentlyRegistered: boolean) => {
    if (!isStudent) return;
    setLoadingEventId(id);
    try {
      if (currentlyRegistered) {
        await api.delete(`/events/${id}/register`);
      } else {
        await api.post(`/events/${id}/register`);
      }
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (e) {
      console.error('Registration toggle failed:', e);
    } finally {
      setLoadingEventId(null);
    }
  };

  const filteredEvents = events.filter(ev => {
    const matchesSearch = 
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.description && ev.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === 'registered') {
      return matchesSearch && ev.isRegistered;
    }
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            Campus Events & Workshops
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Explore verified opportunities, technical symposiums, and college activities.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Conditionally rendered "+ Create Event" button - completely omitted for STUDENT */}
          {canCreate && (
            <Link
              to="/admin/events"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 transition-all flex-shrink-0"
              title="Create new event in Admin Portal"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </Link>
          )}

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search events, venues..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-full text-sm shadow-sm transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Students / Role Indicator for Staff */}
      {isStudent ? (
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl w-fit border border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'registered' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Registrations ({events.filter(e => e.isRegistered).length})
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/80 border border-purple-200 text-purple-950 px-5 py-3.5 rounded-2xl text-xs">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 font-extrabold uppercase bg-purple-200 text-purple-900 px-2.5 py-0.5 rounded-full text-[10px] tracking-wide">
              <Shield className="h-3 w-3" />
              {user?.role} View
            </span>
            <span className="font-medium text-purple-800">
              Event RSVP and registrations are student-exclusive actions. Staff accounts cannot register for student events.
            </span>
          </div>
          <Link 
            to="/admin/events" 
            className="inline-flex items-center font-bold text-purple-700 hover:text-purple-950 underline flex-shrink-0"
          >
            Manage Events in Admin Portal &rarr;
          </Link>
        </div>
      )}

      {/* Events Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          Loading campus events...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200 space-y-3">
          <Calendar className="h-12 w-12 mx-auto opacity-30 text-primary" />
          <p className="font-bold text-slate-700">No events found</p>
          <p className="text-xs">No active events matching your filter at this moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isFull = event.registeredCount >= (event.capacity || 100);
            const isLoadingThis = loadingEventId === event.id;
            
            return (
              <div 
                key={event.id}
                className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div className="p-6 md:p-7 space-y-4">
                  {/* Event Top Tags */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="p-2 bg-indigo-50 text-primary rounded-xl">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {isStudent && event.isRegistered ? (
                      <span className="inline-flex items-center text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Registered
                      </span>
                    ) : isFull ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                        Full
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        {(event.capacity || 100) - event.registeredCount} seats left
                      </span>
                    )}
                  </div>

                  {/* Event Details */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Venue & Capacity */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{event.registeredCount} / {event.capacity || 100} registered</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/events/${event.id}`}
                    className="text-xs font-bold text-slate-600 hover:text-primary transition-colors inline-flex items-center"
                  >
                    Details <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>

                  {isStudent ? (
                    <button
                      onClick={() => toggleRegistration(event.id, event.isRegistered)}
                      disabled={isLoadingThis || (!event.isRegistered && isFull)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                        event.isRegistered
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : isFull
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary-dark text-white'
                      }`}
                    >
                      {isLoadingThis 
                        ? 'Updating...' 
                        : event.isRegistered 
                        ? 'Cancel RSVP' 
                        : isFull 
                        ? 'Waitlist Full' 
                        : 'Register (RSVP)'}
                    </button>
                  ) : (
                    <Link
                      to="/admin/events"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors shadow-sm"
                    >
                      Manage in Admin
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
