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
      toast.error('Only PDF and DOCX files are supported');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
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
      toast.success('Document uploaded! Scan started.');
      navigate(`/report/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Upload Document</h1>
      <p className="text-text-secondary mb-8">Upload a PDF or DOCX file to scan for plagiarism and AI-generated content</p>

      {/* Drop Zone */}
      <div
        className={`glass-card rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          dragOver ? 'border-accent-primary bg-accent-primary/5 scale-[1.01]' : ''
        } ${file ? 'border-accent-success/30' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => e.target.files[0] && validateAndSetFile(e.target.files[0])}
          className="hidden"
        />

        {!file ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
              <HiOutlineUpload className="text-3xl text-accent-primary" />
            </div>
            <p className="text-lg font-semibold text-text-primary mb-2">
              Drag & drop your file here
            </p>
            <p className="text-sm text-text-secondary">or click to browse • PDF, DOCX up to 10MB</p>
          </>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-success/10 flex items-center justify-center">
              <HiOutlineDocumentText className="text-2xl text-accent-success" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">{file.name}</p>
              <p className="text-xs text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="text-text-muted hover:text-accent-danger transition-colors"
            >
              <HiOutlineX className="text-xl" />
            </button>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {file && (
        <div className="mt-6 flex justify-end">
          <button onClick={handleUpload} className="btn-primary" disabled={uploading}>
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Scanning...
              </span>
            ) : (
              'Start Scan'
            )}
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-3">How it works</h3>
        <div className="space-y-3">
          {[
            'Upload your PDF or DOCX file',
            'Our engine extracts and chunks the text',
            'Each chunk is checked against web sources and analyzed for AI patterns',
            'View your detailed split-screen report',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-primary/10 flex items-center justify-center text-xs font-bold text-accent-primary flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-text-secondary">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
