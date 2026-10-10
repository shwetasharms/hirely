"""Loads the demo data.

Replace this module with a database or a real jobs API later — the routers
only depend on the shape of the dictionaries returned from here.
"""

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

DATA_DIR = Path(__file__).parent


def _load(name: str):
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def _with_posted_date(job: dict) -> dict:
    job = dict(job)
    days = job.pop("postedDaysAgo", 0)
    job["postedAt"] = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    return job


JOBS: list[dict] = [_with_posted_date(j) for j in _load("jobs.json")]

_questions = _load("questions.json")
ROLES: list[dict] = _questions["roles"]
QUESTION_BANK: dict[str, list[dict]] = _questions["bank"]
LEVELS = ["Entry", "Mid", "Senior", "Lead"]


def get_job(job_id: str) -> dict | None:
    return next((j for j in JOBS if j["id"] == str(job_id)), None)
