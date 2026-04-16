import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const DIFFS = ['Easy', 'Medium', 'Hard'];
const CATS = ['Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph', 'Dynamic Programming', 'Binary Search', 'Sorting', 'Hash Table', 'Math', 'Recursion', 'Other'];
const LANGS = ['javascript', 'python', 'java'];

const emptyTestCase = () => ({ input: '', expectedOutput: '', isHidden: false, explanation: '' });
const emptyExample = () => ({ input: '', output: '', explanation: '' });

const DEFAULT_STARTERS = {
  javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction solution(nums) {\n  // Your code here\n};`,
  python: `def solution(nums):\n    # Your code here\n    pass`,
  java: `class Solution {\n    public int solution(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}`,
};

export default function AdminProblemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [loadingProblem, setLoadingProblem] = useState(isEdit);
  const [activeSection, setActiveSection] = useState('basic');

  const [form, setForm] = useState({
    title: '',
    difficulty: 'Easy',
    category: 'Array',
    description: '',
    functionName: '',
    inputFormat: '',
    tags: '',
    constraints: '',
    isActive: true,
  });

  const [examples, setExamples] = useState([emptyExample()]);
  const [testCases, setTestCases] = useState([emptyTestCase(), { ...emptyTestCase(), isHidden: true }]);
  const [starterCode, setStarterCode] = useState({ ...DEFAULT_STARTERS });
  const [activeLang, setActiveLang] = useState('javascript');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await adminAPI.problem(id);
        const p = data.problem;
        setForm({
          title: p.title, difficulty: p.difficulty, category: p.category,
          description: p.description, functionName: p.functionName,
          inputFormat: p.inputFormat || '', tags: p.tags?.join(', ') || '',
          constraints: p.constraints?.join('\n') || '', isActive: p.isActive,
        });
        setExamples(p.examples?.length ? p.examples : [emptyExample()]);
        setTestCases(p.testCases?.length ? p.testCases : [emptyTestCase()]);
        setStarterCode({ ...DEFAULT_STARTERS, ...p.starterCode });
      } catch { toast.error('Failed to load problem'); navigate('/admin/problems'); }
      finally { setLoadingProblem(false); }
    })();
  }, [id]);

  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  // Test cases helpers
  const addTC = () => setTestCases(tc => [...tc, emptyTestCase()]);
  const removeTC = (i) => setTestCases(tc => tc.filter((_, j) => j !== i));
  const setTC = (i, k, v) => setTestCases(tc => tc.map((t, j) => j === i ? { ...t, [k]: v } : t));

  // Examples helpers
  const addEx = () => setExamples(ex => [...ex, emptyExample()]);
  const removeEx = (i) => setExamples(ex => ex.filter((_, j) => j !== i));
  const setEx = (i, k, v) => setExamples(ex => ex.map((e, j) => j === i ? { ...e, [k]: v } : e));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.functionName.trim()) return toast.error('Function name is required');
    if (!form.description.trim()) return toast.error('Description is required');
    const validTCs = testCases.filter(tc => tc.input.trim() && tc.expectedOutput.trim());
    if (validTCs.length === 0) return toast.error('At least one complete test case is required');

    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        constraints: form.constraints.split('\n').map(c => c.trim()).filter(Boolean),
        examples: examples.filter(e => e.input.trim() && e.output.trim()),
        testCases: validTCs,
        starterCode,
      };

      if (isEdit) {
        await adminAPI.updateProblem(id, payload);
        toast.success('Problem updated!');
      } else {
        await adminAPI.createProblem(payload);
        toast.success('Problem created!');
      }
      navigate('/admin/problems');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save problem');
    } finally { setSaving(false); }
  };

  if (loadingProblem) return <div className="page-loader"><span className="spinner" style={{ width: 28, height: 28 }} /></div>;

  const sections = [
    { id: 'basic', label: '1. Basic Info' },
    { id: 'description', label: '2. Description & Examples' },
    { id: 'testcases', label: '3. Test Cases' },
    { id: 'code', label: '4. Starter Code' },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={S.header}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/problems')}>
          <ArrowLeft size={14} /> Back to Problems
        </button>
        <h1 className="page-title">{isEdit ? 'Edit Problem' : 'Add New Problem'}</h1>
      </div>

      {/* Section tabs */}
      <div style={S.sectionTabs}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ ...S.sectionTab, ...(activeSection === s.id ? S.sectionTabActive : {}) }}>
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── SECTION 1: Basic Info ── */}
        {activeSection === 'basic' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={S.sectionHeading}>Basic Information</h2>
            <div style={S.row}>
              <div className="input-wrap" style={{ flex: 2 }}>
                <label>Problem Title *</label>
                <input className="input-field" placeholder="e.g. Two Sum" value={form.title} onChange={setField('title')} required />
              </div>
              <div className="input-wrap" style={{ flex: 1 }}>
                <label>Difficulty *</label>
                <select className="input-field" value={form.difficulty} onChange={setField('difficulty')}>
                  {DIFFS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={S.row}>
              <div className="input-wrap" style={{ flex: 1 }}>
                <label>Category *</label>
                <select className="input-field" value={form.category} onChange={setField('category')}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="input-wrap" style={{ flex: 1 }}>
                <label>Function Name * <span style={S.hint}>(the main function to call)</span></label>
                <input className="input-field" placeholder="e.g. twoSum" value={form.functionName} onChange={setField('functionName')} required />
              </div>
            </div>
            <div style={S.row}>
              <div className="input-wrap" style={{ flex: 1 }}>
                <label>Tags <span style={S.hint}>(comma-separated)</span></label>
                <input className="input-field" placeholder="array, hash-table, two-pointers" value={form.tags} onChange={setField('tags')} />
              </div>
              <div className="input-wrap" style={{ flex: 1 }}>
                <label>Input Format <span style={S.hint}>(one type per line: array/number/string)</span></label>
                <input className="input-field" placeholder="array&#10;number" value={form.inputFormat} onChange={setField('inputFormat')} />
              </div>
            </div>
            <div className="input-wrap">
              <label>Constraints <span style={S.hint}>(one per line)</span></label>
              <textarea className="input-field" placeholder="2 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
                value={form.constraints} onChange={setField('constraints')} style={{ minHeight: 80 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-1)' }}>
                <input type="checkbox" checked={form.isActive} onChange={setField('isActive')} style={{ accentColor: 'var(--green)', width: 15, height: 15 }} />
                Problem is active (visible to students)
              </label>
            </div>
          </div>
        )}

        {/* ── SECTION 2: Description ── */}
        {activeSection === 'description' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={S.sectionHeading}>Description & Examples</h2>
            <div className="input-wrap">
              <label>Problem Description * <span style={S.hint}>(Markdown supported)</span></label>
              <textarea className="input-field" placeholder="Describe the problem clearly. Use **bold**, `code`, and lists.&#10;&#10;Given an array of integers..."
                value={form.description} onChange={setField('description')}
                style={{ minHeight: 200 }} required />
            </div>

            <div style={S.subsectionHeader}>
              <h3 style={S.subsection}>Examples</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addEx}><Plus size={13} /> Add Example</button>
            </div>
            {examples.map((ex, i) => (
              <div key={i} style={S.exCard}>
                <div style={S.exHeader}>
                  <span style={S.exLabel}>Example {i + 1}</span>
                  {examples.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeEx(i)}><Trash2 size={12} /></button>
                  )}
                </div>
                <div style={S.row}>
                  <div className="input-wrap" style={{ flex: 1 }}>
                    <label>Input</label>
                    <input className="input-field" placeholder="nums = [2,7,11,15], target = 9" value={ex.input} onChange={e => setEx(i, 'input', e.target.value)} />
                  </div>
                  <div className="input-wrap" style={{ flex: 1 }}>
                    <label>Output</label>
                    <input className="input-field" placeholder="[0,1]" value={ex.output} onChange={e => setEx(i, 'output', e.target.value)} />
                  </div>
                </div>
                <div className="input-wrap">
                  <label>Explanation <span style={S.hint}>(optional)</span></label>
                  <input className="input-field" placeholder="Because nums[0] + nums[1] == 9..." value={ex.explanation} onChange={e => setEx(i, 'explanation', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SECTION 3: Test Cases ── */}
        {activeSection === 'testcases' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ ...S.subsectionHeader, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={S.sectionHeading}>Test Cases</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>
                  Visible test cases are shown to students. Hidden ones are used for final evaluation.
                </p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addTC}><Plus size={13} /> Add Test Case</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {testCases.map((tc, i) => (
                <div key={i} style={{ ...S.tcCard, borderColor: tc.isHidden ? 'var(--orange)' : 'var(--border)' }}>
                  <div style={S.tcHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)' }}>
                        Case {i + 1}
                      </span>
                      <label style={S.hiddenToggle}>
                        <input type="checkbox" checked={tc.isHidden} onChange={e => setTC(i, 'isHidden', e.target.checked)} style={{ accentColor: 'var(--orange)', width: 13, height: 13 }} />
                        <span style={{ color: tc.isHidden ? 'var(--orange)' : 'var(--text-3)', fontSize: '0.72rem', fontWeight: 700 }}>
                          {tc.isHidden ? '🔒 Hidden' : '👁 Visible'}
                        </span>
                      </label>
                    </div>
                    {testCases.length > 1 && (
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeTC(i)}><Trash2 size={12} /></button>
                    )}
                  </div>
                  <div style={S.row}>
                    <div className="input-wrap" style={{ flex: 1 }}>
                      <label>Input <span style={S.hint}>(one argument per line)</span></label>
                      <textarea className="input-field" placeholder="[2,7,11,15]&#10;9" value={tc.input} onChange={e => setTC(i, 'input', e.target.value)} style={{ minHeight: 60 }} />
                    </div>
                    <div className="input-wrap" style={{ flex: 1 }}>
                      <label>Expected Output</label>
                      <textarea className="input-field" placeholder="[0,1]" value={tc.expectedOutput} onChange={e => setTC(i, 'expectedOutput', e.target.value)} style={{ minHeight: 60 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--bg-3)', borderRadius: 'var(--radius)', fontSize: '0.78rem', color: 'var(--text-3)' }}>
              <strong style={{ color: 'var(--text-2)' }}>Input format tip:</strong> Each argument on a new line.
              For arrays: <code style={{ fontFamily: 'var(--font-code)', color: 'var(--green)' }}>[1,2,3]</code> &nbsp;
              For numbers: <code style={{ fontFamily: 'var(--font-code)', color: 'var(--green)' }}>9</code> &nbsp;
              For strings: <code style={{ fontFamily: 'var(--font-code)', color: 'var(--green)' }}>hello</code>
            </div>
          </div>
        )}

        {/* ── SECTION 4: Starter Code ── */}
        {activeSection === 'code' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={S.sectionHeading}>Starter Code Templates</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '1.25rem' }}>
              This code is shown to students when they open the problem. Define the function signature clearly.
            </p>

            <div style={S.langTabs}>
              {LANGS.map(l => (
                <button key={l} type="button" onClick={() => setActiveLang(l)}
                  style={{ ...S.langTab, ...(activeLang === l ? S.langTabActive : {}) }}>
                  {l}
                </button>
              ))}
            </div>

            <textarea
              className="input-field"
              value={starterCode[activeLang] || ''}
              onChange={e => setStarterCode(sc => ({ ...sc, [activeLang]: e.target.value }))}
              style={{ minHeight: 220, fontFamily: 'var(--font-code)', fontSize: '0.85rem' }}
              placeholder={DEFAULT_STARTERS[activeLang]}
              spellCheck={false}
            />
          </div>
        )}

        {/* Submit bar */}
        <div style={S.submitBar}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {sections.map((s, i) => (
              <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                style={{ ...S.navBtn, ...(activeSection === s.id ? S.navBtnActive : {}) }}>
                {i + 1}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/problems')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-green" disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : <><Save size={14} /> {isEdit ? 'Save Changes' : 'Create Problem'}</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const S = {
  header: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' },
  sectionTabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' },
  sectionTab: { padding: '0.45rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'none', color: 'var(--text-2)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)', transition: 'all 0.15s' },
  sectionTabActive: { background: 'var(--bg-3)', color: 'var(--text-0)', borderColor: 'var(--border-2)' },
  sectionHeading: { fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-0)' },
  row: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  hint: { color: 'var(--text-3)', fontWeight: 400, textTransform: 'none', fontSize: '0.68rem', letterSpacing: 0 },
  subsectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' },
  subsection: { fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' },
  exCard: { background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '0.75rem' },
  exHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' },
  exLabel: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase' },
  tcCard: { background: 'var(--bg-3)', border: '1px solid', borderRadius: 'var(--radius)', padding: '1rem' },
  tcHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' },
  hiddenToggle: { display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' },
  langTabs: { display: 'flex', gap: '0.35rem', marginBottom: '0.85rem' },
  langTab: { padding: '0.35rem 0.85rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'none', color: 'var(--text-2)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-code)', transition: 'all 0.15s' },
  langTabActive: { background: 'var(--bg-4)', color: 'var(--text-0)', borderColor: 'var(--border-2)' },
  submitBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginTop: '1.5rem' },
  navBtn: { width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', background: 'none', color: 'var(--text-3)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-ui)', transition: 'all 0.15s' },
  navBtnActive: { background: 'var(--green)', color: '#000', borderColor: 'var(--green)' },
};
