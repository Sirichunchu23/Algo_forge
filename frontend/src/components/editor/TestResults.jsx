import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

const STATUS_META = {
  'Accepted':             { color: 'var(--green)', icon: CheckCircle2, label: '✓ Accepted' },
  'Wrong Answer':         { color: 'var(--red)',   icon: XCircle,      label: '✗ Wrong Answer' },
  'Runtime Error':        { color: 'var(--red)',   icon: AlertCircle,  label: '⚡ Runtime Error' },
  'Time Limit Exceeded':  { color: 'var(--orange)',icon: Clock,        label: '⏱ Time Limit Exceeded' },
  'Compilation Error':    { color: 'var(--yellow)',icon: AlertCircle,  label: '⚠ Compilation Error' },
};

export default function TestResults({ results, submission, loading }) {
  if (loading) {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-2)', fontSize: '0.85rem' }}>
        <span className="spinner" style={{ width: 18, height: 18 }} />
        <span>Executing code…</span>
      </div>
    );
  }

  if (!results && !submission) {
    return (
      <div style={{ padding: '1.25rem', color: 'var(--text-3)', fontSize: '0.82rem' }}>
        Run your code or submit to see results here.
      </div>
    );
  }

  // Submission view (all test cases including hidden)
  if (submission) {
    const meta = STATUS_META[submission.status] || { color: 'var(--text-2)', label: submission.status };
    const Icon = meta.icon;

    return (
      <div style={S.wrap}>
        {/* Status banner */}
        <div style={{ ...S.banner, borderColor: meta.color + '44', background: meta.color + '0d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {Icon && <Icon size={18} color={meta.color} />}
            <span style={{ fontWeight: 700, fontSize: '1rem', color: meta.color }}>{meta.label}</span>
          </div>
          <div style={S.bannerStats}>
            <StatChip label="Passed" value={`${submission.passedCount}/${submission.totalCount}`} color={meta.color} />
            {submission.runtime > 0 && <StatChip label="Runtime" value={`${submission.runtime}ms`} />}
          </div>
        </div>

        {submission.errorMessage && (
          <div style={S.errorBox}>
            <div style={S.errorLabel}>Error</div>
            <pre style={S.errorPre}>{submission.errorMessage}</pre>
          </div>
        )}

        {/* Test case results */}
        <div style={S.caseGrid}>
          {submission.testResults?.map((r, i) => (
            <TestCase key={i} result={r} index={i} />
          ))}
        </div>
      </div>
    );
  }

  // Run view (visible test cases only)
  const allPassed = results.every(r => r.passed);
  return (
    <div style={S.wrap}>
      <div style={{ ...S.banner, borderColor: (allPassed ? 'var(--green)' : 'var(--red)') + '44', background: (allPassed ? 'var(--green)' : 'var(--red)') + '0d' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: allPassed ? 'var(--green)' : 'var(--red)' }}>
          {allPassed ? '✓ All visible tests passed' : '✗ Some tests failed'}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontFamily: 'var(--font-code)' }}>
          {results.filter(r => r.passed).length}/{results.length} passed
        </span>
      </div>
      <div style={S.caseGrid}>
        {results.map((r, i) => <TestCase key={i} result={r} index={i} />)}
      </div>
    </div>
  );
}

function TestCase({ result, index }) {
  const passed = result.passed;
  const color = passed ? 'var(--green)' : 'var(--red)';

  return (
    <div style={{ ...S.caseCard, borderColor: color + '44' }}>
      <div style={S.caseHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {passed
            ? <CheckCircle2 size={14} color="var(--green)" />
            : <XCircle size={14} color="var(--red)" />}
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color }}>
            Case {index + 1} {result.isHidden ? '(hidden)' : ''}
          </span>
        </div>
        {result.runtime > 0 && (
          <span style={{ fontSize: '0.68rem', color: 'var(--text-3)', fontFamily: 'var(--font-code)' }}>
            {result.runtime}ms
          </span>
        )}
      </div>

      {result.error ? (
        <div style={S.errorBox}>
          <pre style={S.errorPre}>{result.error}</pre>
        </div>
      ) : (
        <div style={S.caseBody}>
          {result.input !== '(hidden)' && (
            <CaseRow label="Input" value={result.input} />
          )}
          {result.expectedOutput !== '(hidden)' && (
            <CaseRow label="Expected" value={result.expectedOutput} />
          )}
          {result.actualOutput !== undefined && result.actualOutput !== '' && (
            <CaseRow label="Got" value={result.actualOutput} highlight={!passed} />
          )}
        </div>
      )}
    </div>
  );
}

function CaseRow({ label, value, highlight }) {
  return (
    <div style={{ marginBottom: '0.35rem' }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>{label}</span>
      <code style={{ fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: highlight ? 'var(--red)' : 'var(--text-1)', background: 'var(--bg-0)', padding: '0.15rem 0.4rem', borderRadius: 3, display: 'inline-block' }}>
        {value || '""'}
      </code>
    </div>
  );
}

function StatChip({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
      <span style={{ color: 'var(--text-2)' }}>{label}:</span>
      <span style={{ fontWeight: 700, color: color || 'var(--text-1)', fontFamily: 'var(--font-code)' }}>{value}</span>
    </div>
  );
}

const S = {
  wrap: { padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  banner: { padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' },
  bannerStats: { display: 'flex', gap: '1rem' },
  caseGrid: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  caseCard: { background: 'var(--bg-2)', border: '1px solid', borderRadius: 6, overflow: 'hidden' },
  caseHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.75rem', background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' },
  caseBody: { padding: '0.65rem 0.85rem' },
  errorBox: { padding: '0.5rem 0.85rem', background: 'var(--red-dim)' },
  errorLabel: { fontSize: '0.68rem', color: 'var(--red)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' },
  errorPre: { fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--red)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
};
