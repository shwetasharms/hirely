from fastapi import APIRouter, HTTPException

from ..data.store import LEVELS, ROLES
from ..services.ai_service import get_interview_questions

router = APIRouter()


@router.get("/roles")
def roles():
    return {"roles": ROLES, "levels": LEVELS}


@router.get("/questions")
def questions(role: str, level: str | None = None):
    data = get_interview_questions(role, level)
    if not data:
        raise HTTPException(404, "Role not found")
    return data
