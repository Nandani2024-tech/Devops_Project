import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Project
from app.schemas import ProjectResponse, ProjectDetailResponse
from app.config import settings
from app.analyzer import extract_project_zip, count_project_files, build_file_tree

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a .zip archive"
        )

    # 1. Create initial Project record to get project ID
    new_project = Project(
        name=name.strip(),
        filename=file.filename,
        file_count=0,
        python_file_count=0,
        test_file_count=0,
        status="PROCESSING",
        extracted_path=""
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    upload_root = settings.get_upload_dir()
    project_dir = os.path.join(upload_root, str(new_project.id))
    os.makedirs(project_dir, exist_ok=True)

    temp_zip_path = os.path.join(project_dir, "uploaded_archive.zip")
    extracted_target = os.path.join(project_dir, "extracted")

    try:
        # 2. Save uploaded zip file
        with open(temp_zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 3. Safely extract zip
        extract_project_zip(temp_zip_path, extracted_target)

        # 4. Count files
        counts = count_project_files(extracted_target)

        # 5. Update Project record
        new_project.file_count = counts["file_count"]
        new_project.python_file_count = counts["python_file_count"]
        new_project.test_file_count = counts["test_file_count"]
        new_project.extracted_path = extracted_target
        new_project.status = "PROCESSED"
        db.commit()
        db.refresh(new_project)

        response_data = ProjectResponse.model_validate(new_project)
        response_data.bug_count = len(new_project.bugs)
        return response_data

    except Exception as e:
        # Cleanup directory on extraction/processing failure
        shutil.rmtree(project_dir, ignore_errors=True)
        db.delete(new_project)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process zip file: {str(e)}"
        )

@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.uploaded_at.desc()).all()
    results = []
    for p in projects:
        data = ProjectResponse.model_validate(p)
        data.bug_count = len(p.bugs)
        results.append(data)
    return results

@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    file_tree = build_file_tree(project.extracted_path) if project.extracted_path else []

    detail = ProjectDetailResponse.model_validate(project)
    detail.bug_count = len(project.bugs)
    detail.file_tree = file_tree
    detail.bugs = project.bugs
    return detail

@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Remove extracted files and project directory from disk
    if project.extracted_path and os.path.exists(project.extracted_path):
        project_dir = os.path.dirname(project.extracted_path)
        shutil.rmtree(project_dir, ignore_errors=True)

    db.delete(project)
    db.commit()
    return {"detail": f"Project {project_id} deleted successfully"}
