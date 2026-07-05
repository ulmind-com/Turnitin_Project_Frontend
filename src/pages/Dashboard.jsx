import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { HiOutlineDocumentText, HiOutlineShieldCheck, HiOutlineClock, HiOutlineChevronRight } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/dashboard');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl p-8 border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-text-secondary text-lg">You have <span className="font-bold text-accent-primary">{user?.credits} credits</span> remaining for scanning.</p>
        </div>
        <Link to="/scan" className="btn-primary py-3 px-6 text-base">
          Start a new scan
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="clean-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <HiOutlineDocumentText className="text-2xl text-accent-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Total Scans</p>
            <p className="text-3xl font-bold text-text-primary">{stats?.total_scans || 0}</p>
          </div>
        </div>
        
        <div className="clean-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <HiOutlineShieldCheck className="text-2xl text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Avg Plagiarism</p>
            <p className="text-3xl font-bold text-text-primary">{stats?.average_plagiarism > 0 ? `${stats.average_plagiarism}%` : '0%'}</p>
          </div>
        </div>
        
        <div className="clean-card p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
            <HiOutlineClock className="text-2xl text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Avg AI Content</p>
            <p className="text-3xl font-bold text-text-primary">{stats?.average_ai_score > 0 ? `${stats.average_ai_score}%` : '0%'}</p>
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="clean-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Recent Scans</h2>
          <Link to="/history" className="text-sm font-semibold text-accent-primary flex items-center gap-1 hover:underline">
            View all <HiOutlineChevronRight />
          </Link>
        </div>
        
        <div className="p-0">
          {stats?.recent_scans?.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.recent_scans.map((doc) => (
                <Link key={doc.id} to={`/report/${doc.id}`} className="block p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <HiOutlineDocumentText className="text-xl text-accent-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{doc.original_file_name}</p>
                        <p className="text-xs text-text-muted mt-1">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Similarity</p>
                        <p className={`font-bold ${doc.scan_status === 'completed' ? (doc.plagiarism_score > 30 ? 'text-red-600' : 'text-emerald-600') : 'text-slate-400'}`}>
                          {doc.scan_status === 'completed' ? `${doc.plagiarism_score}%` : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-text-secondary">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <HiOutlineDocumentText className="text-2xl text-slate-400" />
              </div>
              <p className="mb-4">No documents scanned yet.</p>
              <Link to="/scan" className="btn-primary">Start a scan</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
