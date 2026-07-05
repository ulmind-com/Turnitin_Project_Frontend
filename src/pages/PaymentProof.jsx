import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUpload, HiOutlineArrowLeft, HiOutlineClipboardCopy, HiOutlineCurrencyRupee } from 'react-icons/hi';

export default function PaymentProof() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const res = await api.get(`/api/plans/${planId}`);
      setPlan(res.data);
    } catch (err) {
      toast.error('PROTOCOL NOT FOUND', { style: { background: '#000', color: '#ff003c', border: '1px solid #ff003c' }});
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error('VISUAL PROOF REQUIRED', { style: { background: '#000', color: '#f59e0b', border: '1px solid #f59e0b' }});
      return;
    }
    setSubmitting(true);

    const formData = new FormData();
    formData.append('plan_id', planId);
    formData.append('transaction_id', transactionId);
    formData.append('screenshot', screenshot);

    try {
      await api.post('/api/payments/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('TRANSACTION SUBMITTED. AWAITING CLEARANCE.', { style: { background: '#000', color: '#00f0ff', border: '1px solid #00f0ff' }});
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'TRANSMISSION FAILED', { style: { background: '#000', color: '#ff003c', border: '1px solid #ff003c' }});
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('COPIED TO CLIPBOARD', { icon: '📋', style: { background: '#000', color: '#00f0ff', border: '1px solid #00f0ff' }});
  };

  if (loading) {
    return <div className="skeleton h-96 cyber-card max-w-2xl mx-auto" />;
  }

  return (
    <div className="max-w-2xl mx-auto fade-in relative z-10">
      <button onClick={() => navigate('/plans')} className="inline-flex items-center gap-2 text-[10px] font-mono text-text-secondary hover:text-neon-cyan transition-colors mb-6 uppercase tracking-widest">
        <HiOutlineArrowLeft /> ABORT TRANSACTION
      </button>

      <div className="border-b border-accent-secondary/20 pb-4 mb-8 relative">
        <div className="absolute bottom-0 right-0 w-32 h-[1px] bg-accent-secondary shadow-[0_0_10px_rgba(188,19,254,1)]" />
        <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-widest">
          Secure <span className="text-neon-purple glitch-hover">Transaction</span>
        </h1>
        <p className="text-text-muted font-mono text-xs mt-2 uppercase tracking-[0.2em]">Authorize payment for <span className="text-accent-secondary">{plan?.name}</span> clearance</p>
      </div>

      {/* Payment Details Card */}
      <div className="cyber-card p-6 mb-8 border-accent-secondary/30 bg-black/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-accent-secondary shadow-[0_0_15px_rgba(188,19,254,0.8)]" />
        <h3 className="text-[11px] font-display font-bold text-accent-secondary uppercase tracking-[0.2em] mb-6">Transaction Parameters</h3>
        
        <div className="space-y-4 ml-4">
          <div className="flex items-center justify-between p-4 bg-accent-secondary/5 border border-accent-secondary/20" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Required Funds</span>
            <span className="text-xl font-bold font-display text-neon-purple flex items-center gap-1"><HiOutlineCurrencyRupee /> {plan?.price}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-accent-primary/5 border border-accent-primary/20" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Clearance Level</span>
            <span className="text-sm font-bold font-mono text-neon-cyan">{plan?.credits} SCANS</span>
          </div>
          <div className="p-4 bg-black/50 border border-white/5" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Destination Node (UPI)</span>
              <button onClick={() => copyToClipboard('scanvault@upi')} className="text-[9px] font-mono font-bold text-accent-secondary hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest">
                [COPY] <HiOutlineClipboardCopy />
              </button>
            </div>
            <p className="text-lg font-mono text-text-primary tracking-wider">scanvault@upi</p>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="cyber-card p-8 bg-black/60 relative">
        <div className="absolute top-0 right-4 w-12 h-1 bg-accent-secondary shadow-[0_0_10px_rgba(188,19,254,0.8)]" />
        <h3 className="text-[11px] font-display font-bold text-accent-primary uppercase tracking-[0.2em] mb-6">Submit Verification</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono text-text-secondary mb-2 uppercase tracking-[0.15em]">Transaction ID (UTR)</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="input-cyber"
              placeholder="ENTER 12-DIGIT UTR..."
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-text-secondary mb-2 uppercase tracking-[0.15em]">Visual Proof (Screenshot)</label>
            <div
              className={`border border-dashed p-8 text-center cursor-pointer transition-all ${
                screenshot ? 'border-accent-success/50 bg-accent-success/5' : 'border-accent-primary/30 hover:border-accent-primary hover:bg-accent-primary/5'
              }`}
              style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                className="hidden"
              />
              {screenshot ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-accent-success/20 flex items-center justify-center rounded-full">
                    <HiOutlineUpload className="text-neon-green text-lg" />
                  </div>
                  <span className="text-sm font-mono text-neon-green">{screenshot.name}</span>
                </div>
              ) : (
                <>
                  <HiOutlineUpload className="text-3xl text-accent-primary/50 mx-auto mb-3" />
                  <p className="text-sm font-display font-bold text-text-primary uppercase tracking-widest">Select Image File</p>
                  <p className="text-[10px] font-mono text-text-muted mt-2 tracking-widest uppercase">ACCEPTED: JPEG, PNG, WEBP</p>
                </>
              )}
            </div>
          </div>

          <button type="submit" className="btn-cyber w-full mt-4" disabled={submitting}>
            {submitting ? 'TRANSMITTING...' : 'AUTHORIZE VERIFICATION'}
          </button>
        </div>
      </form>
    </div>
  );
}
