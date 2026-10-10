import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import JobCard from '../components/JobCard.jsx';

// The URL is the single source of truth for search and filters,
// so results can be shared, bookmarked and survive a refresh.

function CheckGroup({ title, name, options, params, onToggle }) {
  const selected = (params.get(name) || '').split(',').filter(Boolean);
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      {options.map((o) => (
        <label key={o} className="check">
          <input type="checkbox" checked={selected.includes(o.toLowerCase())} onChange={() => onToggle(name, o.toLowerCase())} />
          {o}
        </label>
      ))}
    </fieldset>
  );
}

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.jobsMeta().then(setMeta).catch(() => {});
  }, []);

  const key = params.toString();
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api
      .jobs(Object.fromEntries(params))
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    setQ(params.get('q') || '');
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = (name, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== 'page') next.delete('page');
    setParams(next);
  };

  const toggle = (name, value) => {
    const current = (params.get(name) || '').split(',').filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    set(name, next.join(','));
  };

  const activeCount = [...params.keys()].filter((k) => !['q', 'page', 'sort'].includes(k)).length;

  return (
    <div className="container page">
      <form className="search-bar search-bar-slim" onSubmit={(e) => { e.preventDefault(); set('q', q.trim()); }}>
        <label className="search-field">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title, skill or company" aria-label="Search jobs" />
        </label>
        <button className="btn btn-primary">Search</button>
      </form>

      <div className="jobs-layout">
        <aside className={`filters ${showFilters ? 'open' : ''}`}>
          <div className="filters-head">
            <h3>Filters</h3>
            {(activeCount > 0 || params.get('q')) && (
              <button className="link" onClick={() => setParams({})}>Clear all</button>
            )}
            <button className="icon-btn filters-close" onClick={() => setShowFilters(false)} aria-label="Close filters">✕</button>
          </div>

          <label className="field">
            <span>Location</span>
            <select value={params.get('location') || ''} onChange={(e) => set('location', e.target.value)}>
              <option value="">Any location</option>
              {meta?.locations.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Category</span>
            <select value={params.get('category') || ''} onChange={(e) => set('category', e.target.value)}>
              <option value="">All categories</option>
              {meta?.categories.map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
            </select>
          </label>

          {meta && (
            <>
              <CheckGroup title="Work mode" name="mode" options={meta.modes} params={params} onToggle={toggle} />
              <CheckGroup title="Job type" name="type" options={meta.types} params={params} onToggle={toggle} />
              <CheckGroup title="Experience level" name="level" options={meta.levels} params={params} onToggle={toggle} />
            </>
          )}

          <label className="field">
            <span>Minimum salary</span>
            <select value={params.get('salaryMin') || ''} onChange={(e) => set('salaryMin', e.target.value)}>
              <option value="">Any salary</option>
              {[5, 10, 20, 30, 40].map((s) => <option key={s} value={s}>₹{s} LPA or more</option>)}
            </select>
          </label>

          <label className="field">
            <span>Date posted</span>
            <select value={params.get('postedWithin') || ''} onChange={(e) => set('postedWithin', e.target.value)}>
              <option value="">Any time</option>
              <option value="1">Last 24 hours</option>
              <option value="3">Last 3 days</option>
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
            </select>
          </label>

          <button className="btn btn-primary filters-apply" onClick={() => setShowFilters(false)}>
            Show {data?.total ?? ''} jobs
          </button>
        </aside>

        <section className="results">
          <div className="results-head">
            <p>
              <strong>{data?.total ?? '—'}</strong> job{data?.total === 1 ? '' : 's'} found
              {params.get('q') && <> for “{params.get('q')}”</>}
            </p>
            <div className="results-actions">
              <button className="btn btn-outline filters-open" onClick={() => setShowFilters(true)}>
                Filters{activeCount > 0 && ` (${activeCount})`}
              </button>
              <select value={params.get('sort') || 'recent'} onChange={(e) => set('sort', e.target.value === 'recent' ? '' : e.target.value)} aria-label="Sort jobs">
                <option value="recent">Newest first</option>
                <option value="salary">Highest salary</option>
              </select>
            </div>
          </div>

          {error && <div className="alert">{error}</div>}

          {loading && !data ? (
            <div className="job-grid">{[...Array(6)].map((_, i) => <div key={i} className="job-card skeleton" />)}</div>
          ) : data?.jobs.length === 0 ? (
            <div className="empty">
              <h3>No jobs match these filters</h3>
              <p>Try removing a filter or searching for a different skill.</p>
              <button className="btn btn-outline" onClick={() => setParams({})}>Clear all filters</button>
            </div>
          ) : (
            <div className={`job-grid ${loading ? 'dim' : ''}`}>
              {data?.jobs.map((j) => <JobCard key={j.id} job={j} />)}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <nav className="pagination" aria-label="Pages">
              <button disabled={data.page === 1} onClick={() => set('page', String(data.page - 1))}>← Previous</button>
              {[...Array(data.totalPages)].map((_, i) => (
                <button key={i} className={data.page === i + 1 ? 'active' : ''} onClick={() => set('page', String(i + 1))}>{i + 1}</button>
              ))}
              <button disabled={data.page === data.totalPages} onClick={() => set('page', String(data.page + 1))}>Next →</button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
