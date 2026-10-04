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

  const [audience, setAudience] = useState({
    departmentId: '',
    year: '',
    division: '',
    batch: '',
  });

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
        summary,
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
      // Save the latest edited notice content first.
      await api.put(`/admin/notices/${id}`, {
        title: notice.title,
        content: notice.content,
        summary,
      });

      // Publish using the supported audience fields.
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

  if (isLoading) {
    return (
      <div className="p-8 text-slate-500">
        Loading review...
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="p-8 text-red-500">
        Notice not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            aria-label="Back to admin dashboard"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Review Notice
            </h1>

            <p className="text-slate-500">
              Status:{' '}
              <span className="uppercase font-semibold text-amber-500">
                {notice.status}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isPublishing}
            className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing || isSaving}
            className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>
              {isPublishing ? 'Publishing...' : 'Publish'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Original Source */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px] lg:h-[700px]">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 font-semibold text-slate-700">
              Original Document
            </div>

            <div className="flex-1 p-0 overflow-hidden">
              {notice.sourceUrl ? (
                <iframe
                  src={notice.sourceUrl}
                  className="w-full h-full border-none"
                  title="Original Document"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 p-6 text-center">
                  Original document is not available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Extraction & Editing */}
        <div className="space-y-6 lg:h-[700px] lg:overflow-y-auto lg:pr-2">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex space-x-3 text-blue-800 text-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />

            <p>
              <strong>Review Required:</strong> The AI has extracted the
              following information. Please verify it against the original
              document before publishing. The AI output will never
              auto-publish.
            </p>
          </div>

          {/* Notice Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Notice Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>

              <input
                type="text"
                value={notice.title}
                onChange={(e) =>
                  setNotice({
                    ...notice,
                    title: e.target.value,
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                What Changed (AI Summary)
              </label>

              <textarea
                rows={3}
                value={summary.whatChanged || ''}
                onChange={(e) =>
                  setSummary({
                    ...summary,
                    whatChanged: e.target.value,
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Who is Affected
                </label>

                <input
                  type="text"
                  value={summary.whoAffected || ''}
                  onChange={(e) =>
                    setSummary({
                      ...summary,
                      whoAffected: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deadline
                </label>

                <input
                  type="datetime-local"
                  value={
                    summary.deadline
                      ? new Date(summary.deadline)
                          .toISOString()
                          .slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    setSummary({
                      ...summary,
                      deadline: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Required Action
              </label>

              <input
                type="text"
                value={summary.requiredAction || ''}
                onChange={(e) =>
                  setSummary({
                    ...summary,
                    requiredAction: e.target.value,
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Audience Targeting */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Audience Targeting
            </h3>

            <p className="text-sm text-slate-500">
              Select who should see this notice. Leave all fields blank
              for a college-wide notice.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Year
                </label>

                <select
                  value={audience.year}
                  onChange={(e) =>
                    setAudience({
                      ...audience,
                      year: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">All Years</option>
                  <option value="FY">First Year (FY)</option>
                  <option value="SY">Second Year (SY)</option>
                </select>
              </div>

              {/* Division */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Division
                </label>

                <select
                  value={audience.division}
                  onChange={(e) =>
                    setAudience({
                      ...audience,
                      division: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">All Divisions</option>
                  <option value="A">Division A</option>
                  <option value="B">Division B</option>
                </select>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Batch
                </label>

                <select
                  value={audience.batch}
                  onChange={(e) =>
                    setAudience({
                      ...audience,
                      batch: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">All Batches</option>
                  <option value="F1">Batch F1</option>
                  <option value="F2">Batch F2</option>
                  <option value="F3">Batch F3</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                Department targeting requires an existing department ID.
                The current frontend does not have a department-list API,
                so no department values are being fabricated here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}