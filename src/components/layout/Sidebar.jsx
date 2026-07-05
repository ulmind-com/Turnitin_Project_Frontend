import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineHome, HiOutlineDocumentAdd, HiOutlineCollection, HiOutlineCreditCard, HiOutlineLogout } from 'react-icons/hi';

export default function Sidebar({ className }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/upload', icon: HiOutlineDocumentAdd, label: 'New Scan' },
    { to: '/history', icon: HiOutlineCollection, label: 'History' },
    { to: '/plans', icon: HiOutlineCreditCard, label: 'Plans & Pricing' },
  ];

  return (
    <aside className={`h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 ${className || 'w-64 flex-shrink-0'}`}>
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl shadow-sm">
          T
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Turnitin</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            <Icon className="text-xl" /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 border border-blue-100">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="px-2 mb-4 text-xs font-semibold text-slate-500 flex items-center justify-between">
          <span>Available Credits:</span>
          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100/60">{user?.credits}</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 cursor-pointer">
          <HiOutlineLogout className="text-xl" /> Logout
        </button>
      </div>
    </aside>
  );
}
