import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useLocal } from '../store.js';

export default function InterviewPrep() {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState({});
  const [done, setDone] = useLocal('hirely.practised', []);

  const role = params.get('role') || 'frontend';
  const level = params.get('level') || 'Mid';

  useEffect(() => {
    api.interviewRoles().then(setMeta).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setError('');
    setOpen({});
    api.interviewQuestions(role, level).then(setData).catch((e) => setError(e.message));
  }, [role, level]);

  const set = (name, value) => {
    const next = new URLSearchParams(params);
    next.set(name, value);
    setParams(next);
  };

  const toggleDone = (question) =>
    setDone((list) => (list.includes(question) ? list.filter((x) => x !== question) : [...list, question]));

  const topics = data ? [...new Set(data.questions.map((x) => x.topic))] : [];
  const practised = data ? data.questions.filter((x) => done.includes(x.question)).length : 0;

  return (
    <div className="container page">
      <div className="page-head">
        <span className="eyebrow">Interview Prep</span>
        <h1>Practise for your role and level</h1>
        <p className="muted">Pick your role and experience level. Try each question aloud before you open the hint.</p>
      </div>

      <div className="card prep-controls">
        <div>
          <span className="label">Role</span>
          <div className="chip-row">
            {meta?.roles.map((r) => (
              <button key={r.id} className={`chip ${r.id === role ? 'active' : ''}`} onClick={() => set('role', r.id)}>{r.name}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="label">Experience level</span>
          <div className="chip-row">
            {meta?.levels.map((l) => (
              <button key={l} className={`chip ${l === level ? 'active' : ''}`} onClick={() => set('level', l)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      {data && (
        <>
          <div className="progress-row">
            <p><strong>{practised}</strong> of {data.questions.length} practised</p>
            <div className="progress"><span style={{ width: `${(practised / data.questions.length) * 100}%` }} /></div>
          </div>

          {topics.map((topic) => (
            <section key={topic} className="topic">
              <h3>{topic}</h3>
              {data.questions.filter((x) => x.topic === topic).map((x) => {
                const isDone = done.includes(x.question);
                return (
                  <div key={x.question} className={`question ${isDone ? 'done' : ''}`}>
                    <label className="check" title="Mark as practised">
                      <input type="checkbox" checked={isDone} onChange={() => toggleDone(x.question)} />
                    </label>
                    <div className="question-body">
                      <p>{x.question}</p>
                      {open[x.question] && <p className="hint">Hint: {x.hint}</p>}
                    </div>
                    <button className="link" onClick={() => setOpen((o) => ({ ...o, [x.question]: !o[x.question] }))}>
                      {open[x.question] ? 'Hide hint' : 'Show hint'}
                    </button>
                  </div>
                );
              })}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
