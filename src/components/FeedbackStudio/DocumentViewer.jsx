import React, { useRef } from 'react';

export default function DocumentViewer({ doc, onHighlightClick, highlightedIndex }) {
  const containerRef = useRef(null);

  const getHighlightedHtml = () => {
    if (!doc) return '';
    const text = doc.extracted_text || '';
    const n = text.length;
    const charTags = new Array(n).fill(0); // 0 = normal, 2 = Plagiarism
    const chunkMap = new Array(n).fill(-1); // maps character index to chunk index

    // 1. Mark plagiarism chunks
    if (doc.plagiarism_result?.chunks) {
      doc.plagiarism_result.chunks.forEach((chunk, chunkIdx) => {
        if (chunk.plagiarism_score >= 20) {
          const chunkText = chunk.text;
          let start = 0;
          while (true) {
            const idx = text.indexOf(chunkText, start);
            if (idx === -1) break;
            for (let i = idx; i < idx + chunkText.length; i++) {
              charTags[i] = 2;
              chunkMap[i] = chunkIdx;
            }
            start = idx + 1;
          }
        }
      });
    }

    // 2. Construct HTML with styled marks
    const htmlParts = [];
    let currentTag = 0;
    let currentChunkIdx = -1;

    const escapeHtml = (char) => {
      if (char === '&') return '&amp;';
      if (char === '<') return '&lt;';
      if (char === '>') return '&gt;';
      if (char === '\n') return '<br/>';
      return char;
    };

    for (let i = 0; i < n; i++) {
      const tag = charTags[i];
      const cIdx = chunkMap[i];
      
      if (tag !== currentTag || (tag === 2 && cIdx !== currentChunkIdx)) {
        if (currentTag === 2) {
          htmlParts.push('</mark>');
        }
        if (tag === 2) {
          const isSelected = highlightedIndex === cIdx;
          const bgClass = isSelected 
            ? 'bg-red-200 border-red-400 text-red-950 font-semibold scale-[1.01] shadow-sm' 
            : 'bg-red-100/80 hover:bg-red-200 border-red-200 text-red-900';
          htmlParts.push(`<mark class="cursor-pointer transition-all border-b px-0.5 rounded-sm plagiarism-mark ${bgClass}" data-chunk-index="${cIdx}">`);
        }
        currentTag = tag;
        currentChunkIdx = cIdx;
      }
      htmlParts.push(escapeHtml(text[i]));
    }

    if (currentTag === 2) {
      htmlParts.push('</mark>');
    }

    return htmlParts.join("");
  };

  const handleContainerClick = (e) => {
    const mark = e.target.closest('mark.plagiarism-mark');
    if (mark) {
      const chunkIdx = parseInt(mark.getAttribute('data-chunk-index'), 10);
      if (onHighlightClick) {
        onHighlightClick(chunkIdx);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-slate-100/80 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Student Submission Transcript
        </h2>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-100 border border-red-200 rounded" />
            Similarity matches (Click to inspect source)
          </span>
        </div>
      </div>
      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className="flex-1 overflow-y-auto p-10 font-serif text-base text-slate-800 leading-loose whitespace-pre-wrap select-text bg-white"
        dangerouslySetInnerHTML={{ __html: getHighlightedHtml() }}
      />
    </div>
  );
}
