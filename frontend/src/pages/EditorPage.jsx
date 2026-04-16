import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Play, Send, RotateCcw, Clock, ChevronDown } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { problemAPI, executeAPI, submissionAPI } from '../services/api';
import TestResults from '../components/editor/TestResults';
import SubmissionHistory from '../components/editor/SubmissionHistory';
import toast from 'react-hot-toast';

const LANGUAGES = ['javascript', 'python', 'java'];
const LANG_LABELS = { javascript: 'JavaScript', python: 'Python', java: 'Java' };
const MONACO_LANG = { javascript: 'javascript', python: 'python', java: 'java' };

const DIFF_COLOR = { Easy: 'var(--green)', Medium: 'var(--yellow)', Hard: 'var(--red)' };

export default function EditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [leftTab, setLeftTab] = useState('description');
  const [bottomTab, setBottomTab] = useState('testcases');
  const [customInput, setCustomInput] = useState('');
  const [splitPos, setSplitPos] = useState(42);
  const dragging = useRef(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await problemAPI.get(slug);
        setProblem(data.problem);
        const starter = data.problem.starterCode?.[lang] || '';
        setCode(starter);
      } catch {
        toast.error('Problem not found');
        navigate('/problems');
      } finally { setLoading(false); }
    })();
  }, [slug]);

  useEffect(() => {
    if (problem) setCode(problem.starterCode?.[lang] || '');
  }, [lang]);

  // Draggable divider
  const onMouseDown = () => { dragging.current = true; };
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      if (pct > 25 && pct < 75) setSplitPos(pct);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const handleRun = async () => {
    if (!code.trim()) return toast.error('Write some code first!');
    setRunning(true);
    setBottomTab('results');
    setResults(null);
    setSubmission(null);
    try {
      const { data } = await executeAPI.run({
        problemId: problem._id, code, language: lang,
        customInput: customInput || undefined,
      });
      setResults(data.results);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Execution failed');
    } finally { setRunning(false); }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return toast.error('Write some code first!');
    setSubmitting(true);
    setBottomTab('results');
    setResults(null);
    setSubmission(null);
    try {
      const { data } = await submissionAPI.submit({ problemId: problem._id, code, language: lang });
      setSubmission(data.submission);
      if (data.submission.status === 'Accepted') {
        toast.success('🎉 Accepted! All test cases passed!');
      } else {
        toast.error(`${data.submission.status}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const resetCode = () => {
    if (!confirm('Reset to starter code?')) return;
    setCode(problem?.starterCode?.[lang] || '');
  };

  if (loading) return (
    <div className="page-loader" style={{ minHeight: '100vh' }}>
      <span className="spinner" style={{ width: 28, height: 28 }} />
      <span>Loading problem…</span>
    </div>
  );
  if (!problem) return null;

  const visibleTestCases = problem.testCases?.filter(tc => !tc.isHidden) || [];

  return (
    <div style={S.root}>
      {/* Top bar */}
      <div style={S.topBar}>
        <Link to="/problems" style={S.back}>
          <ChevronLeft size={16} /> Problems
        </Link>
        <div style={S.problemInfo}>
          <span style={S.problemTitle}>{problem.title}</span>
          <span style={{ color: DIFF_COLOR[problem.difficulty], fontSize: '0.78rem', fontWeight: 700 }}>
            {problem.difficulty}
          </span>
        </div>
        <div style={S.topRight}>
          {/* Language selector */}
          <div style={S.langWrap}>
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              style={S.langSelect}
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{LANG_LABELS[l]}</option>)}
            </select>
            <ChevronDown size={12} style={S.langArrow} />
          </div>

          <button className="btn btn-run btn-sm" onClick={handleRun} disabled={running || submitting}>
            {running ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <Play size={13} fill="currentColor" />}
            {running ? 'Running…' : 'Run'}
          </button>
          <button className="btn btn-green btn-sm" onClick={handleSubmit} disabled={running || submitting}>
            {submitting ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <Send size={13} />}
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main split */}
      <div style={S.main}>
        {/* Left panel */}
        <div style={{ ...S.leftPanel, width: `${splitPos}%` }}>
          <div className="tab-bar">
            {['description', 'submissions'].map(t => (
              <button key={t} className={`tab-btn ${leftTab === t ? 'active' : ''}`}
                onClick={() => setLeftTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div style={S.leftScroll}>
            {leftTab === 'description' && (
              <div style={S.descPanel}>
                {/* Examples */}
                {problem.examples?.length > 0 && (
                  <div style={S.examplesSection}>
                    <div className="prose">
                      <ReactMarkdown>{problem.description}</ReactMarkdown>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                      {problem.examples.map((ex, i) => (
                        <div key={i} style={S.example}>
                          <div style={S.exLabel}>Example {i + 1}</div>
                          <div className="code-block" style={{ marginBottom: '0.4rem' }}>
                            <div><span style={{ color: 'var(--text-3)' }}>Input:  </span>{ex.input}</div>
                            <div><span style={{ color: 'var(--text-3)' }}>Output: </span>{ex.output}</div>
                            {ex.explanation && <div style={{ color: 'var(--text-2)', marginTop: '0.3rem', fontSize: '0.78rem' }}>Explanation: {ex.explanation}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {problem.constraints?.length > 0 && (
                      <div style={{ marginTop: '1.25rem' }}>
                        <div style={S.constraintLabel}>Constraints</div>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {problem.constraints.map((c, i) => (
                            <li key={i} style={S.constraintItem}>
                              <span style={{ color: 'var(--green)', marginRight: '0.5rem' }}>•</span>
                              <code style={{ fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'var(--text-1)' }}>{c}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {leftTab === 'submissions' && (
              <SubmissionHistory problemId={problem._id} />
            )}
          </div>
        </div>

        {/* Drag handle */}
        <div style={S.divider} onMouseDown={onMouseDown} />

        {/* Right panel: editor + results */}
        <div style={{ ...S.rightPanel, width: `${100 - splitPos - 0.3}%` }}>
          {/* Monaco Editor */}
          <div style={S.editorWrap}>
            <div style={S.editorToolbar}>
              <span style={S.editorLang}>{LANG_LABELS[lang]}</span>
              <button onClick={resetCode} style={S.resetBtn} title="Reset to starter code">
                <RotateCcw size={13} />
              </button>
            </div>
            <Editor
              height="100%"
              language={MONACO_LANG[lang]}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'IBM Plex Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                padding: { top: 12, bottom: 12 },
                wordWrap: 'on',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          {/* Bottom results panel */}
          <div style={S.bottomPanel}>
            <div className="tab-bar" style={{ borderTop: '1px solid var(--border)' }}>
              <button className={`tab-btn ${bottomTab === 'testcases' ? 'active' : ''}`}
                onClick={() => setBottomTab('testcases')}>
                Test Cases
              </button>
              <button className={`tab-btn ${bottomTab === 'results' ? 'active' : ''}`}
                onClick={() => setBottomTab('results')}>
                Results
                {(results || submission) && (
                  <span style={{ marginLeft: '0.35rem', width: 7, height: 7, borderRadius: '50%', background: getStatusColor(results, submission), display: 'inline-block' }} />
                )}
              </button>
              <button className={`tab-btn ${bottomTab === 'custom' ? 'active' : ''}`}
                onClick={() => setBottomTab('custom')}>
                Custom Input
              </button>
            </div>

            <div style={S.bottomContent}>
              {bottomTab === 'testcases' && (
                <div style={S.testCaseList}>
                  {visibleTestCases.length === 0 ? (
                    <div style={{ color: 'var(--text-2)', fontSize: '0.82rem', padding: '1rem' }}>No visible test cases.</div>
                  ) : visibleTestCases.map((tc, i) => (
                    <div key={i} style={S.tcItem}>
                      <div style={S.tcLabel}>Case {i + 1}</div>
                      <div style={S.tcRow}>
                        <div style={S.tcBlock}>
                          <span style={S.tcKey}>Input</span>
                          <code style={S.tcVal}>{tc.input}</code>
                        </div>
                        <div style={S.tcBlock}>
                          <span style={S.tcKey}>Expected</span>
                          <code style={S.tcVal}>{tc.expectedOutput}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {bottomTab === 'results' && (
                <TestResults
                  results={results}
                  submission={submission}
                  loading={running || submitting}
                />
              )}

              {bottomTab === 'custom' && (
                <div style={{ padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Custom Input</div>
                  <textarea
                    className="input-field"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="Enter custom input here..."
                    style={{ fontFamily: 'var(--font-code)', fontSize: '0.82rem', minHeight: 80 }}
                  />
                  <button className="btn btn-run btn-sm" style={{ marginTop: '0.5rem' }} onClick={handleRun} disabled={running}>
                    <Play size={12} fill="currentColor" /> Run with custom input
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(results, submission) {
  if (submission) return submission.status === 'Accepted' ? 'var(--green)' : 'var(--red)';
  if (results) return results.every(r => r.passed) ? 'var(--green)' : 'var(--red)';
  return 'var(--text-3)';
}

const S = {
  root: { height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-0)', overflow: 'hidden' },
  topBar: {
    height: '2.75rem', display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '0 1rem', background: 'var(--bg-1)', borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  back: { display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-2)', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 },
  problemInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, overflow: 'hidden' },
  problemTitle: { fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  topRight: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 },
  langWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  langSelect: { appearance: 'none', background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', color: 'var(--text-1)', padding: '0.3rem 1.8rem 0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)' },
  langArrow: { position: 'absolute', right: '0.5rem', pointerEvents: 'none', color: 'var(--text-3)' },
  main: { display: 'flex', flex: 1, overflow: 'hidden' },
  leftPanel: { display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 },
  leftScroll: { flex: 1, overflowY: 'auto', overflowX: 'hidden' },
  descPanel: { padding: '1.25rem' },
  examplesSection: {},
  exLabel: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem', marginTop: '1rem' },
  example: { marginBottom: '1rem' },
  constraintLabel: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' },
  constraintItem: { display: 'flex', alignItems: 'flex-start', marginBottom: '0.35rem' },
  divider: { width: '4px', background: 'var(--border)', cursor: 'col-resize', flexShrink: 0, transition: 'background 0.15s', ':hover': { background: 'var(--green)' } },
  rightPanel: { display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },
  editorWrap: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 },
  editorToolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0.75rem', background: '#1e1e1e', borderBottom: '1px solid #2d2d2d' },
  editorLang: { fontSize: '0.72rem', color: '#858585', fontFamily: 'var(--font-code)' },
  resetBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#858585', padding: '0.2rem', display: 'flex', alignItems: 'center', borderRadius: 4 },
  bottomPanel: { height: '38%', display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)', flexShrink: 0 },
  bottomContent: { flex: 1, overflowY: 'auto' },
  testCaseList: { padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  tcItem: { background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.65rem 0.85rem' },
  tcLabel: { fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: '0.5rem' },
  tcRow: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  tcBlock: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  tcKey: { fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tcVal: { fontFamily: 'var(--font-code)', fontSize: '0.82rem', color: 'var(--text-1)', background: 'var(--bg-0)', padding: '0.2rem 0.4rem', borderRadius: 3 },
};
