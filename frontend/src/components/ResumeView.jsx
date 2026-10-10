// Renders a resume. Works for both the original resume (bullets are strings)
// and the tailored one (bullets are { text, hits }).
export default function ResumeView({ resume, highlight = [] }) {
  const isHit = (skill) => highlight.some((k) => k.toLowerCase() === skill.toLowerCase());
  return (
    <article className="resume">
      <header>
        <h2>{resume.name || 'Your name'}</h2>
        <p className="resume-headline">{resume.headline || resume.title}</p>
        <p className="resume-contact">
          {[resume.email, resume.phone, resume.location].filter(Boolean).join('  ·  ')}
        </p>
      </header>

      {resume.summary && (
        <section>
          <h4>Summary</h4>
          <p>{resume.summary}</p>
        </section>
      )}

      {resume.skills?.length > 0 && (
        <section>
          <h4>Skills</h4>
          <div className="resume-skills">
            {resume.skills.map((s) => <span key={s} className={isHit(s) ? 'hit' : ''}>{s}</span>)}
          </div>
        </section>
      )}

      {resume.experience?.length > 0 && (
        <section>
          <h4>Experience</h4>
          {resume.experience.map((e, i) => (
            <div className="resume-role" key={i}>
              <div className="resume-role-head">
                <strong>{e.role}{e.company && ` — ${e.company}`}</strong>
                <span>{e.period}</span>
              </div>
              <ul>
                {e.bullets.map((b, k) => {
                  const text = typeof b === 'string' ? b : b.text;
                  return <li key={k}>{text}</li>;
                })}
              </ul>
            </div>
          ))}
        </section>
      )}

      {resume.education && (
        <section>
          <h4>Education</h4>
          <p>{resume.education}</p>
        </section>
      )}
    </article>
  );
}
