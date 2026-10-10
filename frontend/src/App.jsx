import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import ResumeTailor from './pages/ResumeTailor.jsx';
import InterviewPrep from './pages/InterviewPrep.jsx';
import MyJobs from './pages/MyJobs.jsx';
import Profile from './pages/Profile.jsx';
import Auth from './pages/Auth.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/resume-tailor" element={<ResumeTailor />} />
          <Route path="/interview-prep" element={<InterviewPrep />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route
            path="*"
            element={
              <div className="container empty">
                <h2>Page not found</h2>
                <p>The page you are looking for does not exist.</p>
                <Link className="btn btn-primary" to="/">Go to home</Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="footer no-print">
        <div className="container footer-inner">
          <span className="logo">hire<span>ly</span></span>
          <nav>
            <Link to="/jobs">Jobs</Link>
            <Link to="/resume-tailor">Resume Tailor</Link>
            <Link to="/interview-prep">Interview Prep</Link>
          </nav>
          <span className="muted">© {new Date().getFullYear()} Hirely</span>
        </div>
      </footer>
    </>
  );
}
