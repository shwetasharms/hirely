import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import JobCard, { CompanyLogo, SaveButton } from '../components/JobCard.jsx';
import { formatSalary, roleForCategory, timeAgo, useAppliedJobs, useResume, useUser } from '../store.js';

function ApplyModal({ job, onClose, onDone }) {
  const [user] = useUser();
  const [resume] = useResume();
  const [form, setForm] = useState({ name: user?.name || resume.name || '', email: user?.email || resume.email || '', note: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await api.apply({ jobId: job.id, ...form });
      onDone();
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>Apply for {job.title}</h3>
        <p className="muted">{job.company} · {job.location}</p>
        <label className="field">
          <span>Full name</span>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="field">
          <span>Email</span>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="field">
          <span>Note to the recruiter (optional)</span>
          <textarea rows="4" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </label>
        {error && <div className="alert">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Submit application'}</button>
        </div>
      </form>
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useAppliedJobs();

  useEffect(() => {
    setData(null);
    setError('');
    api.job(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="container empty">
        <h2>{error}</h2>
        <Link to="/jobs" className="btn btn-primary">Back to jobs</Link>
      </div>
    );
  }
  if (!data) return <div className="container page"><div className="card skeleton" style={{ height: 320 }} /></div>;

  const { job, similar } = data;
  const hasApplied = applied.some((j) => j.id === job.id);

  return (
    <div className="container page">
      <Link to="/jobs" className="link back">← Back to jobs</Link>

      <div className="detail-layout">
        <div>
          <div className="card detail-head">
            <CompanyLogo job={job} size={60} />
            <div>
              <h1>{job.title}</h1>
              <p className="muted">{job.company} · {job.location} · Posted {timeAgo(job.postedAt).toLowerCase()}</p>
              <div className="tags">
                <span className="tag">{job.type}</span>
                <span className="tag">{job.mode}</span>
                <span className="tag">{job.level} level</span>
                <span className="tag">{job.category}</span>
              </div>
            </div>
          </div>

          <div className="card prose">
            <h3>About the role</h3>
            <p>{job.description}</p>
            <h3>What you will do</h3>
            <ul>{job.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
            <h3>What we are looking for</h3>
            <ul>{job.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
            <h3>Skills</h3>
            <div className="skills">{job.skills.map((s) => <span key={s}>{s}</span>)}</div>
            <h3>Benefits</h3>
            <ul>{job.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        </div>

        <aside className="detail-side">
          <div className="card">
            <dl className="facts">
              <div><dt>Salary</dt><dd>{formatSalary(job)}</dd></div>
              <div><dt>Experience</dt><dd>{job.experience}</dd></div>
              <div><dt>Work mode</dt><dd>{job.mode}</dd></div>
              <div><dt>Job type</dt><dd>{job.type}</dd></div>
            </dl>
            {hasApplied ? (
              <button className="btn btn-primary btn-block" disabled>✓ Applied</button>
            ) : (
              <button className="btn btn-primary btn-block" onClick={() => setApplying(true)}>Apply now</button>
            )}
            <SaveButton job={job} withLabel />
          </div>

          <div className="card tool-card">
            <h4>Get ready for this job</h4>
            <Link to={`/resume-tailor?jobId=${job.id}`} className="tool-link">
              <strong>Tailor my resume</strong>
              <span>Match your resume to this job description</span>
            </Link>
            <Link to={`/interview-prep?role=${roleForCategory[job.category] || 'frontend'}&level=${job.level}`} className="tool-link">
              <strong>Prepare for the interview</strong>
              <span>Practise {job.level.toLowerCase()}-level {job.category} questions</span>
            </Link>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>Similar jobs</h2></div>
          <div className="job-grid">{similar.map((j) => <JobCard key={j.id} job={j} />)}</div>
        </section>
      )}

      {applying && (
        <ApplyModal
          job={job}
          onClose={() => setApplying(false)}
          onDone={() => {
            setApplied((list) => [...list, { ...job, appliedAt: new Date().toISOString() }]);
            setApplying(false);
          }}
        />
      )}
    </div>
  );
}
