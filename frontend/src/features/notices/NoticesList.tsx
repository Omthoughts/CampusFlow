import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { 
  FileText, 
  Search, 
  AlertCircle, 
  ArrowRight,
  X,
  Plus
} from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: 'EXAM' | 'ACADEMIC' | 'EVENT' | 'GENERAL';
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  publishedAt: string;
  audienceTarget?: string;
  audiences?: Array<{
    departmentId?: string | null;
    year?: string | null;
    division?: string | null;
    batch?: string | null;
  }>;
  summary?: {
    whatChanged?: string;
    whoAffected?: string;
    requiredAction?: string;
    deadline?: string;
  };
  isRead?: boolean;
}

export default function NoticesList() {
  const { user } = useAuthStore();
  const canPublish = user?.role === 'ADMIN' || user?.role === 'FACULTY';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Fetch notices from backend API
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const res = await api.get('/notices');
      return res.data;
    },
    refetchOnWindowFocus: true,
  });

  const fallbackNotices: NoticeItem[] = [
    { 
      id: '1', 
      title: 'CIE-I Exam Timetable Released', 
      content: 'The official timetable for Continuous Internal Evaluation I has been published. All MCA students must verify seating layouts.',
      publishedAt: '2026-10-02T09:00:00Z', 
      priority: 'URGENT', 
      category: 'EXAM', 
      audienceTarget: 'FY & SY MCA',
      isRead: false 
    },
    { 
      id: '2', 
      title: 'Campus Wi-Fi Maintenance Notice', 
      content: 'Scheduled network upgrades in the academic block between 2:00 AM and 5:00 AM on Sunday.',
      publishedAt: '2026-10-01T14:30:00Z', 
      priority: 'NORMAL', 
      category: 'GENERAL', 
      audienceTarget: 'College-wide',
      isRead: true 
    }
  ];

  const rawNotices: NoticeItem[] = (apiResponse?.data && Array.isArray(apiResponse.data))
    ? apiResponse.data
    : fallbackNotices;

  // Multi-criteria live filtering
  const filteredNotices = rawNotices.filter((n) => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || n.category === selectedCategory;
    const matchesPriority = selectedPriority === 'ALL' || n.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedPriority('ALL');
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'ALL' || selectedPriority !== 'ALL';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Official Announcements
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Verified official notices and circulars targeted to your academic cohort.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Live Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search circulars, exams, events..." 
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

          {canPublish && (
            <Link
              to="/admin/notices/upload"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>Create Notice</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between md:items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Category:</span>
          {(['ALL', 'EXAM', 'ACADEMIC', 'EVENT', 'GENERAL'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Only</option>
            <option value="HIGH">High Priority</option>
            <option value="NORMAL">Normal Priority</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 font-bold hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Notices Results Count */}
      <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1">
        <span>Showing {filteredNotices.length} official {filteredNotices.length === 1 ? 'notice' : 'notices'}</span>
        <span className="text-slate-400">All announcements verified by faculty</span>
      </div>

      {/* Notices Cards List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">Loading verified circulars...</div>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <Link 
              key={notice.id} 
              to={`/notices/${notice.id}`}
              className={`block p-6 md:p-8 hover:bg-slate-50 transition-all group ${
                !notice.isRead ? 'bg-indigo-50/20 border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    notice.priority === 'URGENT' 
                      ? 'bg-red-100 text-red-600' 
                      : notice.priority === 'HIGH'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {notice.priority === 'URGENT' ? (
                      <AlertCircle className="h-6 w-6" />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        notice.priority === 'URGENT' 
                          ? 'bg-red-100 text-red-700' 
                          : notice.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {notice.priority}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {notice.category}
                      </span>
                      {/* Audience Badge */}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        🎯 {notice.audienceTarget || (notice.audiences && notice.audiences.length > 0 ? (
                          [
                            notice.audiences[0].departmentId || 'All Depts',
                            notice.audiences[0].year,
                            notice.audiences[0].division ? `Div ${notice.audiences[0].division}` : null,
                            notice.audiences[0].batch ? `Batch ${notice.audiences[0].batch}` : null
                          ].filter(Boolean).join(' • ')
                        ) : 'College-wide')}
                      </span>
                      {!notice.isRead && (
                        <span className="inline-flex items-center text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {notice.title}
                    </h2>

                    <p className="text-xs text-slate-500 line-clamp-2 max-w-3xl">
                      {notice.summary?.whatChanged || notice.content}
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between text-xs text-slate-400 whitespace-nowrap self-start md:self-center">
                  <span>
                    {new Date(notice.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-primary font-bold inline-flex items-center mt-2 group-hover:translate-x-1 transition-transform">
                    View circular <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <FileText className="h-12 w-12 mx-auto opacity-30 text-primary" />
            <p className="text-base font-bold text-slate-700">No matching circulars found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keywords or resetting the category and priority filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
