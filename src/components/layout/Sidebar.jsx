import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineHome, HiOutlineUpload, HiOutlineClock, HiOutlineCreditCard, HiOutlineLogout, HiOutlineDocumentSearch } from 'react-icons/hi';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/upload', icon: HiOutlineUpload, label: 'Upload Document' },
    { to: '/history', icon: HiOutlineClock, label: 'Scan History' },
    { to: '/plans', icon: HiOutlineCreditCard, label: 'Plans' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-secondary border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <HiOutlineDocumentSearch className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">ScanVault</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">Plagiarism Detection</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              }`
            }
          >
            <Icon className="text-lg" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Credits */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="glass-card p-3 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted uppercase tracking-wider">Credits</span>
            <span className="text-lg font-bold font-mono text-accent-primary">{user?.credits ?? 0}</span>
          </div>
          <div className="w-full h-1.5 bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (user?.credits ?? 0) * 2)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-sm font-bold text-accent-primary uppercase">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-text-muted hover:text-accent-danger transition-colors" title="Logout">
            <HiOutlineLogout className="text-lg" />
          </button>
        </div>
      </div>
    </aside>
  );
}
