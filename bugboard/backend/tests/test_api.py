import os
import io
import zipfile
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_dummy_zip():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("app/main.py", "print('hello')\n")
        zf.writestr("app/users.py", "# duplicate email check\n# none nullable check\n")
        zf.writestr("tests/test_app.py", "def test_ok(): pass\n")
    buffer.seek(0)
    return buffer

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "timestamp" in data

def test_project_lifecycle_and_bugs():
    zip_bytes = create_dummy_zip()
    upload_res = client.post(
        "/api/projects",
        data={"name": "Test Pytest Project"},
        files={"file": ("test.zip", zip_bytes, "application/zip")}
    )
    assert upload_res.status_code == 201
    proj_data = upload_res.json()
    proj_id = proj_data["id"]
    assert proj_data["name"] == "Test Pytest Project"
    assert proj_data["file_count"] == 3
    assert proj_data["python_file_count"] == 3
    assert proj_data["test_file_count"] == 1

    # Get project detail
    detail_res = client.get(f"/api/projects/{proj_id}")
    assert detail_res.status_code == 200
    assert len(detail_res.json()["file_tree"]) > 0

    # Create a bug
    bug_res = client.post(
        f"/api/projects/{proj_id}/bugs",
        json={
            "title": "Duplicate email error",
            "description": "Email conflict in users",
            "severity": "HIGH",
            "status": "OPEN",
            "affected_file": "app/users.py",
            "line_number": 1
        }
    )
    assert bug_res.status_code == 201
    bug_data = bug_res.json()
    bug_id = bug_data["id"]

    # Analyze bug
    analyze_res = client.post(f"/api/bugs/{bug_id}/analyze")
    assert analyze_res.status_code == 200
    analysis = analyze_res.json()
    assert "uniqueness" in analysis["potential_cause"].lower() or "duplicate" in analysis["potential_cause"].lower()

    # Update bug
    update_res = client.put(f"/api/bugs/{bug_id}", json={"status": "RESOLVED"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "RESOLVED"

    # Delete bug
    del_bug_res = client.delete(f"/api/bugs/{bug_id}")
    assert del_bug_res.status_code == 200

    # Delete project
    del_proj_res = client.delete(f"/api/projects/{proj_id}")
    assert del_proj_res.status_code == 200
