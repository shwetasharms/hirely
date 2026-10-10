import { useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard, { CompanyLogo } from '../components/JobCard.jsx';
import { formatSalary, useAppliedJobs, useSavedJobs } from '../store.js';

export default function MyJobs() {
  const [tab, setTab] = useState('saved');
  const [saved] = useSavedJobs();
  const [applied] = useAppliedJobs();

  return (
    <div className="container page">
      <div className="page-head">
        <h1>My jobs</h1>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'saved'} className={tab === 'saved' ? 'active' : ''} onClick={() => setTab('saved')}>Saved ({saved.length})</button>
        <button role="tab" aria-selected={tab === 'applied'} className={tab === 'applied' ? 'active' : ''} onClick={() => setTab('applied')}>Applied ({applied.length})</button>
      </div>

      {tab === 'saved' && (
        saved.length ? (
          <div className="job-grid">{saved.map((j) => <JobCard key={j.id} job={j} />)}</div>
        ) : (
          <div className="empty">
            <h3>No saved jobs yet</h3>
            <p>Press the bookmark on any job to keep it here.</p>
            <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
          </div>
        )
      )}

      {tab === 'applied' && (
        applied.length ? (
          <div className="applied-list">
            {applied.map((j) => (
              <Link key={j.id} to={`/jobs/${j.id}`} className="card applied-row">
                <CompanyLogo job={j} />
                <div>
                  <strong>{j.title}</strong>
                  <p className="muted">{j.company} · {j.location} · {formatSalary(j)}</p>
                </div>
                <span className="tag">Applied {new Date(j.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No applications yet</h3>
            <p>Jobs you apply for will appear here.</p>
            <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
          </div>
        )
      )}
    </div>
  );
}
