import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { HiOutlineDocumentText } from 'react-icons/hi';

export default function ScanHistory() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <h1 className="text-2xl font-bold text-text-primary">Scan History</h1>
          <p className="text-text-secondary mt-1">View and manage all your past document analyses.</p>
        </div>
        <Link to="/scan" className="btn-primary">New Scan</Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : documents.length > 0 ? (
        <div className="clean-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 px-6 border-b border-border bg-slate-50 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            <div className="col-span-4">Document</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-center">Similarity</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          <div className="divide-y divide-border bg-white">
            {documents.map((doc) => (
              <div key={doc.id} className="grid grid-cols-12 gap-4 p-4 px-6 items-center hover:bg-slate-50 transition-colors group">
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-primary group-hover:text-white transition-colors text-accent-primary">
                    <HiOutlineDocumentText className="text-xl" />
                  </div>
                  <span className="font-semibold text-text-primary truncate">{doc.original_file_name}</span>
                </div>
                
                <div className="col-span-2 text-sm text-text-secondary">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
                
                <div className="col-span-2">
                  <span className={`badge ${doc.scan_status === 'completed' ? 'badge-success' : doc.scan_status === 'processing' ? 'badge-warning' : doc.scan_status === 'failed' ? 'badge-danger' : 'badge-info'}`}>
                    {doc.scan_status}
                  </span>
                </div>
                
                <div className="col-span-2 text-center">
                  <span className={`font-bold ${doc.scan_status === 'completed' ? (doc.plagiarism_score > 30 ? 'text-red-600' : 'text-emerald-600') : 'text-slate-400'}`}>
                    {doc.scan_status === 'completed' ? `${doc.plagiarism_score}%` : '—'}
                  </span>
                </div>
                
                <div className="col-span-2 text-right">
                  <Link to={`/report/${doc.id}`} className="text-sm font-semibold text-accent-primary hover:underline">
                    View Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="clean-card p-16 text-center text-text-secondary bg-white">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <HiOutlineDocumentText className="text-4xl" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No documents found</h3>
          <p className="mb-6">Upload your first document to see the analysis results here.</p>
          <Link to="/scan" className="btn-primary">Start your first scan</Link>
        </div>
      )}
    </div>
  );
}
