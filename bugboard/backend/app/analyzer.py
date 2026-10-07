import os
import zipfile
from typing import Dict, Any, List, Optional, Tuple

def extract_project_zip(zip_file_path: str, target_dir: str) -> None:
    """Safely extracts a zip file to the target directory, preventing zip-slip vulnerabilities."""
    target_dir = os.path.abspath(target_dir)
    os.makedirs(target_dir, exist_ok=True)
    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        for member in zip_ref.namelist():
            # Guard against zip-slip attacks
            dest_path = os.path.abspath(os.path.join(target_dir, member))
            if not dest_path.startswith(target_dir + os.sep) and dest_path != target_dir:
                raise ValueError(f"Security error: Zip slip attempt detected in member '{member}'")
        zip_ref.extractall(target_dir)

def count_project_files(target_dir: str) -> Dict[str, int]:
    """Walks the extracted directory to count total files, Python files, and test files."""
    total_files = 0
    python_files = 0
    test_files = 0

    ignored_dirs = {"__pycache__", ".git", ".pytest_cache", "node_modules", ".venv", "venv"}

    for root, dirs, files in os.walk(target_dir):
        # Skip ignored directories
        dirs[:] = [d for d in dirs if d not in ignored_dirs]
        for file in files:
            total_files += 1
            if file.endswith(".py"):
                python_files += 1
                rel_path = os.path.relpath(os.path.join(root, file), target_dir).replace("\\", "/")
                if file.startswith("test_") or file.endswith("_test.py") or "/tests/" in f"/{rel_path}":
                    test_files += 1

    return {
        "file_count": total_files,
        "python_file_count": python_files,
        "test_file_count": test_files
    }

def build_file_tree(base_dir: str, current_dir: Optional[str] = None) -> List[Dict[str, Any]]:
    """Generates a hierarchical file tree structure of the extracted project."""
    if current_dir is None:
        current_dir = base_dir

    if not os.path.exists(current_dir):
        return []

    tree = []
    ignored = {"__pycache__", ".git", ".pytest_cache", ".DS_Store"}

    try:
        entries = sorted(os.listdir(current_dir))
    except (OSError, PermissionError):
        return []

    # Sort directories first, then files
    dirs = [e for e in entries if os.path.isdir(os.path.join(current_dir, e)) and e not in ignored]
    files = [e for e in entries if os.path.isfile(os.path.join(current_dir, e)) and e not in ignored]

    for d in dirs:
        dir_full_path = os.path.join(current_dir, d)
        rel_path = os.path.relpath(dir_full_path, base_dir).replace("\\", "/")
        tree.append({
            "name": d,
            "type": "directory",
            "path": rel_path,
            "children": build_file_tree(base_dir, dir_full_path)
        })

    for f in files:
        file_full_path = os.path.join(current_dir, f)
        rel_path = os.path.relpath(file_full_path, base_dir).replace("\\", "/")
        tree.append({
            "name": f,
            "type": "file",
            "path": rel_path,
            "children": None
        })

    return tree

def find_affected_file(base_dir: str, affected_file: str) -> Optional[str]:
    """Finds the absolute path to an affected file within base_dir safely."""
    clean_path = affected_file.replace("/", os.sep).replace("\\", os.sep).lstrip(os.sep)
    candidate = os.path.abspath(os.path.join(base_dir, clean_path))
    if candidate.startswith(os.path.abspath(base_dir)) and os.path.isfile(candidate):
        return candidate

    # Search recursively for the filename or matching relative path
    norm_needle = affected_file.replace("\\", "/").strip("/").lower()
    for root, _, files in os.walk(base_dir):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, base_dir).replace("\\", "/").lower()
            if rel == norm_needle or f.lower() == os.path.basename(norm_needle):
                return full
    return None

