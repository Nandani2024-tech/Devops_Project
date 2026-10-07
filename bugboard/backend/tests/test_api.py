import io
import zipfile
import pytest

def create_sample_zip():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("app/main.py", "print('service main')\n")
        zf.writestr(
            "app/users.py",
            "from fastapi import HTTPException\n"
            "# Line 2: duplicate email check\n"
            "def register(email):\n"
            "    if email == 'duplicate': raise ValueError('duplicate email')\n"
            "# Line 5: nullable reference\n"
            "def get_bio(profile):\n"
            "    if profile is None: return None\n"
            "    return profile['bio']\n"
        )
        zf.writestr("tests/test_users.py", "def test_example(): pass\n")
    buffer.seek(0)
    return buffer

def test_health_endpoint(client):
    """Test 1: GET /health returns 200 with status and DB connectivity check"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "timestamp" in data

def test_create_project_upload(client):
    """Test 2: POST /api/projects accepts multipart zip and analyzes files"""
    zip_bytes = create_sample_zip()
    response = client.post(
        "/api/projects",
        data={"name": "Sample Microservice"},
        files={"file": ("test.zip", zip_bytes, "application/zip")}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Sample Microservice"
    assert data["file_count"] == 3
    assert data["python_file_count"] == 3
    assert data["test_file_count"] == 1
    assert data["status"] == "PROCESSED"

def test_get_project_detail_and_file_tree(client):
    """Test 3: GET /api/projects/{id} returns project detail with file tree"""
    zip_bytes = create_sample_zip()
    create_res = client.post(
        "/api/projects",
        data={"name": "Tree Project"},
        files={"file": ("tree.zip", zip_bytes, "application/zip")}
    )
    proj_id = create_res.json()["id"]

    res = client.get(f"/api/projects/{proj_id}")
    assert res.status_code == 200
    detail = res.json()
    assert detail["id"] == proj_id
    assert "file_tree" in detail
    assert len(detail["file_tree"]) > 0

def test_list_projects(client):
    """Test 4: GET /api/projects returns a list of all uploaded projects"""
    response = client.get("/api/projects")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_bug_for_project(client):
    """Test 5: POST /api/projects/{id}/bugs creates an issue linked to project"""
    zip_bytes = create_sample_zip()
    proj_res = client.post(
        "/api/projects",
        data={"name": "Bug Tracker Target"},
        files={"file": ("app.zip", zip_bytes, "application/zip")}
    )
    proj_id = proj_res.json()["id"]

    bug_payload = {
        "title": "Duplicate email registration",
        "description": "User duplicate email causes unhandled exception",
        "severity": "HIGH",
        "status": "OPEN",
        "affected_file": "app/users.py",
        "line_number": 4
    }
    bug_res = client.post(f"/api/projects/{proj_id}/bugs", json=bug_payload)
    assert bug_res.status_code == 201
    bug_data = bug_res.json()
    assert bug_data["title"] == "Duplicate email registration"
    assert bug_data["severity"] == "HIGH"
    assert bug_data["status"] == "OPEN"
    assert bug_data["project_id"] == proj_id

def test_automated_code_analysis(client):
    """Test 6: POST /api/bugs/{id}/analyze runs deterministic static analysis"""
    zip_bytes = create_sample_zip()
    proj_res = client.post(
        "/api/projects",
        data={"name": "Analyzer Test Project"},
        files={"file": ("test_code.zip", zip_bytes, "application/zip")}
    )
    proj_id = proj_res.json()["id"]

    bug_res = client.post(
        f"/api/projects/{proj_id}/bugs",
        json={
            "title": "Duplicate email collision",
            "description": "duplicate email uniqueness error",
            "severity": "CRITICAL",
            "status": "OPEN",
            "affected_file": "app/users.py",
            "line_number": 4
        }
    )
    bug_id = bug_res.json()["id"]

    analyze_res = client.post(f"/api/bugs/{bug_id}/analyze")
    assert analyze_res.status_code == 200
    analysis = analyze_res.json()
    assert analysis["bug_id"] == bug_id
    assert "detected_snippet" in analysis
    assert "potential_cause" in analysis
    assert "suggested_fix" in analysis
    assert "reproduction_steps" in analysis

def test_update_and_delete_bug(client):
    """Test 7: PUT /api/bugs/{id} updates bug and DELETE /api/bugs/{id} removes it"""
    zip_bytes = create_sample_zip()
    proj_res = client.post(
        "/api/projects",
        data={"name": "Lifecycle Project"},
        files={"file": ("test_lifecycle.zip", zip_bytes, "application/zip")}
    )
    proj_id = proj_res.json()["id"]

    bug_res = client.post(
        f"/api/projects/{proj_id}/bugs",
        json={
            "title": "Bug to update and delete",
            "description": "Lifecycle test",
            "severity": "LOW",
            "status": "OPEN",
            "affected_file": "app/users.py",
            "line_number": 2
        }
    )
    bug_id = bug_res.json()["id"]

    # Update bug
    update_res = client.put(f"/api/bugs/{bug_id}", json={"status": "RESOLVED", "severity": "MEDIUM"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "RESOLVED"
    assert update_res.json()["severity"] == "MEDIUM"

    # Delete bug
    del_res = client.delete(f"/api/bugs/{bug_id}")
    assert del_res.status_code == 200

    # Verify deleted
    get_res = client.get(f"/api/bugs/{bug_id}")
    assert get_res.status_code == 404
