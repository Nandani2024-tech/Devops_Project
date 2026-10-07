from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import settings
from app.routes import health, projects, bugs, analysis

app = FastAPI(
    title="BugBoard API",
    description="DevOps Bug Tracking and Static Code Analysis Platform",
    version="1.0.0"
)

# Configure CORS
origins = settings.get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(projects.router)
app.include_router(bugs.router)
app.include_router(analysis.router)

# Instrument Prometheus metrics
Instrumentator().instrument(app).expose(app)

@app.get("/")
def root():
    return {
        "service": "BugBoard API",
        "status": "operational",
        "documentation": "/docs",
        "health": "/health"
    }
