import { useState } from 'react';
import { api } from '../../lib/api';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NoticeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        setError('This exact file has already been uploaded (Duplicate Hash).');
      } else {
        setError(err.response?.data?.error?.message || 'Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Upload Notice Document</h1>
        <p className="text-slate-500 mt-2">
          Upload an official PDF or image notice. The system will extract text, generate an AI summary, and prepare a draft for your review.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start space-x-3 border border-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
          <UploadCloud className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a file to upload</h3>
        <p className="text-slate-500 mb-6">Supports PDF, PNG, and JPG up to 5MB.</p>
        
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg" 
          onChange={handleFileChange}
        />
        <label 
          htmlFor="file-upload" 
          className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-colors"
        >
          Browse Files
        </label>

        {file && (
          <div className="mt-8 bg-slate-50 border border-slate-200 w-full max-w-md p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-slate-700 font-medium truncate">{file.name}</span>
            </div>
            <span className="text-slate-500 text-sm flex-shrink-0">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-lg shadow-md transition-all"
        >
          {isUploading ? 'Uploading & Processing...' : 'Process Document'}
        </button>
      </div>
    </div>
  );
}
