import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MapPin, 
  Users, 
  Clock, 
  Eye, 
  X,
  Sparkles,
  UploadCloud,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  venue: string;
  capacity?: number | null;
  registeredCount?: number;
  _count?: { registrations: number };
  status: 'DRAFT' | 'PUBLISHED';
  registrationDeadline?: string | null;
}

export default function AdminEventsList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const res = await api.get('/admin/events');
      return res.data;
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/admin/events', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Failed to create event');
    }
  });

  const publishEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/events/${id}/publish`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/events/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setVenue('');
    setCapacity('100');
    setDeadline('');
    setError(null);
  };

  const handleSave = (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    if (!title || !date || !venue) {
      setError('Please provide title, date, and venue.');
      return;
    }

    createEventMutation.mutate({
      title,
      description,
      date,
      venue,
      capacity: capacity ? parseInt(capacity) : null,
      registrationDeadline: deadline || null,
      status: targetStatus
    });
  };

  const events: EventItem[] = apiResponse?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Manage Campus Events
          </h1>
          <p className="text-slate-500 mt-1">
            Publish symposiums, hackathons, seminars, and track student RSVPs in real time.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 transition-all self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 space-y-3">
          <CalendarIcon className="h-12 w-12 mx-auto opacity-30 text-primary" />
          <p className="font-bold text-slate-700">No events found</p>
          <p className="text-xs">Create your first campus event to open RSVPs for students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const count = event.registeredCount ?? event._count?.registrations ?? 0;
            const cap = event.capacity || 100;
            const pct = Math.min(100, Math.round((count / cap) * 100));
            const isPast = new Date(event.date).getTime() < Date.now();
            const isDraft = event.status === 'DRAFT';

            return (
              <div 
                key={event.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                  isDraft ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        isPast 
                          ? 'bg-slate-100 text-slate-600 border-slate-200' 
                          : isDraft
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {isPast ? 'COMPLETED' : event.status}
                      </span>
                      {isDraft && (
                        <span className="text-[11px] text-amber-700 font-semibold">
                          (Hidden from students)
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  <div className="pt-2 flex flex-col gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span>{count} / {cap} RSVPs Registered</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>{pct}% Booked</span>
                      <span>{cap - count > 0 ? `${cap - count} spots left` : 'Full Capacity'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    {event.registrationDeadline 
                      ? `Deadline: ${new Date(event.registrationDeadline).toLocaleDateString()}` 
                      : 'Open until event date'}
                  </span>

                  <div className="flex items-center gap-2">
                    {isDraft ? (
                      <button
                        onClick={() => publishEventMutation.mutate(event.id)}
                        disabled={publishEventMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        title="Publish this draft event so students can view and register"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Publish</span>
                      </button>
                    ) : (
                      <Link
                        to={`/events/${event.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
                          deleteEventMutation.mutate(event.id);
                        }
                      }}
                      disabled={deleteEventMutation.isPending}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-slate-900">Create Campus Event</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Level CodeFest 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide context, tracks, speakers, or requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Seminar Hall 1"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RSVP Deadline</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleSave('DRAFT')}
                    disabled={createEventMutation.isPending}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave('PUBLISHED')}
                    disabled={createEventMutation.isPending}
                    className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold shadow-md shadow-primary/20 transition-all disabled:opacity-50"
                  >
                    {createEventMutation.isPending ? 'Publishing...' : 'Publish Event'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
