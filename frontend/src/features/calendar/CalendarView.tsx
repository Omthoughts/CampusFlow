import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Filter,
  List,
  Grid,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CalendarItem {
  id: string;
  type: 'EVENT' | 'DEADLINE' | 'EXAM';
  title: string;
  dateStr: string; // YYYY-MM-DD
  time?: string;
  venue?: string;
  subject?: string;
  status?: string;
  whatChanged: string;
  actionRequired: string;
  dueInfo: string;
  link: string;
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026 (0-indexed month)
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-05');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'ALL' | 'EVENT' | 'DEADLINE' | 'EXAM'>('ALL');

  // Unified campus calendar entries answering the 3 Golden Questions
  const items: CalendarItem[] = [
    {
      id: 'item-1',
      type: 'EXAM',
      title: 'CIE-I Exam Timetable Released',
      dateStr: '2026-10-02',
      time: '10:00 AM',
      whatChanged: 'Official CIE-I schedule announced for FY MCA students.',
      actionRequired: 'Review your exam slots and room allocations on the notice board.',
      dueInfo: 'Exam starts on Oct 12, 2026.',
      link: '/notices/1'
    },
    {
      id: 'item-2',
      type: 'DEADLINE',
      title: 'Submit DBMS Assignment 1',
      dateStr: '2026-10-05',
      time: '11:59 PM',
      subject: 'Database Systems',
      status: 'upcoming',
      whatChanged: 'First practical assignment submission portal is now active.',
      actionRequired: 'Upload PDF and SQL scripts to the course LMS portal.',
      dueInfo: 'Due today (Oct 5) before midnight.',
      link: '/deadlines'
    },
    {
      id: 'item-3',
      type: 'DEADLINE',
      title: 'Tech Symposium Registration Deadline',
      dateStr: '2026-10-10',
      time: '06:00 PM',
      status: 'upcoming',
      whatChanged: 'Early bird and regular seat allotment closing.',
      actionRequired: 'Confirm workshop tracks and team leader details.',
      dueInfo: 'Registration closes promptly at 6:00 PM.',
      link: '/events/1'
    },
    {
      id: 'item-4',
      type: 'EVENT',
      title: 'Campus Tech Symposium 2026',
      dateStr: '2026-10-15',
      time: '10:00 AM - 05:00 PM',
      venue: 'Main Auditorium',
      whatChanged: 'Keynote speakers confirmed from leading tech companies.',
      actionRequired: 'Bring college ID card for badge verification at entrance.',
      dueInfo: 'Full day symposium on Oct 15.',
      link: '/events/1'
    },
    {
      id: 'item-5',
      type: 'EVENT',
      title: 'Annual Hackathon Orientation',
      dateStr: '2026-10-20',
      time: '02:00 PM',
      venue: 'Computer Center Lab 4',
      whatChanged: 'Rules and problem statements for the 36-hour hackathon unveiled.',
      actionRequired: 'Attend with team members to select problem tracks.',
      dueInfo: 'Orientation begins Oct 20 at 2:00 PM.',
      link: '/events/2'
    },
    {
      id: 'item-6',
      type: 'DEADLINE',
      title: 'Software Engineering Project Proposal',
      dateStr: '2026-10-25',
      time: '05:00 PM',
      subject: 'Software Eng',
      status: 'upcoming',
      whatChanged: 'Project synopsis template finalized by faculty coordinator.',
      actionRequired: 'Submit 2-page synopsis signed by project guide.',
      dueInfo: 'Hard deadline on Oct 25.',
      link: '/deadlines'
    }
  ];

  const filteredItems = items.filter(item => filterType === 'ALL' || item.type === filterType);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const setToday = () => {
    setCurrentDate(new Date(2026, 9, 1));
    setSelectedDateStr('2026-10-05');
  };

  // Calendar math for grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const getItemsForDate = (dateString: string) => {
    return filteredItems.filter(item => item.dateStr === dateString);
  };

  const selectedItems = filteredItems.filter(item => item.dateStr === selectedDateStr);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Events & Academic Calendar
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Personalized schedule: See What Changed, What to Do, and When it's Due.
          </p>
        </div>

        {/* View Switcher & Today */}
        <div className="flex items-center space-x-3">
          <button
            onClick={setToday}
            className="px-3.5 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 shadow-sm transition-all"
          >
            Today
          </button>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-800'}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-800'}`}
              title="Agenda List"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400 ml-1" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter:</span>
          {(['ALL', 'EXAM', 'DEADLINE', 'EVENT'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterType === type 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'All Items' : type === 'EXAM' ? 'Exams & Notices' : type === 'DEADLINE' ? 'Deadlines' : 'Events'}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center space-x-4 text-xs font-medium text-slate-500">
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></span>Exams</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>Deadlines</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-1.5"></span>Events</span>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Grid (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {monthName} {year}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                  aria-label="Next Month"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty leading padding days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/50"></div>
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayItems = getItemsForDate(dateStr);
                const isSelected = selectedDateStr === dateStr;
                const isToday = day === 5 && month === 9; // Highlight Oct 5 as current demo day

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={`h-20 sm:h-24 p-2 rounded-xl text-left transition-all flex flex-col justify-between border relative group ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/20 bg-indigo-50/40 shadow-sm' 
                        : isToday 
                        ? 'border-indigo-300 bg-white hover:border-primary/50' 
                        : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-sm font-bold ${
                        isSelected 
                          ? 'text-primary' 
                          : isToday 
                          ? 'bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' 
                          : 'text-slate-700'
                      }`}>
                        {day}
                      </span>
                      {dayItems.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {dayItems.length}
                        </span>
                      )}
                    </div>

                    {/* Day tags */}
                    <div className="space-y-1 overflow-hidden w-full">
                      {dayItems.slice(0, 2).map(it => (
                        <div 
                          key={it.id} 
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${
                            it.type === 'EXAM' 
                              ? 'bg-red-100 text-red-700' 
                              : it.type === 'DEADLINE' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {it.title}
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-semibold block">
                          +{dayItems.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Date Action Center */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Selected Date Schedule</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-primary">
                  {selectedItems.length} {selectedItems.length === 1 ? 'Action' : 'Actions'}
                </span>
              </div>

              {selectedItems.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CalendarIcon className="h-10 w-10 mx-auto opacity-30" />
                  <p className="text-sm font-semibold">No deadlines or events scheduled</p>
                  <p className="text-xs">Select dates highlighted with dots to view action plans.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedItems.map(item => (
                    <div 
                      key={item.id}
                      className="p-5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.type === 'EXAM' 
                            ? 'bg-red-100 text-red-700' 
                            : item.type === 'DEADLINE' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {item.type}
                        </span>
                        {item.time && (
                          <span className="text-xs font-semibold text-slate-500 flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                            {item.time}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-slate-900 text-base leading-snug">
                        {item.title}
                      </h4>

                      {/* 3 Golden Questions for the student */}
                      <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                          <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px] flex items-center gap-1 text-indigo-600">
                            <span>💡 What changed?</span>
                          </p>
                          <p className="text-slate-800 font-medium mt-0.5">{item.whatChanged}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                          <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px] flex items-center gap-1 text-emerald-600">
                            <span>📋 What do I need to do?</span>
                          </p>
                          <p className="text-slate-800 font-medium mt-0.5">{item.actionRequired}</p>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                          <p className="font-bold text-slate-500 uppercase tracking-wide text-[10px] flex items-center gap-1 text-red-600">
                            <span>⏰ When is it due?</span>
                          </p>
                          <p className="text-slate-800 font-bold mt-0.5">{item.dueInfo}</p>
                        </div>
                      </div>

                      <div className="pt-1 flex justify-end">
                        <Link 
                          to={item.link}
                          className="inline-flex items-center text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                        >
                          View Details & Submit
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {filteredItems.map(item => (
            <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl flex flex-col items-center justify-center min-w-[70px] ${
                  item.type === 'EXAM' 
                    ? 'bg-red-50 text-red-600 border border-red-100' 
                    : item.type === 'DEADLINE' 
                    ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}>
                  <span className="text-xs font-bold uppercase">{new Date(item.dateStr).toLocaleString('en-US', { month: 'short' })}</span>
                  <span className="text-2xl font-extrabold">{new Date(item.dateStr).getDate()}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.type === 'EXAM' ? 'bg-red-100 text-red-700' : item.type === 'DEADLINE' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {item.type}
                    </span>
                    {item.time && (
                      <span className="text-xs text-slate-400 font-medium flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.time}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <div className="text-xs text-slate-600 space-y-1 max-w-xl">
                    <p><strong className="text-slate-800">Action:</strong> {item.actionRequired}</p>
                    <p><strong className="text-red-600">Due:</strong> {item.dueInfo}</p>
                  </div>
                </div>
              </div>

              <Link
                to={item.link}
                className="self-end md:self-center px-4 py-2 bg-slate-100 hover:bg-primary hover:text-white rounded-lg text-xs font-bold text-slate-700 transition-all flex items-center space-x-1"
              >
                <span>Take Action</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
