import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentApi, dashboardApi } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineDocumentText,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlinePencilAlt,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
} from 'react-icons/hi';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatusBadge = ({ status }) => {
  const map = {
    completed: { label: 'Completed', cls: 'badge-success' },
    processing: { label: 'Processing', cls: 'badge-warning' },
    queued:     { label: 'Queued',     cls: 'badge-info'    },
    failed:     { label: 'Failed',     cls: 'badge-danger'  },
    pending:    { label: 'Pending',    cls: 'badge-info'    },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'badge-info' };
  return <span className={`badge ${cls} capitalize`}>{label}</span>;
};

const SimilarityPill = ({ score, ready }) => {
  if (!ready) return <span className="text-slate-400 font-semibold text-sm">—</span>;
  if (score > 50)
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 ring-1 ring-red-200">
        {score}%
      </span>
    );
  if (score > 0)
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 ring-1 ring-amber-200">
        {score}%
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
      0%
    </span>
  );
};

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value }) => (
  <div className="clean-card p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`text-2xl ${iconColor}`} />
    </div>
    <div>
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getCombinedStatus = (doc) => {
  const ai = doc.ai_scan_status;
  const pl = doc.plagiarism_scan_status;
  if (ai === 'failed' || pl === 'failed') return 'failed';
  if (ai === 'completed' && pl === 'completed') return 'completed';
  if (ai === 'processing' || pl === 'processing') return 'processing';
  if (ai === 'queued' || pl === 'queued') return 'queued';
  return 'pending';
};

const getPlagScore = (doc) =>
  doc.plagiarism_result?.plagiarism_score ?? doc.plagiarism_score ?? 0;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]       = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState('');
  const [sortKey, setSortKey]   = useState('created_at');
  const [sortDir, setSortDir]   = useState('desc');

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, dRes] = await Promise.all([
          dashboardApi.getStats(),
          documentApi.getAll(),
        ]);
        setStats(sRes.data);
        setDocuments(Array.isArray(dRes.data) ? dRes.data : []);
      } catch (err) {
        console.error(err);
        toast.error('Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = documents
    .filter((d) =>
      d.original_file_name?.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      let av = a[sortKey] ?? '';
      let bv = b[sortKey] ?? '';
      if (sortKey === 'plagiarism_score') { av = getPlagScore(a); bv = getPlagScore(b); }
      if (sortKey === 'status') { av = getCombinedStatus(a); bv = getCombinedStatus(b); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="space-y-6 fade-in max-w-7xl mx-auto">
        <div className="h-36 bg-white rounded-2xl border border-border animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-white rounded-2xl border border-border animate-pulse" />
      </div>
    );
  }

  const SortIcon = ({ col }) =>
    sortKey === col ? (
      sortDir === 'asc' ? <HiOutlineChevronUp className="inline ml-1" /> : <HiOutlineChevronDown className="inline ml-1" />
    ) : null;

  return (
    <div className="fade-in max-w-7xl mx-auto space-y-8">
      {/* ── Welcome banner ── */}
      <div className="bg-white rounded-2xl p-8 border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-1">
            Welcome back, {user?.name?.split(' ')[0] ?? 'User'}
          </h1>
          <p className="text-text-secondary text-base">
            You have{' '}
            <span className="font-bold text-accent-primary">{user?.credits ?? 0}</span>{' '}
            credit{user?.credits !== 1 ? 's' : ''} remaining for scanning.
          </p>
        </div>
        <Link
          to="/upload"
          className="btn-primary py-3 px-6 text-sm flex items-center gap-2 self-start md:self-auto"
        >
          <HiOutlinePlus className="text-base" />
          New Scan
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={HiOutlineDocumentText}
          iconBg="bg-blue-50"
          iconColor="text-accent-primary"
          label="Total Scans"
          value={stats?.total_scans ?? 0}
        />
        <StatCard
          icon={HiOutlineShieldCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Avg Plagiarism"
          value={stats?.average_plagiarism > 0 ? `${stats.average_plagiarism}%` : '0%'}
        />
        <StatCard
          icon={HiOutlineClock}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          label="Avg AI Score"
          value={stats?.average_ai_score > 0 ? `${stats.average_ai_score}%` : '0%'}
        />
      </div>

      {/* ── Documents Table ── */}
      <div className="clean-card overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Documents</h2>
            <p className="text-sm text-text-secondary mt-0.5">
              {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by filename…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all w-64"
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border">
                  {[
                    { key: 'original_file_name', label: 'Document Name', align: 'left', extra: 'pl-6' },
                    { key: 'created_at',          label: 'Upload Date',   align: 'left' },
                    { key: 'status',              label: 'Status',        align: 'left' },
                    { key: 'plagiarism_score',    label: 'Similarity',    align: 'center' },
                  ].map(({ key, label, align, extra = '' }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className={`text-${align} px-4 py-3 ${extra} text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-text-primary transition-colors`}
                    >
                      {label}
                      <SortIcon col={key} />
                    </th>
                  ))}
                  <th className="text-right px-6 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((doc) => {
                  const status = getCombinedStatus(doc);
                  const score  = getPlagScore(doc);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Document Name */}
                      <td className="pl-6 pr-4 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-accent-primary group-hover:bg-accent-primary group-hover:text-white transition-all duration-200">
                            <HiOutlineDocumentText className="text-lg" />
                          </div>
                          <span
                            className="font-semibold text-text-primary text-sm truncate max-w-[200px]"
                            title={doc.original_file_name}
                          >
                            {doc.original_file_name}
                          </span>
                        </div>
                      </td>

                      {/* Upload Date */}
                      <td className="px-4 py-4 text-sm text-text-secondary whitespace-nowrap">
                        {new Date(doc.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <StatusBadge status={status} />
                      </td>

                      {/* Similarity */}
                      <td className="px-4 py-4 text-center">
                        <SimilarityPill score={score} ready={status === 'completed'} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/report/${doc.id}`}
                            title="View Report"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-accent-primary hover:border-accent-primary hover:bg-blue-50 transition-all duration-150"
                          >
                            <HiOutlineEye className="text-sm" />
                          </Link>
                          <Link
                            to={`/feedback-studio/${doc.id}`}
                            title="Feedback Studio"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-400 hover:bg-violet-50 transition-all duration-150"
                          >
                            <HiOutlinePencilAlt className="text-sm" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <HiOutlineDocumentText className="text-3xl text-slate-400" />
            </div>
            <p className="font-semibold text-text-primary mb-1">
              {query ? 'No matching documents' : 'No documents yet'}
            </p>
            <p className="text-sm text-text-secondary mb-6">
              {query
                ? 'Try a different search term'
                : 'Upload your first document to begin scanning'}
            </p>
            {!query && (
              <Link to="/upload" className="btn-primary">
                Start a scan
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
