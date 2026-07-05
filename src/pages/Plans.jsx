import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineBadgeCheck, HiOutlineLightningBolt, HiOutlineShieldCheck } from 'react-icons/hi';

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
      toast.error('Failed to load access protocols');
    } finally {
      setLoading(false);
    }
  };

  const planIcons = [HiOutlineBadgeCheck, HiOutlineLightningBolt, HiOutlineShieldCheck];
  const planColors = ['accent-primary', 'accent-secondary', 'accent-success'];
  const neonColors = ['neon-cyan', 'neon-purple', 'neon-green'];

  if (loading) {
    return (
      <div className="space-y-6 fade-in relative z-10">
        <div className="skeleton h-8 w-48 bg-accent-primary/20" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-80 cyber-card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in relative z-10">
      <div className="border-b border-accent-primary/20 pb-4 mb-8 relative">
        <div className="absolute bottom-0 right-0 w-32 h-[1px] bg-accent-primary shadow-[0_0_10px_rgba(0,240,255,1)]" />
        <h1 className="text-3xl font-display font-bold text-text-primary uppercase tracking-widest">
          Access <span className="text-neon-cyan glitch-hover">Protocols</span>
        </h1>
        <p className="text-text-muted font-mono text-xs mt-2 uppercase tracking-[0.2em]">Acquire operational clearance & scan credits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, i) => {
          const Icon = planIcons[i] || HiOutlineBadgeCheck;
          const colorClass = planColors[i] || 'accent-primary';
          const neonText = neonColors[i] || 'neon-cyan';
          const isPro = i === 1;

          return (
            <div key={plan.id} className={`cyber-card relative group hover:-translate-y-2 transition-transform duration-300 ${isPro ? `border-${colorClass} shadow-[0_0_30px_rgba(188,19,254,0.15)]` : `border-${colorClass}/30`}`}>
              {/* Highlight bar for PRO plan */}
              {isPro && <div className="absolute top-0 left-0 w-full h-1 bg-accent-secondary shadow-[0_0_10px_rgba(188,19,254,0.8)]" />}
              
              <div className={`p-6 bg-${colorClass}/5 border-b border-${colorClass}/20 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${colorClass}/10 rounded-full blur-2xl pointer-events-none group-hover:bg-${colorClass}/20 transition-colors`} />
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 bg-black border border-${colorClass} flex items-center justify-center relative shadow-[0_0_15px_rgba(var(--color-${colorClass}),0.3)]`} style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
                    <Icon className={`text-2xl text-${colorClass}`} />
                  </div>
                  {isPro && (
                    <span className="cyber-badge badge-purple bg-accent-secondary/20">RECOMMENDED</span>
                  )}
                </div>
                <h3 className={`text-xl font-display font-bold text-${neonText} uppercase tracking-widest`}>{plan.name}</h3>
                <p className="text-[10px] font-mono text-text-muted mt-2 uppercase tracking-[0.1em]">{plan.description}</p>
              </div>

              <div className="p-6 space-y-8 bg-black/40">
                <div className="flex items-baseline gap-2 border-b border-white/5 pb-4">
                  <span className={`text-4xl font-display font-bold text-text-primary group-hover:text-${neonText} transition-colors`}>₹{plan.price}</span>
                  <span className="text-text-muted font-mono text-xs uppercase tracking-widest">/ INITIATION</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 flex items-center justify-center mt-0.5`} style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)', backgroundColor: `var(--color-${colorClass})` }} />
                    <span className="text-xs font-mono text-text-secondary leading-relaxed uppercase"><strong className={`text-${colorClass}`}>{plan.credits}</strong> TARGET SCANS</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 flex items-center justify-center mt-0.5 opacity-70`} style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)', backgroundColor: `var(--color-${colorClass})` }} />
                    <span className="text-[11px] font-mono text-text-secondary leading-relaxed uppercase">Neural Plagiarism Detection</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 flex items-center justify-center mt-0.5 opacity-70`} style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)', backgroundColor: `var(--color-${colorClass})` }} />
                    <span className="text-[11px] font-mono text-text-secondary leading-relaxed uppercase">AI Pattern Analysis</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 flex items-center justify-center mt-0.5 opacity-70`} style={{ clipPath: 'polygon(0 50%, 100% 0, 100% 100%)', backgroundColor: `var(--color-${colorClass})` }} />
                    <span className="text-[11px] font-mono text-text-secondary leading-relaxed uppercase">Deep Source Cross-Ref</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/payment/${plan.id}`)}
                  className={`btn-cyber w-full group overflow-hidden ${isPro ? '!border-accent-secondary !text-accent-secondary hover:!bg-accent-secondary/10 hover:!shadow-[0_0_15px_rgba(188,19,254,0.4)]' : `!border-${colorClass} !text-${colorClass} hover:!bg-${colorClass}/10`}`}
                >
                  <span className="relative z-10">{isPro ? 'REQUEST CLEARANCE (PRO)' : 'REQUEST CLEARANCE'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
