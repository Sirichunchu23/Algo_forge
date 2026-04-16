import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2, LayoutList, History, User, LogOut, ChevronRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const loc = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const isActive = (path) => loc.pathname === path || loc.pathname.startsWith(path + '/');

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        {/* Logo */}
        <Link to="/problems" style={S.logo}>
          <div style={S.logoIcon}><Code2 size={16} /></div>
          <span style={S.logoText}>Algo<span style={{ color: 'var(--green)' }}>Forge</span></span>
        </Link>

        {/* Nav links */}
        <div style={S.links}>
          <NavLink to="/problems" icon={<LayoutList size={15} />} label="Problems" active={isActive('/problems')} />
          {user?.role === 'student' && (
            <NavLink to="/submissions" icon={<History size={15} />} label="Submissions" active={isActive('/submissions')} />
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" icon={<ChevronRight size={15} />} label="Admin Panel" active={isActive('/admin')} />
          )}
        </div>

        {/* Right */}
        <div style={S.right}>
          {user && (
            <>
              <div style={S.userChip}>
                <div style={S.avatar}>{user.username[0].toUpperCase()}</div>
                <span style={S.username}>{user.username}</span>
                <span style={{ ...S.rolePill, background: user.role === 'admin' ? 'var(--red-dim)' : 'var(--green-dim)', color: user.role === 'admin' ? 'var(--red)' : 'var(--green)' }}>
                  {user.role}
                </span>
              </div>
              <Link to="/profile" style={{ ...S.iconBtn, ...(isActive('/profile') ? { color: 'var(--green)' } : {}) }} title="Profile">
                <User size={16} />
              </Link>
              <button onClick={handleLogout} style={S.iconBtn} title="Logout">
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label, active }) {
  return (
    <Link to={to} style={{ ...S.navLink, ...(active ? S.navLinkActive : {}) }}>
      {icon}<span>{label}</span>
    </Link>
  );
}

const S = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    height: '3.5rem', background: 'rgba(13,13,13,0.97)',
    borderBottom: '1px solid var(--border)', backdropFilter: 'blur(8px)',
  },
  inner: {
    maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem',
    height: '100%', display: 'flex', alignItems: 'center', gap: '1.5rem',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 },
  logoIcon: {
    width: 28, height: 28, borderRadius: 6, background: 'var(--green)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000',
  },
  logoText: { fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' },
  links: { display: 'flex', gap: '0.25rem', flex: 1 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.4rem 0.7rem', borderRadius: 'var(--radius)',
    fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)',
    transition: 'all var(--transition)',
  },
  navLinkActive: { color: 'var(--text-0)', background: 'var(--bg-3)' },
  right: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexShrink: 0 },
  userChip: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  avatar: {
    width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-4)',
    border: '1px solid var(--green)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)',
  },
  username: { fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-1)' },
  rolePill: {
    fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.4rem',
    borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  iconBtn: {
    width: 32, height: 32, borderRadius: 'var(--radius)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-2)', transition: 'all var(--transition)',
    background: 'none', border: 'none', cursor: 'pointer',
  },
};
