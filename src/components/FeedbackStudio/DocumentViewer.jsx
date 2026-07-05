import React, { useRef } from 'react';

export default function DocumentViewer({ doc, onHighlightClick, highlightedIndex }) {
  const containerRef = useRef(null);

  const getHighlightedHtml = () => {
    if (!doc) return '';
    const text = doc.extracted_text || '';
    const n = text.length;
    const charTags = new Array(n).fill(0); // 0 = normal, 1 = AI, 2 = Plagiarism
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

    // 2. Mark AI sentences
    if (doc.ai_result?.ai_score > 15) {
      const aiScore = doc.ai_result.ai_score;
      const sentenceEnds = [];
      const sentenceRegex = /[^.!?]+[.!?]+/g;
      let match;
      while ((match = sentenceRegex.exec(text)) !== null) {
        sentenceEnds.push(sentenceRegex.lastIndex);
      }
      
      const sentences = [];
      let lastIdx = 0;
      sentenceEnds.forEach(end => {
        sentences.push([lastIdx, end]);
        lastIdx = end;
      });
      if (lastIdx < n) {
        sentences.push([lastIdx, n]);
      }

      const aiKeywords = [
        "delve", "tapestry", "moreover", "furthermore", "testament", "notably", 
        "in conclusion", "it is important to note", "consequently", "pivotal",
        "beacon", "comprehensive", "demystify", "multifaceted", "paramount"
      ];

      const sentenceScores = sentences.map(([start, end]) => {
        const sentText = text.substring(start, end).toLowerCase();
        let score = 0;
        aiKeywords.forEach(kw => {
          if (sentText.includes(kw)) score += 10;
        });
        return { score, start, end };
      });

      const numToHighlight = Math.floor(sentences.length * (aiScore / 100));
      const sortedSentences = [...sentenceScores].sort((a, b) => b.score - a.score);
      const highlighted = sortedSentences.slice(0, Math.max(numToHighlight, 1));

      highlighted.forEach(({ start, end }) => {
        for (let i = start; i < end; i++) {
          if (charTags[i] === 0) {
            charTags[i] = 1;
          }
        }
      });
    }

    // 3. Construct HTML with styled marks
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
        if (currentTag === 2 || currentTag === 1) {
          htmlParts.push('</mark>');
        }
        if (tag === 2) {
          const isSelected = highlightedIndex === cIdx;
          const isHigh = doc.plagiarism_result?.chunks?.[cIdx]?.plagiarism_score > 50;
          const bgClass = isSelected 
            ? (isHigh 
                ? 'bg-red-300 border-red-500 text-red-950 font-bold scale-[1.01] shadow-sm' 
                : 'bg-yellow-300 border-yellow-500 text-yellow-950 font-bold scale-[1.01] shadow-sm')
            : (isHigh
                ? 'bg-red-100/90 hover:bg-red-200 border-red-200 text-red-900'
                : 'bg-yellow-100/90 hover:bg-yellow-200 border-yellow-200 text-yellow-900');
          htmlParts.push(`<mark class="cursor-pointer transition-all border-b px-0.5 rounded-sm plagiarism-mark ${bgClass}" data-chunk-index="${cIdx}">`);
        } else if (tag === 1) {
          htmlParts.push(`<mark class="bg-blue-100/80 border-b border-blue-200 text-blue-900 px-0.5 rounded-sm">`);
        }
        currentTag = tag;
        currentChunkIdx = cIdx;
      }
      htmlParts.push(escapeHtml(text[i]));
    }

    if (currentTag === 2 || currentTag === 1) {
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
