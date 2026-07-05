import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineChevronLeft,
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineExclamationCircle
} from 'react-icons/hi';

export default function ScanReport() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let intervalId;
    
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/api/documents/${id}`);
        setDoc(res.data);
        setLoading(false);

        // Automatically trigger scans if they haven't been started yet
        if (res.data.ai_scan_status === null) {
          api.post(`/api/documents/${id}/analyze/ai`).catch(err => {
            console.error('Failed to auto-start AI scan', err);
          });
          // Optimistically update status to queued to show progress
          setDoc(prev => prev ? { ...prev, ai_scan_status: 'queued' } : null);
        }
        if (res.data.plagiarism_scan_status === null) {
          api.post(`/api/documents/${id}/analyze/plagiarism`).catch(err => {
            console.error('Failed to auto-start Plagiarism scan', err);
          });
          setDoc(prev => prev ? { ...prev, plagiarism_scan_status: 'queued' } : null);
        }

        // Check if both scans are in a terminal state (completed or failed)
        const isAiTerminal = res.data.ai_scan_status === 'completed' || res.data.ai_scan_status === 'failed';
        const isPlagTerminal = res.data.plagiarism_scan_status === 'completed' || res.data.plagiarism_scan_status === 'failed';

        if (isAiTerminal && isPlagTerminal) {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Failed to fetch document', error);
        clearInterval(intervalId);
        setLoading(false);
      }
    };

    fetchDoc();
    intervalId = setInterval(fetchDoc, 4000);
    return () => clearInterval(intervalId);
  }, [id]);

  const downloadReport = async () => {
    try {
      setDownloading(true);
      const res = await api.get(`/api/documents/${id}/download-report`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const safeFilename = doc?.original_file_name || 'report';
      const cleanName = safeFilename.replace(/[^a-zA-Z0-9._-]/g, '');
      link.setAttribute('download', `Originality_Report_${cleanName.split('.')[0]}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Failed to download report', error);
      toast.error('Failed to generate downloadable PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  // HTML Highlighting Logic (identical to PDF engine)
  const getHighlightedHtml = () => {
    if (!doc) return '';
    const text = doc.extracted_text || '';
    const n = text.length;
    const charTags = new Array(n).fill(0); // 0 = normal, 1 = AI, 2 = Plagiarism

    // 1. Mark plagiarism
    if (doc.plagiarism_result?.chunks) {
      doc.plagiarism_result.chunks.forEach(chunk => {
        if (chunk.plagiarism_score >= 20) {
          const chunkText = chunk.text;
          let start = 0;
          while (true) {
            const idx = text.indexOf(chunkText, start);
            if (idx === -1) break;
            for (let i = idx; i < idx + chunkText.length; i++) {
              charTags[i] = 2;
            }
            start = idx + 1;
          }
        }
      });
      
      doc.plagiarism_result.matched_sources?.forEach(source => {
        if (source.similarity_score >= 20 && source.matched_text) {
          const matched = source.matched_text;
          let start = 0;
          while (true) {
            const idx = text.indexOf(matched, start);
            if (idx === -1) break;
            for (let i = idx; i < idx + matched.length; i++) {
              charTags[i] = 2;
            }
            start = idx + 1;
          }
        }
      });
    }

    // 2. Mark AI
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

    // 3. Construct HTML
    const htmlParts = [];
    let currentTag = 0;

    const escapeHtml = (char) => {
      if (char === '&') return '&amp;';
      if (char === '<') return '&lt;';
      if (char === '>') return '&gt;';
      if (char === '\n') return '<br/>';
      return char;
    };

    for (let i = 0; i < n; i++) {
      const tag = charTags[i];
      if (tag !== currentTag) {
        if (currentTag === 1 || currentTag === 2) {
          htmlParts.push('</mark>');
        }
        if (tag === 1) {
          htmlParts.push('<mark class="bg-blue-100/80 text-blue-900 border-b border-blue-200 px-0.5 rounded-sm">');
        } else if (tag === 2) {
          htmlParts.push('<mark class="bg-red-100/80 text-red-900 border-b border-red-200 px-0.5 rounded-sm">');
        }
        currentTag = tag;
      }
      htmlParts.push(escapeHtml(text[i]));
    }

    if (currentTag === 1 || currentTag === 2) {
      htmlParts.push('</mark>');
    }

    return htmlParts.join("");
  };

  if (loading) {
    return (
      <div className="fade-in max-w-4xl mx-auto text-center py-20">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-accent-primary rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Loading Report...</h2>
        <p className="text-text-secondary">Retrieving submission details from ScanVault.</p>
      </div>
    );
  }

  const isAiFailed = doc?.ai_scan_status === 'failed';
  const isPlagFailed = doc?.plagiarism_scan_status === 'failed';

  if (isAiFailed && isPlagFailed) {
    return (
      <div className="fade-in max-w-4xl mx-auto py-10">
        <div className="clean-card p-12 text-center bg-red-50 border-red-200">
          <HiOutlineExclamationCircle className="text-5xl text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Analysis Failed</h2>
          <p className="text-red-600 mb-6">Both AI detection and Plagiarism scans encountered errors.</p>
          <Link to="/scan" className="btn-primary bg-red-600 hover:bg-red-700">Try Again</Link>
        </div>
      </div>
    );
  }

  const isAiCompleted = doc?.ai_scan_status === 'completed';
  const isPlagCompleted = doc?.plagiarism_scan_status === 'completed';
  const isReportReady = isAiCompleted && isPlagCompleted;

  const plagiarismScore = doc?.plagiarism_result?.plagiarism_score || 0;
  const aiScore = doc?.ai_result?.ai_score || 0;
  
  const isHighPlagiarism = plagiarismScore > 30;
  const isHighAI = aiScore > 30;

  return (
    <div className="fade-in max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link to="/history" className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center text-text-secondary hover:bg-slate-50 transition-colors shadow-sm">
            <HiOutlineChevronLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <HiOutlineDocumentText className="text-text-muted" /> {doc?.original_file_name}
            </h1>
            <p className="text-sm text-text-secondary mt-1">Uploaded on {new Date(doc?.created_at).toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={downloadReport}
          disabled={downloading || !isReportReady}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold shadow-sm transition-all duration-200 ${
            isReportReady
              ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <HiOutlineDownload className="text-lg" />
              Download PDF Report
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Summary Card */}
          <div className="clean-card p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Analysis Summaries</h2>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plagiarism Check</h4>
                {isPlagCompleted ? (
                  <p className="text-text-secondary leading-relaxed">{doc?.plagiarism_result?.summary}</p>
                ) : isPlagFailed ? (
                  <p className="text-red-600 text-sm flex items-center gap-1.5"><HiOutlineExclamationCircle /> Plagiarism check failed.</p>
                ) : (
                  <p className="text-text-muted text-sm flex items-center gap-2 animate-pulse"><HiOutlineRefresh className="animate-spin" /> Web search and plagiarism analysis in progress...</p>
                )}
              </div>
              
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">AI Detection</h4>
                {isAiCompleted ? (
                  <p className="text-text-secondary leading-relaxed">{doc?.ai_result?.summary}</p>
                ) : isAiFailed ? (
                  <p className="text-red-600 text-sm flex items-center gap-1.5"><HiOutlineExclamationCircle /> AI scan failed.</p>
                ) : (
                  <p className="text-text-muted text-sm flex items-center gap-2 animate-pulse"><HiOutlineRefresh className="animate-spin" /> Analyzing sentence structures for AI signatures...</p>
                )}
              </div>
            </div>
          </div>

          {/* Highlighted text panel */}
          <div className="clean-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">Submission Document Text</h2>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-100 border-b border-red-200 rounded-sm inline-block" /> Plagiarism</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-100 border-b border-blue-200 rounded-sm inline-block" /> AI Writing</span>
              </div>
            </div>
            <div 
              className="bg-slate-50 border border-border rounded-lg p-6 max-h-[600px] overflow-y-auto font-serif text-base text-text-primary leading-loose whitespace-pre-wrap selection:bg-yellow-200"
              dangerouslySetInnerHTML={{ __html: getHighlightedHtml() }}
            />
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          {/* Similarity Score */}
          <div className="clean-card p-6 text-center">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">Similarity Score</h3>
            
            {isPlagCompleted ? (
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={isHighPlagiarism ? '#ef4444' : '#10b981'} strokeWidth="3" strokeDasharray={`${plagiarismScore}, 100`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${isHighPlagiarism ? 'text-red-600' : 'text-emerald-600'}`}>{plagiarismScore}%</span>
                </div>
              </div>
            ) : isPlagFailed ? (
              <div className="py-10 text-red-500">
                <HiOutlineExclamationCircle className="text-4xl mx-auto mb-2" />
                <span className="text-sm font-medium">Plagiarism Check Failed</span>
              </div>
            ) : (
              <div className="py-10 text-slate-400 animate-pulse">
                <HiOutlineRefresh className="text-4xl mx-auto mb-2 animate-spin text-accent-primary" />
                <span className="text-sm font-medium">Scanning Web Sources...</span>
              </div>
            )}
          </div>

          {/* AI Detection Score */}
          <div className="clean-card p-6 text-center">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">AI Detection</h3>
            
            {isAiCompleted ? (
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={isHighAI ? '#ef4444' : '#10b981'} strokeWidth="3" strokeDasharray={`${aiScore}, 100`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${isHighAI ? 'text-red-600' : 'text-emerald-600'}`}>{aiScore}%</span>
                </div>
              </div>
            ) : isAiFailed ? (
              <div className="py-10 text-red-500">
                <HiOutlineExclamationCircle className="text-4xl mx-auto mb-2" />
                <span className="text-sm font-medium">AI Analysis Failed</span>
              </div>
            ) : (
              <div className="py-10 text-slate-400 animate-pulse">
                <HiOutlineRefresh className="text-4xl mx-auto mb-2 animate-spin text-accent-primary" />
                <span className="text-sm font-medium">Analyzing Writing Patterns...</span>
              </div>
            )}
          </div>

          {/* Matched Sources */}
          {doc?.plagiarism_result?.matched_sources?.length > 0 && (
            <div className="clean-card overflow-hidden">
              <div className="p-4 border-b border-border bg-slate-50">
                <h3 className="text-sm font-semibold text-text-primary">Matched Sources</h3>
              </div>
              <div className="divide-y divide-border">
                {doc.plagiarism_result.matched_sources.map((source, idx) => (
                  <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent-primary hover:underline break-all flex items-start gap-1">
                        <HiOutlineExternalLink className="flex-shrink-0 mt-1" />
                        {source.url}
                      </a>
                      <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{source.similarity_score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
