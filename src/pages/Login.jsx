import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed. Please check your credentials.');
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
          <h1 className="text-2xl font-bold text-text-primary">Log in to Turnitin</h1>
          <p className="text-text-secondary mt-2 text-sm">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="input-field pl-10" 
                placeholder="Enter your email" 
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
                required 
              />
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-accent-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
