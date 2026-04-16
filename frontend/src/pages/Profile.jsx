import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, CheckCircle2, Code2, TrendingUp } from 'lucide-react';
import { submissionAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const DIFF_COLOR = { Easy: 'var(--green)', Medium: 'var(--yellow)', Hard: 'var(--red)' };
const STATUS_COLOR = {
  'Accepted': 'var(--green)', 'Wrong Answer': 'var(--red)',
  'Runtime Error': 'var(--red)', 'Time Limit Exceeded': 'var(--orange)',
  'Compilation Error': 'var(--yellow)',
};

export default function Profile() {
  const { user } = useAuthStore();
  const [recentSubs, setRecentSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await submissionAPI.mine({ limit: 10 });
        setRecentSubs(data.submissions);
      } catch { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    })();
  }, []);

  const stats = user?.stats || {};
  const solved = stats.solved || 0;
  const easy = stats.easySolved || 0;
  const medium = stats.mediumSolved || 0;
  const hard = stats.hardSolved || 0;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: 900 }}>
      {/* Profile card */}
      <div className="card" style={S.profileCard}>
        <div style={S.avatarWrap}>
          <div style={S.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
          <div style={S.onlineDot} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{user?.username}</h1>
            <span style={{ ...S.rolePill, background: user?.role === 'admin' ? 'var(--red-dim)' : 'var(--green-dim)', color: user?.role === 'admin' ? 'var(--red)' : 'var(--green)' }}>
              {user?.role}
            </span>
          </div>
          <p style={S.email}>{user?.email}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={S.statsGrid}>
        <StatCard label="Problems Solved" value={solved} color="var(--green)" icon={<CheckCircle2 size={18} />} />
        <StatCard label="Easy Solved" value={easy} color="var(--green)" sub="Easy" />
        <StatCard label="Medium Solved" value={medium} color="var(--yellow)" sub="Medium" />
        <StatCard label="Hard Solved" value={hard} color="var(--red)" sub="Hard" />
      </div>

      {/* Heatmap-style progress bars */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={S.sectionTitle}><TrendingUp size={16} /> Progress</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
          {[
            { label: 'Easy', solved: easy, total: 20, color: 'var(--green)' },
            { label: 'Medium', solved: medium, total: 15, color: 'var(--yellow)' },
            { label: 'Hard', solved: hard, total: 10, color: 'var(--red)' },
          ].map(({ label, solved: s, total, color }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color }}>{label}</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-code)', color: 'var(--text-3)' }}>{s}/{total}</span>
              </div>
              <div style={S.barBg}>
                <div style={{ ...S.barFill, width: `${Math.min(100, (s / total) * 100)}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent submissions */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={S.sectionTitle}><Code2 size={16} /> Recent Submissions</h2>
          <Link to="/submissions" style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600 }}>View all →</Link>
        </div>
        {loading ? (
          <div style={{ padding: '1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'center', color: 'var(--text-2)', fontSize: '0.82rem' }}>
            <span className="spinner" style={{ width: 15, height: 15 }} /> Loading…
          </div>
        ) : recentSubs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.82rem' }}>
            No submissions yet. <Link to="/problems" style={{ color: 'var(--green)' }}>Start solving!</Link>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Status</th>
                <th>Lang</th>
                <th>Passed</th>
              </tr>
            </thead>
            <tbody>
              {recentSubs.map((s) => (
                <tr key={s._id}>
                  <td>
                    <Link to={`/problems/${s.problem?.slug}`} style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-0)' }}>
                      {s.problem?.title}
                    </Link>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', fontWeight: 700, color: DIFF_COLOR[s.problem?.difficulty] }}>
                      {s.problem?.difficulty}
                    </span>
                  </td>
                  <td style={{ color: STATUS_COLOR[s.status] || 'var(--text-2)', fontWeight: 700, fontSize: '0.82rem' }}>
                    {s.status}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.72rem', background: 'var(--bg-4)', color: 'var(--text-2)', padding: '0.1rem 0.45rem', borderRadius: 3, fontFamily: 'var(--font-code)' }}>
                      {s.language}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                    {s.passedCount}/{s.totalCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, sub }) {
  return (
    <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
      {icon && <div style={{ color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>}
      {sub && <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, margin: '0 auto 0.5rem' }} />}
      <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-code)', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', marginTop: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
    </div>
  );
}

const S = {
  profileCard: { display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', marginBottom: '1.5rem' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'linear-gradient(135deg, #00c853, #00897b)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.75rem', fontWeight: 800, color: '#000',
  },
  onlineDot: { position: 'absolute', bottom: 3, right: 3, width: 12, height: 12, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--bg-2)' },
  rolePill: { fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.05em' },
  email: { fontSize: '0.82rem', color: 'var(--text-3)', fontFamily: 'var(--font-code)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' },
  barBg: { height: 6, background: 'var(--bg-4)', borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999, transition: 'width 0.6s ease' },
};
