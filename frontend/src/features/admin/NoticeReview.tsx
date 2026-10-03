import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Save, Send, AlertTriangle } from 'lucide-react';

export default function NoticeReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [summary, setSummary] = useState<any>({});
  const [audience, setAudience] = useState({ departmentId: '', year: '', division: '', batch: '' });

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await api.get(`/notices/${id}`);
        setNotice(res.data);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotice();
  }, [id]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await api.put(`/admin/notices/${id}`, {
        title: notice.title,
        content: notice.content,
        summary
      });
      alert('Draft saved successfully.');
    } catch (e) {
      alert('Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // First save draft state
      await api.put(`/admin/notices/${id}`, { title: notice.title, content: notice.content, summary });
      // Then publish
      await api.post(`/admin/notices/${id}/publish`, {
        departmentId: audience.departmentId || undefined,
        year: audience.year || undefined,
        division: audience.division || undefined,
        batch: audience.batch || undefined,
      });
      navigate('/admin/dashboard');
    } catch (e) {
      alert('Failed to publish notice.');
      setIsPublishing(false);
    }
  };

  if (isLoading) return <div className="p-8">Loading review...</div>;
  if (!notice) return <div className="p-8 text-red-500">Notice not found.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Review Notice</h1>
            <p className="text-slate-500">Status: <span className="uppercase font-semibold text-amber-500">{notice.status}</span></p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleSaveDraft} disabled={isSaving} className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50">
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button onClick={handlePublish} disabled={isPublishing} className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
            <Send className="h-4 w-4" />
            <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Original Source */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 font-semibold text-slate-700">
              Original Document
            </div>
            <div className="flex-1 p-0 overflow-hidden">
              <iframe 
                src={notice.sourceUrl} 
                className="w-full h-full border-none"
                title="Original Document"
              />
            </div>
          </div>
        </div>

        {/* Right Column: AI Extraction & Editing */}
        <div className="space-y-6 h-[700px] overflow-y-auto pr-2">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex space-x-3 text-blue-800 text-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p><strong>Review Required:</strong> The AI has extracted the following information. Please verify it against the original document before publishing. The AI output will never auto-publish.</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Notice Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input 
                type="text" 
                value={notice.title} 
                onChange={(e) => setNotice({...notice, title: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">What Changed (AI Summary)</label>
              <textarea 
                rows={3}
                value={summary.whatChanged || ''} 
                onChange={(e) => setSummary({...summary, whatChanged: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Who is Affected</label>
                <input 
                  type="text" 
                  value={summary.whoAffected || ''} 
                  onChange={(e) => setSummary({...summary, whoAffected: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                <input 
                  type="datetime-local" 
                  value={summary.deadline ? new Date(summary.deadline).toISOString().slice(0,16) : ''} 
                  onChange={(e) => setSummary({...summary, deadline: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Required Action</label>
              <input 
                type="text" 
                value={summary.requiredAction || ''} 
                onChange={(e) => setSummary({...summary, requiredAction: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Audience Targeting</h3>
            <p className="text-sm text-slate-500 mb-4">Select who should see this notice. Leave blank for college-wide.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                <select 
                  value={audience.year} 
                  onChange={(e) => setAudience({...audience, year: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">All Years</option>
                  <option value="FY">First Year (FY)</option>
                  <option value="SY">Second Year (SY)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Division</label>
                <select 
                  value={audience.division} 
                  onChange={(e) => setAudience({...audience, division: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">All Divisions</option>
                  <option value="A">Div A</option>
                  <option value="B">Div B</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
