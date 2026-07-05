import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { HiOutlineExternalLink, HiOutlineRefresh, HiOutlineArrowLeft } from 'react-icons/hi';

function ScoreGauge({ score, label, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 50 ? '#ef4444' : score > 20 ? '#f59e0b' : '#10b981';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold font-mono" style={{ color }}>{score}%</span>
      </div>
      <p className="text-xs text-text-secondary mt-2 uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

export default function ScanReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChunk, setActiveChunk] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const docRes = await api.get(`/api/documents/${id}`);
      const doc = docRes.data;

      if (doc.scan_status === 'completed') {
        const reportRes = await api.get(`/api/documents/${id}/report`);
        setReport({ ...doc, reportData: reportRes.data });
        setPolling(false);
      } else if (doc.scan_status === 'processing' || doc.scan_status === 'queued') {
        setReport(doc);
        setPolling(true);
        setTimeout(fetchReport, 3000); // poll every 3s
      } else {
        setReport(doc);
        setPolling(false);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 gap-6">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Processing state
  if (report?.scan_status !== 'completed') {
    return (
      <div className="fade-in">
        <Link to="/history" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-6">
          <HiOutlineArrowLeft /> Back to History
        </Link>
        <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-auto">
          {report?.scan_status === 'failed' ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-accent-danger/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">❌</span>
              </div>
              <h2 className="text-xl font-bold text-accent-danger mb-2">Scan Failed</h2>
              <p className="text-sm text-text-secondary">{report?.scan_result?.summary || 'An error occurred during scanning.'}</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
                <HiOutlineRefresh className="text-3xl text-accent-primary animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Scanning in Progress</h2>
              <p className="text-sm text-text-secondary mb-4">
                Analyzing <span className="text-accent-primary font-medium">{report?.original_file_name}</span>
              </p>
              <div className="flex items-center justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-accent-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const rd = report.reportData;

  return (
    <div className="fade-in">
      <Link to="/history" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-6">
        <HiOutlineArrowLeft /> Back to History
      </Link>

      {/* Header with Scores */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{rd.file_name}</h1>
            <p className="text-sm text-text-secondary mt-1">{rd.summary}</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative">
              <ScoreGauge score={rd.overall_plagiarism_score} label="Plagiarism" />
            </div>
            <div className="relative">
              <ScoreGauge score={rd.overall_ai_score} label="AI Content" />
            </div>
          </div>
        </div>
      </div>

      {/* Split-Screen Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Document Text with Highlights */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Document Text</h2>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto space-y-3">
            {rd.chunks?.map((chunk) => {
              const isActive = activeChunk === chunk.index;
              const hasPlagiarism = chunk.plagiarism_score > 20;
              const hasAI = chunk.ai_score > 50;
              return (
                <div
                  key={chunk.index}
                  onClick={() => setActiveChunk(isActive ? null : chunk.index)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 text-sm leading-relaxed border ${
                    isActive
                      ? 'border-accent-primary/40 bg-accent-primary/5'
                      : hasPlagiarism
                      ? 'border-accent-danger/20 bg-accent-danger/5 hover:border-accent-danger/40'
                      : hasAI
                      ? 'border-accent-warning/20 bg-accent-warning/5 hover:border-accent-warning/40'
                      : 'border-transparent hover:border-border hover:bg-bg-elevated/30'
                  }`}
                >
                  <p className="text-text-primary">{chunk.text}</p>
                  <div className="flex gap-3 mt-2">
                    <span className={`text-xs font-mono font-bold ${chunk.plagiarism_score > 50 ? 'text-accent-danger' : chunk.plagiarism_score > 20 ? 'text-accent-warning' : 'text-accent-success'}`}>
                      P: {chunk.plagiarism_score}%
                    </span>
                    <span className={`text-xs font-mono font-bold ${chunk.ai_score > 50 ? 'text-accent-danger' : chunk.ai_score > 20 ? 'text-accent-warning' : 'text-accent-success'}`}>
                      AI: {chunk.ai_score}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sources & Analysis */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              {activeChunk !== null ? `Chunk ${activeChunk + 1} Sources` : 'Matched Sources'}
            </h2>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto space-y-4">
            {activeChunk !== null ? (
              // Show sources for active chunk
              (() => {
                const chunk = rd.chunks?.find((c) => c.index === activeChunk);
                const chunkSources = chunk?.sources || [];
                if (chunkSources.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-text-secondary text-sm">No sources matched for this chunk</p>
                    </div>
                  );
                }
                return chunkSources.map((source, i) => (
                  <div key={i} className="glass-card p-4 rounded-xl">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{source.title || source.url}</p>
                        <a href={source.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-accent-primary hover:underline flex items-center gap-1 mt-1 truncate">
                          {source.url} <HiOutlineExternalLink />
                        </a>
                      </div>
                      <span className="text-sm font-mono font-bold text-accent-warning">{source.similarity}%</span>
                    </div>
                  </div>
                ));
              })()
            ) : (
              // Show all matched sources
              rd.matched_sources?.length > 0 ? (
                rd.matched_sources.map((source, i) => (
                  <div key={i} className="glass-card p-4 rounded-xl">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{source.title || 'Web Source'}</p>
                        <a href={source.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-accent-primary hover:underline flex items-center gap-1 mt-1">
                          {source.url?.substring(0, 50)}... <HiOutlineExternalLink />
                        </a>
                      </div>
                      <span className="text-sm font-mono font-bold text-accent-warning">{source.similarity_score}%</span>
                    </div>
                    {source.matched_text && (
                      <p className="text-xs text-text-muted mt-2 p-2 bg-bg-primary rounded-lg">
                        "{source.matched_text.substring(0, 200)}..."
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-text-secondary text-sm">No matching web sources found</p>
                  <p className="text-text-muted text-xs mt-1">Click on a text chunk to see detailed analysis</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
