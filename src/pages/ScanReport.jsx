import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { documentApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineChevronLeft,
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineShieldExclamation,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const POLL_INTERVAL = 4000;

const isActive = (status) => status === 'queued' || status === 'processing';

// Builds highlighted HTML from raw text + scan results.
// All characters are HTML-escaped before insertion, so DOMPurify only needs
// to allow our known tags — no injection surface from user text.
const buildHighlightedHtml = (doc) => {
  if (!doc) return '';
  const text = doc.extracted_text ?? '';
  const n = text.length;
  const tags = new Uint8Array(n); // 0=plain, 1=AI, 2=plagiarism

  // Mark plagiarism spans
  const chunks = doc.plagiarism_result?.chunks ?? [];
  for (const chunk of chunks) {
    if (chunk.plagiarism_score >= 20) {
      let pos = 0;
      while (true) {
        const idx = text.indexOf(chunk.text, pos);
        if (idx === -1) break;
        tags.fill(2, idx, idx + chunk.text.length);
        pos = idx + 1;
      }
    }
  }

  // Mark AI sentences (only if AI score is meaningful)
  if ((doc.ai_result?.ai_score ?? 0) > 15) {
    const aiScore = doc.ai_result.ai_score;
    const AI_KEYWORDS = [
      'delve', 'tapestry', 'moreover', 'furthermore', 'testament', 'notably',
      'in conclusion', 'it is important to note', 'consequently', 'pivotal',
      'beacon', 'comprehensive', 'demystify', 'multifaceted', 'paramount',
    ];

    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const sentences = [];
    let m;
    let last = 0;
    while ((m = sentenceRegex.exec(text)) !== null) {
      sentences.push({ start: last, end: sentenceRegex.lastIndex, score: 0 });
      last = sentenceRegex.lastIndex;
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
        if (tags[i] === 0) tags[i] = 1;
      }
    }
  }

  // Build HTML string
  const escape = (c) => {
    if (c === '&') return '&amp;';
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '\n') return '<br/>';
    return c;
  };

  const parts = [];
  let cur = 0;
  for (let i = 0; i < n; i++) {
    const t = tags[i];
    if (t !== cur) {
      if (cur !== 0) parts.push('</mark>');
      if (t === 1)
        parts.push('<mark class="bg-blue-100/80 text-blue-900 border-b border-blue-300 px-0.5 rounded-sm">');
      else if (t === 2)
        parts.push('<mark class="bg-red-100/80 text-red-900 border-b border-red-300 px-0.5 rounded-sm">');
      cur = t;
    }
    parts.push(escape(text[i]));
  }
  if (cur !== 0) parts.push('</mark>');

  const raw = parts.join('');
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['mark', 'br'],
    ALLOWED_ATTR: ['class'],
  });
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const ScoreGauge = ({ score, color, label, loading: busy, failed, onRun, running }) => {
  const stroke = color === 'red' ? '#ef4444' : color === 'amber' ? '#f59e0b' : '#10b981';
  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-6 text-center shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">{label}</h3>
      {busy ? (
        <div className="py-10 animate-pulse text-slate-400">
          <HiOutlineRefresh className="text-4xl mx-auto mb-2 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Analysing…</span>
        </div>
      ) : failed ? (
        <div className="py-10 text-red-500">
          <HiOutlineExclamationCircle className="text-4xl mx-auto mb-2" />
          <span className="text-sm font-medium">Scan Failed</span>
        </div>
      ) : score !== null ? (
        <div className="relative w-36 h-36 mx-auto mb-2">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={stroke}
              strokeWidth="3"
              strokeDasharray={`${score} 100`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold" style={{ color: stroke }}>{score}%</span>
          </div>
        </div>
      ) : (
        <div className="py-8 text-slate-400">
          <p className="text-sm font-semibold mb-3">Not Started</p>
          <button
            onClick={onRun}
            disabled={running}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer disabled:opacity-50"
            style={{ borderColor: stroke, color: stroke }}
          >
            {running ? 'Queuing…' : 'Run Scan'}
          </button>
        </div>
      )}
    </div>
  );
};

