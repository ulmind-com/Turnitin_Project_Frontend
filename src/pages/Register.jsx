import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineViewGridAdd } from 'react-icons/hi';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('REGISTRATION COMPLETE', { icon: '🟢', style: { background: '#000', color: '#00ff41', border: '1px solid #00ff41' }});
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'REGISTRATION FAILED', { icon: '🔴', style: { background: '#000', color: '#ff003c', border: '1px solid #ff003c' }});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-accent-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-black border border-accent-secondary flex items-center justify-center mx-auto mb-6 relative shadow-[0_0_30px_rgba(188,19,254,0.4)]" style={{ clipPath: 'polygon(25% 0%, 100% 0, 100% 75%, 75% 100%, 0 100%, 0% 25%)' }}>
            <HiOutlineViewGridAdd className="text-accent-secondary text-4xl animate-pulse" />
            <div className="absolute inset-0 bg-accent-secondary/10 blur-md" />
          </div>
          <h1 className="text-4xl font-bold font-display text-neon-purple tracking-[0.1em] glitch-hover">NAK</h1>
          <p className="text-accent-secondary uppercase tracking-[0.3em] text-xs mt-2 font-bold opacity-80">Entity Registration</p>
        </div>

        <div className="cyber-card p-8 bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-accent-secondary/30">
          <div className="absolute top-0 left-4 w-12 h-1 bg-accent-secondary shadow-[0_0_10px_rgba(188,19,254,0.8)]" />
          <div className="absolute bottom-0 right-4 w-12 h-1 bg-accent-primary shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-display text-accent-secondary mb-2 uppercase tracking-[0.1em]">Operative Designation</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-cyber w-full focus:border-accent-secondary focus:shadow-[inset_0_0_10px_rgba(188,19,254,0.2),0_0_15px_rgba(188,19,254,0.2)]"
                placeholder="JOHN_DOE"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-display text-accent-secondary mb-2 uppercase tracking-[0.1em]">Target Identity</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-cyber w-full focus:border-accent-secondary focus:shadow-[inset_0_0_10px_rgba(188,19,254,0.2),0_0_15px_rgba(188,19,254,0.2)]"
                placeholder="OPERATIVE_EMAIL@SYS.COM"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-display text-accent-secondary mb-2 uppercase tracking-[0.1em]">Security Passcode</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-cyber w-full focus:border-accent-secondary focus:shadow-[inset_0_0_10px_rgba(188,19,254,0.2),0_0_15px_rgba(188,19,254,0.2)]"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-cyber w-full mt-4 !border-accent-secondary !text-accent-secondary hover:!bg-accent-secondary/10 hover:!shadow-[0_0_15px_rgba(188,19,254,0.4)]" disabled={loading}>
              <span className="relative z-10">{loading ? 'INITIALIZING...' : 'CREATE ENTITY'}</span>
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-accent-secondary/20 text-center">
            <p className="text-[11px] text-text-muted font-mono uppercase">
              EXISTING ENTITY?{' '}
              <Link to="/login" className="text-accent-primary font-bold hover:text-accent-secondary transition-colors tracking-widest drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                AUTHENTICATE
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
