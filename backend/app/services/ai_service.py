"""This is the ONE place to plug in AI later.

Today both functions use plain keyword matching, so the app works with no API
key and no cost. When you are ready, call an LLM (OpenAI, Claude, etc.) inside
tailor_resume() and get_interview_questions() and return the same shape —
the routers and the frontend will not need to change.
"""

import re

from ..data.store import QUESTION_BANK, ROLES

KNOWN_KEYWORDS = [
    "React", "Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Redux",
    "Node.js", "Express", "MongoDB", "PostgreSQL", "MySQL", "SQL", "GraphQL", "REST APIs", "Docker", "Kubernetes",
    "AWS", "CI/CD", "Jest", "Cypress", "Playwright", "Webpack", "Vite", "Python", "Java", "Spring Boot", "Go",
    "Kafka", "Redis", "Microservices", "Micro-frontends", "Accessibility", "Performance", "Design Systems",
    "LLMs", "RAG", "LangChain", "Embeddings", "OpenAI API", "Figma", "Git", "Linux", "Terraform", "Mentoring",
]


def _variants(keyword: str) -> set[str]:
    """'REST APIs' should match 'REST API'; 'Node.js' should match 'nodejs' or 'node'."""
    k = keyword.lower()
    options = {k, re.sub(r"s$", "", k), re.sub(r"\.js$", "", k), re.sub(r"[.\s-]", "", k)}
    return {o for o in options if len(o) > 1}


def _has(text: str, keyword: str) -> bool:
    return any(re.search(rf"(^|[^a-z0-9]){re.escape(v)}([^a-z0-9]|$)", text) for v in _variants(keyword))


def _resume_text(resume: dict) -> str:
    exp = " ".join(
        f"{e.get('role', '')} {e.get('company', '')} {' '.join(e.get('bullets', []))}"
        for e in resume.get("experience", [])
    )
    parts = [resume.get("title", ""), resume.get("summary", ""), " ".join(resume.get("skills", [])), exp, resume.get("education", "")]
    return " ".join(parts).lower()


def tailor_resume(resume: dict, job: dict) -> dict:
    job_text = " ".join([job["title"], job["description"], *job["requirements"], *job["responsibilities"]]).lower()
    keywords = list(dict.fromkeys([*job["skills"], *[k for k in KNOWN_KEYWORDS if _has(job_text, k)]]))

    text = _resume_text(resume)
    matched = [k for k in keywords if _has(text, k)]
    missing = [k for k in keywords if k not in matched]
    score = round(len(matched) / len(keywords) * 100) if keywords else 0

    # Skills: the ones this job asks for come first
    skills = resume.get("skills", [])

    def wanted(skill: str) -> bool:
        return any(_has(skill.lower(), k) or _has(k.lower(), skill) for k in keywords)

    ordered_skills = [s for s in skills if wanted(s)] + [s for s in skills if not wanted(s)]

    # Experience: inside each role, bullets that mention job keywords move up
    experience = []
    for e in resume.get("experience", []):
        bullets = [{"text": b, "hits": [k for k in keywords if _has(b.lower(), k)]} for b in e.get("bullets", [])]
        bullets.sort(key=lambda b: -len(b["hits"]))  # stable: equal bullets keep their order
        experience.append({**e, "bullets": bullets})

    # Summary: lead with what matches, then keep the person's own words.
    # Nothing is invented — only skills already on the resume are mentioned.
    title = resume.get("title") or "Professional"
    if matched:
        lead = f"{title} with hands-on experience in {', '.join(matched[:5])}, applying for the {job['title']} role at {job['company']}."
    else:
        lead = f"{title} applying for the {job['title']} role at {job['company']}."

    suggestions = []
    if missing:
        suggestions.append(f"The job asks for {', '.join(missing[:6])}. Add these only if you have really worked with them.")
    if score < 50:
        suggestions.append("Less than half of the job keywords appear in your resume. Add projects or bullets that show the matching skills.")
    if not (resume.get("summary") or "").strip():
        suggestions.append("Add a short summary to your resume so it can be tailored.")
    if any(not re.search(r"\d", b["text"]) for e in experience for b in e["bullets"]):
        suggestions.append("Add numbers to your bullets where you can (for example: users, percentage improved, time saved).")

    return {
        "engine": "keyword-match",
        "score": score,
        "matchedKeywords": matched,
        "missingKeywords": missing,
        "suggestions": suggestions,
        "tailored": {
            **resume,
            "headline": job["title"],
            "summary": f"{lead} {resume.get('summary', '')}".strip(),
            "skills": ordered_skills,
            "experience": experience,
        },
    }


def get_interview_questions(role_id: str, level: str | None) -> dict | None:
    bank = QUESTION_BANK.get(role_id)
    role = next((r for r in ROLES if r["id"] == role_id), None)
    if not bank or not role:
        return None
    questions = [q for q in bank if not level or q["level"] in ("All", level)]
    return {"engine": "question-bank", "role": role, "questions": questions + QUESTION_BANK["behavioural"]}
