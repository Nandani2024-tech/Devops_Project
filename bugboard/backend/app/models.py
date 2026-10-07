import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class SeverityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class BugStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    filename = Column(String(255), nullable=False)
    file_count = Column(Integer, default=0, nullable=False)
    python_file_count = Column(Integer, default=0, nullable=False)
    test_file_count = Column(Integer, default=0, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status = Column(String(50), default="PROCESSED", nullable=False)
    extracted_path = Column(String(500), nullable=False)

    bugs = relationship("Bug", back_populates="project", cascade="all, delete-orphan")

class Bug(Base):
    __tablename__ = "bugs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(
        SAEnum(SeverityLevel, name="severity_level"),
        default=SeverityLevel.MEDIUM,
        nullable=False
    )
    status = Column(
        SAEnum(BugStatus, name="bug_status"),
        default=BugStatus.OPEN,
        nullable=False
    )
    affected_file = Column(String(255), nullable=False)
    line_number = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    project = relationship("Project", back_populates="bugs")
    analysis = relationship("BugAnalysis", uselist=False, back_populates="bug", cascade="all, delete-orphan")

class BugAnalysis(Base):
    __tablename__ = "bug_analyses"

    id = Column(Integer, primary_key=True, index=True)
    bug_id = Column(Integer, ForeignKey("bugs.id", ondelete="CASCADE"), unique=True, nullable=False)
    detected_snippet = Column(Text, nullable=True)
    potential_cause = Column(Text, nullable=False)
    suggested_fix = Column(Text, nullable=True)
    reproduction_steps = Column(Text, nullable=False)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    bug = relationship("Bug", back_populates="analysis")
