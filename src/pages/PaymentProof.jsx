import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCloudUpload, HiOutlineShieldCheck, HiOutlineCreditCard } from 'react-icons/hi';

export default function PaymentProof() {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get('/api/plans');
        const found = res.data.plans?.find(p => p.id === parseInt(planId));
        if (found) setPlan(found);
        else {
          toast.error('Plan not found');
          navigate('/plans');
        }
      } catch (err) {
        toast.error('Failed to load plan details');
        navigate('/plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error('Please upload a screenshot of your payment');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('plan_id', planId);
    formData.append('transaction_id', transactionId);
    formData.append('screenshot', screenshot);

    try {
      await api.post('/api/payments/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Payment submitted successfully! Waiting for admin approval.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-accent-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="fade-in max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Complete Your Purchase</h1>
        <p className="text-text-secondary mt-1">Submit your payment details to get access to {plan?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Details */}
        <div className="space-y-6">
          <div className="clean-card p-6 bg-slate-50 border-transparent">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <HiOutlineCreditCard className="text-xl text-accent-primary" /> Order Summary
            </h3>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-text-secondary">Plan</span>
              <span className="font-semibold text-text-primary">{plan?.name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-text-secondary">Credits</span>
              <span className="font-semibold text-text-primary">{plan?.credits} Scans</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-text-primary font-bold">Total Amount</span>
              <span className="text-2xl font-bold text-accent-primary">₹{plan?.price}</span>
            </div>
          </div>

          <div className="clean-card p-6 border-accent-primary bg-blue-50/50">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
              <HiOutlineShieldCheck className="text-xl text-emerald-600" /> Payment Instructions
            </h3>
            <p className="text-sm text-text-secondary mb-4">Please scan the QR code below or transfer the amount to the provided UPI ID.</p>
            <div className="bg-white p-4 rounded-xl border border-border text-center">
              <div className="w-48 h-48 bg-slate-100 mx-auto mb-4 border border-border flex items-center justify-center">
                <span className="text-slate-400">QR CODE HERE</span>
              </div>
              <p className="font-mono font-bold text-text-primary">merchant@upi</p>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="clean-card p-8">
          <h3 className="text-xl font-bold text-text-primary mb-6">Submit Proof</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Transaction ID / UTR</label>
              <input 
                type="text" 
                value={transactionId} 
                onChange={(e) => setTransactionId(e.target.value)} 
                className="input-field" 
                placeholder="e.g. 31234567890" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Payment Screenshot</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                {screenshot ? (
                  <div className="space-y-2">
                    <p className="font-medium text-text-primary">{screenshot.name}</p>
                    <button type="button" onClick={() => setScreenshot(null)} className="text-sm text-red-600 hover:underline">Remove</button>
                  </div>
                ) : (
                  <>
                    <HiOutlineCloudUpload className="text-3xl text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-text-secondary mb-2">Upload screenshot of successful payment</p>
                    <input 
                      type="file" 
                      id="screenshot" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => setScreenshot(e.target.files[0])} 
                    />
                    <label htmlFor="screenshot" className="btn-secondary cursor-pointer mt-2 inline-block">
                      Browse Image
                    </label>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Payment Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
