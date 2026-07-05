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
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="fade-in max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Complete Your Purchase</h1>
        <p className="text-slate-500 mt-1 font-medium">Submit your payment details to get access to {plan?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HiOutlineCreditCard className="text-xl text-slate-400" /> Order Summary
            </h3>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Plan</span>
              <span className="font-semibold text-slate-800">{plan?.name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Credits</span>
              <span className="font-semibold text-slate-800">{plan?.credits} Scans</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-900 font-bold">Total Amount</span>
              <span className="text-2xl font-extrabold text-blue-600">₹{plan?.price}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-6 shadow-sm border-blue-100/50 bg-blue-50/10">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HiOutlineShieldCheck className="text-xl text-emerald-600" /> Payment Instructions
            </h3>
            <p className="text-sm text-slate-500 mb-4 font-medium">Please scan the QR code below or transfer the amount to the provided UPI ID.</p>
            <div className="bg-white p-4 rounded-xl border border-slate-100 text-center shadow-inner">
              <div className="w-48 h-48 bg-slate-50 mx-auto mb-4 border border-slate-100 flex items-center justify-center rounded-lg">
                <span className="text-slate-400 font-medium">QR CODE HERE</span>
              </div>
              <p className="font-mono font-bold text-slate-800 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 inline-block">merchant@upi</p>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Submit Proof</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">Transaction ID / UTR</label>
              <input 
                type="text" 
                value={transactionId} 
                onChange={(e) => setTransactionId(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-slate-800" 
                placeholder="e.g. 31234567890" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">Payment Screenshot</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50/50 transition-colors">
                {screenshot ? (
                  <div className="space-y-2">
                    <p className="font-medium text-slate-800">{screenshot.name}</p>
                    <button type="button" onClick={() => setScreenshot(null)} className="text-sm text-red-600 hover:underline cursor-pointer">Remove</button>
                  </div>
                ) : (
                  <>
                    <HiOutlineCloudUpload className="text-3xl text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 mb-4 font-medium">Upload screenshot of successful payment</p>
                    <input 
                      type="file" 
                      id="screenshot" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => setScreenshot(e.target.files[0])} 
                    />
                    <label htmlFor="screenshot" className="border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg px-4 py-2 cursor-pointer mt-2 inline-block transition-all shadow-sm">
                      Browse Image
                    </label>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-3 transition-all duration-200 shadow-sm active:scale-95 w-full text-base cursor-pointer" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Payment Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
