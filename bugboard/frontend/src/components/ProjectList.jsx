import React, { useState } from 'react';

export default function ProjectList({
  projects,
  selectedProject,
  onSelectProject,
  onDeleteProject,
  apiBase = ''
}) {
  const [expandedTreeId, setExpandedTreeId] = useState(null);
  const [projectTree, setProjectTree] = useState(null);
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  const fetchTree = async (projectId) => {
    if (expandedTreeId === projectId) {
      setExpandedTreeId(null);
      setProjectTree(null);
      return;
    }

    setIsLoadingTree(true);
    setExpandedTreeId(projectId);
    try {
      const res = await fetch(`${apiBase}/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectTree(data.file_tree || []);
      }
    } catch (e) {
      console.error('Failed to fetch file tree:', e);
    } finally {
      setIsLoadingTree(false);
    }
  };

  const renderTreeNodes = (nodes, depth = 0) => {
    if (!nodes || nodes.length === 0) return <div style={{ color: 'var(--text-dim)' }}>Empty directory</div>;
    return nodes.map((node) => (
      <div key={node.path} style={{ paddingLeft: `${depth * 14}px` }}>
        <div className="tree-node">
          {node.type === 'directory' ? (
            <span className="tree-node-dir">📁 {node.name}/</span>
          ) : (
            <span className="tree-node-file">
              {node.name.endsWith('.py') ? '🐍' : '📄'} {node.name}
            </span>
          )}
        </div>
        {node.type === 'directory' && node.children && renderTreeNodes(node.children, depth + 1)}
      </div>
    ));
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <h3 style={{ marginBottom: '8px' }}>No Projects Uploaded Yet</h3>
          <p style={{ fontSize: '0.85rem' }}>Upload a zip file on the left (e.g. from examples/sample-project.zip) to start tracking and analyzing bugs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        </svg>
        Projects Browser ({projects.length})
      </div>
      <p className="card-subtitle">
        Select a project to inspect source tree, view reported bugs, and run deterministic root-cause analysis.
      </p>

      <div className="project-list-grid" style={{ overflowY: 'auto', flex: 1, maxHeight: '380px', paddingRight: '4px' }}>
        {projects.map((proj) => {
          const isSelected = selectedProject?.id === proj.id;
          const isTreeOpen = expandedTreeId === proj.id;

          return (
            <div
              key={proj.id}
              className={`project-item-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectProject(proj)}
            >
              <div>
                <div className="project-item-header">
                  <h4 className="project-name">{proj.name}</h4>
                  <span className={`badge ${isSelected ? 'badge-open' : 'badge-closed'}`}>
                    {isSelected ? 'ACTIVE' : 'ID: ' + proj.id}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
                  Archive: {proj.filename}
                </div>

                <div className="project-stats-row">
                  <span className="project-stats-pill" title="Total Files">
                    📁 {proj.file_count} files
                  </span>
                  <span className="project-stats-pill" title="Python Files">
                    🐍 {proj.python_file_count} py
                  </span>
                  <span className="project-stats-pill" title="Test Files">
                    🧪 {proj.test_file_count} test
                  </span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchTree(proj.id);
                    }}
                  >
                    {isTreeOpen ? 'Hide Tree' : 'Files Tree'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete project "${proj.name}" and all associated bug reports?`)) {
                        onDeleteProject(proj.id);
                      }
                    }}
                    title="Delete Project"
                  >
                    🗑️
                  </button>
                </div>

                {isTreeOpen && (
                  <div
                    style={{ marginTop: '12px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginBottom: '6px', fontWeight: 600 }}>
                      Extracted Directory Structure:
                    </div>
                    <div className="file-tree-container">
                      {isLoadingTree ? 'Loading structure...' : renderTreeNodes(projectTree)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
