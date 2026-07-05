import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { documentApi } from '../services/api';
import DocumentViewer from '../components/FeedbackStudio/DocumentViewer';
import MatchSidebar from '../components/FeedbackStudio/MatchSidebar';
import GradingSidebar from '../components/FeedbackStudio/GradingSidebar';
import toast from 'react-hot-toast';
import {
  HiOutlineChevronLeft,
  HiOutlineShieldCheck,
  HiOutlinePencilAlt,
  HiOutlineDocumentText,
  HiOutlineUser,
} from 'react-icons/hi';

export default function FeedbackStudio() {
  const { id } = useParams();
  const [doc, setDoc]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab]         = useState('similarity');
  const [activeChunkIndex, setActiveChunkIndex] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await documentApi.getById(id);
        setDoc(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load document for Feedback Studio.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSaveGrade = async ({ grade, feedback }) => {
    await documentApi.saveGrade(id, { grade, feedback });
    setDoc((prev) => (prev ? { ...prev, grade, feedback } : null));
  };

  // Clicking a source card updates activeChunkIndex;
  // DocumentViewer's useEffect handles the smooth scroll after re-render.
  const handleSourceClick = (chunkIdx) => {
    setActiveChunkIndex(chunkIdx);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-semibold text-sm">Entering Feedback Studio…</p>
      </div>
    );
  }

  const plagScore = doc?.plagiarism_result?.plagiarism_score ?? 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      {/* ── Top Header ── */}
      <header className="h-[60px] bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 shadow-sm z-20 flex-shrink-0">
        {/* Left: back + doc title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/history"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors flex-shrink-0 cursor-pointer"
            title="Back to History"
          >
            <HiOutlineChevronLeft className="text-lg" />
          </Link>

          <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
            <HiOutlineDocumentText className="text-base" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-900 truncate max-w-[260px]" title={doc?.original_file_name}>
              {doc?.original_file_name ?? 'Untitled Document'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Feedback Studio
            </p>
          </div>
        </div>

        {/* Center: user/student metadata chips */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs text-slate-600 font-medium">
            <HiOutlineUser className="text-slate-400" />
            <span>User: <span className="font-bold text-slate-700">{doc?.user_id?.substring(0, 8) ?? '—'}</span></span>
          </div>
          {doc?.created_at && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs text-slate-600 font-medium">
              Submitted:{' '}
              <span className="font-bold text-slate-700 ml-1">
                {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}
          {doc?.grade !== null && doc?.grade !== undefined && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-55 border border-violet-100/50 rounded-full text-xs font-bold text-violet-750">
              Grade: {doc.grade}/100
            </div>
          )}
          {/* Similarity pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            plagScore > 50 ? 'bg-red-50 text-red-650 border-red-100/50' : plagScore > 0 ? 'bg-amber-50 text-amber-650 border-amber-100/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
          }`}>
            <HiOutlineShieldCheck />
            {plagScore}% Similarity
          </div>
        </div>

        {/* Right: Tab switcher */}
        <div className="flex-shrink-0">
          <div className="bg-slate-50 p-1 rounded-xl flex gap-1 border border-slate-200/60 shadow-inner">
            <button
              onClick={() => setActiveTab('similarity')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === 'similarity'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-100'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <HiOutlineShieldCheck />
              Similarity
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === 'grading'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <HiOutlinePencilAlt />
              Grading
            </button>
          </div>
        </div>
      </header>

      {/* ── Workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Viewer — 70% */}
        <main className="flex-1 p-5 overflow-hidden flex flex-col min-w-0">
          <DocumentViewer
            doc={doc}
            onMarkClick={handleSourceClick}
            highlightedIndex={activeChunkIndex}
          />
        </main>

        {/* Sidebar — 30%, min 280px */}
        <aside className="w-[30%] min-w-[280px] max-w-[420px] h-full bg-white flex flex-col border-l border-slate-200 shadow-lg flex-shrink-0">
          {activeTab === 'similarity' ? (
            <MatchSidebar
              doc={doc}
              activeChunkIndex={activeChunkIndex}
              onSourceClick={handleSourceClick}
            />
          ) : (
            <GradingSidebar doc={doc} onSaveGrade={handleSaveGrade} />
          )}
        </aside>
      </div>
    </div>
  );
}
