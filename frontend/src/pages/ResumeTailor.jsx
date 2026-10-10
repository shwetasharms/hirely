import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ResumeView from '../components/ResumeView.jsx';
import { useResume } from '../store.js';

function ScoreRing({ score }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const tone = score >= 70 ? 'good' : score >= 40 ? 'ok' : 'low';
  return (
    <div className={`score-ring ${tone}`}>
      <svg viewBox="0 0 100 100" width="120" height="120">
        <circle cx="50" cy="50" r={r} className="track" />
        <circle cx="50" cy="50" r={r} className="value" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} />
      </svg>
      <div><strong>{score}%</strong><span>match</span></div>
    </div>
  );
}

const toText = (r) =>
  [
    r.name,
    r.headline || r.title,
    [r.email, r.phone, r.location].filter(Boolean).join(' | '),
    '',
    'SUMMARY',
    r.summary,
    '',
    'SKILLS',
    r.skills.join(', '),
    '',
    'EXPERIENCE',
    ...r.experience.flatMap((e) => [`${e.role} — ${e.company} (${e.period})`, ...e.bullets.map((b) => `• ${b.text ?? b}`), '']),
    'EDUCATION',
    r.education,
  ].join('\n');

export default function ResumeTailor() {
  const [params, setParams] = useSearchParams();
  const [resume] = useResume();
  const [jobs, setJobs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const jobId = params.get('jobId') || '';

  useEffect(() => {
    api.jobs({ limit: 50 }).then((d) => setJobs(d.jobs)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => setResult(null), [jobId]);

  const tailor = async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await api.tailorResume(jobId, resume));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(toText(result.tailored));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container page">
      <div className="page-head no-print">
        <span className="eyebrow">Resume Tailor</span>
        <h1>Shape your resume for a specific job</h1>
        <p className="muted">Choose a job. Your resume is compared with the job description and reordered around what the employer asks for.</p>
      </div>

      <div className="card tailor-bar no-print">
        <label className="field">
          <span>1. Choose a job</span>
          <select value={jobId} onChange={(e) => setParams(e.target.value ? { jobId: e.target.value } : {})}>
            <option value="">Select a job…</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
          </select>
        </label>
        <div className="field">
          <span>2. Your resume</span>
          <div className="resume-pill">
            <strong>{resume.name || 'No name yet'}</strong>
            <span className="muted">{resume.title} · {resume.skills.length} skills</span>
            <Link to="/profile" className="link">Edit resume</Link>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" disabled={!jobId || loading} onClick={tailor}>
          {loading ? 'Tailoring…' : 'Tailor my resume'}
        </button>
      </div>

      {error && <div className="alert no-print">{error}</div>}

      {!result && !error && (
        <div className="empty no-print">
          <h3>{jobId ? 'Ready when you are' : 'Select a job to begin'}</h3>
          <p>{jobId ? 'Press “Tailor my resume” to see your match score and the tailored version.' : 'You can also open any job and press “Tailor my resume” there.'}</p>
        </div>
      )}

      {result && (
        <div className="tailor-layout">
          <aside className="tailor-side no-print">
            <div className="card center">
              <ScoreRing score={result.score} />
              <p className="muted">
                {result.matchedKeywords.length} of {result.matchedKeywords.length + result.missingKeywords.length} keywords from
                <br /><strong>{result.job.title}</strong> at {result.job.company}
              </p>
            </div>

            <div className="card">
              <h4>Keywords you already have</h4>
              <div className="skills ok">
                {result.matchedKeywords.length ? result.matchedKeywords.map((k) => <span key={k}>{k}</span>) : <p className="muted">None found yet.</p>}
              </div>
              <h4>Keywords missing from your resume</h4>
              <div className="skills warn">
                {result.missingKeywords.length ? result.missingKeywords.map((k) => <span key={k}>{k}</span>) : <p className="muted">Nothing missing.</p>}
              </div>
            </div>

            {result.suggestions.length > 0 && (
              <div className="card">
                <h4>Suggestions</h4>
                <ul className="suggestions">{result.suggestions.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}
          </aside>

          <section>
            <div className="results-head no-print">
              <p><strong>Tailored resume</strong></p>
              <div className="results-actions">
                <button className="btn btn-outline" onClick={copy}>{copied ? 'Copied ✓' : 'Copy text'}</button>
                <button className="btn btn-primary" onClick={() => window.print()}>Download PDF</button>
              </div>
            </div>
            <ResumeView resume={result.tailored} highlight={result.matchedKeywords} />
          </section>
        </div>
      )}
    </div>
  );
}
