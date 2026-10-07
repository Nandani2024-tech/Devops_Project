from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.database import get_db
from app.models import Bug, BugAnalysis
from app.schemas import BugAnalysisResponse
from app.analyzer import analyze_bug

router = APIRouter(tags=["analysis"])

@router.post("/api/bugs/{bug_id}/analyze", response_model=BugAnalysisResponse, status_code=status.HTTP_200_OK)
def trigger_bug_analysis(bug_id: int, db: Session = Depends(get_db)):
    bug = db.query(Bug).filter(Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")

    project = bug.project
    extracted_path = project.extracted_path if project else ""

    result = analyze_bug(
        base_dir=extracted_path,
        affected_file=bug.affected_file,
        line_number=bug.line_number,
        title=bug.title,
        description=bug.description
    )

    if bug.analysis:
        bug.analysis.detected_snippet = result["detected_snippet"]
        bug.analysis.potential_cause = result["potential_cause"]
        bug.analysis.suggested_fix = result["suggested_fix"]
        bug.analysis.reproduction_steps = result["reproduction_steps"]
        bug.analysis.analyzed_at = func.now()
        analysis_record = bug.analysis
    else:
        analysis_record = BugAnalysis(
            bug_id=bug.id,
            detected_snippet=result["detected_snippet"],
            potential_cause=result["potential_cause"],
            suggested_fix=result["suggested_fix"],
            reproduction_steps=result["reproduction_steps"]
        )
        db.add(analysis_record)

    db.commit()
    db.refresh(analysis_record)
    return analysis_record

@router.get("/api/bugs/{bug_id}/analysis", response_model=BugAnalysisResponse)
def get_bug_analysis(bug_id: int, db: Session = Depends(get_db)):
    bug = db.query(Bug).filter(Bug.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bug not found")

    if not bug.analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis has not yet been generated for this bug"
        )

    return bug.analysis
