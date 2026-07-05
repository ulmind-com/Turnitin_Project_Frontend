import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineHome, HiOutlineUpload, HiOutlineClock, HiOutlineCreditCard, HiOutlineLogout, HiOutlineViewGridAdd } from 'react-icons/hi';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/upload', icon: HiOutlineUpload, label: 'Scan Document' },
    { to: '/history', icon: HiOutlineClock, label: 'Data Logs' },
    { to: '/plans', icon: HiOutlineCreditCard, label: 'Access Passes' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-secondary border-r border-accent-primary/20 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-accent-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black border border-accent-primary flex items-center justify-center relative shadow-[0_0_15px_rgba(0,240,255,0.3)]" style={{ clipPath: 'polygon(20% 0%, 100% 0, 100% 80%, 80% 100%, 0 100%, 0% 20%)' }}>
            <HiOutlineViewGridAdd className="text-accent-primary text-xl" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary tracking-widest font-display text-neon-cyan">NAK</h1>
            <p className="text-[9px] text-accent-primary uppercase tracking-[0.2em] opacity-80">Detection Tool</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-display font-medium transition-all duration-300 relative overflow-hidden group ${
                isActive
                  ? 'text-accent-primary border border-accent-primary/50 shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]'
                  : 'text-text-secondary border border-transparent hover:text-accent-primary hover:border-accent-primary/30'
              }`
            }
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            {({ isActive }) => (
              <>
                <div className={`absolute left-0 top-0 w-1 h-full bg-accent-primary transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                <Icon className={`text-lg ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}`} />
                <span className="tracking-wide uppercase text-xs">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Credits */}
      <div className="p-4 border-t border-accent-primary/20 space-y-4 bg-black/40">
        <div className="cyber-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-accent-primary uppercase tracking-[0.15em]">Core Credits</span>
            <span className="text-lg font-bold font-mono text-neon-cyan">{user?.credits ?? 0}</span>
          </div>
          <div className="w-full h-1 bg-black border border-accent-primary/30 overflow-hidden relative">
            <div
              className="absolute left-0 top-0 h-full bg-accent-primary shadow-[0_0_10px_rgba(0,240,255,0.8)] transition-all duration-1000"
              style={{ width: `${Math.min(100, (user?.credits ?? 0) * 2)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-sm font-bold text-accent-primary uppercase" style={{ clipPath: 'polygon(20% 0%, 100% 0, 100% 80%, 80% 100%, 0 100%, 0% 20%)' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-display font-bold text-text-primary truncate">{user?.name}</p>
            <p className="text-[10px] text-text-muted font-mono truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-text-muted hover:text-accent-danger transition-colors group" title="System Logout">
            <HiOutlineLogout className="text-lg group-hover:drop-shadow-[0_0_8px_rgba(255,0,60,0.8)]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
