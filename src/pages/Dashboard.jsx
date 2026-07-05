import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { HiOutlineDocumentText, HiOutlineUpload, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/user/dashboard');
      setDashboard(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 relative z-10">
        <div className="skeleton h-10 w-64 mb-8 bg-accent-primary/20" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-none cyber-card" />)}
        </div>
        <div className="skeleton h-64 rounded-none cyber-card" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Core Credits',
      value: dashboard?.credits ?? 0,
      icon: HiOutlineDocumentText,
      color: 'text-neon-cyan',
      shadowColor: 'rgba(0,240,255,0.4)',
    },
    {
      label: 'Total Scans',
      value: dashboard?.total_scans ?? 0,
      icon: HiOutlineUpload,
      color: 'text-neon-purple',
      shadowColor: 'rgba(188,19,254,0.4)',
    },
    {
      label: 'Completed',
      value: dashboard?.completed_scans ?? 0,
      icon: HiOutlineCheckCircle,
      color: 'text-neon-green',
      shadowColor: 'rgba(0,255,65,0.4)',
    },
    {
      label: 'Active Protocol',
      value: dashboard?.active_plan?.name || 'NONE',
      icon: HiOutlineClock,
      color: dashboard?.active_plan ? 'text-neon-cyan' : 'text-neon-red',
      shadowColor: dashboard?.active_plan ? 'rgba(0,240,255,0.4)' : 'rgba(255,0,60,0.4)',
      isText: true,
    },
  ];

  return (
    <div className="space-y-8 fade-in relative z-10">
      {/* Header */}
      <div className="border-b border-accent-primary/20 pb-4 relative">
        <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-accent-primary shadow-[0_0_10px_rgba(0,240,255,1)]" />
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-widest uppercase">
          Welcome, <span className="text-neon-cyan glitch-hover">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-accent-primary font-mono text-xs uppercase tracking-[0.2em] mt-2 opacity-80">System Overview & Diagnostics</p>
      </div>

      {/* Pending Payment Banner */}
      {dashboard?.pending_payment && (
        <div className="cyber-card p-4 border-accent-warning flex items-center gap-4 pulse-glow bg-accent-warning/5">
          <div className="w-12 h-12 bg-accent-warning/20 border border-accent-warning flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
            <HiOutlineClock className="text-accent-warning text-2xl" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-display font-bold tracking-widest text-accent-warning uppercase text-neon-warning">Protocol Under Review</p>
            <p className="text-xs text-text-muted font-mono mt-1">Clearance pending verification. Credits will be allocated upon system approval.</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, shadowColor, isText }) => (
          <div key={label} className="cyber-card p-6 group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="text-[10px] text-text-secondary uppercase font-display tracking-[0.15em]">{label}</span>
              <div className="w-8 h-8 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                <Icon className={`text-2xl ${color}`} />
              </div>
            </div>
            <p className={`${isText ? 'text-xl' : 'text-4xl'} font-bold font-mono ${color} tracking-wider z-10 relative`} style={{ textShadow: `0 0 15px ${shadowColor}` }}>
              {value}
            </p>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/upload" className="cyber-card p-6 group cursor-pointer border-accent-primary/30 hover:border-accent-primary overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-2xl group-hover:bg-accent-primary/20 transition-colors" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-black border border-accent-primary flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
              <HiOutlineUpload className="text-2xl text-accent-primary" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-neon-cyan tracking-widest uppercase">Initialize Scan</h3>
              <p className="text-xs text-text-muted font-mono mt-1">Upload target document for deep AI analysis</p>
            </div>
          </div>
        </Link>

        <Link to="/plans" className="cyber-card p-6 group cursor-pointer border-accent-secondary/30 hover:border-accent-secondary overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary/5 rounded-full blur-2xl group-hover:bg-accent-secondary/20 transition-colors" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-black border border-accent-secondary flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(188,19,254,0.4)] transition-all" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
              <HiOutlineDocumentText className="text-2xl text-accent-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-neon-purple tracking-widest uppercase">Acquire Credits</h3>
              <p className="text-xs text-text-muted font-mono mt-1">Request higher clearance protocols</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Scans */}
      <div className="cyber-card">
        <div className="p-5 border-b border-accent-primary/20 flex justify-between items-center bg-black/40">
          <h2 className="text-sm font-display font-bold text-accent-primary tracking-[0.2em] uppercase">Data Logs (Recent)</h2>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-accent-primary animate-pulse" />
            <div className="w-1 h-1 bg-accent-primary animate-pulse delay-75" />
            <div className="w-1 h-1 bg-accent-primary animate-pulse delay-150" />
          </div>
        </div>
        {dashboard?.recent_documents?.length > 0 ? (
          <div className="divide-y divide-accent-primary/10">
            {dashboard.recent_documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/report/${doc.id}`}
                className="flex items-center justify-between p-4 px-6 hover:bg-accent-primary/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-xs font-mono text-accent-primary/50 group-hover:text-accent-primary transition-colors">
                    &gt;
                  </div>
                  <div>
                    <p className="text-sm font-mono text-text-primary group-hover:text-neon-cyan transition-colors">{doc.original_file_name}</p>
                    <p className="text-[10px] text-text-muted font-mono mt-1 uppercase tracking-widest">
                      {new Date(doc.created_at).toISOString().replace('T', ' ').substring(0, 19)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {doc.scan_status === 'completed' ? (
                    <>
                      <div className="text-right">
                        <p className="text-[9px] font-display text-text-muted uppercase tracking-[0.1em]">Plagiarism</p>
                        <p className={`text-sm font-mono font-bold mt-1 ${doc.plagiarism_score > 50 ? 'text-neon-red' : doc.plagiarism_score > 20 ? 'text-accent-warning' : 'text-neon-green'}`}>
                          {doc.plagiarism_score}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-display text-text-muted uppercase tracking-[0.1em]">AI Pattern</p>
                        <p className={`text-sm font-mono font-bold mt-1 ${doc.ai_score > 50 ? 'text-neon-red' : doc.ai_score > 20 ? 'text-accent-warning' : 'text-neon-green'}`}>
                          {doc.ai_score}%
                        </p>
                      </div>
                    </>
                  ) : (
                    <span className={`cyber-badge ${doc.scan_status === 'processing' ? 'badge-warning animate-pulse' : doc.scan_status === 'failed' ? 'badge-red' : 'badge-cyan'}`}>
                      {doc.scan_status}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-black/20">
            <HiOutlineDocumentText className="text-5xl text-accent-primary/20 mx-auto mb-4" />
            <p className="text-accent-primary font-mono text-xs uppercase tracking-widest">No target data found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
