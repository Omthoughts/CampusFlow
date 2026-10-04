import { Link } from 'react-router-dom';
import { FileSearch, ArrowRight, AlertCircle } from 'lucide-react';

export default function ReviewQueue() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Review Queue
        </h1>
        <p className="text-slate-500 mt-2">
          Review notices before they are published to students.
        </p>
      </div>

      {/* Queue unavailable notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
        <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />

        <div>
          <h2 className="font-semibold text-amber-900">
            Review queue data is not available yet
          </h2>

          <p className="text-sm text-amber-800 mt-1">
            The current backend does not provide an endpoint for listing
            notices awaiting review. No placeholder or mock notices are
            shown here.
          </p>
        </div>
      </div>

      {/* Empty state */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 sm:p-12">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <FileSearch className="h-8 w-8 text-slate-500" />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-slate-900">
            No review items to display
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Once an admin notice-list/review-queue API is available,
            notices requiring verification can be displayed here.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/admin/notices"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              Manage Notices
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/admin/notices/upload"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Upload Notice
            </Link>
          </div>
        </div>
      </div>

      {/* Backend requirement */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h2 className="font-semibold text-slate-800">
          Backend requirement
        </h2>

        <p className="text-sm text-slate-600 mt-1">
          A protected admin endpoint that returns reviewable notices
          is required to populate this queue with real data. The
          frontend does not create or assume review items.
        </p>
      </div>
    </div>
  );
}