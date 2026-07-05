import { useRef, useMemo, useEffect } from 'react';
import DOMPurify from 'dompurify';

// ---------------------------------------------------------------------------
// Build highlighted HTML from doc data.
// All raw text characters are HTML-escaped before we inject our own <mark>
// tags, so there is no user-controlled HTML injection path.  DOMPurify then
// acts as a belt-and-suspenders gate in case backend data ever carries HTML.
// ---------------------------------------------------------------------------

const AI_KEYWORDS = [
  'delve', 'tapestry', 'moreover', 'furthermore', 'testament', 'notably',
  'in conclusion', 'it is important to note', 'consequently', 'pivotal',
  'beacon', 'comprehensive', 'demystify', 'multifaceted', 'paramount',
];

const buildHighlightedHtml = (doc, highlightedIndex) => {
  if (!doc) return '';
  const text = doc.extracted_text ?? '';
  const n = text.length;

  // charTags: 0=plain, 1=AI, 2=plagiarism
  const charTags  = new Uint8Array(n);
  const chunkMap  = new Int32Array(n).fill(-1);

  // 1. Mark plagiarism chunks
  for (const [idx, chunk] of (doc.plagiarism_result?.chunks ?? []).entries()) {
    if (chunk.plagiarism_score < 20) continue;
    let pos = 0;
    while (true) {
      const start = text.indexOf(chunk.text, pos);
      if (start === -1) break;
      const end = start + chunk.text.length;
      charTags.fill(2, start, end);
      chunkMap.fill(idx, start, end);
      pos = start + 1;
    }
  }

  // 2. Mark AI sentences
  if ((doc.ai_result?.ai_score ?? 0) > 15) {
    const aiScore = doc.ai_result.ai_score;
    const sentences = [];
    const re = /[^.!?]+[.!?]+/g;
    let m;
    let last = 0;
    while ((m = re.exec(text)) !== null) {
      sentences.push({ start: last, end: re.lastIndex, score: 0 });
      last = re.lastIndex;
    }
    if (last < n) sentences.push({ start: last, end: n, score: 0 });

    for (const s of sentences) {
      const slice = text.slice(s.start, s.end).toLowerCase();
      for (const kw of AI_KEYWORDS) if (slice.includes(kw)) s.score += 10;
    }

    const count = Math.max(1, Math.floor(sentences.length * (aiScore / 100)));
    const top = [...sentences].sort((a, b) => b.score - a.score).slice(0, count);
    for (const { start, end } of top) {
      for (let i = start; i < end; i++) {
        if (charTags[i] === 0) charTags[i] = 1;
      }
    }
  }

  // 3. Construct HTML
  const esc = (c) => {
    if (c === '&') return '&amp;';
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '\n') return '<br/>';
    return c;
  };

  const parts = [];
  let curTag   = 0;
  let curChunk = -1;

  for (let i = 0; i < n; i++) {
    const t = charTags[i];
    const c = chunkMap[i];

    const needsSwitch = t !== curTag || (t === 2 && c !== curChunk);
    if (needsSwitch) {
      if (curTag !== 0) parts.push('</mark>');

      if (t === 1) {
        parts.push('<mark class="bg-blue-100/80 border-b border-blue-300 text-blue-900 px-0.5 rounded-sm">');
      } else if (t === 2) {
        const isSelected = highlightedIndex === c;
        const isHigh     = (doc.plagiarism_result?.chunks?.[c]?.plagiarism_score ?? 0) > 50;

        // Selected: brighter highlight (high=red300, low=yellow300)
        // Default:  subtle highlight (high=red100, low=yellow100)
        const bg = isSelected
          ? (isHigh ? 'bg-red-300 border-red-500 text-red-950 shadow-sm' : 'bg-yellow-200 border-yellow-400 text-yellow-950 shadow-sm')
          : (isHigh ? 'bg-red-100/90 hover:bg-red-200 border-red-300 text-red-900'  : 'bg-yellow-100/90 hover:bg-yellow-200 border-yellow-300 text-yellow-900');

        parts.push(
          `<mark class="cursor-pointer transition-all duration-150 border-b px-0.5 rounded-sm plagiarism-mark ${bg}" data-chunk-index="${c}">`
        );
      }

      curTag   = t;
      curChunk = c;
    }
    parts.push(esc(text[i]));
  }
  if (curTag !== 0) parts.push('</mark>');

  const raw = parts.join('');
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['mark', 'br'],
    ALLOWED_ATTR: ['class', 'data-chunk-index'],
  });
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DocumentViewer({ doc, onMarkClick, highlightedIndex }) {
  const containerRef = useRef(null);

  const html = useMemo(
    () => buildHighlightedHtml(doc, highlightedIndex),
    [doc, highlightedIndex]
  );

  // Smooth-scroll to the highlighted mark AFTER the DOM re-renders.
  useEffect(() => {
    if (highlightedIndex === null || highlightedIndex === undefined) return;
    const el = containerRef.current?.querySelector(
      `[data-chunk-index="${highlightedIndex}"]`
    );
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedIndex, html]); // depends on html so we re-run after paint

  // Event delegation — catch clicks on plagiarism marks
  const handleClick = (e) => {
    const mark = e.target.closest('mark.plagiarism-mark');
    if (!mark) return;
    const idx = parseInt(mark.getAttribute('data-chunk-index'), 10);
    if (!isNaN(idx) && onMarkClick) onMarkClick(idx);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Panel header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Student Submission Transcript
        </span>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block" />
            Plagiarism (click to inspect)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300 inline-block" />
            AI Writing
          </span>
        </div>
      </div>

      {/* Scrollable text body */}
      <div
        ref={containerRef}
        onClick={handleClick}
        className="flex-1 overflow-y-auto px-12 py-10 font-serif text-[15px] text-slate-800 leading-[1.9] whitespace-pre-wrap select-text bg-white custom-scrollbar"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
