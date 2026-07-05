import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', { name, email, password });
      toast.success('Account created successfully!');
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md clean-card p-8 sm:p-10 fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-md">
            T
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create an Account</h1>
          <p className="text-text-secondary mt-2 text-sm">Join Turnitin to start analyzing documents.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="input-field pl-10" 
                placeholder="John Doe" 
                required 
              />
              <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="input-field pl-10" 
                placeholder="john@example.com" 
                required 
              />
              <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="input-field pl-10" 
                placeholder="••••••••" 
                minLength={6} 
                required 
              />
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
            </div>
            <p className="text-xs text-text-muted mt-2">Must be at least 6 characters long.</p>
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
