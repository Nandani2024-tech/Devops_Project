import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ProjectUpload from './components/ProjectUpload';
import ProjectList from './components/ProjectList';
import BugList from './components/BugList';
import BugModal from './components/BugModal';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [backendStatus, setBackendStatus] = useState(null);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [globalStats, setGlobalStats] = useState({
    totalProjects: 0,
    totalBugs: 0,
    openBugs: 0,
    highCriticalBugs: 0,
  });

  // Fetch backend health status
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendStatus(data);
      } else {
        setBackendStatus({ status: 'unhealthy', database: 'disconnected' });
      }
    } catch {
      setBackendStatus({ status: 'error', database: 'disconnected' });
    }
  }, []);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);

        // If no selected project yet or selected is no longer in list, auto-select first
        if (data.length > 0) {
          setSelectedProject((prev) => {
            if (!prev) return data[0];
            const stillExists = data.find((p) => p.id === prev.id);
            return stillExists || data[0];
          });
        } else {
          setSelectedProject(null);
          setBugs([]);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  }, []);

  // Fetch bugs for current project
  const fetchBugs = useCallback(async (projectId) => {
    if (!projectId) {
      setBugs([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/bugs`);
      if (res.ok) {
        const data = await res.json();
        setBugs(data);
      }
    } catch (err) {
      console.error('Failed to load bugs:', err);
    }
  }, []);

  // Recalculate global stats across all projects/bugs
  const updateStats = useCallback(async () => {
    checkHealth();
    try {
      const projRes = await fetch(`${API_BASE}/api/projects`);
      if (projRes.ok) {
        const projData = await projRes.json();
        let totalB = 0;
        let openB = 0;
        let hcB = 0;

        // Fetch bugs for each project to get accurate cross-project counts
        for (const p of projData) {
          const bugRes = await fetch(`${API_BASE}/api/projects/${p.id}/bugs`);
          if (bugRes.ok) {
            const bData = await bugRes.json();
            totalB += bData.length;
            openB += bData.filter((b) => b.status === 'OPEN' || b.status === 'IN_PROGRESS').length;
            hcB += bData.filter((b) => b.severity === 'HIGH' || b.severity === 'CRITICAL').length;
          }
        }

        setGlobalStats({
          totalProjects: projData.length,
          totalBugs: totalB,
          openBugs: openB,
          highCriticalBugs: hcB,
        });
      }
    } catch (err) {
      console.error('Failed to compute stats:', err);
    }
  }, [checkHealth]);

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchProjects();
  }, [checkHealth, fetchProjects]);

  // When selected project changes, fetch its bugs
  useEffect(() => {
    if (selectedProject) {
      fetchBugs(selectedProject.id);
    } else {
      setBugs([]);
    }
    updateStats();
  }, [selectedProject, fetchBugs, updateStats]);

  const handleProjectUploaded = (newProject) => {
    fetchProjects();
    setSelectedProject(newProject);
    updateStats();
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchProjects();
        updateStats();
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleBugSubmit = async (bugData) => {
    if (!selectedProject) return;

    if (editingBug) {
      // Update existing bug
      const res = await fetch(`${API_BASE}/api/bugs/${editingBug.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bugData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to update bug' }));
        throw new Error(err.detail || 'Failed to update bug');
      }
    } else {
      // Create new bug
      const res = await fetch(`${API_BASE}/api/projects/${selectedProject.id}/bugs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bugData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to report bug' }));
        throw new Error(err.detail || 'Failed to report bug');
      }
    }

    setEditingBug(null);
    fetchBugs(selectedProject.id);
    updateStats();
  };

  const handleUpdateBugStatus = async (bugId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/bugs/${bugId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchBugs(selectedProject.id);
        updateStats();
      }
    } catch (err) {
      console.error('Failed to update bug status:', err);
    }
  };

  const handleDeleteBug = async (bugId) => {
    try {
      const res = await fetch(`${API_BASE}/api/bugs/${bugId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchBugs(selectedProject.id);
        updateStats();
      }
    } catch (err) {
      console.error('Failed to delete bug:', err);
    }
  };

  const handleEditBug = (bug) => {
    setEditingBug(bug);
    setIsBugModalOpen(true);
  };

  const handleRefreshAll = () => {
    checkHealth();
    fetchProjects();
    if (selectedProject) fetchBugs(selectedProject.id);
    updateStats();
  };

  return (
    <div className="app-container">
      <Navbar
        stats={globalStats}
        backendStatus={backendStatus}
        onRefresh={handleRefreshAll}
      />

      <main className="main-content">
        {/* Top Grid: Upload & Projects Browser */}
        <section className="grid-top">
          <ProjectUpload
            onProjectUploaded={handleProjectUploaded}
            apiBase={API_BASE}
          />
          <ProjectList
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onDeleteProject={handleDeleteProject}
            apiBase={API_BASE}
          />
        </section>

        {/* Bug Tracker and Deterministic Analysis Section */}
        <section>
          <BugList
            project={selectedProject}
            bugs={bugs}
            onRefreshBugs={() => selectedProject && fetchBugs(selectedProject.id)}
            onOpenNewBugModal={() => {
              setEditingBug(null);
              setIsBugModalOpen(true);
            }}
            onEditBug={handleEditBug}
            onDeleteBug={handleDeleteBug}
            onUpdateBugStatus={handleUpdateBugStatus}
            apiBase={API_BASE}
          />
        </section>
      </main>

      <BugModal
        isOpen={isBugModalOpen}
        onClose={() => {
          setIsBugModalOpen(false);
          setEditingBug(null);
        }}
        onSubmit={handleBugSubmit}
        initialData={editingBug}
        projectName={selectedProject?.name || ''}
      />
    </div>
  );
}
