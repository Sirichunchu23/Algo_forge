import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle2, Circle, ChevronRight, Filter } from 'lucide-react';
import { problemAPI, submissionAPI } from '../services/api';
import toast from 'react-hot-toast';

const DIFFS = ['All', 'Easy', 'Medium', 'Hard'];

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diff, setDiff] = useState('All');
  const [cat, setCat] = useState('All');
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0, solved: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (diff !== 'All') params.difficulty = diff;
      if (cat !== 'All') params.category = cat;
      if (search) params.search = search;

      const [probRes, catRes, subRes] = await Promise.all([
        problemAPI.list(params),
        problemAPI.categories(),
        submissionAPI.mine({ limit: 200 }),
      ]);

      setProblems(probRes.data.problems);
      setCategories(['All', ...catRes.data.categories]);

      const accepted = new Set(
        subRes.data.submissions
          .filter(s => s.status === 'Accepted')
          .map(s => s.problem?._id)
          .filter(Boolean)
      );
      setSolvedIds(accepted);

      // Compute stats from full list (no filters)
      const all = probRes.data.problems;
      setStats({
        total: probRes.data.total || all.length,
        easy: all.filter(p => p.difficulty === 'Easy').length,
        medium: all.filter(p => p.difficulty === 'Medium').length,
        hard: all.filter(p => p.difficulty === 'Hard').length,
        solved: accepted.size,
      });
    } catch {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, [diff, cat, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const diffColor = { Easy: 'var(--green)', Medium: 'var(--yellow)', Hard: 'var(--red)' };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 className="page-title">Problems</h1>
          <p className="page-subtitle">{stats.solved} / {stats.total} solved</p>
        </div>
        <div style={S.statRow}>
          <StatPill label="Easy" count={stats.easy} color="var(--green)" />
          <StatPill label="Medium" count={stats.medium} color="var(--yellow)" />
          <StatPill label="Hard" count={stats.hard} color="var(--red)" />
        </div>
      </div>

      {/* Filters */}
      <div style={S.filters}>
        <div style={S.searchWrap}>
          <Search size={14} style={S.searchIcon} />
          <input className="input-field" placeholder="Search problems…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.2rem' }} />
        </div>

        <div style={S.pills}>
          {DIFFS.map(d => (
            <button key={d} onClick={() => setDiff(d)}
              style={{ ...S.pill, ...(diff === d ? { ...S.pillActive, color: d === 'All' ? 'var(--text-0)' : diffColor[d], borderColor: d === 'All' ? 'var(--border-2)' : diffColor[d], background: d === 'All' ? 'var(--bg-4)' : diffColor[d] + '22' } : {}) }}>
              {d}
            </button>
          ))}
        </div>

        <div style={S.pills}>
          <Filter size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ ...S.pill, ...(cat === c ? S.pillActive : {}) }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="page-loader">
          <span className="spinner" style={{ width: 24, height: 24 }} />
          <span>Loading problems…</span>
        </div>
      ) : problems.length === 0 ? (
        <div className="empty-state">
          <Search size={40} />
          <h3>No problems found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={S.tableWrap} className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Category</th>
                <th>Acceptance</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => {
                const solved = solvedIds.has(p._id);
                return (
                  <tr key={p._id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/problems/${p.slug}`}>
                    <td>
                      {solved
                        ? <CheckCircle2 size={16} color="var(--green)" />
                        : <Circle size={16} color="var(--text-3)" />}
                    </td>
                    <td>
                      <Link to={`/problems/${p.slug}`} style={S.titleLink}
                        onClick={e => e.stopPropagation()}>
                        {p.title}
                      </Link>
                      {p.tags?.slice(0,2).map(t => (
                        <span key={t} style={S.tag}>{t}</span>
                      ))}
                    </td>
                    <td>
                      <span style={{ color: diffColor[p.difficulty], fontWeight: 600, fontSize: '0.82rem' }}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{p.category}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--text-2)' }}>
                        {p.acceptanceRate ?? Math.round((p.acceptedSubmissions / Math.max(p.totalSubmissions, 1)) * 100)}%
                      </span>
                    </td>
                    <td><ChevronRight size={15} color="var(--text-3)" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, count, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ fontSize: '0.78rem', color: 'var(--text-2)' }}>{label}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-code)', color }}>{count}</span>
    </div>
  );
}

const S = {
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  statRow: { display: 'flex', gap: '1.25rem', alignItems: 'center' },
  filters: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' },
  searchWrap: { position: 'relative', maxWidth: 380 },
  searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' },
  pills: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' },
  pill: { padding: '0.28rem 0.7rem', borderRadius: 999, border: '1px solid var(--border)', background: 'none', color: 'var(--text-2)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)', transition: 'all 0.15s' },
  pillActive: { background: 'var(--bg-4)', borderColor: 'var(--border-2)', color: 'var(--text-0)' },
  tableWrap: { overflow: 'hidden' },
  titleLink: { fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-0)', marginRight: '0.5rem' },
  tag: { fontSize: '0.65rem', background: 'var(--bg-4)', color: 'var(--text-2)', padding: '0.1rem 0.4rem', borderRadius: 3, marginRight: '0.25rem', fontFamily: 'var(--font-code)' },
};
