import { useAuthStore } from '../../lib/auth';
import { Clock, AlertCircle, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();

  // Mock data for MVP frontend before wiring queries
  const priorityNotices = [
    { id: '1', title: 'CIE-I Exam Timetable Released', date: '2026-10-02', priority: 'URGENT' },
  ];
  
  const deadlines = [
    { id: '1', title: 'Submit Assignment 1', dueAt: '2026-10-05T23:59:00', type: 'SUBMISSION', status: 'upcoming' },
  ];

  const events = [
    { id: '1', title: 'Tech Symposium 2026', date: '2026-10-15T10:00:00', venue: 'Main Auditorium' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Greeting */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Hello, {user?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Here's what you need to know today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Urgent Actions / Priority Summary */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                Priority Notices
              </h2>
              <Link to="/notices" className="text-sm font-semibold text-primary hover:text-[#4338CA] flex items-center">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {priorityNotices.length > 0 ? (
                priorityNotices.map((notice) => (
                  <div key={notice.id} className="p-6 hover:bg-slate-50 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        {notice.priority}
                      </span>
                      <span className="text-xs font-medium text-slate-400">{notice.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {notice.title}
                    </h3>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">No urgent notices today.</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          
          {/* Deadlines Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <Clock className="h-5 w-5 text-amber-500 mr-2" />
                Upcoming Deadlines
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {deadlines.length > 0 ? (
                deadlines.map((d) => (
                  <div key={d.id} className="p-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-50 flex flex-col items-center justify-center border border-amber-100">
                      <span className="text-xs font-bold text-amber-600">Oct</span>
                      <span className="text-sm font-black text-amber-700">05</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{d.title}</p>
                      <p className="text-xs text-slate-500 font-medium capitalize">{d.type.toLowerCase()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-slate-500">No upcoming deadlines.</div>
              )}
            </div>
          </div>

          {/* Events Widget */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <CalendarIcon className="h-5 w-5 text-emerald-500 mr-2" />
                Campus Events
              </h2>
            </div>
            <div className="p-4">
              {events.length > 0 ? (
                events.map((e) => (
                  <div key={e.id} className="group cursor-pointer">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{e.title}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                      <span className="mr-2">Oct 15, 10:00 AM</span> • <span className="ml-2 truncate">{e.venue}</span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-500">No upcoming events.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
