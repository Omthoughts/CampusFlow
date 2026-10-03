import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Filter, AlertCircle } from 'lucide-react';

export default function NoticesList() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mocked data for MVP frontend
  const notices = [
    { id: '1', title: 'CIE-I Exam Timetable Released', date: '2026-10-02', priority: 'URGENT', category: 'EXAM', isRead: false },
    { id: '2', title: 'Campus Wi-Fi Maintenance', date: '2026-10-01', priority: 'NORMAL', category: 'GENERAL', isRead: true },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Official Notices</h1>
          <p className="text-slate-500 mt-1 font-medium">Stay updated with the latest announcements.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notices..." 
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notices.map((notice) => (
            <Link 
              key={notice.id} 
              to={`/notices/${notice.id}`}
              className={`block p-6 hover:bg-slate-50 transition-colors ${!notice.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${notice.priority === 'URGENT' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {notice.priority === 'URGENT' ? <AlertCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${notice.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {notice.priority}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {notice.category}
                      </span>
                      {!notice.isRead && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      )}
                    </div>
                    <h2 className={`text-lg font-bold text-slate-900 ${!notice.isRead ? 'font-extrabold' : ''}`}>
                      {notice.title}
                    </h2>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-400 md:text-right whitespace-nowrap">
                  {notice.date}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
