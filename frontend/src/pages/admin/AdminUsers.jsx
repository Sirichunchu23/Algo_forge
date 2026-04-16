import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.users({ page, limit: LIMIT, search });
      setUsers(data.users);
      setTotal(data.total);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchVal); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchVal]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, username) => {
    if (!confirm(`Deactivate user "${username}"?\n\nTheir submissions will be preserved.`)) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      setTotal(t => t - 1);
      toast.success(`User "${username}" deactivated`);
    } catch { toast.error('Failed to deactivate user'); }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div style={S.header}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{total} registered students</p>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input className="input-field" placeholder="Search by name or email…"
            value={searchVal} onChange={e => setSearchVal(e.target.value)}
            style={{ paddingLeft: '2.2rem' }} />
        </div>
      </div>

      {loading ? (
        <div className="page-loader"><span className="spinner" style={{ width: 24, height: 24 }} /></div>
      ) : users.length === 0 ? (
        <div className="empty-state"><h3>No students found</h3></div>
      ) : (
        <>
          <div className="card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Solved</th>
                  <th>Easy</th>
                  <th>Medium</th>
                  <th>Hard</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={S.avatar}>{u.username[0].toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.username}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontFamily: 'var(--font-code)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={S.statCell}>{u.stats?.solved || 0}</td>
                    <td style={{ ...S.statCell, color: 'var(--green)' }}>{u.stats?.easySolved || 0}</td>
                    <td style={{ ...S.statCell, color: 'var(--yellow)' }}>{u.stats?.mediumSolved || 0}</td>
                    <td style={{ ...S.statCell, color: 'var(--red)' }}>{u.stats?.hardSolved || 0}</td>
                    <td style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--text-3)' }}>
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 3, textTransform: 'uppercase',
                        background: u.isActive ? 'var(--green-dim)' : 'var(--red-dim)',
                        color: u.isActive ? 'var(--green)' : 'var(--red)',
                      }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id, u.username)} title="Deactivate">
                        <Trash2 size={13} />
                      </button>
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
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  avatar: { width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-4)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)', flexShrink: 0 },
  statCell: { fontFamily: 'var(--font-code)', fontSize: '0.8rem', fontWeight: 700 },
};
