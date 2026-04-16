import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function NotFound() {
  const { user } = useAuthStore();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontFamily: 'var(--font-code)', fontSize: '5rem', fontWeight: 800, color: 'var(--bg-4)', lineHeight: 1 }}>404</div>
      <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.9rem', color: 'var(--green)' }}>
        <span style={{ color: 'var(--text-3)' }}>Error: </span>PageNotFoundException
      </div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.5rem' }}>Page not found</h1>
      <p style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>This route doesn't exist in the codebase.</p>
      <Link to={user ? '/problems' : '/login'} className="btn btn-green" style={{ marginTop: '0.5rem' }}>
        ← Go Home
      </Link>
    </div>
  );
}
