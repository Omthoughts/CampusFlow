import { useState } from 'react';
import { useAuthStore } from '../../lib/auth';
import { api } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [completedDeadlines, setCompletedDeadlines] = useState<Record<string, boolean>>({});

  // Query student dashboard API
  const { data: dashboardData } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    },
    refetchOnWindowFocus: true,
  });

  const priorityNotices = (dashboardData?.prioritySummary && dashboardData.prioritySummary.length > 0)
    ? dashboardData.prioritySummary
    : (dashboardData?.notices && dashboardData.notices.length > 0)
    ? dashboardData.notices
    : [
        { 
          id: '1', 
          title: 'CIE-I Exam Timetable Released', 
          publishedAt: '2026-10-02', 
          priority: 'URGENT', 
          category: 'EXAM',
          summary: { whatChanged: 'Timetable announced for FY and SY MCA students. Hall tickets required.' }
        }
      ];

  const featuredNotice = priorityNotices?.[0];
  const whatChanged = featuredNotice?.summary?.whatChanged || featuredNotice?.title || 'Continuous internal evaluation and lecture announcements released.';
  const whatToDo = featuredNotice?.summary?.requiredAction || 'Verify timetable, hall allocations and complete required departmental tasks.';
  const whenDue = featuredNotice?.summary?.deadline 
    ? new Date(featuredNotice.summary.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Oct 5, 2026 • 23:59 PM';
  
  const deadlines = dashboardData?.deadlines || [
    { 
      id: '1', 
      title: 'Submit DBMS Assignment 1', 
      dueAt: '2026-10-05T23:59:00', 
      type: 'SUBMISSION', 
      subject: 'Database Systems',
      status: 'upcoming' 
    },
    { 
      id: '2', 
      title: 'Mid-term Project Proposal', 
      dueAt: '2026-10-25T17:00:00', 
      type: 'SUBMISSION', 
      subject: 'Software Eng',
      status: 'upcoming' 
    }
  ];

  const events = dashboardData?.events || [
    { 
      id: '1', 
      title: 'Tech Symposium 2026', 
      date: '2026-10-15T10:00:00', 
      venue: 'Main Auditorium',
      capacity: 200,
      registeredCount: 150,
      isRegistered: false
    }
  ];

  const toggleDeadline = (id: string) => {
    setCompletedDeadlines(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome & Audience Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-indigo-50/50 to-purple-50/50 p-6 md:p-8 rounded-3xl border border-indigo-100/80 shadow-sm relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-primary text-white tracking-wide uppercase">
              {user?.role === 'STUDENT' ? 'Official Student Portal' : `${user?.role} Preview Mode`}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Academic Session 2026–2027
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {studentFirstName} 👋
          </h1>
          <p className="text-slate-600 font-medium text-sm md:text-base max-w-xl">
            Here is your verified information-to-action layer for today. No missed circulars, no scattered WhatsApp chats.
          </p>
        </div>

        {/* Academic Audience Tag Card */}
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-indigo-100 shadow-sm z-10 flex flex-col justify-center space-y-1 text-xs">
          <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Your Audience Profile</p>
          <p className="font-bold text-slate-800 text-sm">{user?.department || 'MCA'}</p>
          <div className="flex items-center space-x-2 font-medium text-slate-500">
            <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">Year {user?.year || 'FY'}</span>
            <span>•</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">Div {user?.division || 'A'}</span>
            <span>•</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">Batch {user?.batch || 'F1'}</span>
          </div>
        </div>
      </div>

      {/* THE 3 GOLDEN QUESTIONS - INFORMATION TO ACTION LAYER */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Today's Action Focus
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                The 3 Core Questions: Answering what matters for your academic progress.
              </p>
            </div>
          </div>
          <Link 
            to="/calendar" 
            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center self-start sm:self-center"
          >
            View Full Schedule <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Question 1: What changed? */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-blue-50/40 border border-indigo-100/80 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-extrabold text-indigo-950 text-sm uppercase tracking-wider">
                What Changed?
              </h3>
            </div>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">
              {whatChanged}
            </p>
            <div className="pt-2">
              <Link to={`/notices/${featuredNotice?.id || '1'}`} className="inline-flex items-center text-xs font-bold text-indigo-700 hover:text-indigo-900">
                Read official circular <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
          </div>

          {/* Question 2: What do I need to do? */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100/80 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-extrabold text-emerald-950 text-sm uppercase tracking-wider">
                What Do I Need To Do?
              </h3>
            </div>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">
              {whatToDo}
            </p>
            <div className="pt-2">
              <Link to="/deadlines" className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-900">
                View submission checklist <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
          </div>

          {/* Question 3: When is it due? */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50/70 to-amber-50/40 border border-red-100/80 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-extrabold text-red-950 text-sm uppercase tracking-wider">
                When Is It Due?
              </h3>
            </div>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">
              <span className="text-red-700 font-extrabold block text-base">{whenDue}</span>
              Track submission milestones and examination timetables.
            </p>
            <div className="pt-2">
              <Link to="/calendar" className="inline-flex items-center text-xs font-bold text-red-700 hover:text-red-900">
                Add to your calendar <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Notices + Deadlines & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Urgent Notices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-bold text-slate-800">
                  Priority Notices
                </h2>
              </div>
              <Link to="/notices" className="text-xs font-bold text-primary hover:text-primary-dark flex items-center">
                View all announcements <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {priorityNotices.map((notice: any) => (
                <Link
                  key={notice.id}
                  to={`/notices/${notice.id}`}
                  className="block p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        notice.priority === 'URGENT' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {notice.priority}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {notice.category || 'ACADEMIC'}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(notice.publishedAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {notice.title}
                  </h3>
                  {notice.summary && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {typeof notice.summary === 'string' 
                        ? notice.summary 
                        : notice.summary?.whatChanged || notice.content || ''}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Academic Resource Access */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/notices"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex items-center space-x-3 group"
            >
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Official Notices</h4>
                <p className="text-xs text-slate-400 font-medium">All circulars</p>
              </div>
            </Link>

            <Link
              to="/deadlines"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex items-center space-x-3 group"
            >
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Deadlines</h4>
                <p className="text-xs text-slate-400 font-medium">Pending tasks</p>
              </div>
            </Link>

            <Link
              to="/calendar"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex items-center space-x-3 group"
            >
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Calendar</h4>
                <p className="text-xs text-slate-400 font-medium">Monthly agenda</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column (1 Col): Deadlines & Upcoming Events */}
        <div className="space-y-6">
          {/* Deadlines Widget */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-base">Deadlines & Tasks</h3>
              </div>
              <Link to="/deadlines" className="text-xs font-bold text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {deadlines.map((deadline: any) => {
                const isDone = !!completedDeadlines[deadline.id];
                return (
                  <div
                    key={deadline.id}
                    onClick={() => toggleDeadline(deadline.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                      isDone 
                        ? 'bg-slate-50 border-slate-200 opacity-60' 
                        : 'bg-amber-50/40 border-amber-100 hover:border-amber-300'
                    }`}
                  >
                    <button className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-emerald-600">
                      <CheckCircle2 className={`h-4 w-4 ${isDone ? 'text-emerald-600' : 'text-slate-300'}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-bold text-slate-900 truncate ${isDone ? 'line-through text-slate-400' : ''}`}>
                        {deadline.title}
                      </h4>
                      <p className="text-[11px] font-semibold text-red-600 mt-0.5">
                        Due: {new Date(deadline.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events Widget */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 text-base">Campus Events</h3>
              </div>
              <Link to="/events" className="text-xs font-bold text-primary hover:underline">
                Explore
              </Link>
            </div>

            <div className="space-y-3">
              {events.map((ev: any) => (
                <div key={ev.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                      Registration Open
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {ev.title}
                  </h4>
                  <div className="flex items-center text-xs text-slate-500 gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{ev.venue}</span>
                  </div>
                  <div className="pt-2">
                    <Link
                      to={`/events/${ev.id}`}
                      className="block text-center w-full py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      {user?.role === 'STUDENT' ? 'Reserve Seat' : 'View Event'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
