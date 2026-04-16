import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate(data.user.role === 'admin' ? '/admin' : '/problems');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div style={S.page}>
      <div style={S.grid}>
        {/* Left panel */}
        <div style={S.left}>
          <div style={S.brand}>
            <div style={S.brandIcon}><Code2 size={22} /></div>
            <span style={S.brandName}>Algo<span style={{ color: 'var(--green)' }}>Forge</span></span>
          </div>
          <h1 style={S.headline}>Code.<br />Solve.<br />Grow.</h1>
          <p style={S.sub}>Practice data structures & algorithms with instant feedback and detailed test results.</p>
          <div style={S.features}>
            {['6+ hand-crafted problems', 'Monaco editor with syntax highlighting', 'Detailed test case results', 'Submission history tracking'].map(f => (
              <div key={f} style={S.feature}><span style={S.dot} />  {f}</div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div style={S.right}>
          <div style={S.formCard}>
            <div style={S.formHeader}>
              <Terminal size={18} color="var(--green)" />
              <span style={S.formTitle}>Sign in</span>
            </div>
            <p style={S.formSub}>Enter your credentials to continue</p>

            <form onSubmit={submit}>
              <div className="input-wrap">
                <label>Email</label>
                <input className="input-field" type="email" placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoFocus />
              </div>
              <div className="input-wrap">
                <label>Password</label>
                <input className="input-field" type="password" placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>

              <button className="btn btn-green btn-lg" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Signing in…</> : 'Sign In →'}
              </button>
            </form>

            <p style={S.switch}>New here? <Link to="/register" style={{ color: 'var(--green)', fontWeight: 600 }}>Create account</Link></p>

          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: 900, width: '100%', alignItems: 'center' },
  left: { padding: '1rem 0' },
  brand: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' },
  brandIcon: { width: 34, height: 34, background: 'var(--green)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' },
  brandName: { fontWeight: 800, fontSize: '1.1rem' },
  headline: { fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1.25rem' },
  sub: { color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 340 },
  features: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  feature: { display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--text-2)' },
  dot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 },
  right: {},
  formCard: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '2rem' },
  formHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' },
  formTitle: { fontWeight: 700, fontSize: '1.1rem' },
  formSub: { color: 'var(--text-2)', fontSize: '0.82rem', marginBottom: '1.75rem' },
  switch: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-2)' },
  adminNote: { marginTop: '1rem', padding: '0.6rem 0.85rem', background: 'var(--bg-3)', borderRadius: 'var(--radius)', fontSize: '0.72rem', color: 'var(--text-2)', fontFamily: 'var(--font-code)' },
};
