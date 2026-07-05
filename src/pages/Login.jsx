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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl ring-1 ring-slate-200/60 p-8 sm:p-10 shadow-xl border border-slate-100/50 fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-lg shadow-blue-200">
            T
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Log in to Turnitin</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-855 font-medium" 
                placeholder="Enter your email" 
                required 
              />
              <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-855 font-medium" 
                placeholder="••••••••" 
                required 
              />
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            </div>
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 transition-all duration-200 shadow-lg shadow-blue-100/50 active:scale-95 w-full cursor-pointer" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
