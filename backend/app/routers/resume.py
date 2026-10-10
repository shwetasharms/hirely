from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..data.store import get_job
from ..services.ai_service import tailor_resume

router = APIRouter()


class Experience(BaseModel):
    role: str = ""
    company: str = ""
    period: str = ""
    bullets: list[str] = []


class Resume(BaseModel):
    name: str = ""
    title: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    summary: str = ""
    skills: list[str] = []
    experience: list[Experience] = []
    education: str = ""


class TailorRequest(BaseModel):
    jobId: str
    resume: Resume


@router.post("/tailor")
def tailor(body: TailorRequest):
    job = get_job(body.jobId)
    if not job:
        raise HTTPException(404, "Job not found")
    return {"job": job, **tailor_resume(body.resume.model_dump(), job)}
