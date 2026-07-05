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
    <aside className={`h-screen bg-bg-secondary border-r border-border flex flex-col sticky top-0 ${className || 'w-64 flex-shrink-0'}`}>
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 bg-accent-primary rounded flex items-center justify-center text-white font-bold text-xl">
          T
        </div>
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Turnitin</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-accent-primary/10 text-accent-primary font-semibold' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'}`}>
            <Icon className="text-xl" /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-sm font-bold text-accent-primary">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <div className="px-2 mb-4 text-xs font-medium text-text-secondary">
          Credits: <span className="font-bold text-accent-primary">{user?.credits}</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm font-medium text-text-secondary hover:bg-accent-danger/10 hover:text-accent-danger transition-colors">
          <HiOutlineLogout className="text-xl" /> Logout
        </button>
      </div>
    </aside>
  );
}
