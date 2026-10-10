import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../store.js';

// Screens only: this stores the name and email in the browser.
// Connect it to real backend authentication before going live.
export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const [, setUser] = useUser();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const submit = (e) => {
    e.preventDefault();
    setUser({ name: form.name || form.email.split('@')[0], email: form.email });
    navigate('/jobs');
  };

  const field = (name, label, type, extra = {}) => (
    <label className="field">
      <span>{label}</span>
      <input required type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} {...extra} />
    </label>
  );

  return (
    <div className="auth">
      <div className="auth-art">
        <Link to="/" className="logo">hire<span>ly</span></Link>
        <h2>Your next role is<br />a few clicks away.</h2>
        <ul>
          <li>Search and filter open roles</li>
          <li>Tailor your resume to each job</li>
          <li>Practise interview questions for your level</li>
        </ul>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">{isLogin ? 'Sign in to see your saved jobs and resume.' : 'It takes less than a minute.'}</p>

        {!isLogin && field('name', 'Full name', 'text', { autoComplete: 'name' })}
        {field('email', 'Email', 'email', { autoComplete: 'email' })}
        {field('password', 'Password', 'password', { minLength: 6, autoComplete: isLogin ? 'current-password' : 'new-password' })}

        <button className="btn btn-primary btn-lg btn-block">{isLogin ? 'Sign in' : 'Create account'}</button>

        <p className="muted center">
          {isLogin ? <>New here? <Link className="link" to="/register">Create an account</Link></> : <>Already have an account? <Link className="link" to="/login">Sign in</Link></>}
        </p>
      </form>
    </div>
  );
}
