import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import applications, interview, jobs, resume

app = FastAPI(title="Job Portal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGIN", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
