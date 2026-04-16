import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Code2, Users, FileText, LogOut, ChevronRight, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/problems', icon: Code2, label: 'Problems' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/submissions', icon: FileText, label: 'Submissions' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div style={S.root}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sideTop}>
          <div style={S.brand}>
            <div style={S.brandIcon}><Shield size={14} /></div>
            <div>
              <div style={S.brandName}>AlgoForge</div>
              <div style={S.brandSub}>Admin Panel</div>
            </div>
          </div>

          <nav style={S.nav}>
            {NAV.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end}
                style={({ isActive }) => ({ ...S.navLink, ...(isActive ? S.navActive : {}) })}>
                <Icon size={16} />
                <span>{label}</span>
                <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.4 }} />
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={S.sideBot}>
          <div style={S.userRow}>
            <div style={S.userAvatar}>{user?.username?.[0]?.toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={S.userName}>{user?.username}</div>
              <div style={S.userRole}>Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} style={S.logoutBtn} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={S.main}>
        <Outlet />
      </main>
    </div>
  );
}

const S = {
  root: { display: 'flex', minHeight: '100vh', background: 'var(--bg-0)' },
  sidebar: {
    width: 220, flexShrink: 0, background: 'var(--bg-1)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh',
  },
  sideTop: { flex: 1, overflow: 'auto', padding: '1.25rem 0.75rem' },
  brand: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem', marginBottom: '2rem' },
  brandIcon: { width: 30, height: 30, borderRadius: 7, background: 'var(--red-dim)', border: '1px solid #f4433640', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', flexShrink: 0 },
  brandName: { fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em' },
  brandSub: { fontSize: '0.65rem', color: 'var(--red)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' },
  nav: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  navLink: { display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-2)', transition: 'all 0.15s', textDecoration: 'none' },
  navActive: { background: 'var(--bg-3)', color: 'var(--text-0)', borderLeft: '2px solid var(--green)', paddingLeft: 'calc(0.75rem - 2px)' },
  sideBot: { padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  userRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 },
  userAvatar: { width: 28, height: 28, borderRadius: '50%', background: 'var(--red-dim)', border: '1px solid #f4433640', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--red)', flexShrink: 0 },
  userName: { fontSize: '0.78rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { fontSize: '0.65rem', color: 'var(--text-3)' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '0.35rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.15s' },
  main: { flex: 1, overflow: 'auto', padding: '2rem 2.5rem' },
};
