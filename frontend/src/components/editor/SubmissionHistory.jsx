import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { submissionAPI } from '../../services/api';

const STATUS_COLOR = {
  'Accepted': 'var(--green)', 'Wrong Answer': 'var(--red)',
  'Runtime Error': 'var(--red)', 'Time Limit Exceeded': 'var(--orange)',
  'Compilation Error': 'var(--yellow)', 'Pending': 'var(--blue)',
};

export default function SubmissionHistory({ problemId }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await submissionAPI.forProblem(problemId);
        setSubs(data.submissions);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [problemId]);

  if (loading) return (
    <div style={{ padding: '1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'center', color: 'var(--text-2)', fontSize: '0.82rem' }}>
      <span className="spinner" style={{ width: 15, height: 15 }} /> Loading…
    </div>
  );

  if (subs.length === 0) return (
    <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '0.82rem' }}>
      No submissions yet. Write your solution and submit!
    </div>
  );

  return (
    <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {subs.map((s) => (
        <div key={s._id}
          onClick={() => setExpanded(expanded === s._id ? null : s._id)}
          style={S.row}>
          <div style={S.rowTop}>
            <span style={{ ...S.status, color: STATUS_COLOR[s.status] || 'var(--text-2)' }}>
              {s.status}
            </span>
            <span style={S.lang}>{s.language}</span>
            <span style={S.time}>{formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}</span>
          </div>
          <div style={S.rowBot}>
            <span style={S.stat}>{s.passedCount}/{s.totalCount} passed</span>
            {s.runtime > 0 && <span style={S.stat}>{s.runtime}ms</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

const S = {
  row: { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.65rem 0.85rem', cursor: 'pointer', transition: 'border-color 0.15s' },
  rowTop: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' },
  status: { fontSize: '0.8rem', fontWeight: 700 },
  lang: { fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-code)', background: 'var(--bg-4)', padding: '0.1rem 0.4rem', borderRadius: 3 },
  time: { fontSize: '0.72rem', color: 'var(--text-3)', marginLeft: 'auto', fontFamily: 'var(--font-code)' },
  rowBot: { display: 'flex', gap: '0.75rem' },
  stat: { fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-code)' },
};
