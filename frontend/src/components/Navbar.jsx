import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSavedJobs, useUser } from '../store.js';

const links = [
  { to: '/jobs', label: 'Find Jobs' },
  { to: '/resume-tailor', label: 'Resume Tailor' },
  { to: '/interview-prep', label: 'Interview Prep' },
  { to: '/my-jobs', label: 'My Jobs' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useUser();
  const [saved] = useSavedJobs();
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="nav no-print">
      <div className="container nav-inner">
        <Link to="/" className="logo">hire<span>ly</span></Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}>
              {l.label}
              {l.to === '/my-jobs' && saved.length > 0 && <span className="count">{saved.length}</span>}
            </NavLink>
          ))}
          <div className="nav-auth">
            {user ? (
              <>
                <Link to="/profile" className="avatar-link">
                  <span className="avatar">{user.name?.[0]?.toUpperCase() || 'U'}</span>
                  {user.name}
                </Link>
                <button className="btn btn-ghost" onClick={() => setUser(null)}>Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Sign in</Link>
                <Link to="/register" className="btn btn-primary">Create account</Link>
              </>
            )}
          </div>
        </nav>

        <button className="menu-btn" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
