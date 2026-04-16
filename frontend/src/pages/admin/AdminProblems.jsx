import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DIFF_COLOR = { Easy: 'var(--green)', Medium: 'var(--yellow)', Hard: 'var(--red)' };

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.problems({ page, limit: LIMIT, search });
      setProblems(data.problems);
      setTotal(data.total);
    } catch { toast.error('Failed to load problems'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchVal); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchVal]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete problem: "${title}"?\n\nAll submissions for this problem will remain in history.`)) return;
    try {
      await adminAPI.deleteProblem(id);
      toast.success('Problem deleted');
      setProblems(prev => prev.filter(p => p._id !== id));
      setTotal(t => t - 1);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div style={S.header}>
        <div>
          <h1 className="page-title">Problems</h1>
          <p className="page-subtitle">{total} problems in the system</p>
        </div>
        <Link to="/admin/problems/new" className="btn btn-green">
          <Plus size={15} /> Add Problem
        </Link>
      </div>

      <div style={S.toolbar}>
        <div style={S.searchWrap}>
          <Search size={14} style={S.searchIcon} />
          <input className="input-field" placeholder="Search problems…"
            value={searchVal} onChange={e => setSearchVal(e.target.value)}
            style={{ paddingLeft: '2.2rem', maxWidth: 340 }} />
        </div>
      </div>

      {loading ? (
        <div className="page-loader"><span className="spinner" style={{ width: 24, height: 24 }} /></div>
      ) : problems.length === 0 ? (
        <div className="empty-state">
          <h3>No problems found</h3>
          <Link to="/admin/problems/new" className="btn btn-green" style={{ marginTop: '1rem' }}>
            <Plus size={14} /> Add First Problem
          </Link>
        </div>
      ) : (
        <>
          <div className="card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Category</th>
                  <th>Test Cases</th>
                  <th>Submissions</th>
                  <th>Acceptance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p, i) => {
                  const acceptance = p.totalSubmissions > 0
                    ? Math.round((p.acceptedSubmissions / p.totalSubmissions) * 100)
                    : p.acceptanceRate || 0;
                  return (
                    <tr key={p._id}>
                      <td style={{ color: 'var(--text-3)', fontFamily: 'var(--font-code)', fontSize: '0.75rem' }}>
                        {(page - 1) * LIMIT + i + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.title}</div>
                        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                          {p.tags?.slice(0, 3).map(t => (
                            <span key={t} style={S.tag}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: DIFF_COLOR[p.difficulty], fontWeight: 700, fontSize: '0.82rem' }}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{p.category}</td>
                      <td style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                        {p.testCases?.length || 0}
                        <span style={{ color: 'var(--text-3)', fontSize: '0.7rem' }}>
                          {' '}({p.testCases?.filter(t => t.isHidden)?.length || 0} hidden)
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                        {p.totalSubmissions || 0}
                      </td>
                      <td style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                        {acceptance}%
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                          borderRadius: 3, textTransform: 'uppercase',
                          background: p.isActive ? 'var(--green-dim)' : 'var(--red-dim)',
                          color: p.isActive ? 'var(--green)' : 'var(--red)',
                        }}>
                          {p.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <Link to={`/admin/problems/${p._id}/edit`} className="btn btn-ghost btn-sm" title="Edit">
                            <Edit3 size={13} />
                          </Link>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id, p.title)} title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div style={S.pagination}>
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
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' },
  toolbar: { marginBottom: '1.25rem' },
  searchWrap: { position: 'relative' },
  searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' },
  tag: { fontSize: '0.62rem', background: 'var(--bg-4)', color: 'var(--text-3)', padding: '0.08rem 0.35rem', borderRadius: 3, fontFamily: 'var(--font-code)' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' },
};
