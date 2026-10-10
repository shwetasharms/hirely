<<<<<<< HEAD
# Hirely — Job Portal

Two separate apps. Run each in its own terminal.

## 1. Backend (Python + FastAPI) — http://localhost:5000

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows   (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

API docs (auto-generated): http://localhost:5000/docs

## 2. Frontend (React + Vite) — http://localhost:5173

```bash
cd frontend
npm install
npm run dev
```

If the backend runs on another URL, copy `frontend/.env.example` to `.env` and change `VITE_API_URL`.

## API

| Method | URL | Purpose |
|---|---|---|
| GET | `/api/jobs` | List jobs. Query: `q, location, category, type, mode, level, salaryMin, postedWithin, sort, page, limit` |
| GET | `/api/jobs/meta` | Filter options |
| GET | `/api/jobs/{id}` | One job + similar jobs |
| POST | `/api/applications` | Apply for a job |
| POST | `/api/resume/tailor` | Tailor a resume to a job |
| GET | `/api/interview/roles` | Roles and levels |
| GET | `/api/interview/questions` | Questions for `role` and `level` |

## Where things live

- `backend/app/data/jobs.json` — demo jobs. Replace `data/store.py` with a database or a real jobs API.
- `backend/app/services/ai_service.py` — **the place to add AI.** Resume tailoring and interview
  questions use keyword matching and a fixed question bank today. Call an LLM inside
  `tailor_resume()` and `get_interview_questions()` and return the same shape; nothing else changes.
- `frontend/src/pages/` — one file per screen.
- `frontend/src/store.js` — saved jobs, applied jobs, resume and signed-in user (browser storage for now).

## Not built yet

- Real login: the sign-in and register screens only store the name and email in the browser.
- Database: applications are written to `backend/app/data/applications.json`.
=======
# hirely
>>>>>>> 91908b9df406756a35b26edd59d15b46649f1fd5
