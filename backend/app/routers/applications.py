import json
import time
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from ..data.store import DATA_DIR, get_job

# Applications are saved to a JSON file so they survive a restart.
# Swap this for a database table when you add one.
FILE = DATA_DIR / "applications.json"

router = APIRouter()


class ApplicationIn(BaseModel):
    jobId: str
    name: str = Field(min_length=1)
    email: EmailStr
    note: str = ""


def _read() -> list[dict]:
    return json.loads(FILE.read_text(encoding="utf-8")) if FILE.exists() else []


@router.get("")
def list_applications():
    return {"applications": _read()}


@router.post("", status_code=201)
def create_application(body: ApplicationIn):
    if not get_job(body.jobId):
        raise HTTPException(404, "Job not found")
    application = {
        "id": format(int(time.time() * 1000), "x"),
        **body.model_dump(),
        "appliedAt": datetime.now(timezone.utc).isoformat(),
    }
    FILE.write_text(json.dumps([*_read(), application], indent=2), encoding="utf-8")
    return {"application": application}
