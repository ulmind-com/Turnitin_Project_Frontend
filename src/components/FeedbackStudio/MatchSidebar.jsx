import React from 'react';
import { HiOutlineExternalLink, HiOutlineCollection } from 'react-icons/hi';

export default function MatchSidebar({ doc, onSourceClick, activeChunkIndex }) {
  const plagiarismScore = doc?.plagiarism_result?.plagiarism_score || 0;
  const sources = doc?.plagiarism_result?.matched_sources || [];

  const getScoreColor = (score) => {
    if (score > 50) return 'text-red-600 border-red-500 bg-red-50';
    if (score > 20) return 'text-orange-500 border-orange-400 bg-orange-50';
    return 'text-emerald-600 border-emerald-400 bg-emerald-50';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Header & Score Banner */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Similarity Index</h3>
        <div className={`inline-flex items-center justify-center px-6 py-3 rounded-2xl border-2 font-black text-3xl ${getScoreColor(plagiarismScore)}`}>
          {plagiarismScore}%
        </div>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          Matches detected against general student submission history and live internet databases.
        </p>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Matched Sources</h4>
        {sources.length > 0 ? (
          sources.map((src, idx) => {
            const isActive = activeChunkIndex === src.chunk_index;
            return (
              <div
                key={idx}
                onClick={() => onSourceClick(src.chunk_index)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-red-50/80 border-red-300 shadow-sm scale-[1.02]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start gap-3 mb-2">
                  <div className="font-bold text-slate-800 text-sm truncate flex-1" title={src.title}>
                    {src.title}
                  </div>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                    src.similarity_score > 50 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {src.similarity_score}%
                  </span>
                </div>
                
                {src.url && src.url !== "Submitted Work (Student Paper)" ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 break-all"
                  >
                    <HiOutlineExternalLink className="flex-shrink-0" />
                    {src.url}
                  </a>
                ) : (
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <HiOutlineCollection className="flex-shrink-0" />
                    Submitted Work (Student Paper)
                  </div>
                )}
                
                {src.matched_text && (
                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded border border-slate-100 italic line-clamp-3 leading-relaxed">
                    "{src.matched_text}"
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            No matching sources found.
          </div>
        )}
      </div>
    </div>
  );
}
