import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Code2, FileText, CheckCircle2, TrendingUp, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  'Accepted': 'var(--green)', 'Wrong Answer': 'var(--red)',
  'Runtime Error': 'var(--red)', 'Time Limit Exceeded': 'var(--orange)',
  'Compilation Error': 'var(--yellow)',
};
const DIFF_COLOR = { Easy: 'var(--green)', Medium: 'var(--yellow)', Hard: 'var(--red)' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.stats()
      .then(r => { setData(r.data.stats); setLoading(false); })
      .catch(() => { toast.error('Failed to load stats'); setLoading(false); });
  }, []);

  if (loading) return <div className="page-loader"><span className="spinner" style={{ width: 28, height: 28 }} /></div>;

  const acceptRate = data.totalSubmissions > 0
    ? Math.round((data.acceptedSubs / data.totalSubmissions) * 100)
    : 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Platform overview</p>
      </div>

      {/* Stat cards */}
      <div style={S.statsGrid}>
        <StatCard icon={<Users size={20} />} label="Students" value={data.totalUsers} color="var(--blue)" link="/admin/users" />
        <StatCard icon={<Code2 size={20} />} label="Problems" value={data.totalProblems} color="var(--green)" link="/admin/problems" />
        <StatCard icon={<FileText size={20} />} label="Submissions" value={data.totalSubmissions} color="var(--yellow)" link="/admin/submissions" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Accepted" value={`${acceptRate}%`} color="var(--green)" sub={`${data.acceptedSubs} accepted`} />
      </div>

      {/* Difficulty breakdown */}
      {data.diffStats?.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={S.sectionTitle}><TrendingUp size={15} /> Problems by Difficulty</h2>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {['Easy', 'Medium', 'Hard'].map(d => {
              const s = data.diffStats.find(x => x._id === d);
              const count = s?.count || 0;
              return (
                <div key={d} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-code)', color: DIFF_COLOR[d] }}>{count}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 700, textTransform: 'uppercase' }}>{d}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent submissions */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.1rem 1.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={S.sectionTitle}><FileText size={15} /> Recent Submissions</h2>
          <Link to="/admin/submissions" style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600 }}>View all →</Link>
        </div>
        {data.recentSubs?.length === 0 ? (
          <div style={{ padding: '1.5rem', color: 'var(--text-3)', fontSize: '0.82rem' }}>No submissions yet.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Student</th>
                <th>Problem</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSubs?.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.user?.username}</td>
                  <td>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.problem?.title}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: DIFF_COLOR[s.problem?.difficulty] }}>
                      {s.problem?.difficulty}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: STATUS_COLOR[s.status] || 'var(--text-2)', fontWeight: 700, fontSize: '0.8rem' }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--text-3)' }}>
                    {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
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

function StatCard({ icon, label, value, color, link, sub }) {
  const inner = (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color, background: color + '1a', padding: '0.5rem', borderRadius: 8, display: 'inline-flex' }}>{icon}</div>
        {link && <ChevronRight size={14} color="var(--text-3)" />}
      </div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-code)', color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '0.3rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.15rem' }}>{sub}</div>}
      </div>
    </div>
  );
  return link ? <Link to={link} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

const S = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' },
};
