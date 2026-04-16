import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { submissionAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  'Accepted': 'var(--green)', 'Wrong Answer': 'var(--red)',
  'Runtime Error': 'var(--red)', 'Time Limit Exceeded': 'var(--orange)',
  'Compilation Error': 'var(--yellow)',
};
const DIFF_COLOR = { Easy: 'var(--green)', Medium: 'var(--yellow)', Hard: 'var(--red)' };

export default function MySubmissions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await submissionAPI.mine({ page, limit: LIMIT });
        setSubs(data.submissions);
        setTotal(data.total);
      } catch { toast.error('Failed to load submissions'); }
      finally { setLoading(false); }
    })();
  }, [page]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <History size={22} color="var(--green)" /> My Submissions
        </h1>
        <p className="page-subtitle">{total} total submissions</p>
      </div>

      {loading ? (
        <div className="page-loader">
          <span className="spinner" style={{ width: 24, height: 24 }} /> Loading…
        </div>
      ) : subs.length === 0 ? (
        <div className="empty-state">
          <History size={42} />
          <h3>No submissions yet</h3>
          <p>Solve a problem to see your history here</p>
          <Link to="/problems" className="btn btn-green" style={{ marginTop: '1rem' }}>Browse Problems</Link>
        </div>
      ) : (
        <>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Status</th>
                  <th>Language</th>
                  <th>Passed</th>
                  <th>Runtime</th>
                  <th>Time</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <Link to={`/problems/${s.problem?.slug}`} style={S.probLink}>
                        {s.problem?.title || 'Unknown'}
                      </Link>
                      <span style={{ ...S.diff, color: DIFF_COLOR[s.problem?.difficulty] }}>
                        {s.problem?.difficulty}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: STATUS_COLOR[s.status] || 'var(--text-2)', fontWeight: 700, fontSize: '0.82rem' }}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <span style={S.langTag}>{s.language}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                      {s.passedCount}/{s.totalCount}
                    </td>
                    <td style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                      {s.runtime > 0 ? `${s.runtime}ms` : '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--text-3)' }}>
                      {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                    </td>
                    <td>
                      <Link to={`/problems/${s.problem?.slug}`} style={{ color: 'var(--text-3)' }}>
                        <ChevronRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div style={S.pagination}>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                {page} / {pages}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= pages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const S = {
  probLink: { fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-0)', marginRight: '0.5rem' },
  diff: { fontSize: '0.72rem', fontWeight: 700 },
  langTag: { fontSize: '0.72rem', background: 'var(--bg-4)', color: 'var(--text-2)', padding: '0.1rem 0.45rem', borderRadius: 3, fontFamily: 'var(--font-code)' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' },
};
