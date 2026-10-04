import { useState } from 'react';
import { api } from '../../lib/api';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  Send,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NoticeUpload() {
  const [mode, setMode] = useState<'DOCUMENT' | 'DIRECT'>('DOCUMENT');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Direct Composer Form State
  const [directTitle, setDirectTitle] = useState('');
  const [directContent, setDirectContent] = useState('');
  const [directCategory, setDirectCategory] = useState<'GENERAL' | 'EXAM' | 'ACADEMIC' | 'EVENT'>('GENERAL');
  const [directPriority, setDirectPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [directAction, setDirectAction] = useState('');
  const [directDeadline, setDirectDeadline] = useState('');
  const [directDept, setDirectDept] = useState('MCA');
  const [directYear, setDirectYear] = useState('FY');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/admin/notices/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/admin/notices/${res.data.noticeId}/review`);
    } catch (err: any) {
      if (err.response?.data?.error?.code === 'DUPLICATE_FILE') {
        setError('This exact file has already been uploaded (Duplicate SHA-256 Hash). Check Manage Notices to view existing.');
      } else {
        setError(err.response?.data?.error?.message || 'Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDirectPublish = async (publishImmediately: boolean) => {
    if (!directTitle.trim() || !directContent.trim()) {
      setError('Please provide notice title and content.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const res = await api.post('/admin/notices', {
        title: directTitle,
        content: directContent,
        category: directCategory,
        priority: directPriority,
        status: publishImmediately ? 'PUBLISHED' : 'DRAFT',
        summary: {
          whatChanged: directTitle,
          whoAffected: `${directYear || 'All'} ${directDept || 'Students'}`,
          requiredAction: directAction || null,
          deadline: directDeadline || null,
        },
        audiences: [
          {
            departmentId: directDept || null,
            year: directYear || null,
            division: null,
            batch: null,
          }
        ]
      });

      if (publishImmediately) {
        navigate('/admin/notices');
      } else {
        navigate(`/admin/notices/${res.data.noticeId}/review`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create notice');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title & Context */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <UploadCloud className="h-8 w-8 text-primary" />
          Create or Upload Notice
        </h1>
        <p className="text-slate-500 mt-1">
          Distribute official college circulars with automated text extraction, AI summarization, and targeted audience routing.
        </p>
      </div>

      {/* Mode Selection Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setMode('DOCUMENT'); setError(null); }}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            mode === 'DOCUMENT'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Upload PDF / Circular Document</span>
        </button>
        <button
          onClick={() => { setMode('DIRECT'); setError(null); }}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            mode === 'DIRECT'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Direct Announcement Composer</span>
        </button>
      </div>

      {/* Process Stepper */}
      <div className="bg-slate-100/70 p-3.5 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-2 text-primary font-bold">
          <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">1</span>
          <span>{mode === 'DOCUMENT' ? 'Document Upload' : 'Notice Details'}</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">2</span>
          <span>AI Extraction & Verification</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">3</span>
          <span>Audience Targeting & Publish</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start space-x-3 border border-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-medium leading-relaxed">{error}</span>
        </div>
      )}

      {/* DOCUMENT UPLOAD MODE */}
      {mode === 'DOCUMENT' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-dashed border-slate-300 hover:border-primary/50 transition-colors rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
              <UploadCloud className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Select an official document to upload</h3>
            <p className="text-slate-500 text-xs mb-6 max-w-sm">
              Supports PDF, PNG, and JPG. Text will be extracted, verified by AI, and prepared for your review.
            </p>
            
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".pdf,.png,.jpg,.jpeg,.txt" 
              onChange={handleFileChange}
            />
            <label 
              htmlFor="file-upload" 
              className="bg-primary hover:bg-primary-dark text-white font-bold text-sm py-2.5 px-6 rounded-xl cursor-pointer transition-all shadow-md shadow-primary/20 hover:scale-105"
            >
              Choose File from Computer
            </label>

            {file && (
              <div className="mt-8 bg-slate-50 border border-slate-200 w-full max-w-md p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3 truncate">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-800 font-bold text-sm truncate">{file.name}</span>
                </div>
                <span className="text-slate-500 text-xs font-mono flex-shrink-0">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-primary/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isUploading ? 'Extracting & Generating Summary...' : 'Process Document & Review'}</span>
            </button>
          </div>
        </div>
      )}

      {/* DIRECT COMPOSER MODE */}
      {mode === 'DIRECT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Notice Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule for MCA Mini-Project Review & Presentation"
              value={directTitle}
              onChange={(e) => setDirectTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
              <select
                value={directCategory}
                onChange={(e) => setDirectCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="GENERAL">General Announcement</option>
                <option value="EXAM">Examination / Assessment</option>
                <option value="ACADEMIC">Academic / Submission</option>
                <option value="EVENT">Event / Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Priority</label>
              <select
                value={directPriority}
                onChange={(e) => setDirectPriority(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent (Requires Immediate Attention)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Official Notice Content *</label>
            <textarea
              rows={6}
              required
              placeholder="Write the full body of the notice or circular..."
              value={directContent}
              onChange={(e) => setDirectContent(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Golden Action Checklist items */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Action (Golden Question 2)</label>
              <input
                type="text"
                placeholder="e.g. Submit project abstract via college portal"
                value={directAction}
                onChange={(e) => setDirectAction(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date / Deadline (Golden Question 3)</label>
              <input
                type="date"
                value={directDeadline}
                onChange={(e) => setDirectDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Audience Routing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Department</label>
              <select
                value={directDept}
                onChange={(e) => setDirectDept(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white"
              >
                <option value="">All Departments (College-wide)</option>
                <option value="MCA">MCA (Master of Computer Applications)</option>
                <option value="COMP">Computer Engineering</option>
                <option value="IT">Information Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Year</label>
              <select
                value={directYear}
                onChange={(e) => setDirectYear(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white"
              >
                <option value="">All Years</option>
                <option value="FY">First Year (FY)</option>
                <option value="SY">Second Year (SY)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleDirectPublish(false)}
              disabled={isUploading}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleDirectPublish(true)}
              disabled={isUploading}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Publish Notice Immediately</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
