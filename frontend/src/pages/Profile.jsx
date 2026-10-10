import { useState } from 'react';
import ResumeView from '../components/ResumeView.jsx';
import { sampleResume, useResume } from '../store.js';

const emptyRole = { role: '', company: '', period: '', bullets: [] };

export default function Profile() {
  const [stored, setStored] = useResume();
  const [resume, setResume] = useState(stored);
  const [saved, setSaved] = useState(false);

  const change = (patch) => {
    setResume((r) => ({ ...r, ...patch }));
    setSaved(false);
  };
  const changeRole = (i, patch) =>
    change({ experience: resume.experience.map((e, k) => (k === i ? { ...e, ...patch } : e)) });

  // Text inputs keep empty lines while typing; they are cleaned up on save.
  const save = (e) => {
    e.preventDefault();
    const clean = {
      ...resume,
      skills: resume.skills.map((s) => s.trim()).filter(Boolean),
      experience: resume.experience.map((x) => ({ ...x, bullets: x.bullets.map((b) => b.trim()).filter(Boolean) })),
    };
    setResume(clean);
    setStored(clean);
    setSaved(true);
  };

  const text = (name, label, type = 'text') => (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={resume[name]} onChange={(e) => change({ [name]: e.target.value })} />
    </label>
  );

  return (
    <div className="container page">
      <div className="page-head">
        <h1>My resume</h1>
        <p className="muted">This is the resume used by Resume Tailor. Keep it complete — tailoring only uses what you write here.</p>
      </div>

      <div className="profile-layout">
        <form className="card form" onSubmit={save}>
          <div className="form-row">{text('name', 'Full name')}{text('title', 'Job title')}</div>
          <div className="form-row">{text('email', 'Email', 'email')}{text('phone', 'Phone')}</div>
          {text('location', 'Location')}

          <label className="field">
            <span>Summary</span>
            <textarea rows="3" value={resume.summary} onChange={(e) => change({ summary: e.target.value })} />
          </label>

          <label className="field">
            <span>Skills (separate with commas)</span>
            <textarea rows="2" value={resume.skills.join(', ')} onChange={(e) => change({ skills: e.target.value.split(/,\s*/) })} />
          </label>

          <h4>Experience</h4>
          {resume.experience.map((e, i) => (
            <div className="role-editor" key={i}>
              <div className="form-row">
                <label className="field"><span>Role</span><input value={e.role} onChange={(ev) => changeRole(i, { role: ev.target.value })} /></label>
                <label className="field"><span>Company</span><input value={e.company} onChange={(ev) => changeRole(i, { company: ev.target.value })} /></label>
              </div>
              <label className="field"><span>Period</span><input value={e.period} placeholder="2022 – Present" onChange={(ev) => changeRole(i, { period: ev.target.value })} /></label>
              <label className="field">
                <span>Achievements (one per line)</span>
                <textarea rows="4" value={e.bullets.join('\n')} onChange={(ev) => changeRole(i, { bullets: ev.target.value.split('\n') })} />
              </label>
              <button type="button" className="link danger" onClick={() => change({ experience: resume.experience.filter((_, k) => k !== i) })}>Remove this role</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline" onClick={() => change({ experience: [...resume.experience, emptyRole] })}>+ Add role</button>

          {text('education', 'Education')}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => change(sampleResume)}>Load sample</button>
            <button className="btn btn-primary">{saved ? 'Saved ✓' : 'Save resume'}</button>
          </div>
        </form>

        <div className="preview">
          <span className="label">Preview</span>
          <ResumeView resume={{ ...resume, skills: resume.skills.filter((s) => s.trim()), experience: resume.experience.map((x) => ({ ...x, bullets: x.bullets.filter((b) => b.trim()) })) }} />
        </div>
      </div>
    </div>
  );
}