def extract_code_snippet(base_dir: str, affected_file: str, line_number: Optional[int]) -> Tuple[Optional[str], Optional[str]]:
    """Extracts a 5-10 line snippet around line_number from the target file."""
    file_path = find_affected_file(base_dir, affected_file)
    if not file_path:
        return None, None

    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
    except Exception:
        return None, None

    if not lines:
        return None, None

    total_lines = len(lines)
    if line_number is None or line_number < 1 or line_number > total_lines:
        # Default to first 10 lines if line_number is omitted or out of range
        start_line = 1
        end_line = min(10, total_lines)
        target_line_text = lines[0].strip() if lines else ""
    else:
        start_line = max(1, line_number - 4)
        end_line = min(total_lines, line_number + 4)
        target_line_text = lines[line_number - 1].strip()

    snippet_lines = []
    for idx in range(start_line, end_line + 1):
        line_content = lines[idx - 1].rstrip("\r\n")
        prefix = ">" if line_number is not None and idx == line_number else " "
        snippet_lines.append(f"{prefix} {idx:3d} | {line_content}")

    return "\n".join(snippet_lines), target_line_text

def analyze_bug(
    base_dir: str,
    affected_file: str,
    line_number: Optional[int],
    title: str = "",
    description: str = ""
) -> Dict[str, Any]:
    """Performs deterministic rule-based analysis on the bug."""
    snippet, target_line_text = extract_code_snippet(base_dir, affected_file, line_number)

    search_corpus = f"{title} {description} {target_line_text or ''} {snippet or ''}".lower()

    if "email" in search_corpus or "duplicate" in search_corpus or "unique" in search_corpus:
        potential_cause = (
            "Missing uniqueness validation or duplicate record handling. The application attempts "
            "to insert or process an entity without verifying uniqueness or catching unique constraint conflicts."
        )
        suggested_fix = (
            "Add a defensive uniqueness check prior to insertion, or catch IntegrityError / duplicate errors "
            "and return an HTTP 409 Conflict response.\n\n"
            "Example Fix:\n"
            "```python\n"
            "# Check for duplicate before committing record\n"
            "for existing in USERS_DB.values():\n"
            "    if existing['email'] == user.email:\n"
            "        raise HTTPException(status_code=409, detail='Email already registered')\n"
            "```"
        )
        reproduction_steps = (
            "1. Send a POST request to register an entity with an email address (e.g. 'alice@example.com').\n"
            "2. Send an identical POST request with the same email address.\n"
            "3. Observe an unhandled exception or duplicate state instead of an expected HTTP 409 Conflict."
        )
    elif "none" in search_corpus or "nullable" in search_corpus or "null" in search_corpus or "attributeerror" in search_corpus:
        potential_cause = (
            "Missing null/None check on nullable reference or optional lookup. The code attempts "
            "to access attributes or subscript a dictionary/object that evaluated to None."
        )
        suggested_fix = (
            "Validate that the referenced object is not None before accessing attributes, or return "
            "a 404 Not Found error if the resource does not exist.\n\n"
            "Example Fix:\n"
            "```python\n"
            "profile = get_user_profile(user_id)\n"
            "if profile is None:\n"
            "    raise HTTPException(status_code=404, detail='User profile not found')\n"
            "return {'bio': profile.get('bio', '')}\n"
            "```"
        )
        reproduction_steps = (
            "1. Request a resource or child entity for an ID with no initialized profile.\n"
            "2. Execute the endpoint calling the affected function.\n"
            "3. Observe an unhandled AttributeError or TypeError when dereferencing None."
        )
    else:
        potential_cause = (
            f"Potential runtime or logic issue identified in '{affected_file}' near line {line_number or 'N/A'}. "
            "The execution flow encountered an unexpected condition with missing defensive checks."
        )
        suggested_fix = (
            f"Add input validation and defensive error handling around line {line_number or 'N/A'} of {affected_file} "
            "to catch edge cases and return structured error messages."
        )
        reproduction_steps = (
            f"1. Invoke the API or routine reaching '{affected_file}'.\n"
            f"2. Supply edge case or invalid payload targeting line {line_number or 'N/A'}.\n"
            "3. Verify that the system handles the failure gracefully."
        )

    return {
        "detected_snippet": snippet or f"Could not extract snippet from '{affected_file}' at line {line_number}.",
        "potential_cause": potential_cause,
        "suggested_fix": suggested_fix,
        "reproduction_steps": reproduction_steps
    }
