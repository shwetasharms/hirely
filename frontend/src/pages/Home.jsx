import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import JobCard from '../components/JobCard.jsx';

const categories = ['Frontend', 'Backend', 'Full Stack', 'AI / ML', 'Data', 'DevOps', 'Mobile', 'Design', 'QA', 'Product'];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [meta, setMeta] = useState(null);
  const [latest, setLatest] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.jobsMeta().then(setMeta).catch(() => {});
    api.jobs({ limit: 6 }).then((d) => setLatest(d.jobs)).catch((e) => setError(e.message));
  }, []);

  const search = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (location) params.set('location', location);
    navigate(`/jobs?${params}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">{meta ? `${meta.total} open roles right now` : 'Open roles updated daily'}</span>
          <h1>Find the job.<br /><em>Fit the resume.</em> Ace the interview.</h1>
          <p>Search roles, tailor your resume to each job description, and practise the questions for your role — all in one place.</p>

          <form className="search-bar" onSubmit={search}>
            <label className="search-field">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill or company" aria-label="Search jobs" />
            </label>
            <label className="search-field">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
              <select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location">
                <option value="">Any location</option>
                {meta?.locations.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
            <button className="btn btn-primary btn-lg">Search jobs</button>
          </form>

          <div className="chip-row">
            <span className="muted">Popular:</span>
            {['React', 'Python', 'AI Engineer', 'Remote'].map((t) => (
              <Link key={t} className="chip" to={t === 'Remote' ? '/jobs?mode=remote' : `/jobs?q=${encodeURIComponent(t)}`}>{t}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Browse by category</h2>
        </div>
        <div className="category-grid">
          {categories.map((c) => (
            <Link key={c} to={`/jobs?category=${encodeURIComponent(c.toLowerCase())}`} className="category-card">
              {c}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Latest jobs</h2>
          <Link to="/jobs" className="link">View all jobs →</Link>
        </div>
        {error && <div className="alert">{error}</div>}
        <div className="job-grid">
          {latest.map((j) => <JobCard key={j.id} job={j} />)}
        </div>
      </section>

      <section className="container section">
        <div className="feature-grid">
          <div className="feature feature-dark">
            <span className="eyebrow">Resume Tailor</span>
            <h3>One resume, shaped for every job</h3>
            <p>Pick a job and see how well your resume matches. Your skills and experience are reordered around what the job asks for.</p>
            <Link to="/resume-tailor" className="btn btn-accent">Tailor my resume</Link>
          </div>
          <div className="feature feature-light">
            <span className="eyebrow">Interview Prep</span>
            <h3>Practise questions for your role and level</h3>
            <p>Choose your role and experience level and work through technical and behavioural questions with hints.</p>
            <Link to="/interview-prep" className="btn btn-primary">Start preparing</Link>
          </div>
        </div>
      </section>
    </>
  );
}
