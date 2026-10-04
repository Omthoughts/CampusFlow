import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle2, AlertCircle, Pencil, Shield } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';

export default function EventDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FACULTY';
  const isStudent = user?.role === 'STUDENT';

  const { data: eventData, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}`);
      return res.data;
    },
    retry: false
  });

  const registerMutation = useMutation({
    mutationFn: async (register: boolean) => {
      if (register) {
        return api.post(`/events/${id}/register`);
      } else {
        return api.delete(`/events/${id}/register`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  // Fallback event data if offline or mocking
  const fallbackEvent = {
    id,
    title: 'Tech Symposium 2026',
    description: 'Join us for the annual Tech Symposium featuring guest speakers from top tech companies, workshops, and networking opportunities. Lunch will be provided for all registered attendees.',
    date: '2026-10-15T10:00:00Z',
    venue: 'Main Auditorium',
    capacity: 200,
    registeredCount: 150,
    registrationDeadline: '2026-10-10T23:59:00Z',
    isRegistered: false,
    organizer: 'Computer Dept'
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        Loading event details...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 my-8 shadow-sm">
        <div className="h-16 w-16 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-200">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Event Unavailable</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          This event either does not exist, is an unpublished draft, or registration is not open.
        </p>
        <Link 
          to="/events" 
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const event = eventData || fallbackEvent;
  const isFull = (event.registeredCount || 0) >= (event.capacity || 100);
  const isPastDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false;

  const handleRegisterToggle = () => {
    if (!isStudent) return;
    registerMutation.mutate(!event.isRegistered);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Link to="/events" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>

        {/* Conditionally rendered "Edit Event" button - completely omitted for STUDENT */}
        {canEdit && (
          <Link
            to="/admin/events"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            title="Manage and publish events in Admin Portal"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Manage Events</span>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-indigo-600 via-primary to-purple-700 relative flex items-end p-6 md:p-10">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 mb-4 inline-block">
              Organized by {event.organizer || 'Modern College'}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Main Info */}
          <div className="md:col-span-2 p-6 md:p-10">
            <h3 className="text-xl font-bold text-slate-900 mb-4">About the Event</h3>
            <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed whitespace-pre-line">
              <p>{event.description || 'No additional details provided for this event.'}</p>
            </div>
          </div>

          {/* Sidebar Info & Action */}
          <div className="p-6 md:p-10 bg-slate-50/50 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</span>
                <div className="flex items-center text-slate-800 font-semibold text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  {new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</span>
                <div className="flex items-center text-slate-800 font-semibold text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  {event.venue}
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Availability</span>
                <div className="flex items-center text-slate-800 font-semibold text-sm">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  {event.registeredCount || 0} / {event.capacity || 100} Registered
                </div>
                {isFull && <p className="text-xs font-bold text-red-500 mt-1">This event is currently full.</p>}
              </div>

              {event.registrationDeadline && (
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deadline to Register</span>
                  <div className="flex items-center text-slate-800 font-semibold text-sm">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    {new Date(event.registrationDeadline).toLocaleDateString()}
                  </div>
                  {isPastDeadline && <p className="text-xs font-bold text-red-500 mt-1">Registration has closed.</p>}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              {isStudent ? (
                <>
                  {event.isRegistered ? (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-center text-emerald-700 font-bold text-xs">
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        You're Registered
                      </div>
                      <button
                        onClick={handleRegisterToggle}
                        disabled={registerMutation.isPending}
                        className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 border border-slate-200 py-2.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 disabled:opacity-50"
                      >
                        {registerMutation.isPending ? 'Processing...' : 'Cancel Registration'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleRegisterToggle}
                      disabled={isFull || isPastDeadline || registerMutation.isPending}
                      className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                      {registerMutation.isPending ? 'Processing...' : 'Register (RSVP)'}
                    </button>
                  )}
                  
                  {!event.isRegistered && !isFull && !isPastDeadline && (
                    <p className="text-[11px] text-slate-500 text-center mt-3 font-medium flex items-center justify-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Instant confirmation
                    </p>
                  )}
                </>
              ) : (
                <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-5 text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-900">
                    <Shield className="h-3.5 w-3.5 text-purple-700" />
                    <span>{user?.role} Mode</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-950">Student Action Restricted</h4>
                    <p className="text-[11px] text-purple-700 mt-1 leading-relaxed">
                      Student RSVP and registration is disabled for administrator and faculty accounts. Staff can manage attendees and event details directly in the Admin Portal.
                    </p>
                  </div>
                  <Link
                    to="/admin/events"
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Open in Event Management
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
