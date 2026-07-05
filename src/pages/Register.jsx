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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl ring-1 ring-slate-200/60 p-8 sm:p-10 shadow-xl border border-slate-100/50 fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4 shadow-lg shadow-blue-200">
            T
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Join Turnitin to start analyzing documents.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-855 font-medium" 
                placeholder="John Doe" 
                required 
              />
              <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-855 font-medium" 
                placeholder="john@example.com" 
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
                minLength={6} 
                required 
              />
              <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Must be at least 6 characters long.</p>
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 transition-all duration-200 shadow-lg shadow-blue-100/50 active:scale-95 w-full cursor-pointer" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
