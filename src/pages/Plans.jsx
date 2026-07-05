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
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Choose the plan that best fits your needs. Buy credits once and use them whenever you want. No expiring credits.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => <div key={i} className="h-96 bg-slate-200/60 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={plan.id} className={`bg-white rounded-3xl p-8 flex flex-col relative transition-all duration-200 ${index === 1 ? 'ring-2 ring-blue-600 shadow-xl shadow-blue-100/50 transform md:-translate-y-4' : 'ring-1 ring-slate-200/60 shadow-sm hover:shadow-md'}`}>
              {index === 1 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6 flex flex-col">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">₹{plan.price}</span>
                </div>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/50 mt-3 self-start">{plan.credits} Scans Included</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineCheck className="text-emerald-600 text-sm" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">Plagiarism detection</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineCheck className="text-emerald-600 text-sm" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">AI content detection</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineCheck className="text-emerald-600 text-sm" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">Detailed PDF Reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineCheck className="text-emerald-600 text-sm" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">Never expires</span>
                </li>
              </ul>
              
              <button onClick={() => navigate(`/payment/${plan.id}`)} className={`w-full py-3 rounded-xl font-bold transition-all active:scale-95 cursor-pointer ${index === 1 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
