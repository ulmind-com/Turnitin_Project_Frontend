import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineLightningBolt, HiOutlineShieldCheck } from 'react-icons/hi';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/api/plans');
      setPlans(res.data.plans || []);
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const planIcons = [HiOutlineCheck, HiOutlineLightningBolt, HiOutlineShieldCheck];
  const planColors = ['accent-primary', 'accent-secondary', 'accent-success'];
  const planGradients = [
    'from-accent-primary/20 to-accent-primary/5',
    'from-accent-secondary/20 to-accent-secondary/5',
    'from-accent-success/20 to-accent-success/5',
  ];

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-80 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Subscription Plans</h1>
      <p className="text-text-secondary mb-8">Choose a plan and get scanning credits</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const Icon = planIcons[i] || HiOutlineCheck;
          const color = planColors[i] || 'accent-primary';
          const gradient = planGradients[i] || planGradients[0];

          return (
            <div key={plan.id} className={`glass-card rounded-2xl overflow-hidden ${i === 1 ? 'gradient-border' : ''}`}>
              <div className={`p-6 bg-gradient-to-b ${gradient}`}>
                <div className={`w-12 h-12 rounded-xl bg-${color}/20 flex items-center justify-center mb-4`}>
                  <Icon className={`text-2xl text-${color}`} />
                </div>
                <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                <p className="text-sm text-text-secondary mt-1">{plan.description}</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-mono text-text-primary">₹{plan.price}</span>
                  <span className="text-text-muted text-sm">/ one-time</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full bg-${color}/20 flex items-center justify-center`}>
                      <HiOutlineCheck className={`text-xs text-${color}`} />
                    </div>
                    <span className="text-sm text-text-secondary"><strong className="text-text-primary">{plan.credits}</strong> document scans</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full bg-${color}/20 flex items-center justify-center`}>
                      <HiOutlineCheck className={`text-xs text-${color}`} />
                    </div>
                    <span className="text-sm text-text-secondary">Plagiarism detection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full bg-${color}/20 flex items-center justify-center`}>
                      <HiOutlineCheck className={`text-xs text-${color}`} />
                    </div>
                    <span className="text-sm text-text-secondary">AI content analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full bg-${color}/20 flex items-center justify-center`}>
                      <HiOutlineCheck className={`text-xs text-${color}`} />
                    </div>
                    <span className="text-sm text-text-secondary">Detailed source reports</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/payment/${plan.id}`)}
                  className={i === 1 ? 'btn-primary w-full' : 'btn-secondary w-full'}
                >
                  Select Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
