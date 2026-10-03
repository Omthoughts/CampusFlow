import { useState } from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DeadlinesList() {
  const [filter, setFilter] = useState<'upcoming' | 'overdue' | 'all'>('upcoming');

  // Mocked data
  const deadlines = [
    { 
      id: '1', 
      title: 'Submit Assignment 1', 
      description: 'First assignment for Database Management Systems',
      dueAt: '2026-10-05T23:59:00Z', 
      type: 'SUBMISSION', 
      subject: 'DBMS',
      status: 'upcoming' 
    },
    { 
      id: '2', 
      title: 'Mid-term Project Proposal', 
      description: 'Submit project abstract and group members list.',
      dueAt: '2026-09-25T17:00:00Z', 
      type: 'SUBMISSION', 
      subject: 'Software Engineering',
      status: 'overdue' 
    },
  ];

  const filteredDeadlines = deadlines.filter(d => filter === 'all' || d.status === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Deadlines</h1>
        <p className="text-slate-500 mt-1 font-medium">Keep track of your academic submissions and tasks.</p>
      </div>

      <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg w-fit">
        {(['upcoming', 'overdue', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${
              filter === f 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredDeadlines.length > 0 ? (
          filteredDeadlines.map((deadline) => {
            const isOverdue = new Date(deadline.dueAt) < new Date();
            
            return (
              <div 
                key={deadline.id}
                className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md
                  ${isOverdue ? 'border-red-200' : 'border-slate-200'}`}
              >
                <div className={`flex-shrink-0 w-24 h-24 rounded-2xl flex flex-col items-center justify-center border
                  ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}
                >
                  <span className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                    {new Date(deadline.dueAt).toLocaleString('en-US', { month: 'short' })}
                  </span>
                  <span className={`text-3xl font-black ${isOverdue ? 'text-red-700' : 'text-amber-700'}`}>
                    {new Date(deadline.dueAt).getDate()}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {deadline.subject}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 capitalize">
                        {deadline.type.toLowerCase()}
                      </span>
                      {isOverdue && (
                        <span className="flex items-center text-xs font-bold text-red-600">
                          <AlertCircle className="h-3 w-3 mr-1" /> Overdue
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{deadline.title}</h2>
                    <p className="text-slate-600 font-medium text-sm">{deadline.description}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm font-bold text-slate-500">
                    <Clock className="h-4 w-4 mr-1.5" />
                    Due at {new Date(deadline.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center">
                  <button className="h-12 px-6 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Mark Done
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">You're all caught up!</h3>
            <p className="text-slate-500 font-medium mt-1">No {filter} deadlines to show.</p>
          </div>
        )}
      </div>
    </div>
  );
}