const IntegrityCard = ({ flags }) => {
  if (!flags) return null;
  if (flags.length === 0) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Integrity Overview
        </h3>
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100/50 rounded-xl text-emerald-800">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <HiOutlineCheckCircle className="text-xl text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold">0 Flags Detected</p>
            <p className="text-xs text-emerald-600 mt-0.5 font-medium">No evasion tactics detected.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-5 border border-red-150 shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Integrity Overview
      </h3>
      {/* Pulsating warning banner */}
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 mb-4 animate-pulse ring-2 ring-red-100/50">
        <HiOutlineShieldExclamation className="text-2xl flex-shrink-0 text-red-600" />
        <div>
          <p className="text-sm font-bold">{flags.length} Integrity Warning{flags.length > 1 ? 's' : ''}</p>
          <p className="text-xs text-red-600 mt-0.5 font-medium">Possible scan-evasion tactics detected.</p>
        </div>
      </div>
      <div className="space-y-2">
        {flags.map((flag, i) => (
          <div key={i} className="p-3 bg-red-50/60 border border-red-100 rounded-lg">
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">{flag.type}</p>
            <p className="text-sm text-text-primary mt-1 leading-relaxed">{flag.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ScanReport() {
  const { id } = useParams();
  const [doc, setDoc]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [trigAi, setTrigAi]         = useState(false);
  const [trigPlag, setTrigPlag]     = useState(false);

  // ── Smart polling — starts on initial fetch, stops when both scans settle ──
  useEffect(() => {
    let intervalId = null;

    const fetchDoc = async () => {
      try {
        const res = await documentApi.getById(id);
        const data = res.data;
        setDoc(data);
        setLoading(false);

        const stillActive =
          isActive(data.ai_scan_status) || isActive(data.plagiarism_scan_status);

        if (!stillActive && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        } else if (stillActive && !intervalId) {
          intervalId = setInterval(fetchDoc, POLL_INTERVAL);
        }
      } catch (err) {
        console.error('Failed to fetch document', err);
        setLoading(false);
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
      }
    };

    fetchDoc();

    return () => { if (intervalId) clearInterval(intervalId); };
  }, [id]);

  // ── Manual scan triggers ──
  const startAiScan = async () => {
    setTrigAi(true);
    try {
      await documentApi.startAiScan(id);
      toast.success('AI Detection scan queued!');
      setDoc((prev) => prev ? { ...prev, ai_scan_status: 'queued' } : null);
    } catch {
      toast.error('Failed to start AI scan.');
    } finally {
      setTrigAi(false);
    }
  };

  const startPlagiarismScan = async () => {
    setTrigPlag(true);
    try {
      await documentApi.startPlagiarismScan(id);
      toast.success('Plagiarism scan queued!');
      setDoc((prev) => prev ? { ...prev, plagiarism_scan_status: 'queued' } : null);
    } catch {
      toast.error('Failed to start plagiarism scan.');
    } finally {
      setTrigPlag(false);
    }
  };

  const downloadReport = async () => {
    setDownloading(true);
    try {
      const res = await documentApi.downloadReport(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      const safe = (doc?.original_file_name ?? 'report').replace(/[^a-zA-Z0-9._-]/g, '');
      a.download = `Originality_Report_${safe.split('.')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch {
      toast.error('Failed to generate PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Derived state ──
  const aiStatus   = doc?.ai_scan_status;
  const plagStatus = doc?.plagiarism_scan_status;
  const aiOk   = aiStatus === 'completed';
  const plagOk  = plagStatus === 'completed';
  const reportReady = aiOk && plagOk;
  const plagScore = doc?.plagiarism_result?.plagiarism_score ?? null;
  const aiScore   = doc?.ai_result?.ai_score ?? null;

  const highlightedHtml = useMemo(() => buildHighlightedHtml(doc), [doc]);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="fade-in max-w-5xl mx-auto text-center py-24">
        <div className="w-14 h-14 border-4 border-slate-200 border-t-accent-primary rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Loading Report…</h2>
        <p className="text-text-secondary text-sm">Retrieving submission details.</p>
      </div>
    );
  }

  // ── Both failed ──
  if (aiStatus === 'failed' && plagStatus === 'failed') {
    return (
      <div className="fade-in max-w-4xl mx-auto py-10">
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-14 text-center border border-red-150 bg-red-50/20 shadow-sm">
          <HiOutlineExclamationCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Analysis Failed</h2>
          <p className="text-red-600 text-sm mb-6 font-medium">Both AI detection and plagiarism scans encountered errors.</p>
          <Link to="/upload" className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-5 py-2.5 transition-all shadow-sm active:scale-95 cursor-pointer">Try Again</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/history"
            className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <HiOutlineChevronLeft className="text-xl" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2 truncate">
              <HiOutlineDocumentText className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{doc?.original_file_name}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              Uploaded {new Date(doc?.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={downloadReport}
          disabled={downloading || !reportReady}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all cursor-pointer ${
            reportReady
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100/50'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {downloading ? (
            <><div className="w-4 h-4 border-2 border-blue-300 border-t-white rounded-full animate-spin" /> Generating…</>
          ) : (
            <><HiOutlineDownload className="text-base" /> Download PDF Report</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="md:col-span-2 space-y-6">
          {/* Analysis Summaries */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5">Analysis Summaries</h2>
            <div className="space-y-5">
              {/* Plagiarism */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Plagiarism Check</h4>
                {plagOk ? (
                  <p className="text-slate-650 text-sm leading-relaxed font-medium">{doc?.plagiarism_result?.summary}</p>
                ) : plagStatus === 'failed' ? (
                  <p className="text-red-600 text-sm flex items-center gap-1.5 font-medium">
                    <HiOutlineExclamationCircle /> Plagiarism scan failed.
                  </p>
                ) : isActive(plagStatus) ? (
                  <p className="text-sm text-slate-450 flex items-center gap-2 animate-pulse font-medium">
                    <HiOutlineRefresh className="animate-spin text-red-500" />
                    Web search &amp; plagiarism analysis in progress…
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-slate-500 mb-3 font-medium">Plagiarism analysis has not been run.</p>
                    <button
                      onClick={startPlagiarismScan}
                      disabled={trigPlag}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-750 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                    >
                      {trigPlag
                        ? <><div className="w-3 h-3 border-2 border-red-300 border-t-white rounded-full animate-spin" /> Queuing…</>
                        : 'Start Plagiarism Scan'}
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Detection</h4>
                {aiOk ? (
                  <p className="text-slate-650 text-sm leading-relaxed font-medium">{doc?.ai_result?.summary}</p>
                ) : aiStatus === 'failed' ? (
                  <p className="text-red-600 text-sm flex items-center gap-1.5 font-medium">
                    <HiOutlineExclamationCircle /> AI scan failed.
                  </p>
                ) : isActive(aiStatus) ? (
                  <p className="text-sm text-slate-450 flex items-center gap-2 animate-pulse font-medium">
                    <HiOutlineRefresh className="animate-spin text-blue-500" />
                    Analysing sentence structures for AI signatures…
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-slate-500 mb-3 font-medium">AI detection has not been run.</p>
                    <button
                      onClick={startAiScan}
                      disabled={trigAi}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                    >
                      {trigAi
                        ? <><div className="w-3 h-3 border-2 border-blue-300 border-t-white rounded-full animate-spin" /> Queuing…</>
                        : 'Start AI Scan'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Highlighted Text */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Submission Text</h2>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200 inline-block" />
                  Plagiarism
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200 inline-block" />
                  AI Writing
                </span>
              </div>
            </div>
            <div
              className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-6 max-h-[600px] overflow-y-auto font-serif text-base text-slate-800 leading-loose selection:bg-yellow-100 custom-scrollbar"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">
          {/* Similarity gauge */}
          <ScoreGauge
            label="Similarity Score"
            score={plagOk ? plagScore : null}
            color={plagScore > 50 ? 'red' : plagScore > 0 ? 'amber' : 'green'}
            loading={isActive(plagStatus)}
            failed={plagStatus === 'failed'}
            onRun={startPlagiarismScan}
            running={trigPlag}
          />

          {/* AI gauge */}
          <ScoreGauge
            label="AI Detection"
            score={aiOk ? aiScore : null}
            color={aiScore > 50 ? 'red' : aiScore > 0 ? 'amber' : 'green'}
            loading={isActive(aiStatus)}
            failed={aiStatus === 'failed'}
            onRun={startAiScan}
            running={trigAi}
          />

          {/* Integrity Card */}
          <IntegrityCard flags={doc?.integrity_flags} />

          {/* Document Metadata */}
          {doc?.metadata && (
            <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Document Metadata
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: 'Pages',      value: doc.metadata.page_count ?? 1 },
                  { label: 'Words',      value: (doc.metadata.token_count ?? 0).toLocaleString() },
                  { label: 'Characters', value: (doc.metadata.character_count ?? 0).toLocaleString() },
                  { label: 'File Size',  value: doc.metadata.file_size ? `${(doc.metadata.file_size / 1024).toFixed(1)} KB` : 'N/A' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-base font-extrabold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Sources */}
          {(doc?.plagiarism_result?.matched_sources?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched Sources</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {doc.plagiarism_result.matched_sources.map((src, i) => (
                  <div key={i} className="px-5 py-3 hover:bg-slate-50/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline break-all flex items-start gap-1"
                      >
                        <HiOutlineExternalLink className="flex-shrink-0 mt-0.5 text-blue-500" />
                        {src.url}
                      </a>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-bold border ${
                        src.similarity_score > 50 ? 'bg-red-50 text-red-650 border-red-100/50' : 'bg-amber-50 text-amber-650 border-amber-100/50'
                      }`}>
                        {src.similarity_score}%
                      </span>
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
