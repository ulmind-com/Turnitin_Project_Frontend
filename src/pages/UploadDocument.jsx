import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCloudUpload, HiOutlineDocumentText } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function UploadDocument() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { user, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    
    // File validation
    const validTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload a TXT, PDF, or DOCX file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File is too large. Maximum size is 10MB.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    if (user?.credits <= 0) {
      toast.error('Insufficient credits. Please purchase a plan.');
      navigate('/plans');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Document uploaded successfully!');
      
      // Update local credits immediately
      await fetchProfile();
      
      // The backend returns scan_id = null if scanning happens async, or document ID
      const docId = res.data.document_id;
      if (docId) {
        navigate(`/report/${docId}`);
      } else {
        navigate('/history');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Upload failed. Please try again.';
      toast.error(errorMsg);
      if (err.response?.status === 402) {
        navigate('/plans');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">New Scan</h1>
        <p className="text-text-secondary mt-1">Upload a document to check for plagiarism and AI-generated content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Upload Area */}
          <div 
            className={`clean-card p-10 flex flex-col items-center justify-center text-center transition-all duration-200 border-2 border-dashed ${
              isDragging ? 'border-accent-primary bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
              isDragging ? 'bg-accent-primary text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {file ? <HiOutlineDocumentText className="text-3xl" /> : <HiOutlineCloudUpload className="text-3xl" />}
            </div>
            
            {file ? (
              <div className="space-y-4 w-full max-w-md mx-auto">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2">
                  <h4 className="font-bold text-text-primary text-sm border-b pb-2 mb-2 flex items-center gap-2">
                    <HiOutlineDocumentText className="text-accent-primary text-lg" /> Local File Metadata
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <span className="text-text-secondary font-medium">Name:</span>
                    <span className="col-span-2 text-text-primary truncate font-semibold">{file.name}</span>

                    <span className="text-text-secondary font-medium">Size:</span>
                    <span className="col-span-2 text-text-primary font-semibold">{(file.size / 1024).toFixed(1)} KB ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>

                    <span className="text-text-secondary font-medium">Last Modified:</span>
                    <span className="col-span-2 text-text-primary font-semibold">{new Date(file.lastModified).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setFile(null)} className="btn-secondary text-sm">
                    Remove File
                  </button>
                  <button 
                    onClick={handleUpload} 
                    className="btn-primary text-sm min-w-[180px]" 
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Upload & Consume Credit'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Drag & drop your file here</h3>
                <p className="text-sm text-text-secondary mb-6">or click the button below to browse</p>
                
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept=".txt,.pdf,.doc,.docx" 
                  onChange={(e) => handleFileSelect(e.target.files[0])} 
                />
                <label htmlFor="file-upload" className="btn-primary cursor-pointer">
                  Browse Files
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="clean-card p-6">
            <h3 className="font-semibold text-text-primary mb-4">Scan Information</h3>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-accent-primary font-bold text-xs">1</div>
                <p>Upload a PDF, Word Doc, or Text file (Max 10MB).</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-accent-primary font-bold text-xs">2</div>
                <p>One scan costs exactly <strong>1 credit</strong>.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-accent-primary font-bold text-xs">3</div>
                <p>Results are typically ready in under a minute.</p>
              </li>
            </ul>
          </div>
          
          <div className="clean-card p-6 bg-slate-50 border-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-text-primary">Your Credits</span>
              <span className="text-lg font-bold text-accent-primary">{user?.credits}</span>
            </div>
            {user?.credits === 0 && (
              <div className="mt-4">
                <p className="text-xs text-red-600 mb-3">You don't have enough credits to perform a scan.</p>
                <button onClick={() => navigate('/plans')} className="btn-primary w-full text-sm">
                  Get More Credits
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
