import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { 
  ArrowLeft, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Share2, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Check,
  Pencil,
  AlertCircle
} from 'lucide-react';

export default function NoticeDetail() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const canEdit = user?.role === 'ADMIN' || user?.role === 'FACULTY';
  const [copied, setCopied] = useState(false);
  const [isActionCompleted, setIsActionCompleted] = useState<boolean>(() => {
    return localStorage.getItem(`notice_action_${id}`) === 'true';
  });

  const { data: apiResponse, isLoading, isError } = useQuery({
    queryKey: ['notice', id],
    queryFn: async () => {
      const res = await api.get(`/notices/${id}`);
      return res.data;
    },
    retry: false
  });

  // Fallback notice data if network delay or mock
  const fallbackNotice = {
    id,
    title: 'CIE-I Exam Timetable Released',
    publishedAt: '2026-10-02T09:00:00Z',
    publisher: 'Exam Department & MCA Coordinator',
    category: 'EXAM',
    priority: 'URGENT',
    content: 'The official timetable for Continuous Internal Evaluation I (CIE-I) has been published. All MCA students must verify room seating allocations and report 15 minutes prior to commencement with college ID cards.',
    sourceUrl: '/uploads/official_cie1_timetable.pdf',
    summary: {
      whatChanged: 'CIE-I examination schedule and hall allocations announced.',
      whoAffected: 'FY and SY MCA students.',
      requiredAction: 'Check seating layout in Lab 2/3 and report 15 mins early.',
      deadline: '2026-10-29',
    },
    audiences: [{ departmentId: 'MCA', year: 'FY', division: null, batch: null }]
  };

  const notice = apiResponse || fallbackNotice;

  const toggleAction = () => {
    const nextState = !isActionCompleted;
    setIsActionCompleted(nextState);
    localStorage.setItem(`notice_action_${id}`, String(nextState));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddToCalendar = () => {
    if (!notice?.summary?.deadline) return;
    const deadlineDate = new Date(notice.summary.deadline);
    const startStr = deadlineDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(notice.title);
    const details = encodeURIComponent(notice.summary.requiredAction || notice.content || '');
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startStr}/${startStr}`;
    window.open(gcalUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        Loading official circular...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4 my-8 shadow-sm">
        <div className="h-16 w-16 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-200">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Notice Unavailable</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          This notice either does not exist, is an unpublished draft, or is not targeted to your cohort profile.
        </p>
        <Link 
          to="/notices" 
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Announcements</span>
        </Link>
      </div>
    );
  }

  const priorityColor = notice.priority === 'URGENT' 
    ? 'bg-red-100 text-red-700 border-red-200'
    : notice.priority === 'HIGH'
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Breadcrumb & Share Actions */}
      <div className="flex items-center justify-between">
        <Link 
          to="/notices" 
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Announcements
        </Link>

        <div className="flex items-center space-x-2">
          {canEdit && (
            <Link
              to={`/admin/notices/${id}/review`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Edit or publish this notice in the Admin Portal"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Edit Notice</span>
            </Link>
          )}

          {notice.summary?.deadline && (
            <button
              onClick={handleAddToCalendar}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Add deadline to Google Calendar"
            >
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Add to Calendar</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Notice Meta Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${priorityColor}`}>
              {notice.priority || 'NORMAL'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
              {notice.category || 'GENERAL'}
            </span>

            {notice.audiences && notice.audiences.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                🎯 {notice.audiences[0].departmentId || 'College-wide'} {notice.audiences[0].year || ''}
              </span>
            )}

            <span className="text-xs font-medium text-slate-400 ml-auto flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {new Date(notice.publishedAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
            {notice.title}
          </h1>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>
              Official notice published by{' '}
              <strong className="text-slate-700">{notice.author?.name || notice.publisher || 'Department Administration'}</strong>
            </span>
          </div>
        </div>

        {/* AI Golden Questions Banner (The Information-to-Action Layer) */}
        {notice.summary && (
          <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Information-to-Action Summary
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">
                (Answers to the 3 Golden Questions)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Question 1: What changed? */}
              <div className="bg-white/80 p-4 rounded-2xl border border-indigo-100/60 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider mb-1.5">
                    1. What Changed?
                  </p>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">
                    {notice.summary.whatChanged}
                  </p>
                </div>
                {notice.summary.whoAffected && (
                  <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    <strong>Audience:</strong> {notice.summary.whoAffected}
                  </p>
                )}
              </div>

              {/* Question 2: What do I need to do? */}
              <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between shadow-sm ${
                isActionCompleted 
                  ? 'bg-emerald-50/60 border-emerald-200' 
                  : 'bg-white/80 border-indigo-100/60'
              }`}>
                <div>
                  <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider mb-1.5">
                    2. What Do I Need To Do?
                  </p>
                  <p className={`text-xs font-bold leading-relaxed ${
                    isActionCompleted ? 'text-emerald-800 line-through' : 'text-slate-800'
                  }`}>
                    {notice.summary.requiredAction || 'No direct submission required. Review circular details.'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={toggleAction}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isActionCompleted
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isActionCompleted ? 'Action Completed ✓' : 'Mark as Done'}</span>
                  </button>
                </div>
              </div>

              {/* Question 3: When is it due? */}
              <div className="bg-white/80 p-4 rounded-2xl border border-indigo-100/60 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider mb-1.5">
                    3. When Is It Due?
                  </p>
                  {notice.summary.deadline ? (
                    <div>
                      <p className="text-sm font-black text-red-600 flex items-center gap-1.5 mt-1">
                        <Clock className="h-4 w-4" />
                        {new Date(notice.summary.deadline).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Time: {new Date(notice.summary.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic mt-1">
                      No hard deadline specified for this notice.
                    </p>
                  )}
                </div>

                <Link
                  to="/calendar"
                  className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Calendar className="h-3 w-3" />
                  <span>View in Academic Calendar →</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Official Circular Text */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">
              Official Circular Content
            </h3>
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
              {notice.content}
            </div>
          </div>

          {/* Authoritative Document Source & Download */}
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Authoritative Source Document
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Official College Document & Notice Circular
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Authoritative legal record with administrative signatures
                  </p>
                </div>
              </div>

              {notice.sourceUrl ? (
                <a 
                  href={notice.sourceUrl.startsWith('http') ? notice.sourceUrl : `http://localhost:3000${notice.sourceUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <span>Open Document</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Direct Bulletin</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              * The original circular remains the authoritative reference. AI-generated summaries are assistive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
