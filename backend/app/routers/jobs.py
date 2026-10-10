from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

from ..data.store import JOBS, LEVELS, get_job

router = APIRouter()


def _list(value: str) -> list[str]:
    return [s.strip().lower() for s in value.split(",") if s.strip()]


def _uniq(key: str) -> list[str]:
    return sorted({j[key] for j in JOBS})


@router.get("/meta")
def meta():
    """Options used to build the filter panel."""
    return {
        "locations": _uniq("location"),
        "categories": _uniq("category"),
        "types": _uniq("type"),
        "modes": _uniq("mode"),
        "levels": LEVELS,
        "total": len(JOBS),
    }


@router.get("")
def list_jobs(
    q: str = "",
    location: str = "",
    category: str = "",
    type: str = "",
    mode: str = "",
    level: str = "",
    salaryMin: float | None = None,
    postedWithin: int | None = None,
    sort: str = "recent",
    page: int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=50),
):
    terms = q.lower().split()
    types, modes, levels, categories = _list(type), _list(mode), _list(level), _list(category)
    now = datetime.now(timezone.utc)

    def keep(j: dict) -> bool:
        haystack = f"{j['title']} {j['company']} {j['category']} {' '.join(j['skills'])}".lower()
        if not all(t in haystack for t in terms):
            return False
        if location and j["location"].lower() != location.lower():
            return False
        if types and j["type"].lower() not in types:
            return False
        if modes and j["mode"].lower() not in modes:
            return False
        if levels and j["level"].lower() not in levels:
            return False
        if categories and j["category"].lower() not in categories:
            return False
        if salaryMin and j["salaryMax"] < salaryMin:
            return False
        if postedWithin and (now - datetime.fromisoformat(j["postedAt"])).days > postedWithin:
            return False
        return True

    result = [j for j in JOBS if keep(j)]
    if sort == "salary":
        result.sort(key=lambda j: j["salaryMax"], reverse=True)
    else:
        result.sort(key=lambda j: j["postedAt"], reverse=True)

    total = len(result)
    return {
        "jobs": result[(page - 1) * limit : page * limit],
        "total": total,
        "page": page,
        "totalPages": max(1, -(-total // limit)),
    }


@router.get("/{job_id}")
def job_detail(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    similar = [j for j in JOBS if j["id"] != job["id"] and j["category"] == job["category"]][:3]
    return {"job": job, "similar": similar}
