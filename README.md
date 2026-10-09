# BugBoard — DevOps Final Capstone: FullStack Bug Tracker & Static Code Analyzer

[![CI/CD Pipeline](https://github.com/Nandani2024-tech/Devops_Project/actions/workflows/ci.yml/badge.svg)](https://github.com/Nandani2024-tech/Devops_Project/actions/workflows/ci.yml)
[![GHCR Packages](https://img.shields.io/badge/GHCR-Images%20Published-2496ED.svg)](https://github.com/Nandani2024-tech?tab=packages)
[![Docker Hub](https://img.shields.io/badge/Docker%20Hub-Images%20Published-blue.svg)](https://hub.docker.com/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Container-2496ED.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Alembic](https://img.shields.io/badge/Alembic-Migrations-red.svg)](https://alembic.sqlalchemy.org/)
[![Pytest](https://img.shields.io/badge/Pytest-7%20Passed-brightgreen.svg)](https://pytest.org/)

---

## 1. What We Are Building

**BugBoard** is a production-grade, developer-oriented SaaS bug tracking and deterministic static code analysis platform. It allows engineering teams to upload zipped codebases, automatically inspect file hierarchies, file counts, and test files, track issues across lifecycle statuses and severity levels, and trigger automated deterministic root-cause code analysis.

### Core Capabilities:
- **React + Vite Frontend:** Modern, responsive dark-themed dashboard with glassmorphic cards, KPI counters, directory file tree view, and modal forms.
- **FastAPI Python Backend:** High-performance RESTful API with automated static code analysis, Prometheus metrics, and `/health` probes.
- **PostgreSQL Database:** Managed with SQLAlchemy ORM and Alembic database versioning migrations.
- **Deterministic Static Code Analyzer:** Safely unzips archives, walks project trees, extracts code snippets around affected lines, diagnoses root causes, generates reproduction steps, and suggests code fixes.
- **Automated Quality Gate:** Pytest suite with isolated in-memory test database fixtures (`conftest.py`).
- **Production Containerization:** Hardened Docker setup with non-root user execution, multi-stage Node + Nginx frontend build on port `3000`, and Docker Compose multi-service orchestration.
- **Automated CI/CD & Multi-Registry Publishing:** GitHub Actions pipeline executing backend Pytest tests, frontend Vite builds, and dual-publishing tagged container images to both GitHub Container Registry (GHCR) and Docker Hub.

```text
Developer Laptop
       |
       v
Git / GitHub (Push to main branch)
       |
       v
GitHub Actions CI/CD Pipeline (.github/workflows/ci.yml)
   ├── Job 1: test-backend (Python 3.11 + Pytest Quality Gate)
   ├── Job 2: build-frontend (Node 20 + Vite Compilation Gate)
   └── Job 3: build-and-push-images (Docker Buildx Multi-Registry)
         ├──> GitHub Container Registry (ghcr.io)
         └──> Docker Hub (hub.docker.com)
       |
       v
Multi-Container Runtime Stack
  +-------------------------------------------------------+
  |                                                       |
  |  Frontend (Port 3000)        Backend (Port 8000)      |
  |  React 18 + Vite             FastAPI + Analyzer       |
  |  Multi-Stage Nginx           Non-Root (appuser)       |
  |           |                           |               |
  |           +------------+--------------+               |
  |                        |                              |
  |                        v                              |
  |              PostgreSQL 16 (Port 5432)                |
  |              Alembic Managed Migrations               |
  |              Persistent Docker Volume                 |
  +-------------------------------------------------------+
```

---

## 2. Repository Structure

```text
Devops_final_project/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD multi-job pipeline
├── .dockerignore              # Root Docker ignore rules
├── .gitignore                 # Root Git ignore rules (excludes .env, venv, caches)
├── .trivyignore               # DevSecOps vulnerability suppression policy
├── README.md                  # Project documentation & execution guide
├── terraform/                 # AWS Infrastructure as Code (VPC + EKS)
│   ├── main.tf                # Provider & backend configuration
│   ├── variables.tf           # Parameter declarations
│   ├── vpc.tf                 # Multi-AZ VPC, subnets, IGW, NAT GW
│   ├── eks.tf                 # EKS cluster control plane & worker node groups
│   ├── outputs.tf             # Output resource identifiers
│   ├── terraform.tfvars.example # Safe variable template
│   └── .gitignore             # Terraform cache & state ignore rules
└── bugboard/                  # Self-contained application stack
    ├── docker-compose.yml     # Multi-container orchestration (frontend, backend, postgres)
    ├── .dockerignore          # Application Docker ignore
    ├── backend/               # FastAPI backend service
    │   ├── Dockerfile         # Hardened non-root Python 3.11-slim container
    │   ├── requirements.txt   # Pinned backend dependencies
    │   ├── alembic.ini        # Alembic migration configuration
    │   ├── conftest.py        # Pytest in-memory SQLite fixtures & dependency overrides
    │   ├── pytest.ini         # Pytest discovery settings
    │   ├── alembic/           # Alembic migration environment & versions
    │   │   ├── env.py
    │   │   ├── script.py.mako
    │   │   └── versions/
    │   │       └── 0001_initial_schema.py
    │   ├── app/               # FastAPI core application code
    │   │   ├── __init__.py
    │   │   ├── main.py        # App entrypoint, CORS, Prometheus instrumentation
    │   │   ├── config.py      # Pydantic BaseSettings environment configuration
    │   │   ├── database.py    # SQLAlchemy engine, session maker, get_db dependency
    │   │   ├── models.py      # Project, Bug, BugAnalysis database models
    │   │   ├── schemas.py     # Pydantic request/response validation schemas
    │   │   ├── analyzer.py    # Deterministic static code analysis engine
    │   │   └── routes/        # Modular API route controllers
    │   │       ├── health.py  # GET /health probe
    │   │       ├── projects.py# POST, GET, DELETE projects
    │   │       ├── bugs.py    # POST, GET, PUT, DELETE bugs
    │   │       └── analysis.py# POST, GET automated code analysis
    │   └── tests/
    │       └── test_api.py    # 7 automated unit/integration tests
    ├── frontend/              # React 18 + Vite frontend service
    │   ├── Dockerfile         # Multi-stage build (Node 20 builder + Unprivileged Nginx)
    │   ├── nginx.conf         # Production Nginx reverse-proxy & routing on port 3000
    │   ├── package.json       # Frontend scripts and dependencies
    │   ├── vite.config.js     # Vite configuration with proxy rules
    │   ├── index.html         # HTML5 entrypoint with Google Fonts
    │   └── src/
    │       ├── main.jsx       # React DOM root
    │       ├── App.jsx        # Root component, state management, API synchronization
    │       ├── index.css      # Custom dark-mode glassmorphic CSS design system
    │       └── components/
    │           ├── Navbar.jsx         # Live health pill, KPI counters, brand header
    │           ├── ProjectUpload.jsx  # Drag-and-drop .zip archive uploader
    │           ├── ProjectList.jsx    # Project cards, file stats, directory tree viewer
    │           ├── BugList.jsx        # Filterable bug tracker & code analysis panel
    │           └── BugModal.jsx       # Modal dialog for reporting & editing bugs
    ├── docs/                  # Capstone milestone documentation reports & proofs
    │   ├── M1.md              # Application: Frontend + Backend + Database (10/10)
    │   ├── M2.md              # Testing: Pytest + Code Quality (10/10)
    │   ├── M3.md              # Git & GitHub Version Control (5/5)
    │   ├── M4.md              # Docker: Dockerfile + Compose (10/10)
    │   ├── M5.md              # CI/CD: GitHub Actions & Dual Registries (15/15)
    │   ├── M6.md              # DevSecOps: Trivy Security Scan (5/5)
    │   ├── M7.md              # Terraform: AWS Infrastructure as Code (15/15)
    │   └── (screenshot assets)
    ├── examples/              # Sample test project for live demonstrations
    │   ├── sample-project.zip # Ready-to-upload zipped test project
    │   └── sample-project/    # Unpacked source files of sample service
    │       ├── README.md
    │       ├── requirements.txt
    │       ├── app/
    │       │   ├── main.py
    │       │   └── users.py   # Intentional bugs: Line 18 duplicate, Line 34 null
    │       └── tests/
    │           └── test_users.py
    └── uploads/               # Persistent directory for extracted uploaded projects
```

---

# PART A — UNDERSTAND THE APPLICATION

## 3. Frontend Architecture

The frontend is designed with a premium, responsive dark-mode glassmorphic interface:

- **Header / Navbar:** Real-time KPI stat pills (Total Projects, Total Bugs, Open Bugs, High/Critical Bugs) and an active backend health monitor with pulse indicators.
- **Project Upload Box:** Clean drag-and-drop file dropzone accepting `.zip` project archives with automated name extraction.
- **Projects Browser:** Interactive cards displaying uploaded projects, file counts (Total Files, Python files, Test files), directory tree inspection, and deletion controls.
- **Bug Tracker:** Filterable by status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and search query.
- **Bug Report Modal:** Input form to specify Title, Description, Severity, Affected File path, and Line Number.
- **Automated Code Analysis Panel:** On-demand static code analysis viewer showing extracted code snippets with line numbers, potential root cause diagnostics, step-by-step reproduction instructions, and remediation code snippets.

**Client Routing & Reverse Proxy:** In production, Nginx listens on port `3000` and reverse-proxies `/api` and `/health` requests directly to `http://backend:8000`, removing any hardcoded hostnames from the client.

---

## 4. Backend & Deterministic Static Code Analyzer

FastAPI exposes the following RESTful API endpoints:

```text
GET    /health                      # Application health & PostgreSQL connectivity check
GET    /metrics                     # Prometheus metrics endpoint
GET    /docs                        # Interactive OpenAPI Swagger documentation

POST   /api/projects                # Multipart upload of .zip project archive
GET    /api/projects                # List all uploaded projects with file counts
GET    /api/projects/{id}           # Get project detail with hierarchical file tree
DELETE /api/projects/{id}           # Delete project, bugs, and disk files

POST   /api/projects/{id}/bugs      # Create a bug report for a project
GET    /api/projects/{id}/bugs      # List bugs for a project (filterable by status/severity)
GET    /api/bugs/{id}               # Get details of a specific bug
PUT    /api/bugs/{id}               # Update bug status, severity, title, or description
DELETE /api/bugs/{id}               # Delete a bug report

POST   /api/bugs/{id}/analyze       # Run automated deterministic code analysis on affected line
GET    /api/bugs/{id}/analysis      # Retrieve saved analysis record
```

### How the Deterministic Analyzer Works (`backend/app/analyzer.py`):
1. **Safe Zip Extraction:** Unzips uploaded `.zip` archives with zip-slip path traversal guards.
2. **File Counting & Tree Building:** Recursively scans the project to count total files, Python files (`.py`), and test files (`test_*.py`, `*_test.py`), constructing a hierarchical JSON file tree.
3. **Snippet Extraction:** Given an `affected_file` and `line_number`, safely reads the extracted file on disk and isolates a 5–10 line window centered on the target line with 1-based line numbering and marker flags (`>`).
4. **Root Cause Diagnosis:**
   - **Unique Constraint / Duplication:** If the target code contains `"email"`, `"duplicate"`, or `"unique"`, flags missing uniqueness validation and suggests HTTP 409 conflict handling.
   - **Null Pointer / None Reference:** If the code contains `"None"`, `"nullable"`, or `"null"`, flags missing null check on optional lookups and suggests defensive validation.
   - **General Runtime Errors:** For other issues, provides structured diagnostic reports with reproduction steps.

---

# PART B — STEP-BY-STEP LIVE DEMO GUIDE

A sample test microservice is included in `bugboard/examples/sample-project.zip` for instant testing.

### What is the Sample Project?
The sample project (`examples/sample-project/`) is a user management FastAPI service containing intentional bugs:
1. **Line 18 of `app/users.py`:** Unhandled duplicate email registration exception.
2. **Line 34 of `app/users.py`:** Missing null check on user profile lookups (raises `AttributeError` when profile is `None`).

---

### Step 1: Upload the Sample Project
1. Open the frontend at **`http://localhost:3000`** (or `http://localhost:5173` if running dev server).
2. In the **Upload Project** card on the left:
   - Drag and drop `bugboard/examples/sample-project.zip` into the dropzone (or click to select).
   - Project Name auto-populates as `Sample Project`.
3. Click **Upload & Process Archive**.
4. The project appears in the **Projects Browser** showing **6 files**, **4 py**, **1 test**.
5. Click **Files Tree** to inspect the extracted directory structure (`app/main.py`, `app/users.py`, `tests/test_users.py`, `README.md`, `requirements.txt`).

---

### Step 2: Report a Bug

Click the blue **+ Report Bug** button and submit the following sample query:

| Field | Input Value |
| :--- | :--- |
| **Bug Title** | `Duplicate email registration error` |
| **Description** | `Registering the same email twice causes an unhandled duplicate exception` |
| **Severity** | `HIGH` (or `CRITICAL`) |
| **Status** | `OPEN` |
| **Affected File** | `app/users.py` |
| **Line Number** | `18` |

Click **Submit Bug Report**. The bug immediately appears in the Bug Tracker table.

*(Optional: Report a second bug for **Line 34** of `app/users.py` titled `Missing null check in user bio endpoint` with severity `MEDIUM`)*.

---

### Step 3: Run Automated Code Analysis
1. Select the newly created bug in the Bug Tracker table.
2. In the right-hand **Bug Analysis Panel**, click **⚡ Run Automated Code Analysis**.
3. BugBoard immediately returns the diagnostic evidence:
   - **Extracted Code Snippet:**
     ```python
        15 | def register_user(user: UserCreate):
        16 |     for existing in USERS_DB.values():
        17 |         # Intentionally unhandled duplicate email exception
     >  18 |         if existing["email"] == user.email: raise Exception("duplicate email registration error")
        19 |     user_id = len(USERS_DB) + 1
        20 |     USERS_DB[user_id] = {"id": user_id, "username": user.username, "email": user.email}
     ```
   - **Potential Root Cause:** Missing uniqueness validation or duplicate record handling.
   - **Reproduction Steps:** Step 1: Register an entity. Step 2: Send identical email. Step 3: Observe unhandled exception.
   - **Suggested Fix:** Add defensive uniqueness check with HTTP 409 Conflict exception.

---

# PART C — RUN IT LOCALLY

## 5. Method 1: Docker Compose (Recommended)

Requirements:
- Docker Desktop / Docker Engine

Run the full stack from the `bugboard` directory:

```bash
cd bugboard
docker compose up -d --build
```

### Access URLs:

| Service | URL | Notes |
| :--- | :--- | :--- |
| **Frontend Application** | [http://localhost:3000](http://localhost:3000) | Production multi-stage Nginx container |
| **Backend API Health** | [http://localhost:8000/health](http://localhost:8000/health) | Returns DB connection status & timestamp |
| **Swagger Documentation** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API exploration |
| **Prometheus Metrics** | [http://localhost:8000/metrics](http://localhost:8000/metrics) | Scraped metrics for Prometheus |

Stop the stack:
```bash
docker compose down
```

---

## 6. Method 2: Direct Local Development

### 1. Start PostgreSQL Database
```bash
cd bugboard
docker compose up -d postgres
```

### 2. Start FastAPI Backend (Terminal A)
```bash
cd bugboard/backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\activate       # Windows
# source venv/bin/activate    # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start Uvicorn development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Start React Frontend (Terminal B)
```bash
cd bugboard/frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

---

# PART D — AUTOMATED TESTING (M2 QUALITY GATE)

Run the test suite using Pytest:

```bash
cd bugboard/backend
pytest -v
```

Output:
```text
============================= test session starts =============================
platform win32 -- Python 3.11.0, pytest-8.3.3, pluggy-1.6.0
rootdir: bugboard\backend
configfile: pytest.ini
testpaths: tests
plugins: anyio-4.15.1
collecting ... collected 7 items

tests/test_api.py::test_health_endpoint PASSED                           [ 14%]
tests/test_api.py::test_create_project_upload PASSED                     [ 28%]
tests/test_api.py::test_get_project_detail_and_file_tree PASSED          [ 42%]
tests/test_api.py::test_list_projects PASSED                             [ 57%]
tests/test_api.py::test_create_bug_for_project PASSED                    [ 71%]
tests/test_api.py::test_automated_code_analysis PASSED                   [ 85%]
tests/test_api.py::test_update_and_delete_bug PASSED                     [100%]

======================== 7 passed, 2 warnings in 0.47s ========================
```

### Why Test Isolation Matters:
All tests run against an **in-memory SQLite database (`sqlite:///:memory:`)** managed via `conftest.py` with FastAPI dependency overrides (`app.dependency_overrides[get_db]`). The production PostgreSQL database is never touched, ensuring tests are fast, idempotent, and non-destructive.

---

# PART E — DOCKER ARCHITECTURE (M4)

### Backend Container (`backend/Dockerfile`):
- Base image: `python:3.11-slim`
- **Security Hardening:** Runs as unprivileged non-root user `appuser:appgroup`
- **Alembic Automation:** Runs `alembic upgrade head` before starting Uvicorn server on port `8000`.

### Frontend Container (`frontend/Dockerfile`):
- **Multi-Stage Build:**
  1. **Builder Stage (`node:20-alpine`):** Installs packages and compiles Vite assets into `dist/`.
  2. **Runtime Stage (`nginxinc/nginx-unprivileged:alpine`):** Copies static bundle into lightweight unprivileged Nginx serving on port `3000`.
- Keeps build tools out of the final runtime image, drastically reducing image size and attack surface.

---

# PART F — CI/CD PIPELINE & DUAL CONTAINER REGISTRIES (M5)

BugBoard features an enterprise-grade automated CI/CD pipeline using **GitHub Actions** (`.github/workflows/ci.yml`). Every push to the `main` branch or manual `workflow_dispatch` trigger executes parallel quality gates before containerization.

### Pipeline Architecture:
1. **Quality Gate 1 (`test-backend`):** Spins up a Python 3.11 runner, installs `requirements.txt`, and executes `pytest -v`. The pipeline immediately terminates if any test fails, blocking flawed builds from advancing.
2. **Quality Gate 2 (`build-frontend`):** Spins up a Node.js 20 runner, executes deterministic `npm ci` with `package-lock.json`, and runs `npm run build` to validate production Vite bundle compilation.
3. **Containerization & Dual Push (`build-and-push-images`):**
   - Configured with `needs: [test-backend, build-frontend]` — only executes if both tests and frontend compilation succeed.
   - Sets up Docker Buildx for reproducible image builds.
   - **GitHub Container Registry (GHCR):** Authenticates automatically to `ghcr.io` using ephemeral `${{ secrets.GITHUB_TOKEN }}` and `packages: write` permissions.
   - **Docker Hub:** Authenticates to `docker.io` using repository secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`).
   - Builds both Backend and Frontend containers simultaneously tagging with:
     - Immutable Git Commit SHA (`${{ github.sha }}`) for end-to-end traceability
     - Rolling release tag (`latest`)

### Published Container Registries:
- **GitHub Container Registry (GHCR):**
  - `ghcr.io/nandani2024-tech/devops_project/backend:latest` (and `:<sha>`)
  - `ghcr.io/nandani2024-tech/devops_project/frontend:latest` (and `:<sha>`)
- **Docker Hub:**
  - `<dockerhub_username>/bugboard-backend:latest` (and `:<sha>`)
  - `<dockerhub_username>/bugboard-frontend:latest` (and `:<sha>`)

---

# PART G — CAPSTONE MILESTONES PROGRESS

| Milestone | Topic | Points | Status | Documentation & Proofs |
| :---: | :--- | :---: | :---: | :--- |
| **M1** | Application: Frontend + Backend + Database | **10 / 10** | **Completed** | [bugboard/docs/M1.md](bugboard/docs/M1.md) |
| **M2** | Testing: Pytest + Code Quality | **10 / 10** | **Completed** | [bugboard/docs/M2.md](bugboard/docs/M2.md) |
| **M3** | Git and GitHub | **5 / 5** | **Completed** | [bugboard/docs/M3.md](bugboard/docs/M3.md) |
| **M4** | Docker: Dockerfile + Compose | **10 / 10** | **Completed** | [bugboard/docs/M4.md](bugboard/docs/M4.md) |
| **M5** | CI/CD — GitHub Actions Pipeline | **15 / 15** | **Completed** | [bugboard/docs/M5.md](bugboard/docs/M5.md) |
| **M6** | DevSecOps — Trivy Security Scan | **5 / 5** | **Completed** | [bugboard/docs/M6.md](bugboard/docs/M6.md) |
| **M7** | Terraform — AWS Infrastructure as Code | **15 / 15** | **Completed** | [bugboard/docs/M7.md](bugboard/docs/M7.md) |
| **M8** | Kubernetes + Helm Deployment | 15 | *Next* | Planned |
| **M9** | Observability — Prometheus + Grafana | 10 | *Upcoming* | Planned |
| **M10**| Final Presentation + Documentation | 5 | *Upcoming* | Planned |
| **Total** | | **70 / 100** | **In Progress** | |

---

## 7. Submission Checklist Summary

- [x] Full-stack application running with FastAPI, React, and PostgreSQL (M1).
- [x] Database migrations managed by Alembic (`0001_initial_schema.py`) (M1).
- [x] Complete REST API endpoints implemented (GET, POST, PUT, DELETE) (M1).
- [x] 7 automated Pytest unit tests passing with isolated test database (`conftest.py`) (M2).
- [x] GitHub repository with conventional commit history and clean ignore rules (M3).
- [x] Hardened Dockerfiles (non-root backend, multi-stage unprivileged Nginx frontend on port 3000) (M4).
- [x] Single-command local stack execution (`docker compose up --build`) (M4).
- [x] Multi-job GitHub Actions CI/CD pipeline passing with quality gates (`.github/workflows/ci.yml`) (M5).
- [x] Automated container image publishing to GitHub Container Registry (GHCR) and Docker Hub (M5).
- [x] DevSecOps Trivy vulnerability scanner quality gate in CI pipeline blocking on HIGH/CRITICAL CVEs (M6).
- [x] Modular Terraform AWS Infrastructure as Code (VPC + Multi-AZ Subnets + EKS + IAM) (M7).
- [x] Detailed milestone reports with embedded screenshots in `bugboard/docs/` (M1–M7).
