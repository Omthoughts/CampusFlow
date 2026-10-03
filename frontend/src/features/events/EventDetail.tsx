import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function EventDetail() {
  const { id } = useParams();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Mocked data
  const event = {
    id,
    title: 'Tech Symposium 2026',
    description: 'Join us for the annual Tech Symposium featuring guest speakers from top tech companies, workshops, and networking opportunities. Lunch will be provided for all registered attendees.',
    date: '2026-10-15T10:00:00Z',
    venue: 'Main Auditorium',
    capacity: 200,
    registeredCount: 150,
    registrationDeadline: '2026-10-10T23:59:00Z',
    isRegistered: registered,
    organizer: 'Computer Dept'
  };

  const isFull = event.registeredCount >= event.capacity;
  const isPastDeadline = new Date(event.registrationDeadline) < new Date();

  const handleRegister = () => {
    setIsRegistering(true);
    // Simulate transaction
    setTimeout(() => {
      setRegistered(true);
      setIsRegistering(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/events" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-indigo-600 via-primary to-purple-700 relative flex items-end p-6 md:p-10">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 mb-4 inline-block">
              Organized by {event.organizer}
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
            <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed">
              <p>{event.description}</p>
            </div>
          </div>

          {/* Sidebar Info & Action */}
          <div className="p-6 md:p-10 bg-slate-50/50 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</span>
                <div className="flex items-center text-slate-800 font-semibold">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  {new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</span>
                <div className="flex items-center text-slate-800 font-semibold">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  {event.venue}
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Availability</span>
                <div className="flex items-center text-slate-800 font-semibold">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  {event.registeredCount} / {event.capacity} Registered
                </div>
                {isFull && <p className="text-xs font-bold text-red-500 mt-1">This event is currently full.</p>}
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deadline to Register</span>
                <div className="flex items-center text-slate-800 font-semibold">
                  <Clock className="h-5 w-5 mr-2 text-amber-500" />
                  {new Date(event.registrationDeadline).toLocaleDateString()}
                </div>
                {isPastDeadline && <p className="text-xs font-bold text-red-500 mt-1">Registration has closed.</p>}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              {event.isRegistered ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-center text-emerald-700 font-bold">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  You're Registered
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isFull || isPastDeadline || isRegistering}
                  className="w-full bg-primary hover:bg-[#4338CA] text-white py-3 px-4 rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isRegistering ? 'Processing...' : 'Register Now'}
                </button>
              )}
              
              {!event.isRegistered && !isFull && !isPastDeadline && (
                <p className="text-xs text-slate-500 text-center mt-3 font-medium flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Transaction-safe registration
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
