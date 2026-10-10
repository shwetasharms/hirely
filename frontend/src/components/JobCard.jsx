import { Link } from 'react-router-dom';
import { formatSalary, timeAgo, useSavedJobs } from '../store.js';

export function CompanyLogo({ job, size = 44 }) {
  return (
    <span className="company-logo" style={{ background: job.logoColor, width: size, height: size, fontSize: size * 0.42 }}>
      {job.company[0]}
    </span>
  );
}

export function SaveButton({ job, withLabel = false }) {
  const [saved, setSaved] = useSavedJobs();
  const isSaved = saved.some((j) => j.id === job.id);
  const toggle = (e) => {
    e.preventDefault();
    setSaved((list) => (isSaved ? list.filter((j) => j.id !== job.id) : [...list, job]));
  };
  return (
    <button
      className={`${withLabel ? 'btn btn-outline' : 'icon-btn'} ${isSaved ? 'saved' : ''}`}
      onClick={toggle}
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
      </svg>
      {withLabel && (isSaved ? 'Saved' : 'Save job')}
    </button>
  );
}

export default function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="job-card">
      <div className="job-card-top">
        <CompanyLogo job={job} />
        <div className="job-card-title">
          <h3>{job.title}</h3>
          <p>{job.company} · {job.location}</p>
        </div>
        <SaveButton job={job} />
      </div>
      <div className="tags">
        <span className="tag">{job.type}</span>
        <span className="tag">{job.mode}</span>
        <span className="tag">{job.experience}</span>
      </div>
      <div className="skills">
        {job.skills.slice(0, 4).map((s) => <span key={s}>{s}</span>)}
        {job.skills.length > 4 && <span>+{job.skills.length - 4}</span>}
      </div>
      <div className="job-card-bottom">
        <strong>{formatSalary(job)}</strong>
        <span className="muted">{timeAgo(job.postedAt)}</span>
      </div>
    </Link>
  );
}
