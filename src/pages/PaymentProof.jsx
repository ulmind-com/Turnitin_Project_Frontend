import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUpload, HiOutlineArrowLeft, HiOutlineClipboardCopy } from 'react-icons/hi';

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
      toast.error('Plan not found');
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error('Please upload a payment screenshot');
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
      toast.success('Payment proof submitted! Awaiting admin review.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return <div className="skeleton h-96 rounded-2xl max-w-2xl mx-auto" />;
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <button onClick={() => navigate('/plans')} className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-6">
        <HiOutlineArrowLeft /> Back to Plans
      </button>

      <h1 className="text-2xl font-bold text-text-primary mb-2">Complete Payment</h1>
      <p className="text-text-secondary mb-8">Make payment and submit proof for <strong className="text-accent-primary">{plan?.name}</strong></p>

      {/* Payment Details Card */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Payment Details</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-bg-primary rounded-xl">
            <span className="text-sm text-text-secondary">Amount</span>
            <span className="text-lg font-bold font-mono text-accent-primary">₹{plan?.price}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-bg-primary rounded-xl">
            <span className="text-sm text-text-secondary">Credits</span>
            <span className="text-lg font-bold font-mono text-accent-success">{plan?.credits} scans</span>
          </div>
          <div className="p-3 bg-bg-primary rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">UPI ID</span>
              <button onClick={() => copyToClipboard('scanvault@upi')} className="text-xs text-accent-primary hover:underline flex items-center gap-1">
                Copy <HiOutlineClipboardCopy />
              </button>
            </div>
            <p className="text-sm font-mono text-text-primary">scanvault@upi</p>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Submit Payment Proof</h3>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Transaction ID / UTR Number</label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="input-field"
            placeholder="Enter your transaction ID"
            required
            minLength={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Payment Screenshot</label>
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              screenshot ? 'border-accent-success/30 bg-accent-success/5' : 'border-border hover:border-accent-primary/30'
            }`}
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
                <HiOutlineUpload className="text-accent-success text-xl" />
                <span className="text-sm text-accent-success font-medium">{screenshot.name}</span>
              </div>
            ) : (
              <>
                <HiOutlineUpload className="text-2xl text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-secondary">Click to upload screenshot</p>
                <p className="text-xs text-text-muted">JPEG, PNG, WebP</p>
              </>
            )}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Payment Proof'}
        </button>
      </form>
    </div>
  );
}
