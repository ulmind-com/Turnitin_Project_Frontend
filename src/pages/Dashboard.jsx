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
      <div className="space-y-6">
        <div className="skeleton h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Available Credits',
      value: dashboard?.credits ?? 0,
      icon: HiOutlineDocumentText,
      color: 'text-accent-primary',
      bgColor: 'bg-accent-primary/10',
    },
    {
      label: 'Total Scans',
      value: dashboard?.total_scans ?? 0,
      icon: HiOutlineUpload,
      color: 'text-accent-secondary',
      bgColor: 'bg-accent-secondary/10',
    },
    {
      label: 'Completed',
      value: dashboard?.completed_scans ?? 0,
      icon: HiOutlineCheckCircle,
      color: 'text-accent-success',
      bgColor: 'bg-accent-success/10',
    },
    {
      label: 'Active Plan',
      value: dashboard?.active_plan?.name || 'No Plan',
      icon: HiOutlineClock,
      color: dashboard?.active_plan ? 'text-accent-primary' : 'text-accent-warning',
      bgColor: dashboard?.active_plan ? 'bg-accent-primary/10' : 'bg-accent-warning/10',
      isText: true,
    },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, <span className="text-accent-primary">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-text-secondary mt-1">Here's your scanning overview</p>
      </div>

      {/* Pending Payment Banner */}
      {dashboard?.pending_payment && (
        <div className="glass-card p-4 border-accent-warning/30 bg-accent-warning/5 flex items-center gap-3 pulse-glow">
          <div className="w-10 h-10 rounded-xl bg-accent-warning/20 flex items-center justify-center">
            <HiOutlineClock className="text-accent-warning text-xl" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-accent-warning">Payment Under Review</p>
            <p className="text-xs text-text-secondary">Your payment is being verified by our team. Credits will be added upon approval.</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon: Icon, color, bgColor, isText }) => (
          <div key={label} className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
              <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
                <Icon className={`text-xl ${color}`} />
              </div>
            </div>
            <p className={`${isText ? 'text-lg' : 'text-3xl'} font-bold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/upload" className="glass-card p-6 rounded-2xl group cursor-pointer hover:border-accent-primary/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary/20 transition-colors">
              <HiOutlineUpload className="text-2xl text-accent-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Upload Document</h3>
              <p className="text-sm text-text-secondary">Scan a PDF or DOCX for plagiarism & AI</p>
            </div>
          </div>
        </Link>

        <Link to="/plans" className="glass-card p-6 rounded-2xl group cursor-pointer hover:border-accent-secondary/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-secondary/10 flex items-center justify-center group-hover:bg-accent-secondary/20 transition-colors">
              <HiOutlineDocumentText className="text-2xl text-accent-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Get More Credits</h3>
              <p className="text-sm text-text-secondary">Browse plans and purchase scanning credits</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Scans */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">Recent Scans</h2>
        </div>
        {dashboard?.recent_documents?.length > 0 ? (
          <div className="divide-y divide-border">
            {dashboard.recent_documents.map((doc) => (
              <Link
                key={doc.id}
                to={`/report/${doc.id}`}
                className="flex items-center justify-between p-4 px-6 hover:bg-bg-elevated/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center">
                    <HiOutlineDocumentText className="text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{doc.original_file_name}</p>
                    <p className="text-xs text-text-muted">{new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.scan_status === 'completed' ? (
                    <>
                      <div className="text-right">
                        <p className="text-xs text-text-muted">Plagiarism</p>
                        <p className={`text-sm font-mono font-bold ${doc.plagiarism_score > 50 ? 'text-accent-danger' : doc.plagiarism_score > 20 ? 'text-accent-warning' : 'text-accent-success'}`}>
                          {doc.plagiarism_score}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-muted">AI</p>
                        <p className={`text-sm font-mono font-bold ${doc.ai_score > 50 ? 'text-accent-danger' : doc.ai_score > 20 ? 'text-accent-warning' : 'text-accent-success'}`}>
                          {doc.ai_score}%
                        </p>
                      </div>
                    </>
                  ) : (
                    <span className={`badge ${doc.scan_status === 'processing' ? 'badge-warning' : doc.scan_status === 'failed' ? 'badge-danger' : 'badge-info'}`}>
                      {doc.scan_status}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <HiOutlineDocumentText className="text-4xl text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No scans yet. Upload your first document!</p>
          </div>
        )}
      </div>
    </div>
  );
}
