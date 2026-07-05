import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUpload, HiOutlineDocumentText, HiOutlineX } from 'react-icons/hi';

export default function UploadDocument() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      toast.error('INVALID FORMAT - PDF/DOCX ONLY', { style: { background: '#000', color: '#ff003c', border: '1px solid #ff003c' }});
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('FILE EXCEEDS 10MB LIMIT', { style: { background: '#000', color: '#ff003c', border: '1px solid #ff003c' }});
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('DATA ACCEPTED - INITIALIZING SCAN', { style: { background: '#000', color: '#00f0ff', border: '1px solid #00f0ff' }});
      navigate(`/report/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'TRANSFER FAILED', { style: { background: '#000', color: '#ff003c', border: '1px solid #ff003c' }});
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto fade-in relative z-10">
      <div className="border-b border-accent-primary/20 pb-4 mb-8 relative">
        <div className="absolute bottom-0 right-0 w-32 h-[1px] bg-accent-primary shadow-[0_0_10px_rgba(0,240,255,1)]" />
        <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-widest">
          Target <span className="text-neon-cyan glitch-hover">Acquisition</span>
        </h1>
        <p className="text-text-muted font-mono text-xs mt-2 uppercase tracking-[0.2em]">Deploy documents for deep-scan analysis</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`cyber-card p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
          dragOver ? 'border-accent-primary bg-accent-primary/10 shadow-[inset_0_0_30px_rgba(0,240,255,0.2)]' : 'bg-black/40'
        } ${file ? 'border-accent-success/50 bg-accent-success/5' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {/* Animated Laser Scan Line (Active when dragging or processing) */}
        {(dragOver || uploading) && <div className="scan-line-anim" />}
        
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
          className="hidden"
          disabled={uploading}
        />

        <div className="relative z-10">
          {!file ? (
            <>
              <div className="w-20 h-20 bg-black border border-accent-primary/50 flex items-center justify-center mx-auto mb-6 transition-all group-hover:border-accent-primary group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
                <HiOutlineUpload className="text-4xl text-accent-primary/50 group-hover:text-neon-cyan transition-all" />
              </div>
              <p className="text-xl font-display font-bold text-text-primary mb-2 uppercase tracking-widest group-hover:text-neon-cyan transition-colors">
                Transmit File
              </p>
              <p className="text-xs font-mono text-text-muted uppercase tracking-[0.1em]">DRAG & DROP OR CLICK TO INITIATE TRANSFER</p>
              <div className="mt-6 flex justify-center gap-4">
                <span className="cyber-badge badge-cyan">PDF</span>
                <span className="cyber-badge badge-cyan">DOCX</span>
                <span className="cyber-badge border-text-muted text-text-muted">MAX 10MB</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-accent-success/10 border border-accent-success flex items-center justify-center shadow-[0_0_20px_rgba(0,255,65,0.3)] animate-pulse" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
                <HiOutlineDocumentText className="text-3xl text-neon-green" />
              </div>
              <div>
                <p className="text-lg font-display font-bold text-neon-green uppercase tracking-wider">{file.name}</p>
                <p className="text-xs font-mono text-text-muted uppercase mt-1">SIZE: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!uploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-4 flex items-center gap-2 text-xs font-mono text-accent-danger hover:text-white transition-colors"
                >
                  <HiOutlineX /> ABORT UPLOAD
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      {file && (
        <div className="mt-8 flex justify-end fade-in">
          <button onClick={handleUpload} className="btn-cyber w-full md:w-auto" disabled={uploading}>
            {uploading ? (
              <span className="flex items-center gap-3 relative z-10">
                <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                TRANSMITTING DATA...
              </span>
            ) : (
              <span className="relative z-10 text-lg">INITIATE SCAN PROTOCOL</span>
            )}
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-12 cyber-card p-6 bg-black/40 border-accent-primary/20">
        <h3 className="text-xs font-display font-bold text-accent-primary mb-4 uppercase tracking-[0.2em]">Operational Sequence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'ESTABLISH SECURE CONNECTION & UPLOAD TARGET FILE',
            'SYSTEM CHUNKS TEXT INTO MANAGEABLE DATA BLOCKS',
            'CROSS-REFERENCE AGAINST GLOBAL WEB DATABASES',
            'AI PATTERN RECOGNITION & NEURAL ANALYSIS',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-4 p-3 bg-white/5 border border-white/5 hover:border-accent-primary/30 transition-colors group">
              <span className="w-6 h-6 bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-[10px] font-mono font-bold text-accent-primary flex-shrink-0 group-hover:bg-accent-primary group-hover:text-black transition-colors" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
                0{i + 1}
              </span>
              <p className="text-[10px] font-mono text-text-secondary mt-1 group-hover:text-text-primary transition-colors">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
