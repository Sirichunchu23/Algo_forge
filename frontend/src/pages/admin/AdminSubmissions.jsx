import { useState, useEffect, useCallback } from 'react';
import { FileText, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  'Accepted': 'var(--green)', 'Wrong Answer': 'var(--red)',
  'Runtime Error': 'var(--red)', 'Time Limit Exceeded': 'var(--orange)',
  'Compilation Error': 'var(--yellow)', 'Pending': 'var(--blue)',
};
const DIFF_COLOR = { Easy: 'var(--green)', Medium: 'var(--yellow)', Hard: 'var(--red)' };
const STATUSES = ['', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error'];

export default function AdminSubmissions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminAPI.submissions(params);
      setSubs(data.submissions);
      setTotal(data.total);
    } catch { toast.error('Failed to load submissions'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const pages = Math.ceil(total / LIMIT);

  const accepted = subs.filter(s => s.status === 'Accepted').length;
  const acceptRate = subs.length > 0 ? Math.round((accepted / subs.length) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Submissions</h1>
          <p className="page-subtitle">{total} total submissions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={S.miniStat}>
            <span style={{ color: 'var(--green)', fontWeight: 700, fontFamily: 'var(--font-code)' }}>{accepted}</span>
            <span style={{ color: 'var(--text-3)', fontSize: '0.72rem' }}>accepted on this page</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {STATUSES.map(s => (
          <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{ ...S.filterBtn, ...(statusFilter === s ? S.filterActive : {}), ...(s && { color: STATUS_COLOR[s] }) }}>
            {s || 'All Status'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader"><span className="spinner" style={{ width: 24, height: 24 }} /></div>
      ) : subs.length === 0 ? (
        <div className="empty-state">
          <FileText size={40} />
          <h3>No submissions found</h3>
        </div>
      ) : (
        <>
          <div className="card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Problem</th>
                  <th>Status</th>
                  <th>Language</th>
                  <th>Passed</th>
                  <th>Runtime</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s._id}>
                    <td style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.user?.username}</td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.problem?.title}</span>
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: DIFF_COLOR[s.problem?.difficulty] }}>
                        {s.problem?.difficulty}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: STATUS_COLOR[s.status] || 'var(--text-2)', fontWeight: 700, fontSize: '0.8rem' }}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.72rem', background: 'var(--bg-4)', color: 'var(--text-2)', padding: '0.1rem 0.45rem', borderRadius: 3, fontFamily: 'var(--font-code)' }}>
                        {s.language}
                      </span>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--text-2)' }}>{page} / {pages}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= pages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const S = {
  miniStat: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.78rem' },
  filterBtn: { padding: '0.3rem 0.75rem', borderRadius: 999, border: '1px solid var(--border)', background: 'none', color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)', transition: 'all 0.15s' },
  filterActive: { background: 'var(--bg-3)', borderColor: 'var(--border-2)', color: 'var(--text-0)' },
};
