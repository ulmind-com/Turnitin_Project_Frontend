import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { HiOutlineDocumentText } from 'react-icons/hi';

export default function ScanHistory() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCombinedStatus = (doc) => {
    const ai = doc.ai_scan_status;
    const plag = doc.plagiarism_scan_status;
    if (ai === 'failed' || plag === 'failed') return 'failed';
    if (ai === 'completed' && plag === 'completed') return 'completed';
    if (ai === 'processing' || plag === 'processing' || ai === 'queued' || plag === 'queued') return 'processing';
    return 'pending';
  };

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/api/documents');
        setDocuments(res.data.documents || []);
      } catch (error) {
        console.error('Failed to fetch scan history', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="fade-in max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Scan History</h1>
          <p className="text-slate-500 mt-1 font-medium">View and manage all your past document analyses.</p>
        </div>
        <Link to="/upload" className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer">
          New Scan
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-200/60 rounded-2xl animate-pulse" />)}
        </div>
      ) : documents.length > 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4.5 px-6 border-b border-slate-100 bg-slate-50/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-4">Document</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-center">Similarity</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => {
              const status = getCombinedStatus(doc);
              return (
                <div key={doc.id} className="grid grid-cols-12 gap-4 p-4 px-6 items-center hover:bg-slate-50/50 transition-colors group">
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 text-blue-600 shadow-sm">
                      <HiOutlineDocumentText className="text-xl" />
                    </div>
                    <span className="font-semibold text-slate-800 truncate">{doc.original_file_name}</span>
                  </div>
                  
                  <div className="col-span-2 text-sm text-slate-500 font-medium">
                    {new Date(doc.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </div>
                  
                  <div className="col-span-2">
                    <span className={`badge ${status === 'completed' ? 'badge-success' : status === 'processing' ? 'badge-warning' : status === 'failed' ? 'badge-danger' : 'badge-info'}`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <span className={`font-extrabold text-sm ${status === 'completed' ? (doc.plagiarism_score > 30 ? 'text-red-650' : 'text-emerald-600') : 'text-slate-400'}`}>
                      {status === 'completed' ? `${doc.plagiarism_score}%` : '—'}
                    </span>
                  </div>
                  
                  <div className="col-span-2 text-right flex justify-end gap-2.5">
                    <Link to={`/report/${doc.id}`} className="text-xs font-bold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:bg-slate-50 transition-all cursor-pointer">
                      Report
                    </Link>
                    <Link to={`/feedback-studio/${doc.id}`} className="text-xs font-bold text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg px-2.5 py-1.5 hover:bg-blue-600 transition-all cursor-pointer">
                      Grade
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-16 text-center text-slate-500 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <HiOutlineDocumentText className="text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No documents found</h3>
          <p className="mb-6 font-medium text-slate-500">Upload your first document to see the analysis results here.</p>
          <Link to="/upload" className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2.5 transition-all shadow-sm active:scale-95 cursor-pointer">Start your first scan</Link>
        </div>
      )}
    </div>
  );
}
