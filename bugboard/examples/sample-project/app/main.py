from fastapi import FastAPI
from app.users import router as users_router

app = FastAPI(title="Sample User Microservice", version="1.0.0")

app.include_router(users_router)

@app.get("/")
def read_root():
    return {"message": "Sample microservice is running"}

@app.get("/health")
def sample_health():
    return {"status": "ok"}
