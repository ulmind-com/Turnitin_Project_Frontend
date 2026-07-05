import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { HiOutlineChevronLeft, HiOutlineDocumentText, HiOutlineExternalLink } from 'react-icons/hi';

export default function ScanReport() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId;
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/api/documents/${id}`);
        setDoc(res.data);
        if (res.data.scan_status === 'completed' || res.data.scan_status === 'failed') {
          clearInterval(intervalId);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch document', error);
        clearInterval(intervalId);
        setLoading(false);
      }
    };

    fetchDoc();
    intervalId = setInterval(fetchDoc, 5000);
    return () => clearInterval(intervalId);
  }, [id]);

  if (loading || doc?.scan_status === 'pending' || doc?.scan_status === 'processing') {
    return (
      <div className="fade-in max-w-4xl mx-auto text-center py-20">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-accent-primary rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Analyzing Document...</h2>
        <p className="text-text-secondary">Please wait while we scan for plagiarism and AI content.</p>
        <p className="text-sm text-text-muted mt-4">This usually takes less than a minute.</p>
      </div>
    );
  }

  if (doc?.scan_status === 'failed') {
    return (
      <div className="fade-in max-w-4xl mx-auto">
        <div className="clean-card p-12 text-center bg-red-50 border-red-200">
          <h2 className="text-xl font-bold text-red-700 mb-2">Scan Failed</h2>
          <p className="text-red-600 mb-6">There was an error processing your document.</p>
          <Link to="/scan" className="btn-primary bg-red-600 hover:bg-red-700">Try Again</Link>
        </div>
      </div>
    );
  }

  const { scan_result } = doc;
  const isHighPlagiarism = scan_result?.plagiarism_score > 30;
  const isHighAI = scan_result?.ai_score > 30;

  return (
    <div className="fade-in max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/history" className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center text-text-secondary hover:bg-slate-50 transition-colors shadow-sm">
          <HiOutlineChevronLeft className="text-xl" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <HiOutlineDocumentText className="text-text-muted" /> {doc.original_file_name}
          </h1>
          <p className="text-sm text-text-secondary mt-1">Scanned on {new Date(doc.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="clean-card p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Summary</h2>
            <p className="text-text-secondary leading-relaxed">{scan_result?.summary}</p>
          </div>

          <div className="clean-card p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Original Text Content</h2>
            <div className="bg-slate-50 border border-border rounded-lg p-6 max-h-[600px] overflow-y-auto font-sans text-sm text-text-primary leading-loose">
              {doc.content}
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          {/* Similarity Score */}
          <div className="clean-card p-6 text-center">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">Similarity Score</h3>
            
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={isHighPlagiarism ? '#ef4444' : '#10b981'} strokeWidth="3" strokeDasharray={`${scan_result?.plagiarism_score}, 100`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${isHighPlagiarism ? 'text-red-600' : 'text-emerald-600'}`}>{scan_result?.plagiarism_score}%</span>
              </div>
            </div>
          </div>

          {/* AI Detection Score */}
          <div className="clean-card p-6 text-center">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">AI Detection</h3>
            
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={isHighAI ? '#ef4444' : '#10b981'} strokeWidth="3" strokeDasharray={`${scan_result?.ai_score}, 100`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${isHighAI ? 'text-red-600' : 'text-emerald-600'}`}>{scan_result?.ai_score}%</span>
              </div>
            </div>
          </div>

          {/* Matched Sources */}
          {scan_result?.matched_sources?.length > 0 && (
            <div className="clean-card overflow-hidden">
              <div className="p-4 border-b border-border bg-slate-50">
                <h3 className="text-sm font-semibold text-text-primary">Matched Sources</h3>
              </div>
              <div className="divide-y divide-border">
                {scan_result.matched_sources.map((source, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent-primary hover:underline break-all flex items-start gap-1">
                        <HiOutlineExternalLink className="flex-shrink-0 mt-1" />
                        {source.url}
                      </a>
                      <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{source.similarity_score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
