import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

export default function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage = 'An unexpected error occurred.';
  let statusCode = 500;
  let statusText = 'Application Error';

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    statusText = error.statusText || (error.status === 404 ? 'Page Not Found' : 'Error');
    errorMessage = error.data?.message || (error.status === 404 ? 'The requested resource or page could not be located.' : errorMessage);
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10">
            {statusCode} • {statusText}
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-4">
            {statusCode === 404 ? "We couldn't find that page" : "Something went wrong"}
          </h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {errorMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all"
          >
            <Home className="h-3.5 w-3.5" />
            <span>CampusFlow Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
