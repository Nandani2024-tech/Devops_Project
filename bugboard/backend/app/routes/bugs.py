from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Project, Bug, SeverityLevel, BugStatus
from app.schemas import BugCreate, BugUpdate, BugResponse

router = APIRouter(tags=["bugs"])

@router.post("/api/projects/{project_id}/bugs", response_model=BugResponse, status_code=status.HTTP_201_CREATED)
def create_bug(project_id: int, bug_in: BugCreate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    new_bug = Bug(
        project_id=project_id,
        title=bug_in.title,
        description=bug_in.description,
        severity=bug_in.severity,
        status=bug_in.status,
        affected_file=bug_in.affected_file,
        line_number=bug_in.line_number
    )
    db.add(new_bug)
    db.commit()
    db.refresh(new_bug)
    return new_bug

@router.get("/api/projects/{project_id}/bugs", response_model=List[BugResponse])
def list_project_bugs(
    project_id: int,
    status_filter: Optional[BugStatus] = Query(None, alias="status"),
    severity_filter: Optional[SeverityLevel] = Query(None, alias="severity"),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    query = db.query(Bug).filter(Bug.project_id == project_id)
    if status_filter:
        query = query.filter(Bug.status == status_filter)
    if severity_filter:
        query = query.filter(Bug.severity == severity_filter)

    return query.order_by(Bug.created_at.desc()).all()

@router.get("/api/bugs/{bug_id}", response_model=BugResponse)
def get_bug(bug_id: int, db: Session = Depends(get_db)):
    bug = db.query(Bug).filter(Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")
    return bug

@router.put("/api/bugs/{bug_id}", response_model=BugResponse)
def update_bug(bug_id: int, bug_in: BugUpdate, db: Session = Depends(get_db)):
    bug = db.query(Bug).filter(Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")

    update_data = bug_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bug, field, value)

    db.commit()
    db.refresh(bug)
    return bug

@router.delete("/api/bugs/{bug_id}", status_code=status.HTTP_200_OK)
def delete_bug(bug_id: int, db: Session = Depends(get_db)):
    bug = db.query(Bug).filter(Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")

    db.delete(bug)
    db.commit()
    return {"detail": f"Bug {bug_id} deleted successfully"}
