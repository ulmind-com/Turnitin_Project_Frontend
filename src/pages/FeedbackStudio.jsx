import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import DocumentViewer from '../components/FeedbackStudio/DocumentViewer';
import MatchSidebar from '../components/FeedbackStudio/MatchSidebar';
import GradingSidebar from '../components/FeedbackStudio/GradingSidebar';
import { HiOutlineChevronLeft, HiOutlineShieldCheck, HiOutlinePencilAlt } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function FeedbackStudio() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('similarity'); // 'similarity' or 'grading'
  const [activeChunkIndex, setActiveChunkIndex] = useState(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/api/documents/${id}`);
        setDoc(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const handleSaveGrade = async ({ grade, feedback }) => {
    try {
      await api.post(`/api/documents/${id}/grade`, { grade, feedback });
      setDoc((prev) => (prev ? { ...prev, grade, feedback } : null));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSourceClick = (chunkIdx) => {
    setActiveChunkIndex(chunkIdx);
    const element = document.querySelector(`[data-chunk-index="${chunkIdx}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Entering Feedback Studio...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/history"
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          >
            <HiOutlineChevronLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-slate-800 truncate max-w-[300px]">
              {doc?.original_file_name}
            </h1>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Feedback Studio • Submitted by User ID: {doc?.user_id?.substring(0, 8)}
            </p>
          </div>
        </div>

        {/* Tab Switcher & Save Button */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('similarity')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeTab === 'similarity'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HiOutlineShieldCheck className="text-sm" />
              Similarity
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                activeTab === 'grading'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HiOutlinePencilAlt className="text-sm" />
              Grading
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Document Viewer */}
        <main className="w-[70%] p-6 overflow-hidden flex flex-col h-full bg-slate-50">
          <DocumentViewer
            doc={doc}
            onHighlightClick={handleSourceClick}
            highlightedIndex={activeChunkIndex}
          />
        </main>

        {/* Right Side: Active Sidebar Panel */}
        <aside className="w-[30%] h-full bg-white flex flex-col border-l border-slate-200 shadow-lg">
          {activeTab === 'similarity' ? (
            <MatchSidebar
              doc={doc}
              activeChunkIndex={activeChunkIndex}
              onSourceClick={handleSourceClick}
            />
          ) : (
            <GradingSidebar
              doc={doc}
              onSaveGrade={handleSaveGrade}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
