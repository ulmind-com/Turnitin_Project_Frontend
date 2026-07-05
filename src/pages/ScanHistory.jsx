import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { HiOutlineDocumentText, HiOutlineExternalLink } from 'react-icons/hi';

export default function ScanHistory() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/api/documents');
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 fade-in">
        <div className="skeleton h-8 w-48 mb-6" />
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Scan History</h1>
      <p className="text-text-secondary mb-8">All your scanned documents and results</p>

      {documents.length > 0 ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 px-6 border-b border-border text-xs text-text-muted uppercase tracking-wider font-medium">
            <div className="col-span-4">Document</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-center">Plagiarism</div>
            <div className="col-span-2 text-center">AI Score</div>
            <div className="col-span-2 text-right">Date</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/report/${doc.id}`}
                className="grid grid-cols-12 gap-4 p-4 px-6 hover:bg-bg-elevated/50 transition-colors items-center group"
              >
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center flex-shrink-0">
                    <HiOutlineDocumentText className="text-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{doc.original_file_name}</p>
                    <p className="text-xs text-text-muted uppercase">{doc.file_type}</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className={`badge ${
                    doc.scan_status === 'completed' ? 'badge-success' :
                    doc.scan_status === 'processing' ? 'badge-warning' :
                    doc.scan_status === 'failed' ? 'badge-danger' : 'badge-info'
                  }`}>
                    {doc.scan_status}
                  </span>
                </div>

                <div className="col-span-2 text-center">
                  {doc.scan_status === 'completed' ? (
                    <span className={`text-sm font-mono font-bold ${
                      doc.plagiarism_score > 50 ? 'text-accent-danger' :
                      doc.plagiarism_score > 20 ? 'text-accent-warning' : 'text-accent-success'
                    }`}>
                      {doc.plagiarism_score}%
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted">—</span>
                  )}
                </div>

                <div className="col-span-2 text-center">
                  {doc.scan_status === 'completed' ? (
                    <span className={`text-sm font-mono font-bold ${
                      doc.ai_score > 50 ? 'text-accent-danger' :
                      doc.ai_score > 20 ? 'text-accent-warning' : 'text-accent-success'
                    }`}>
                      {doc.ai_score}%
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted">—</span>
                  )}
                </div>

                <div className="col-span-2 text-right">
                  <p className="text-xs text-text-muted">{new Date(doc.created_at).toLocaleDateString()}</p>
                  <HiOutlineExternalLink className="text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-sm mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center">
          <HiOutlineDocumentText className="text-5xl text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No documents yet</h3>
          <p className="text-sm text-text-secondary mb-4">Upload your first document to get started</p>
          <Link to="/upload" className="btn-primary inline-block">Upload Document</Link>
        </div>
      )}
    </div>
  );
}
