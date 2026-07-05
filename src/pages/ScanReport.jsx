import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { HiOutlineExternalLink, HiOutlineRefresh, HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineExclamationCircle } from 'react-icons/hi';

function HUDScoreGauge({ score, label, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 50 ? '#ff003c' : score > 20 ? '#f59e0b' : '#00ff41';
  const shadowColor = score > 50 ? 'rgba(255,0,60,0.5)' : score > 20 ? 'rgba(245,158,11,0.5)' : 'rgba(0,255,65,0.5)';

  return (
    <div className="flex flex-col items-center relative group">
      {/* Outer rotating ring */}
      <div className="absolute inset-0 border border-accent-primary/20 rounded-full border-t-accent-primary/80 animate-[spin_10s_linear_infinite]" style={{ width: size, height: size }} />
      <div className="absolute inset-2 border border-accent-secondary/20 rounded-full border-b-accent-secondary/80 animate-[spin_15s_linear_infinite_reverse]" style={{ width: size-16, height: size-16 }} />
      
      <svg width={size} height={size} className="-rotate-90 relative z-10">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth="6" fill="none"
          strokeLinecap="square"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 8px ${shadowColor})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center z-20" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold font-mono tracking-tighter" style={{ color, textShadow: `0 0 10px ${shadowColor}` }}>{score}%</span>
      </div>
      <div className="mt-4 px-3 py-1 border border-accent-primary/30 bg-accent-primary/5 clip-path-badge">
        <p className="text-[10px] text-accent-primary uppercase tracking-[0.2em] font-display font-bold">{label}</p>
      </div>
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
      <div className="space-y-6 fade-in relative z-10">
        <div className="skeleton h-8 w-48 bg-accent-primary/20" />
        <div className="grid grid-cols-2 gap-6">
          <div className="skeleton h-96 cyber-card" />
          <div className="skeleton h-96 cyber-card" />
        </div>
      </div>
    );
  }

  // Processing state
  if (report?.scan_status !== 'completed') {
    return (
      <div className="fade-in relative z-10">
        <Link to="/history" className="inline-flex items-center gap-2 text-[10px] font-mono text-accent-primary hover:text-neon-cyan transition-colors mb-6 uppercase tracking-widest">
          <HiOutlineArrowLeft /> ABORT & RETURN TO LOGS
        </Link>
        <div className="cyber-card p-12 text-center max-w-lg mx-auto bg-black/60 relative overflow-hidden">
          {report?.scan_status === 'failed' ? (
            <>
              <div className="w-20 h-20 bg-accent-danger/10 border border-accent-danger flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,0,60,0.3)] animate-pulse" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
                <HiOutlineExclamationCircle className="text-4xl text-neon-red" />
              </div>
              <h2 className="text-2xl font-display font-bold text-neon-red mb-2 tracking-widest uppercase">Scan Failed</h2>
              <p className="text-xs font-mono text-text-secondary uppercase">{report?.scan_result?.summary || 'System error during neural analysis.'}</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-accent-primary/10 border border-accent-primary flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,240,255,0.3)] relative" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
                <div className="absolute inset-0 border-2 border-transparent border-t-accent-primary rounded-full animate-spin" />
                <HiOutlineRefresh className="text-4xl text-neon-cyan animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h2 className="text-xl font-display font-bold text-neon-cyan mb-2 uppercase tracking-widest">Neural Analysis Active</h2>
              <p className="text-xs font-mono text-text-secondary mb-6 uppercase tracking-widest">
                Processing Target: <span className="text-accent-primary">{report?.original_file_name}</span>
              </p>
              
              <div className="w-full h-1 bg-black border border-accent-primary/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-accent-primary shadow-[0_0_10px_rgba(0,240,255,1)] animate-[scan-line_2s_linear_infinite]" style={{ animationName: 'slideRight' }} />
              </div>
              <div className="mt-4 flex justify-between text-[8px] font-mono text-accent-primary/50 uppercase tracking-[0.2em]">
                <span>Extracting Text</span>
                <span>Web Search</span>
                <span>AI Neural Net</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const rd = report.reportData;
  const overallRisk = rd.overall_plagiarism_score > 50 || rd.overall_ai_score > 50 ? 'HIGH' : (rd.overall_plagiarism_score > 20 || rd.overall_ai_score > 20 ? 'MEDIUM' : 'LOW');
  const riskColor = overallRisk === 'HIGH' ? 'text-neon-red' : overallRisk === 'MEDIUM' ? 'text-accent-warning' : 'text-neon-green';

  return (
    <div className="fade-in relative z-10">
      <Link to="/history" className="inline-flex items-center gap-2 text-[10px] font-mono text-accent-primary hover:text-neon-cyan transition-colors mb-6 uppercase tracking-widest">
        <HiOutlineArrowLeft /> BACK TO SYSTEM LOGS
      </Link>

      {/* Header with Scores */}
      <div className="cyber-card p-8 mb-6 bg-black/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex-1 w-full border-l-2 border-accent-primary pl-4">
            <div className="flex items-center gap-3 mb-2">
              <span className={`cyber-badge ${overallRisk === 'HIGH' ? 'badge-red' : overallRisk === 'MEDIUM' ? 'badge-warning border-accent-warning text-accent-warning' : 'badge-green'}`}>
                RISK LEVEL: {overallRisk}
              </span>
              <span className="text-[10px] font-mono text-text-muted tracking-widest">{new Date(report.scanned_at).toISOString().replace('T', ' ').substring(0, 19)}</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-text-primary uppercase tracking-widest">{rd.file_name}</h1>
            <p className="text-xs font-mono text-accent-primary/70 mt-2 uppercase tracking-[0.1em]">{rd.summary}</p>
          </div>
          
          <div className="flex items-center justify-center gap-8 md:gap-12 w-full md:w-auto bg-black/50 p-6 border border-white/5" style={{ clipPath: 'polygon(10% 0%, 100% 0, 100% 90%, 90% 100%, 0 100%, 0% 10%)' }}>
            <ScoreGauge score={rd.overall_plagiarism_score} label="PLAGIARISM INDEX" />
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-accent-primary/30 to-transparent" />
            <ScoreGauge score={rd.overall_ai_score} label="AI PROBABILITY" />
          </div>
        </div>
      </div>

      {/* Split-Screen Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Document Text with Highlights */}
        <div className="cyber-card bg-black/40 flex flex-col h-[700px]">
          <div className="p-4 border-b border-accent-primary/20 flex justify-between items-center bg-accent-primary/5">
            <h2 className="text-[11px] font-display font-bold text-accent-primary uppercase tracking-[0.2em]">Data Stream (Source Text)</h2>
            <HiOutlineShieldCheck className="text-accent-primary opacity-50 text-lg" />
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar relative">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
            
            {rd.chunks?.map((chunk) => {
              const isActive = activeChunk === chunk.index;
              const hasPlagiarism = chunk.plagiarism_score > 20;
              const hasAI = chunk.ai_score > 50;
              
              const borderClass = isActive 
                ? 'border-accent-primary bg-accent-primary/10 shadow-[inset_0_0_15px_rgba(0,240,255,0.2)]'
                : hasPlagiarism 
                ? 'border-accent-danger/30 bg-accent-danger/5 hover:border-accent-danger'
                : hasAI 
                ? 'border-accent-warning/30 bg-accent-warning/5 hover:border-accent-warning'
                : 'border-white/5 hover:border-accent-primary/30 hover:bg-white/5';
                
              return (
                <div
                  key={chunk.index}
                  onClick={() => setActiveChunk(isActive ? null : chunk.index)}
                  className={`p-4 cursor-pointer transition-all duration-300 border relative z-10 ${borderClass}`}
                  style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                >
                  <p className="text-[13px] font-sans leading-relaxed text-text-primary/90">{chunk.text}</p>
                  
                  <div className="flex gap-4 mt-3 pt-3 border-t border-white/10">
                    <span className={`text-[10px] font-mono font-bold tracking-widest ${chunk.plagiarism_score > 50 ? 'text-neon-red' : chunk.plagiarism_score > 20 ? 'text-accent-warning' : 'text-neon-green'}`}>
                      PLAG: {chunk.plagiarism_score}%
                    </span>
                    <span className={`text-[10px] font-mono font-bold tracking-widest ${chunk.ai_score > 50 ? 'text-neon-red' : chunk.ai_score > 20 ? 'text-accent-warning' : 'text-neon-green'}`}>
                      AI: {chunk.ai_score}%
                    </span>
                    <span className="text-[10px] font-mono text-text-muted tracking-widest ml-auto opacity-50">BLOCK {chunk.index.toString().padStart(3, '0')}</span>
                  </div>
                  
                  {isActive && <div className="absolute left-0 top-0 w-1 h-full bg-accent-primary shadow-[0_0_10px_rgba(0,240,255,1)]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sources & Analysis */}
        <div className="cyber-card bg-black/40 flex flex-col h-[700px]">
          <div className="p-4 border-b border-accent-secondary/20 flex justify-between items-center bg-accent-secondary/5">
            <h2 className="text-[11px] font-display font-bold text-accent-secondary uppercase tracking-[0.2em]">
              {activeChunk !== null ? `Target Vectors (Block ${activeChunk.toString().padStart(3, '0')})` : 'Global Cross-References'}
            </h2>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-accent-secondary animate-pulse" />
              <div className="w-1.5 h-1.5 bg-accent-secondary animate-pulse delay-75" />
            </div>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            {activeChunk !== null ? (
              // Show sources for active chunk
              (() => {
                const chunk = rd.chunks?.find((c) => c.index === activeChunk);
                const chunkSources = chunk?.sources || [];
                if (chunkSources.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                      <HiOutlineShieldCheck className="text-4xl text-neon-green mb-2" />
                      <p className="text-xs font-mono text-neon-green uppercase tracking-widest">No matched vectors.</p>
                      <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-1">Block appears original.</p>
                    </div>
                  );
                }
                return chunkSources.map((source, i) => (
                  <div key={i} className="border border-accent-secondary/30 bg-accent-secondary/5 p-4 relative group" style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-accent-secondary/50" />
                    <div className="flex items-start justify-between gap-4 relative z-10">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display font-bold text-text-primary truncate uppercase tracking-wide">{source.title || source.url}</p>
                        <a href={source.url} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-mono text-accent-secondary hover:text-neon-purple transition-colors flex items-center gap-1 mt-1 truncate">
                          [URL] {source.url} <HiOutlineExternalLink />
                        </a>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-1">Match</span>
                        <span className="text-sm font-mono font-bold text-neon-red drop-shadow-[0_0_5px_rgba(255,0,60,0.5)]">{source.similarity}%</span>
                      </div>
                    </div>
                  </div>
                ));
              })()
            ) : (
              // Show all matched sources
              rd.matched_sources?.length > 0 ? (
                rd.matched_sources.map((source, i) => (
                  <div key={i} className="border border-accent-secondary/20 bg-black/50 p-4 hover:border-accent-secondary/50 transition-colors" style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display font-bold text-text-primary truncate uppercase tracking-wide">{source.title || 'UNKNOWN NODE'}</p>
                        <a href={source.url} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-mono text-accent-secondary hover:text-neon-purple transition-colors flex items-center gap-1 mt-1">
                          [URL] {source.url?.substring(0, 50)}... <HiOutlineExternalLink />
                        </a>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-1">Vector</span>
                         <span className="text-sm font-mono font-bold text-neon-red drop-shadow-[0_0_5px_rgba(255,0,60,0.5)]">{source.similarity_score}%</span>
                      </div>
                    </div>
                    {source.matched_text && (
                      <div className="p-3 bg-black/80 border border-white/5 font-mono text-[10px] text-text-muted leading-relaxed">
                        &gt; "{source.matched_text.substring(0, 150)}..."
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <HiOutlineShieldCheck className="text-4xl text-neon-green mb-2" />
                  <p className="text-xs font-mono text-neon-green uppercase tracking-widest">No external vectors found.</p>
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest mt-1">Select a data block for detailed metrics.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
