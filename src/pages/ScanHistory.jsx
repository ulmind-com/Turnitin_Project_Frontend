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
      <div className="space-y-4 fade-in relative z-10">
        <div className="skeleton h-10 w-64 mb-8 bg-accent-primary/20" />
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 cyber-card" />)}
      </div>
    );
  }

  return (
    <div className="fade-in relative z-10">
      <div className="border-b border-accent-primary/20 pb-4 mb-8 relative">
        <div className="absolute bottom-0 right-0 w-32 h-[1px] bg-accent-primary shadow-[0_0_10px_rgba(0,240,255,1)]" />
        <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-widest">
          Data <span className="text-neon-cyan glitch-hover">Logs</span>
        </h1>
        <p className="text-text-muted font-mono text-xs mt-2 uppercase tracking-[0.2em]">Historical target acquisition records</p>
      </div>

      {documents.length > 0 ? (
        <div className="cyber-card bg-black/40 relative overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 px-6 border-b border-accent-primary/30 text-[10px] text-accent-primary font-display font-bold uppercase tracking-[0.2em] bg-accent-primary/5">
            <div className="col-span-4">Target Identity</div>
            <div className="col-span-2">System Status</div>
            <div className="col-span-2 text-center">Plagiarism</div>
            <div className="col-span-2 text-center">AI Pattern</div>
            <div className="col-span-2 text-right">Timestamp</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/report/${doc.id}`}
                className="grid grid-cols-12 gap-4 p-4 px-6 hover:bg-accent-primary/5 transition-colors items-center group relative"
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-accent-primary opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(0,240,255,1)] transition-opacity" />
                
                <div className="col-span-4 flex items-center gap-4 min-w-0">
                  <div className="w-8 h-8 bg-black border border-accent-primary/50 flex items-center justify-center flex-shrink-0 group-hover:border-accent-primary transition-colors" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
                    <HiOutlineDocumentText className="text-accent-primary/50 group-hover:text-neon-cyan transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-mono text-text-primary truncate group-hover:text-neon-cyan transition-colors">{doc.original_file_name}</p>
                    <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-display mt-0.5">{doc.file_type}</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className={`cyber-badge ${
                    doc.scan_status === 'completed' ? 'badge-green' :
                    doc.scan_status === 'processing' ? 'badge-warning animate-pulse' :
                    doc.scan_status === 'failed' ? 'badge-red' : 'badge-cyan'
                  }`}>
                    {doc.scan_status}
                  </span>
                </div>

                <div className="col-span-2 text-center">
                  {doc.scan_status === 'completed' ? (
                    <span className={`text-sm font-mono font-bold tracking-widest ${
                      doc.plagiarism_score > 50 ? 'text-neon-red' :
                      doc.plagiarism_score > 20 ? 'text-accent-warning' : 'text-neon-green'
                    }`}>
                      {doc.plagiarism_score}%
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted font-mono tracking-widest">—</span>
                  )}
                </div>

                <div className="col-span-2 text-center">
                  {doc.scan_status === 'completed' ? (
                    <span className={`text-sm font-mono font-bold tracking-widest ${
                      doc.ai_score > 50 ? 'text-neon-red' :
                      doc.ai_score > 20 ? 'text-accent-warning' : 'text-neon-green'
                    }`}>
                      {doc.ai_score}%
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted font-mono tracking-widest">—</span>
                  )}
                </div>

                <div className="col-span-2 flex flex-col items-end justify-center">
                  <p className="text-[10px] font-mono text-text-muted tracking-widest">{new Date(doc.created_at).toISOString().split('T')[0]}</p>
                  <div className="flex items-center gap-1 text-[9px] font-display text-accent-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    ACCESS REPORT <HiOutlineExternalLink />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="cyber-card p-16 text-center bg-black/40">
          <div className="w-20 h-20 bg-accent-primary/5 border border-accent-primary/20 flex items-center justify-center mx-auto mb-4" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
            <HiOutlineDocumentText className="text-4xl text-accent-primary/40" />
          </div>
          <h3 className="text-lg font-display font-bold text-accent-primary uppercase tracking-widest mb-2">No Records Found</h3>
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] mb-6">Database contains zero target acquisitions.</p>
          <Link to="/upload" className="btn-cyber inline-block">INITIALIZE FIRST SCAN</Link>
        </div>
      )}
    </div>
  );
}
