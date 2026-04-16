import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      const data = await register(form);
      toast.success(`Welcome, ${data.user.username}! 🚀`);
      navigate('/problems');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.top}>
          <div style={S.icon}><Code2 size={20} /></div>
          <div>
            <h1 style={S.title}>Create account</h1>
            <p style={S.sub}>Join AlgoForge and start solving</p>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="input-wrap">
            <label>Username</label>
            <input className="input-field" placeholder="cool_coder" value={form.username} onChange={set('username')} required minLength={3} autoFocus />
          </div>
          <div className="input-wrap">
            <label>Email</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="input-wrap">
            <label>Password</label>
            <input className="input-field" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <button className="btn btn-green btn-lg" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Creating…</> : <><UserPlus size={15} /> Create Account</>}
          </button>
        </form>

        <p style={S.switch}>
          Already have an account? <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-0)' },
  card: { width: '100%', maxWidth: 420, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '2rem' },
  top: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' },
  icon: { width: 44, height: 44, background: 'var(--green)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', flexShrink: 0 },
  title: { fontWeight: 800, fontSize: '1.2rem' },
  sub: { color: 'var(--text-2)', fontSize: '0.8rem', marginTop: '0.15rem' },
  switch: { textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-2)' },
};
