import { HiOutlineExternalLink, HiOutlineAcademicCap, HiOutlineGlobe } from 'react-icons/hi';

// ---------------------------------------------------------------------------
// Circular SVG progress gauge
// ---------------------------------------------------------------------------
const CircularGauge = ({ score }) => {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  const color =
    score > 50 ? '#ef4444' :
    score > 20 ? '#f59e0b' :
    '#10b981';

  const label =
    score > 50 ? 'High Similarity' :
    score > 20 ? 'Moderate Similarity' :
    'Low Similarity';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold" style={{ color }}>{score}%</span>
        </div>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Source type badge
// ---------------------------------------------------------------------------
const SourceTypeBadge = ({ url }) => {
  const isStudentPaper =
    !url || url === 'Submitted Work (Student Paper)' || url.startsWith('internal://');

  if (isStudentPaper) {
    return (
      <div className="flex items-center gap-1 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 rounded px-2 py-0.5">
        <HiOutlineAcademicCap className="text-xs" />
        Student Paper
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-200 rounded px-2 py-0.5">
      <HiOutlineGlobe className="text-xs" />
      Internet Source
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function MatchSidebar({ doc, onSourceClick, activeChunkIndex }) {
  const plagScore = doc?.plagiarism_result?.plagiarism_score ?? 0;
  const sources   = doc?.plagiarism_result?.matched_sources ?? [];

  const isStudentPaper = (src) =>
    !src.url ||
    src.url === 'Submitted Work (Student Paper)' ||
    src.url.startsWith('internal://');

  // Partition sources into student papers vs internet
  const studentPapers = sources.filter(isStudentPaper);
  const internetSrcs  = sources.filter((s) => !isStudentPaper(s));

  const renderSourceCard = (src, idx) => {
    const isActive = activeChunkIndex !== null && activeChunkIndex === src.chunk_index;
    const student  = isStudentPaper(src);

    return (
      <div
        key={idx}
        onClick={() => onSourceClick(src.chunk_index)}
        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
          isActive
            ? 'bg-red-50/70 border-red-350 ring-2 ring-red-100 shadow-md shadow-red-100/50 scale-[1.01]'
            : 'bg-white border-slate-200/60 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="font-semibold text-slate-800 text-sm truncate flex-1" title={src.title}>
            {src.title || (student ? 'Student Submission' : src.url)}
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 border ${
              src.similarity_score > 50
                ? 'bg-red-50 text-red-650 border-red-100/50'
                : src.similarity_score > 20
                ? 'bg-amber-50 text-amber-650 border-amber-100/50'
                : 'bg-slate-50 text-slate-600 border-slate-100'
            }`}
          >
            {src.similarity_score}%
          </span>
        </div>

        <SourceTypeBadge url={src.url} />

        {!student && src.url && (
          <a
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2 text-[11px] text-blue-600 hover:underline flex items-center gap-1 break-all"
          >
            <HiOutlineExternalLink className="flex-shrink-0" />
            {src.url}
          </a>
        )}

        {src.matched_text && (
          <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 border border-slate-100 rounded-lg p-2.5 italic line-clamp-3 leading-relaxed">
            &ldquo;{src.matched_text}&rdquo;
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Score banner */}
      <div className="p-5 border-b border-slate-200 bg-white flex-shrink-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Similarity Index
        </p>
        <div className="flex items-center justify-center">
          {doc?.plagiarism_result ? (
            <CircularGauge score={plagScore} />
          ) : (
            <div className="text-slate-400 text-sm font-medium py-4">No scan data</div>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed text-center">
          Matches found against student submissions and live internet databases.
        </p>
      </div>

      {/* Sources list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {sources.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-10">No matching sources found.</p>
        ) : (
          <>
            {internetSrcs.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <HiOutlineGlobe className="text-sky-500 text-sm" />
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Internet Sources ({internetSrcs.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {internetSrcs.map(renderSourceCard)}
                </div>
              </section>
            )}

            {studentPapers.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <HiOutlineAcademicCap className="text-violet-500 text-sm" />
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Student Papers ({studentPapers.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {studentPapers.map(renderSourceCard)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
