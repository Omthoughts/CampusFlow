import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  AlertTriangle, 
  FileText, 
  Eye, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';

export default function NoticeReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [summary, setSummary] = useState<any>({});
  const [audience, setAudience] = useState({ departmentId: 'MCA', year: 'FY', division: '', batch: '' });
  const [leftTab, setLeftTab] = useState<'DOCUMENT' | 'RAW_TEXT'>('DOCUMENT');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        let resData: any = null;
        try {
          const res = await api.get(`/admin/notices/${id}`);
          resData = res.data?.data || res.data;
        } catch (e) {
          const res = await api.get(`/notices/${id}`);
          resData = res.data?.data || res.data;
        }

        if (resData) {
          setNotice(resData);
          if (resData.summary) {
            setSummary(resData.summary);
          }
          if (resData.audiences && resData.audiences.length > 0) {
            const a = resData.audiences[0];
            setAudience({
              departmentId: a.departmentId || '',
              year: a.year || '',
              division: a.division || '',
              batch: a.batch || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load notice:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotice();
  }, [id]);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await api.put(`/admin/notices/${id}`, {
        title: notice.title,
        content: notice.content,
        category: notice.category,
        priority: notice.priority,
        summary,
        audience,
        status: notice.status || 'DRAFT'
      });
      showToast('Draft successfully updated.');
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // 1. Save all edited fields & audience
      await api.put(`/admin/notices/${id}`, {
        title: notice.title,
        content: notice.content,
        category: notice.category,
        priority: notice.priority,
        summary,
        audience,
        status: 'PUBLISHED'
      });

      // 2. Publish with targeting rules
      await api.post(`/admin/notices/${id}/publish`, {
        departmentId: audience.departmentId || undefined,
        year: audience.year || undefined,
        division: audience.division || undefined,
        batch: audience.batch || undefined,
      });

      showToast('Notice published successfully!');
      setTimeout(() => {
        navigate('/admin/notices');
      }, 500);
    } catch (e: any) {
      console.error('Publish error:', e);
      alert(e?.response?.data?.message || 'Failed to publish notice.');
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400">
        Loading notice verification details...
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="p-12 text-center text-red-500">
        <p className="font-bold text-lg">Notice not found.</p>
        <Link to="/admin/notices" className="text-xs text-primary font-bold hover:underline mt-2 inline-block">
          ← Return to Manage Notices
        </Link>
      </div>
    );
  }

  const isPublished = notice.status === 'PUBLISHED';
  const isImage = notice.sourceUrl && /\.(jpe?g|png|webp|gif)$/i.test(notice.sourceUrl);
  const docUrl = notice.sourceUrl 
    ? (notice.sourceUrl.startsWith('http') ? notice.sourceUrl : `http://localhost:3000${notice.sourceUrl}`)
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/admin/notices')} 
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              Review & Verify Notice
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                isPublished 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {notice.status}
              </span>
              <span className="text-xs text-slate-400">
                Created: {new Date(notice.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center space-x-2 bg-slate-100 border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 text-xs font-bold transition-all"
          >
            <Eye className="h-4 w-4" />
            <span>Student Preview</span>
          </button>

          <button 
            onClick={handleSaveDraft} 
            disabled={isSaving} 
            className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-xs font-bold transition-all"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button 
            onClick={handlePublish} 
            disabled={isPublishing} 
            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl shadow-md shadow-primary/20 text-xs font-bold transition-all"
          >
            <Send className="h-4 w-4" />
            <span>{isPublishing ? 'Publishing...' : isPublished ? 'Save & Republish' : 'Publish to Students'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Source Document & Extracted Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[750px]">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setLeftTab('DOCUMENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  leftTab === 'DOCUMENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Official Document View
              </button>
              <button
                onClick={() => setLeftTab('RAW_TEXT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  leftTab === 'RAW_TEXT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Extracted Text ({notice.content?.length || 0} chars)
              </button>
            </div>

            {docUrl && (
              <a
                href={docUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="flex-1 p-0 overflow-y-auto">
            {leftTab === 'DOCUMENT' ? (
              docUrl && !notice.sourceUrl.endsWith('.txt') ? (
                <div className="h-full flex flex-col">
                  <div className="bg-slate-100/70 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-200">
                    <span className="text-slate-600 font-semibold truncate max-w-xs">
                      📄 {notice.sourceUrl.split('/').pop()}
                    </span>
                    <button
                      onClick={() => setLeftTab('RAW_TEXT')}
                      className="text-primary font-bold text-[11px] hover:underline"
                    >
                      Switch to Extracted Text →
                    </button>
                  </div>
                  {isImage ? (
                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-900/5">
                      <img 
                        src={docUrl} 
                        alt="Original Document" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                      />
                    </div>
                  ) : (
                    <iframe 
                      src={docUrl} 
                      className="w-full flex-1 border-none min-h-[620px]"
                      title="Original Document"
                    />
                  )}
                </div>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <FileText className="h-16 w-16 mx-auto text-primary opacity-40" />
                  <h4 className="font-bold text-slate-800">Direct Notice Circular</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    This notice was generated via direct announcement or text extraction. Check the Extracted Text tab to view full raw content.
                  </p>
                  <button
                    onClick={() => setLeftTab('RAW_TEXT')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
                  >
                    View Parsed Text
                  </button>
                </div>
              )
            ) : (
              <div className="p-6">
                <pre className="font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {notice.content}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Extraction & Targeting Details */}
        <div className="space-y-6 h-[750px] overflow-y-auto pr-2">
          {/* Authoritative Warning Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex space-x-3 text-amber-900 text-xs">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">Authoritative Rule Enforcement:</p>
              <p className="mt-0.5 text-amber-800">
                The original document remains the source of truth. Please verify the AI-extracted fields, deadline, and target audience before publishing to students.
              </p>
            </div>
          </div>

          {/* Core Notice Meta */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Notice Details
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title</label>
              <input 
                type="text" 
                value={notice.title || ''} 
                onChange={(e) => setNotice({ ...notice, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={notice.category || 'GENERAL'}
                  onChange={(e) => setNotice({ ...notice, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="EXAM">EXAM</option>
                  <option value="ACADEMIC">ACADEMIC</option>
                  <option value="EVENT">EVENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={notice.priority || 'NORMAL'}
                  onChange={(e) => setNotice({ ...notice, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Golden Questions Verification */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl shadow-sm border border-indigo-100 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-indigo-200/50 pb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                AI Extracted Information-to-Action
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. What Changed? (Concise Notice Essence)
              </label>
              <textarea 
                rows={2}
                value={summary.whatChanged || ''} 
                onChange={(e) => setSummary({ ...summary, whatChanged: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-primary bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Who is Affected?
                </label>
                <input 
                  type="text" 
                  value={summary.whoAffected || ''} 
                  onChange={(e) => setSummary({ ...summary, whoAffected: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. When is it Due? (Deadline)
                </label>
                <input 
                  type="date" 
                  value={summary.deadline ? summary.deadline.slice(0, 10) : ''} 
                  onChange={(e) => setSummary({ ...summary, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. What do I need to do? (Action Requirement)
              </label>
              <input 
                type="text" 
                value={summary.requiredAction || ''} 
                onChange={(e) => setSummary({ ...summary, requiredAction: e.target.value })}
                placeholder="e.g. Check seating layout and report 15 mins early"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              />
            </div>
          </div>

          {/* Academic Audience Targeting */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Audience Targeting
            </h3>
            <p className="text-xs text-slate-500">
              Personalizes notices so only students matching these filters see this circular in their priority feed.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                <select 
                  value={audience.departmentId} 
                  onChange={(e) => setAudience({ ...audience, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="">All Departments (College-wide)</option>
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="COMP">Computer Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="CIVIL">Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
                <select 
                  value={audience.year} 
                  onChange={(e) => setAudience({ ...audience, year: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="">All Years</option>
                  <option value="FY">First Year (FY)</option>
                  <option value="SY">Second Year (SY)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Division</label>
                <select 
                  value={audience.division} 
                  onChange={(e) => setAudience({ ...audience, division: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="">All Divisions</option>
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Batch</label>
                <select 
                  value={audience.batch} 
                  onChange={(e) => setAudience({ ...audience, batch: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="">All Batches</option>
                  <option value="F1">Batch F1</option>
                  <option value="F2">Batch F2</option>
                  <option value="F3">Batch F3</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Live Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Student Feed Preview
              </span>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  notice.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {notice.priority}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {notice.category}
                </span>
                <span className="text-xs text-slate-400 ml-auto">Just now</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{notice.title}</h2>

              {summary.whatChanged && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p><strong>What Changed:</strong> {summary.whatChanged}</p>
                  {summary.requiredAction && (
                    <p><strong>Action:</strong> {summary.requiredAction}</p>
                  )}
                  {summary.deadline && (
                    <p className="text-red-600 font-bold"><strong>Due Date:</strong> {summary.deadline}</p>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {notice.content}
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Target: {audience.departmentId || 'All'} {audience.year || ''}</span>
                <span className="text-primary font-bold">View Details →</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
