import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Upload,
  FileText,
  AlertCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminNoticeManagement() {
  const navigate = useNavigate();

  const [noticeId, setNoticeId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenNotice = async () => {
    const trimmedId = noticeId.trim();

    if (!trimmedId) {
      setError('Enter a notice ID to continue.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.get(`/notices/${trimmedId}`);
      navigate(`/admin/notices/${trimmedId}/review`);
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message ||
        'Notice could not be found. Check the notice ID and try again.';

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Manage Notices
          </h1>
          <p className="text-slate-500 mt-2">
            Review, edit, and publish official campus notices.
          </p>
        </div>

        <Link
          to="/admin/notices/upload"
          className="inline-flex items-center justify-center gap-2 bg-primary text-white font-medium px-5 py-3 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Upload className="h-5 w-5" />
          Upload Notice
        </Link>
      </div>

      {/* Search / Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notices..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled
            className="px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="ALL">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Search and status filtering are ready in the interface, but the
            current backend does not provide an admin notice-list endpoint.
            The controls remain disabled until that API exists.
          </p>
        </div>
      </div>

      {/* Backend limitation / empty state */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
            <FileText className="h-7 w-7 text-slate-500" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-slate-900">
            Notice list is not available yet
          </h2>

          <p className="mt-2 max-w-2xl mx-auto text-slate-500">
            The current backend supports notice upload, editing, publishing,
            and individual notice retrieval, but it does not currently expose
            an admin endpoint for listing notices.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/admin/notices/upload"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload New Notice
            </Link>
          </div>
        </div>
      </div>

      {/* Existing Notice Lookup */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Search className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Open an Existing Notice
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Use an existing notice ID to open the review and editing screen.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
          <input
            type="text"
            value={noticeId}
            onChange={(e) => {
              setNoticeId(e.target.value);
              setError('');
            }}
            placeholder="Enter notice ID"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          <button
            type="button"
            onClick={handleOpenNotice}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Opening...' : 'Open Notice'}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* API requirements */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />

          <div>
            <h3 className="font-semibold text-amber-900">
              Backend requirement
            </h3>

            <p className="text-sm text-amber-800 mt-1">
              An admin notice-list endpoint is required to populate this
              screen with real notices and enable server-backed search and
              filtering. No mock notices are being displayed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}