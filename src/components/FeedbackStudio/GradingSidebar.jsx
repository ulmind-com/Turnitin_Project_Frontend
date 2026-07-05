import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle,
  HiOutlinePencilAlt,
  HiOutlineStar,
} from 'react-icons/hi';

// ---------------------------------------------------------------------------
// Grade colour ring: green ≥70, amber 50-69, red <50
// ---------------------------------------------------------------------------
const gradeColor = (g) => {
  if (g === '' || g === null || g === undefined) return { text: 'text-slate-400', ring: 'ring-slate-200', bg: 'bg-slate-50' };
  const n = Number(g);
  if (n >= 70) return { text: 'text-emerald-600', ring: 'ring-emerald-400', bg: 'bg-emerald-50' };
  if (n >= 50) return { text: 'text-amber-600',   ring: 'ring-amber-400',   bg: 'bg-amber-50'   };
  return             { text: 'text-red-600',       ring: 'ring-red-400',     bg: 'bg-red-50'     };
};

export default function GradingSidebar({ doc, onSaveGrade }) {
  const [grade,    setGrade]    = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  // Populate from existing doc data when it loads / changes
  useEffect(() => {
    setGrade(doc?.grade !== null && doc?.grade !== undefined ? String(doc.grade) : '');
    setFeedback(doc?.feedback ?? '');
  }, [doc?.grade, doc?.feedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (grade !== '') {
      const n = Number(grade);
      if (isNaN(n) || n < 0 || n > 100) {
        toast.error('Grade must be a number between 0 and 100.');
        return;
      }
    }

    setSaving(true);
    try {
      await onSaveGrade({
        grade:    grade !== '' ? parseFloat(grade) : null,
        feedback: feedback.trim() || null,
      });
      setSaved(true);
      toast.success('Grade and feedback saved!', { icon: '✅' });
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast.error('Failed to save grade. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const colors = gradeColor(grade);
  const gradeNum = grade !== '' ? Number(grade) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-white flex-shrink-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Grading &amp; Feedback
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Assign a numerical grade and write instructor feedback for this submission.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar"
      >
        {/* ── Grade input with live visual ring ── */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Numerical Grade
          </label>

          {/* Large grade display */}
          <div className={`flex items-center justify-center w-28 h-28 rounded-full ring-4 mx-auto transition-all duration-300 ${colors.ring} ${colors.bg}`}>
            <span className={`text-4xl font-black transition-colors duration-300 ${colors.text}`}>
              {gradeNum !== null ? gradeNum : '—'}
            </span>
          </div>

          {/* Numeric input */}
          <div className="relative max-w-[140px] mx-auto mt-3">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="0"
              className="block w-full pr-14 pl-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-bold text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-center"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-slate-400 font-semibold text-sm">/100</span>
            </div>
          </div>

          {/* Grade bar */}
          {gradeNum !== null && (
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  gradeNum >= 70 ? 'bg-emerald-500' : gradeNum >= 50 ? 'bg-amber-400' : 'bg-red-500'
                }`}
                style={{ width: `${gradeNum}%` }}
              />
            </div>
          )}
        </div>

        {/* ── Rubric quick-picks ── */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Grade
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'A+', value: 97 }, { label: 'A', value: 93 },
              { label: 'B+', value: 87 }, { label: 'B', value: 83 },
              { label: 'C',  value: 73 }, { label: 'F', value: 50 },
            ].map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => setGrade(String(value))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-150 ${
                  grade === String(value)
                    ? 'bg-accent-primary text-white border-accent-primary shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Instructor Feedback ── */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Instructor Feedback
          </label>
          <textarea
            rows={8}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write detailed, constructive feedback for the student here…"
            className="block w-full p-4 border border-slate-200 rounded-xl text-slate-700 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
          />
          <p className="text-[10px] text-slate-400 text-right">
            {feedback.length} characters
          </p>
        </div>

        {/* ── Save button ── */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-md text-sm ${
            saved
              ? 'bg-emerald-600 text-white shadow-emerald-200'
              : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white shadow-blue-200'
          }`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-blue-200 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <>
              <HiOutlineCheckCircle className="text-lg" />
              Saved Successfully
            </>
          ) : (
            <>
              <HiOutlinePencilAlt className="text-lg" />
              Save Grade &amp; Feedback
            </>
          )}
        </button>

        {/* Existing grade display */}
        {doc?.grade !== null && doc?.grade !== undefined && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <HiOutlineStar className="text-amber-400" />
              <span className="font-semibold uppercase tracking-wider">Previously Saved</span>
            </div>
            <p className="text-sm text-slate-700">
              Grade: <span className="font-bold text-slate-900">{doc.grade}/100</span>
            </p>
            {doc.feedback && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">{doc.feedback}</p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
