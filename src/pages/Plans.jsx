import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { HiOutlineCheck } from 'react-icons/hi';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/api/plans');
        setPlans(res.data.plans || []);
      } catch (error) {
        console.error('Failed to fetch plans', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="fade-in max-w-6xl mx-auto py-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          Choose the plan that best fits your needs. Buy credits once and use them whenever you want. No expiring credits.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => <div key={i} className="h-96 bg-slate-200 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={plan.id} className={`clean-card p-8 flex flex-col relative ${index === 1 ? 'border-2 border-accent-primary transform md:-translate-y-4 shadow-xl' : 'border border-border'}`}>
              {index === 1 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-text-primary">₹{plan.price}</span>
                </div>
                <p className="text-sm font-semibold text-accent-primary mt-2">{plan.credits} Scans Included</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineCheck className="text-emerald-600 text-sm" />
                  </div>
                  <span className="text-sm text-text-secondary">Plagiarism detection</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineCheck className="text-emerald-600 text-sm" />
                  </div>
                  <span className="text-sm text-text-secondary">AI content detection</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineCheck className="text-emerald-600 text-sm" />
                  </div>
                  <span className="text-sm text-text-secondary">Detailed PDF Reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineCheck className="text-emerald-600 text-sm" />
                  </div>
                  <span className="text-sm text-text-secondary">Never expires</span>
                </li>
              </ul>
              
              <button onClick={() => navigate(`/payment/${plan.id}`)} className={`w-full py-3 rounded-xl font-bold transition-colors ${index === 1 ? 'bg-accent-primary text-white hover:bg-[#005bb5]' : 'bg-slate-100 text-text-primary hover:bg-slate-200'}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
