import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Search, 
  Sparkles, 
  Eye, 
  Trash2,
  UploadCloud
} from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  createdAt?: string;
  author?: {
    name: string;
    email: string;
  };
  summary?: {
    whatChanged: string;
    whoAffected: string;
    requiredAction: string | null;
    deadline: string | null;
  };
  audiences?: Array<{
    departmentId?: string | null;
    year?: string | null;
    division?: string | null;
    batch?: string | null;
  }>;
}

export default function AdminNoticesList() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ['admin-notices'],
    queryFn: async () => {
      const res = await api.get('/admin/notices');
      return res.data;
    }
  });

  const deleteNoticeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/notices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const publishNoticeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/admin/notices/${id}/publish`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices'] });
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteNoticeMutation.mutate(id);
    }
  };

  const notices: Notice[] = apiResponse?.data || [];

  const filteredNotices = notices.filter(n => {
    const matchesStatus = statusFilter === 'ALL' || n.status === statusFilter;
    const matchesSearch = 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Manage Notices & Circulars
          </h1>
          <p className="text-slate-500 mt-1">
            Review draft extractions, AI summaries, audience targeting, and published circulars.
          </p>
        </div>

        <Link
          to="/admin/notices/upload"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-md shadow-primary/20 transition-all self-start sm:self-center"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Status Tabs */}
        <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          {(['ALL', 'DRAFT', 'PUBLISHED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                statusFilter === tab 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'ALL' ? 'All Notices' : tab === 'DRAFT' ? 'Drafts / Pending Review' : 'Published'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notices by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Notices Table / List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading notices...</div>
        ) : filteredNotices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="h-10 w-10 mx-auto opacity-30 text-primary" />
            <p className="font-bold text-slate-700">No notices found</p>
            <p className="text-xs">Upload an official document to start the verification pipeline.</p>
            <Link
              to="/admin/notices/upload"
              className="inline-flex items-center text-xs font-bold text-primary hover:underline"
            >
              Upload document now →
            </Link>
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const isDraft = notice.status === 'DRAFT';
            return (
              <div 
                key={notice.id} 
                className={`p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDraft ? 'bg-amber-50/20' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      isDraft 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {notice.status}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {notice.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      notice.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {notice.priority}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {notice.title}
                  </h3>

                  {notice.summary?.whatChanged && (
                    <p className="text-xs text-slate-500 max-w-2xl">
                      <strong className="text-slate-700">Summary:</strong> {notice.summary.whatChanged}
                    </p>
                  )}

                  {notice.audiences && notice.audiences.length > 0 && (
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <span className="font-semibold">Audience:</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {notice.audiences[0].departmentId || 'All Depts'} 
                        {notice.audiences[0].year && ` • ${notice.audiences[0].year}`}
                        {notice.audiences[0].division && ` • Div ${notice.audiences[0].division}`}
                        {notice.audiences[0].batch && ` • Batch ${notice.audiences[0].batch}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 self-end md:self-center">
                  {isDraft ? (
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/notices/${notice.id}/review`}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Review & Publish</span>
                      </Link>

                      <button
                        onClick={() => publishNoticeMutation.mutate(notice.id)}
                        disabled={publishNoticeMutation.isPending}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1"
                        title="Publish directly"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Quick Publish</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/notices/${notice.id}/review`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/notices/${notice.id}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>View Live</span>
                      </Link>
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(notice.id, notice.title)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
