import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentApi } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineCreditCard,
  HiOutlineShieldCheck,
  HiOutlineClock,
} from 'react-icons/hi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const getFileIcon = (type) => {
  if (type === 'application/pdf') return '📄';
  if (type?.includes('word') || type?.includes('openxml')) return '📝';
  return '📃';
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UploadDocument() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress]     = useState(0);

  // ── Drag handlers ──
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateAndSet(dropped);
  }, []);

  const validateAndSet = (f) => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error('Invalid file type. Please upload a TXT, PDF, or DOCX file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10 MB.');
      return;
    }
    setFile(f);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;
    if ((user?.credits ?? 0) <= 0) {
      toast.error('No credits remaining. Please purchase a plan.');
      navigate('/plans');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await documentApi.upload(formData);
      toast.success('Document uploaded! Redirecting to report…');
      await checkAuth(); // refresh credit count
      const docId = res.data?.document_id;
      navigate(docId ? `/report/${docId}` : '/history');
    } catch (err) {
      const msg = err.response?.data?.detail ?? 'Upload failed. Please try again.';
      toast.error(msg);
      if (err.response?.status === 402) navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">New Scan</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Upload a document to check for plagiarism and AI-generated content. 1 credit is consumed per submission.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* ── Left: Upload Zone ── */}
        <div className="md:col-span-2 space-y-5">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative bg-white rounded-2xl p-0 overflow-hidden transition-all duration-200 ${
              isDragging
                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-100'
                : 'border-2 border-dashed border-slate-300 hover:border-slate-400'
            }`}
          >
            {/* Dragging overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-50/70 z-10 flex items-center justify-center pointer-events-none">
                <div className="text-blue-600 font-bold text-lg animate-bounce">Drop it here!</div>
              </div>
            )}

            {!file ? (
              /* ── Empty state ── */
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 transition-colors ${isDragging ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <HiOutlineCloudUpload className="text-4xl" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Drag & drop your file here
                </h3>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  Supports PDF, DOCX, and TXT · Max 10 MB
                </p>
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer text-sm"
                >
                  Browse Files
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) validateAndSet(f);
                    e.target.value = '';
                  }}
                />
              </div>
            ) : (
              /* ── File Preview Card ── */
              <div className="p-8">
                <div className="flex items-start gap-5">
                  {/* File type icon */}
                  <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100/60 flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
                    {getFileIcon(file.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-slate-800 text-base truncate pr-2" title={file.name}>
                        {file.name}
                      </h4>
                      <button
                        onClick={() => setFile(null)}
                        className="w-7 h-7 flex-shrink-0 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors mt-0.5 cursor-pointer"
                        title="Remove file"
                      >
                        <HiOutlineX className="text-sm" />
                      </button>
                    </div>

                    {/* Metadata grid */}
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {[
                        { label: 'Size',   value: formatBytes(file.size) },
                        {
                          label: 'Modified',
                          value: new Date(file.lastModified).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          }),
                        },
                        {
                          label: 'Type',
                          value: file.name.split('.').pop()?.toUpperCase() ?? '—',
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
                          <p className="text-sm font-bold text-slate-800 truncate" title={value}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upload button */}
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-3 transition-all duration-200 shadow-sm active:scale-95 flex-1 text-sm gap-2 flex items-center justify-center disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <HiOutlineCloudUpload className="text-base" />
                        Upload &amp; Consume 1 Credit
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setFile(null)}
                    disabled={loading}
                    className="border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg px-5 py-3 transition-all duration-200 shadow-sm active:scale-95 text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* Progress bar (visible during upload) */}
                {loading && (
                  <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/5" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Info panel ── */}
        <div className="space-y-5">
          {/* Credit balance */}
          <div className={`bg-white rounded-2xl ring-1 ring-slate-200/60 p-5 shadow-sm ${
            (user?.credits ?? 0) === 0 ? 'bg-red-50/10 ring-red-200' : ''
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <HiOutlineCreditCard className="text-base text-slate-400" /> Your Credits
              </span>
              <span className={`text-xl font-extrabold ${
                (user?.credits ?? 0) === 0 ? 'text-red-600 bg-red-50 border border-red-100/50 px-2.5 py-0.5 rounded-md' : 'text-blue-600 bg-blue-50 border border-blue-100/50 px-2.5 py-0.5 rounded-md'
              }`}>
                {user?.credits ?? 0}
              </span>
            </div>
            {(user?.credits ?? 0) === 0 ? (
              <div className="mt-3">
                <p className="text-xs text-red-600 mb-3">Insufficient credits to perform a scan.</p>
                <button
                  onClick={() => navigate('/plans')}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2 w-full text-sm transition-all shadow-sm cursor-pointer"
                >
                  Get More Credits
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2 font-medium">1 credit will be deducted on upload.</p>
            )}
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 text-sm">How it works</h3>
            <ol className="space-y-4">
              {[
                { icon: HiOutlineCloudUpload, text: 'Upload a PDF, DOCX, or TXT (max 10 MB).' },
                { icon: HiOutlineCreditCard,  text: '1 credit is consumed per document.' },
                { icon: HiOutlineShieldCheck, text: 'Plagiarism &amp; AI scans run in the background.' },
                { icon: HiOutlineClock,       text: 'Results are ready in under a minute.' },
              ].map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xs">
                    {i + 1}
                  </div>
                  <p
                    className="text-xs text-slate-500 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: text }}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
