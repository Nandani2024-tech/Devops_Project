from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from app.models import SeverityLevel, BugStatus

class HealthResponse(BaseModel):
    status: str
    database: str
    timestamp: str

class BugAnalysisResponse(BaseModel):
    id: int
    bug_id: int
    detected_snippet: Optional[str] = None
    potential_cause: str
    suggested_fix: Optional[str] = None
    reproduction_steps: str
    analyzed_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BugBase(BaseModel):
    title: str
    description: str
    severity: SeverityLevel = SeverityLevel.MEDIUM
    status: BugStatus = BugStatus.OPEN
    affected_file: str
    line_number: Optional[int] = None

class BugCreate(BugBase):
    pass

class BugUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[SeverityLevel] = None
    status: Optional[BugStatus] = None
    affected_file: Optional[str] = None
    line_number: Optional[int] = None

class BugResponse(BugBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    analysis: Optional[BugAnalysisResponse] = None

    model_config = ConfigDict(from_attributes=True)

class FileTreeNode(BaseModel):
    name: str
    type: str  # "file" or "directory"
    path: str
    children: Optional[List["FileTreeNode"]] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    filename: str
    file_count: int
    python_file_count: int
    test_file_count: int
    uploaded_at: datetime
    status: str
    extracted_path: str
    bug_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class ProjectDetailResponse(ProjectResponse):
    file_tree: List[FileTreeNode] = []
    bugs: List[BugResponse] = []
