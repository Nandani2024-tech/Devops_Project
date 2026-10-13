# BugBoard — DevOps Final Capstone: FullStack Bug Tracker & Static Code Analyzer

> **Live_Demo** : [Demo_Video](https://drive.google.com/drive/folders/1lzfZQQo042O2FlpWg6JZNrWmdVlhFwBe?usp=drive_link)

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
├── k8s/                       # Kubernetes manifests
│   └── namespace.yaml         # Dedicated bugboard namespace
├── helm/                      # Helm package management
│   └── bugboard/              # Production-grade BugBoard Helm chart
│       ├── Chart.yaml         # Chart metadata
│       ├── values.yaml        # Configurable deployment values
│       └── templates/         # Kubernetes resource templates
├── monitoring/                # Observability & telemetry stack
│   ├── prometheus-values.yaml # Prometheus scrape & retention configurations
│   ├── grafana-values.yaml    # Grafana DataSource & auto-provisioning
│   └── bugboard-dashboard.json# 3-panel BugBoard monitoring dashboard
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
    │   ├── M8.md              # Kubernetes + Helm Deployment (15/15)
    │   ├── M9.md              # Observability: Prometheus + Grafana (10/10)
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

# PART G — DEVSECOPS: TRIVY CONTAINER VULNERABILITY SCANNING (M6)

BugBoard implements automated **DevSecOps** quality gates by integrating Aqua Security's **Trivy** vulnerability scanner directly into the CI/CD pipeline (`.github/workflows/ci.yml`). Security scanning is executed as a strict gate between the container build phase and the image push phase.

### 1. Shift-Left Security Philosophy: Why Scan Before Push?
In enterprise software delivery, publishing container images to public or production registries (such as GHCR and Docker Hub) before validating their vulnerability profile creates significant supply-chain risk. BugBoard shifts security left:
- Container images are built locally on the GitHub Actions runner.
- Trivy executes comprehensive static analysis against the newly built image layers.
- If any unpatched, actionable `HIGH` or `CRITICAL` Common Vulnerabilities and Exposures (CVEs) are detected, the pipeline **immediately aborts with exit code 1**.
- Flawed images are blocked from ever reaching remote registries or staging/production Kubernetes clusters.

### 2. Scanning Gate Criteria & Flags:
Trivy scans both the FastAPI backend and React frontend images using the following production configuration:

```bash
trivy image \
  --severity HIGH,CRITICAL \
  --exit-code 1 \
  --ignore-unfixed true \
  --format table \
  <image-reference>
```

- **`--severity HIGH,CRITICAL`:** Enforces zero tolerance for high-risk exploits (remote code execution, privilege escalation) while suppressing low-priority noise.
- **`--exit-code 1`:** Instructs Trivy to emit a non-zero exit code upon encountering matching CVEs, actively failing the GitHub Actions job.
- **`--ignore-unfixed true`:** Suppresses vulnerabilities for which vendor patches do not yet exist, preventing pipeline blockages on issues the engineering team cannot immediately resolve.

### 3. Full-Spectrum Container Layer Inspection:
1. **Base Operating System Packages:**
   - Backend (`python:3.11-slim`): Scans Debian Bookworm system packages (`libc6`, `openssl`, `libsqlite3`). Hardened by purging build tools (`gcc`, `setuptools`, `wheel`) from the runtime image.
   - Frontend (`nginxinc/nginx-unprivileged:alpine`): Scans Alpine Linux packages (`libtiff`, `musl`, `busybox`). Hardened via proactive `apk upgrade` in the Dockerfile.
2. **Application Language Dependencies:**
   - Backend: Recursively inspects installed Python packages in `site-packages` against the OSV and GitHub Security Advisory databases (e.g., ensuring `python-multipart >= 0.0.32`).
   - Frontend: Scans production Node.js package manifests for vulnerable transitive dependencies.
3. **Vulnerability Exception Policy (`.trivyignore`):**
   - Repository-level `.trivyignore` documents and tracks authorized exemptions (such as ASGI path routing constraints in Starlette) with clear rationale, review dates, and remediation plans.

---

# PART H — AWS INFRASTRUCTURE AS CODE WITH TERRAFORM (M7)

All cloud infrastructure required to host BugBoard in production is codified declaratively using **Terraform (HCL)** targeting **Amazon Web Services (AWS)** inside the root-level [`terraform/`](terraform/) directory.

### 1. Modular Multi-AZ VPC Architecture (`terraform/vpc.tf`):
The networking tier follows AWS Well-Architected Framework guidelines:
- **Dedicated VPC:** CIDR block `10.0.0.0/16` with `enable_dns_hostnames = true` and `enable_dns_support = true`.
- **Public Subnets (2 AZs):** `10.0.1.0/24` and `10.0.2.0/24` with `map_public_ip_on_launch = true`. Tagged with `kubernetes.io/role/elb = "1"` to enable automated discovery by AWS Application Load Balancers (ALB).
- **Private Subnets (2 AZs):** `10.0.10.0/24` and `10.0.20.0/24` strictly isolated without public IP allocation. Tagged with `kubernetes.io/role/internal-elb = "1"` for internal microservice routing.
- **Internet Gateway & NAT Gateway:** Dedicated Internet Gateway (IGW) for public ingress. An Elastic IP (EIP) and NAT Gateway in the public subnet provide secure outbound internet egress for private worker nodes (pulling container images, OS security updates).
- **Route Tables:** Explicit separation between public route tables (`0.0.0.0/0 -> IGW`) and private route tables (`0.0.0.0/0 -> NAT Gateway`).

### 2. Managed Kubernetes Compute: Amazon EKS (`terraform/eks.tf`):
- **EKS Control Plane (`aws_eks_cluster`):** Provisions Kubernetes version `1.30` across both public and private subnets, enabling private VPC cluster endpoint communication.
- **EKS Managed Node Group (`aws_eks_node_group`):** Worker nodes reside strictly within **private subnets**. Configured with `t3.medium` instances, autoscaling boundaries (`min_size = 1`, `desired_size = 2`, `max_size = 3`), and automated rolling node AMI updates.
- **Least-Privilege IAM Roles:**
  - Control Plane Role (`aws_iam_role.cluster`): Trust policy for `eks.amazonaws.com` attached to `AmazonEKSClusterPolicy`.
  - Worker Node Role (`aws_iam_role.node_group`): Trust policy for `ec2.amazonaws.com` attached to `AmazonEKSWorkerNodePolicy`, `AmazonEKS_CNI_Policy`, and `AmazonEC2ContainerRegistryReadOnly`.

### 3. Secret Hygiene & Clean Teardown:
- **Zero Credentials Committed:** No AWS access keys, secret keys, or account IDs exist in version control. All authentication uses AWS CLI profiles, environment variables, or IAM instance profiles.
- **Variable Template ([`terraform.tfvars.example`](terraform/terraform.tfvars.example)):** Committed parameter reference defining default regions, CIDRs, and node capacities.
- **Git Exclusions ([`terraform/.gitignore`](terraform/.gitignore)):** Strictly excludes `.terraform/`, `*.tfstate*`, and `*.tfvars`.
- **Clean Lifecycle Teardown:** Full infrastructure stack can be cleanly destroyed without orphaned cloud components via `terraform destroy -auto-approve`.

---

# PART I — KUBERNETES ORCHESTRATION & HELM PACKAGING (M8)

BugBoard provides an enterprise cloud-native deployment package using a dedicated **Kubernetes** namespace manifest ([`k8s/namespace.yaml`](k8s/namespace.yaml)) and a production-grade **Helm (v3/v4)** chart ([`helm/bugboard/`](helm/bugboard/)).

### 1. Dedicated Namespace Isolation:
All application workloads are isolated in the `bugboard` namespace, ensuring clean resource quota boundaries, RBAC scoping, and network policy separation.

### 2. Production Helm Chart Architecture:
- **[`Chart.yaml`](helm/bugboard/Chart.yaml):** Declares chart metadata, semantic versioning (`v0.1.0`), and application version (`v1.0.0`).
- **[`values.yaml`](helm/bugboard/values.yaml):** Single source of truth parameterizing image registries, replica counts, service ports, resource allocations, and ingress paths.
- **[`templates/_helpers.tpl`](helm/bugboard/templates/_helpers.tpl):** Standardized labels (`app.kubernetes.io/name`, `instance`, `managed-by`), component selectors, and truncated resource names.

### 3. High Availability & Resilience:
- **2 Replicas per Tier:** Both Backend (`bugboard-backend`) and Frontend (`bugboard-frontend`) Deployments specify `replicaCount: 2`. Kubernetes automatically distributes replicas across nodes, providing zero-downtime rolling updates and traffic load balancing.
- **Health Probes:**
  - Backend: HTTP readiness probe and liveness probe on `GET /health` (port `8000`), verifying application and database connectivity before routing traffic.
  - Frontend: HTTP readiness and liveness probes verifying Nginx web server responsiveness on `GET /` (port `3000`).
- **Database Durability:** Dedicated `PersistentVolumeClaim` ([`postgres-pvc.yaml`](helm/bugboard/templates/postgres-pvc.yaml)) provisioning `1Gi` persistent storage (`ReadWriteOnce`), ensuring projects and bug analyses survive pod restarts.

### 4. Networking, Service Abstraction & Ingress:
- **Internal ClusterIP Services:** Stable cluster-internal DNS endpoints:
  - `bugboard-backend:8000` (FastAPI REST API)
  - `bugboard-frontend:80` (React Web Application, routing to container port 3000)
  - `bugboard-postgres:5432` (PostgreSQL Database)
- **NGINX Ingress Controller ([`ingress.yaml`](helm/bugboard/templates/ingress.yaml)):** Edge reverse proxy routing external HTTP traffic:
  - `Path: /` -> `bugboard-frontend:80`
  - `Path: /api` -> `bugboard-backend:8000`
  - `Path: /metrics` -> `bugboard-backend:8000`

---

# PART J — FULL-STACK OBSERVABILITY WITH PROMETHEUS & GRAFANA (M9)

BugBoard features an end-to-end telemetry and observability pipeline deployed via community Helm charts in the dedicated `monitoring` namespace.

```text
FastAPI Backend (/metrics) ──> Prometheus Server (Pull Scrape) ──> TSDB Storage ──> Grafana Dashboard (Live Panels)
```

### 1. Application-Level Metrics Instrumentation:
The FastAPI backend instruments all HTTP traffic using `prometheus-fastapi-instrumentator` in [`bugboard/backend/app/main.py`](bugboard/backend/app/main.py), exposing standard Prometheus-formatted metrics at `/metrics`:
- `http_requests_total`: Counter tracking request volume partitioned by `handler`, HTTP `method`, and HTTP `status`.
- `http_request_duration_seconds`: Histogram measuring response latency distribution across standard duration buckets.
- `process_cpu_seconds_total` & `process_resident_memory_bytes`: System metrics tracking container CPU and memory utilization.

### 2. Automated Prometheus Scrape Discovery:
- **Pod Annotations:** The backend deployment pod template metadata declares:
  ```yaml
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/path: "/metrics"
    prometheus.io/port: "8000"
  ```
- **Prometheus Values ([`monitoring/prometheus-values.yaml`](monitoring/prometheus-values.yaml)):** Configures 24h retention, disabled pushgateway/node-exporter for lightweight execution, and dedicated scrape jobs targeting `bugboard-backend.bugboard.svc.cluster.local:8000`.

### 3. Grafana Visualizations ([`monitoring/bugboard-dashboard.json`](monitoring/bugboard-dashboard.json)):
Pre-configured datasource pointing to `http://prometheus-server.monitoring.svc.cluster.local:80` and an auto-provisioned 3-panel dashboard:
1. **Total HTTP Requests Rate (req/sec):**
   ```promql
   sum(rate(http_requests_total[2m])) by (handler, status)
   ```
2. **P95 Request Latency (seconds):**
   ```promql
   histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[2m])) by (le))
   ```
3. **Application Error Rate (5xx / 4xx):**
   ```promql
   sum(rate(http_requests_total{status=~"5.."}[2m])) or vector(0)
   ```

---

# PART K — LIVE DEMO & PRESENTATION SCRIPT (M10 — 5 POINTS)

Use this step-by-step walkthrough script during your final presentation or recorded video demonstration:

### Phase 1: Full-Stack Application & Static Code Analyzer Walkthrough (2 Minutes)
1. **Open Frontend Dashboard:** Navigate to [http://localhost/](http://localhost/) (or port-forwarded frontend at `http://localhost:3000`).
2. **Highlight Architecture:** Show the live KPI stats in the navbar (Total Projects, Total Bugs, Open Bugs) and the pulsing backend health pill.
3. **Upload Sample Archive:**
   - Drag and drop `bugboard/examples/sample-project.zip` into the uploader card.
   - Click **Upload & Process Archive**.
   - Show the newly extracted project card displaying **6 files, 4 Python files, 1 test file**.
   - Expand the **Files Tree** to reveal the unzipped project directory hierarchy.
4. **Report Intentional Bug:**
   - Click **+ Report Bug**.
   - Enter Title: `Duplicate email registration error`, Affected File: `app/users.py`, Line: `18`, Severity: `HIGH`.
   - Submit the bug report.
5. **Demonstrate Deterministic Static Analyzer:**
   - Select the bug in the tracker table and click **⚡ Run Automated Code Analysis**.
   - Highlight the **Extracted Code Snippet** with the line pointer (`> 18`), the **Root Cause Diagnosis** (duplicate email constraint violation), the **Reproduction Steps**, and the **Suggested Code Fix**.

### Phase 2: Live CI/CD Pipeline & DevSecOps Gate (2 Minutes)
1. **Trigger Code Change:**
   - Make a minor, visible update (e.g., bump version or update title in `bugboard/frontend/src/components/Navbar.jsx`).
   - Commit and push to `main` branch.
2. **Inspect GitHub Actions Workflow:**
   - Open GitHub repository > **Actions** tab.
   - Show **Job 1 (`test-backend`)** running 7 automated Pytest tests against an in-memory SQLite database.
   - Show **Job 2 (`build-frontend`)** validating Vite compilation.
   - Show **Job 3 (`build-and-push-images`)** executing:
     - **Trivy Vulnerability Scan:** Explain the shift-left security gate (`--severity HIGH,CRITICAL --exit-code 1`) blocking unpatched CVEs.
     - **Dual-Registry Push:** Show container images being published simultaneously to **GitHub Container Registry (GHCR)** and **Docker Hub** tagged with the immutable commit SHA and `latest`.

### Phase 3: Kubernetes & Helm Rolling Update (1 Minute)
1. **Demonstrate Helm Deployment:**
   - In terminal, show the running Kubernetes pods across the namespace:
     ```bash
     kubectl get pods -n bugboard
     ```
   - Point out the **2 backend replicas**, **2 frontend replicas**, and **1 postgres pod**.
2. **Execute Zero-Downtime Upgrade:**
   - Run `helm upgrade bugboard ./helm/bugboard -n bugboard`.
   - Run `kubectl get pods -n bugboard -w` to demonstrate the rolling update lifecycle: Kubernetes provisions new pods, passes readiness probes, and terminates older replicas with zero downtime.

### Phase 4: Live Telemetry Verification (1 Minute)
1. **Generate Test Traffic:**
   - In PowerShell, run the traffic generation loop:
     ```powershell
     1..40 | ForEach-Object {
         Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get | Out-Null
         Invoke-RestMethod -Uri "http://localhost:8000/api/projects" -Method Get | Out-Null
     }
     ```
2. **Showcase Grafana Live Dashboard:**
   - Open Grafana at [http://localhost:3001](http://localhost:3001) (Dashboard: `BugBoard Operations & Performance Dashboard`).
   - Demonstrate the live metric curves reacting to traffic:
     - **HTTP Requests Rate:** Active spike reflecting the incoming request volume.
     - **P95 Latency:** Sub-100ms response time graph.
     - **Error Rate:** Flat zero curve demonstrating clean application health.

---

# PART L — CAPSTONE MILESTONES PROGRESS (100 / 100 POINTS)

| Milestone | Topic | Points | Status | Documentation & Proofs |
| :---: | :--- | :---: | :---: | :--- |
| **M1** | Application: Frontend + Backend + Database | **10 / 10** | **Completed** | [bugboard/docs/M1.md](bugboard/docs/M1.md) |
| **M2** | Testing: Pytest + Code Quality | **10 / 10** | **Completed** | [bugboard/docs/M2.md](bugboard/docs/M2.md) |
| **M3** | Git and GitHub | **5 / 5** | **Completed** | [bugboard/docs/M3.md](bugboard/docs/M3.md) |
| **M4** | Docker: Dockerfile + Compose | **10 / 10** | **Completed** | [bugboard/docs/M4.md](bugboard/docs/M4.md) |
| **M5** | CI/CD — GitHub Actions Pipeline | **15 / 15** | **Completed** | [bugboard/docs/M5.md](bugboard/docs/M5.md) |
| **M6** | DevSecOps — Trivy Security Scan | **5 / 5** | **Completed** | [bugboard/docs/M6.md](bugboard/docs/M6.md) |
| **M7** | Terraform — AWS Infrastructure as Code | **15 / 15** | **Completed** | [bugboard/docs/M7.md](bugboard/docs/M7.md) |
| **M8** | Kubernetes + Helm Deployment | **15 / 15** | **Completed** | [bugboard/docs/M8.md](bugboard/docs/M8.md) |
| **M9** | Observability — Prometheus + Grafana | **10 / 10** | **Completed** | [bugboard/docs/M9.md](bugboard/docs/M9.md) |
| **M10**| Final Presentation + Documentation | **5 / 5** | **Completed** | [Part K: Live Demo Script](#part-k--live-demo--presentation-script-m10--5-points) |
| **Total** | | **100 / 100** | **Completed** | **Full Capstone Project Complete** |

---

## 8. Final Submission Checklist Summary

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
- [x] High-availability Kubernetes + Helm deployment with NGINX Ingress and PVC persistence (M8).
- [x] Production Prometheus + Grafana telemetry pipeline with live dashboard panels (M9).
- [x] Comprehensive Live Demo & Presentation Walkthrough Script (M10).
- [x] Detailed milestone reports with embedded screenshots in `bugboard/docs/` (M1–M9).

