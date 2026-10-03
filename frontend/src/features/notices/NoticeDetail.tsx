import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Sparkles, CheckCircle2 } from 'lucide-react';

export default function NoticeDetail() {
  const { id } = useParams();

  // Mocked data for MVP frontend
  const notice = {
    id,
    title: 'CIE-I Exam Timetable Released',
    publishedAt: '2026-10-02T09:00:00Z',
    publisher: 'Exam Dept',
    content: 'The official timetable for CIE-I has been published. All MCA students must ensure they are present 15 minutes before the scheduled exam time. Check the attached document for details.',
    sourceUrl: '#',
    summary: {
      whatChanged: 'CIE-I timetable is now available.',
      whoAffected: 'FY and SY MCA students.',
      requiredAction: 'Attend exams as per schedule. Arrive 15 mins early.',
      deadline: '2026-10-29',
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/notices" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Notices
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">URGENT</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">EXAM</span>
            <span className="text-sm font-medium text-slate-400 ml-auto">
              {new Date(notice.publishedAt).toLocaleDateString()} • Published by {notice.publisher}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
            {notice.title}
          </h1>
        </div>

        {/* AI Summary Section */}
        {notice.summary && (
          <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-slate-800">AI Summary</h3>
              <span className="text-xs font-medium text-slate-400 ml-2">(Assistive only)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/60 p-4 rounded-xl border border-white/40">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">What Changed</p>
                <p className="font-semibold text-slate-800">{notice.summary.whatChanged}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl border border-white/40">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Who is Affected</p>
                <p className="font-semibold text-slate-800">{notice.summary.whoAffected}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl border border-white/40">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Required Action</p>
                <p className="font-semibold text-slate-800">{notice.summary.requiredAction}</p>
              </div>
              {notice.summary.deadline && (
                <div className="bg-white/60 p-4 rounded-xl border border-white/40">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Deadline</p>
                  <p className="font-bold text-red-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    {notice.summary.deadline}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Original Content */}
        <div className="p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Official Content</h3>
          <div className="prose prose-slate max-w-none text-slate-700">
            <p>{notice.content}</p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Attachments & Source</h4>
            <a 
              href={notice.sourceUrl}
              className="inline-flex items-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-primary transition-colors"
            >
              <FileText className="h-4 w-4 mr-2 text-primary" />
              Original Source Document.pdf
              <Download className="h-4 w-4 ml-3 text-slate-400" />
            </a>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              * The original official document remains the authoritative source of truth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
