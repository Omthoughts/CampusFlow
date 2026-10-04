import { useState } from 'react';
import { Clock, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DeadlineItem {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  type: 'SUBMISSION' | 'EXAM' | 'REGISTRATION';
  subject?: string;
  noticeId?: string;
}

export default function DeadlinesList() {
  const [filter, setFilter] = useState<'upcoming' | 'overdue' | 'completed' | 'all'>('upcoming');
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const deadlines: DeadlineItem[] = [
    { 
      id: '1', 
      title: 'Submit DBMS Assignment 1', 
      description: 'First practical assignment for Database Management Systems. Upload ER diagrams and SQL scripts.',
      dueAt: '2026-10-05T23:59:00Z', 
      type: 'SUBMISSION', 
      subject: 'Database Systems',
      noticeId: '1'
    },
    { 
      id: '2', 
      title: 'Tech Symposium Registration Deadline', 
      description: 'Final date to register for competitive workshop tracks and secure attendee lunch pass.',
      dueAt: '2026-10-10T18:00:00Z', 
      type: 'REGISTRATION'
    },
    { 
      id: '3', 
      title: 'Software Engineering Project Proposal', 
      description: 'Submit project abstract, technology stack selection, and group members list signed by guide.',
      dueAt: '2026-10-25T17:00:00Z', 
      type: 'SUBMISSION', 
      subject: 'Software Engineering'
    },
    { 
      id: '4', 
      title: 'Mid-term Lab Journal Submission', 
      description: 'Submit verified lab journal for Web Technologies experiments 1 to 5.',
      dueAt: '2026-09-25T17:00:00Z', 
      type: 'SUBMISSION', 
      subject: 'Web Technologies'
    },
  ];

  const toggleComplete = (id: string) => {
    setCompletedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getStatus = (item: DeadlineItem) => {
    if (completedIds.includes(item.id)) return 'completed';
    const isOverdue = new Date(item.dueAt) < new Date();
    return isOverdue ? 'overdue' : 'upcoming';
  };

  const filteredDeadlines = deadlines.filter(d => {
    const status = getStatus(d);
    if (filter === 'all') return true;
    return status === filter;
  });

  const totalCount = deadlines.length;
  const completedCount = completedIds.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-500" />
            Academic Deadlines
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Track, prioritize, and check off your academic submissions and tasks.
          </p>
        </div>

        {/* Completion Progress Badge */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 min-w-[220px]">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-500">Progress</span>
              <span className="text-primary">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-primary">
            {completedCount}/{totalCount} Done
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl w-fit border border-slate-200">
        {(['upcoming', 'overdue', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold capitalize transition-all ${
              filter === f 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {f} {f === 'upcoming' && `(${deadlines.filter(d => getStatus(d) === 'upcoming').length})`}
            {f === 'overdue' && `(${deadlines.filter(d => getStatus(d) === 'overdue').length})`}
            {f === 'completed' && `(${completedCount})`}
          </button>
        ))}
      </div>

      {/* Deadlines List */}
      <div className="space-y-4">
        {filteredDeadlines.length > 0 ? (
          filteredDeadlines.map((deadline) => {
            const isCompleted = completedIds.includes(deadline.id);
            const isOverdue = !isCompleted && new Date(deadline.dueAt) < new Date();
            
            return (
              <div 
                key={deadline.id}
                className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md ${
                  isCompleted 
                    ? 'border-slate-200 bg-slate-50/60 opacity-80' 
                    : isOverdue 
                    ? 'border-red-200' 
                    : 'border-slate-200'
                }`}
              >
                {/* Date Badge */}
                <div className={`flex-shrink-0 w-24 h-24 rounded-2xl flex flex-col items-center justify-center border ${
                  isCompleted
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : isOverdue 
                    ? 'bg-red-50 border-red-100 text-red-600' 
                    : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                  <span className="text-xs font-bold uppercase">
                    {new Date(deadline.dueAt).toLocaleString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-3xl font-extrabold">
                    {new Date(deadline.dueAt).getDate()}
                  </span>
                  <span className="text-[10px] font-semibold mt-0.5">
                    {new Date(deadline.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isCompleted 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : isOverdue 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isCompleted ? 'COMPLETED' : isOverdue ? 'OVERDUE' : 'UPCOMING'}
                      </span>
                      {deadline.subject && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {deadline.subject}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {deadline.type}
                      </span>
                    </div>

                    <h3 className={`text-lg font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {deadline.title}
                    </h3>

                    <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                      {deadline.description}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => toggleComplete(deadline.id)}
                      className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle className={`h-4 w-4 mr-1.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                      {isCompleted ? 'Completed (Click to undo)' : 'Mark as Done'}
                    </button>

                    {deadline.noticeId && (
                      <Link 
                        to={`/notices/${deadline.noticeId}`}
                        className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center"
                      >
                        Official Circular
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
            <Clock className="h-10 w-10 mx-auto opacity-40 text-amber-500" />
            <p className="text-base font-bold text-slate-700">No deadlines in this view</p>
            <p className="text-xs">Great job staying on top of your academic responsibilities!</p>
          </div>
        )}
      </div>
    </div>
  );
}
