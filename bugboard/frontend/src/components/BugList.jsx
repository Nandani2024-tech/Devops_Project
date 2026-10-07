import React, { useState } from 'react';

export default function BugList({
  project,
  bugs,
  onRefreshBugs,
  onOpenNewBugModal,
  onEditBug,
  onDeleteBug,
  onUpdateBugStatus,
  apiBase = ''
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBugId, setSelectedBugId] = useState(bugs?.[0]?.id || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  // Selected bug
  const currentBug = bugs.find((b) => b.id === selectedBugId) || (bugs.length > 0 ? bugs[0] : null);

  // Filtered bugs
  const filteredBugs = bugs.filter((bug) => {
    if (statusFilter !== 'ALL' && bug.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && bug.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = bug.title.toLowerCase().includes(q);
      const matchFile = bug.affected_file.toLowerCase().includes(q);
      const matchDesc = bug.description.toLowerCase().includes(q);
      if (!matchTitle && !matchFile && !matchDesc) return false;
    }
    return true;
  });

  const runAnalysis = async (bugId) => {
    setIsAnalyzing(true);
    setAnalysisError('');
    try {
      const res = await fetch(`${apiBase}/api/bugs/${bugId}/analyze`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
        throw new Error(err.detail || 'Analysis request failed');
      }
      const data = await res.json();
      setAnalysisData(data);
      if (onRefreshBugs) onRefreshBugs();
    } catch (err) {
      setAnalysisError(err.message || 'Could not complete static analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // If a bug is selected and already has analysis attached in backend response
  const activeAnalysis = analysisData && analysisData.bug_id === currentBug?.id 
    ? analysisData 
    : currentBug?.analysis;

  return (
    <div className="card">
      <div className="bugs-header">
        <div>
          <div className="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Bug Tracker: <span style={{ color: '#818cf8', marginLeft: '6px' }}>{project ? project.name : 'Select a Project'}</span>
          </div>
          <p className="card-subtitle" style={{ marginBottom: 0 }}>
            {bugs.length} total reports for this project. Filter by status or severity and trigger automated root-cause analysis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-primary"
            onClick={onOpenNewBugModal}
            disabled={!project}
            id="report-new-bug-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Report Bug
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '20px 0 24px', alignItems: 'center' }}>
        <input
          type="text"
          className="input-text"
          placeholder="🔍 Search bugs by title, file, or description..."
          style={{ maxWidth: '320px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
          <select
            className="input-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Severity:</span>
          <select
            className="input-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Bug Table and Analysis Panel Side-by-Side */}
      {bugs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎉</div>
          <h3>No Bugs Reported For This Project</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
            Click "Report Bug" above to log an issue (e.g. for line 18 duplicate registration or line 34 null check).
          </p>
        </div>
      ) : (
        <div className="bugs-layout">
          {/* Bugs Table */}
          <div className="bug-table-container">
            <table className="bug-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Title & Location</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBugs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No bugs match current filters.
                    </td>
                  </tr>
                ) : (
                  filteredBugs.map((bug) => {
                    const isSelected = (currentBug?.id === bug.id);
                    return (
                      <tr
                        key={bug.id}
                        className={`bug-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedBugId(bug.id)}
                      >
                        <td>
                          <span className={`badge badge-${bug.severity.toLowerCase()}`}>
                            {bug.severity}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                            {bug.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                            {bug.affected_file}{bug.line_number ? `:${bug.line_number}` : ''}
                          </div>
                        </td>
                        <td>
                          <select
                            className="input-select"
                            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}
                            value={bug.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onUpdateBugStatus(bug.id, e.target.value)}
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditBug(bug);
                              }}
                              title="Edit Bug"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete bug "${bug.title}"?`)) {
                                  onDeleteBug(bug.id);
                                }
                              }}
                              title="Delete Bug"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Analysis & Detail Panel */}
          {currentBug ? (
            <div className="analysis-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`badge badge-${currentBug.severity.toLowerCase()}`}>
                      {currentBug.severity}
                    </span>
                    <span className={`badge badge-${currentBug.status.toLowerCase()}`}>
                      {currentBug.status}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      #{currentBug.id}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                    {currentBug.title}
                  </h3>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                {currentBug.description}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>File & Target:</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  {currentBug.affected_file}{currentBug.line_number ? ` (line ${currentBug.line_number})` : ''}
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => runAnalysis(currentBug.id)}
                  disabled={isAnalyzing}
                  id="run-automated-analysis-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  {isAnalyzing ? 'Analyzing Target Code...' : '⚡ Run Automated Code Analysis'}
                </button>
              </div>

              {analysisError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                  ⚠️ {analysisError}
                </div>
              )}

              {/* Analysis Result Display */}
              {activeAnalysis ? (
                <div>
                  <div className="analysis-section">
                    <div className="analysis-section-title">
                      <span>📄</span> Extracted Code Snippet
                    </div>
                    <pre className="code-viewer" id="code-snippet-box">
                      {activeAnalysis.detected_snippet || 'No snippet available.'}
                    </pre>
                  </div>

                  <div className="analysis-section">
                    <div className="analysis-section-title">
                      <span>🔍</span> Potential Root Cause
                    </div>
                    <div className="analysis-box" id="potential-cause-box">
                      {activeAnalysis.potential_cause}
                    </div>
                  </div>

                  <div className="analysis-section">
                    <div className="analysis-section-title">
                      <span>🧪</span> Steps to Reproduce
                    </div>
                    <div className="analysis-box" style={{ whiteSpace: 'pre-line' }} id="reproduction-steps-box">
                      {activeAnalysis.reproduction_steps}
                    </div>
                  </div>

                  {activeAnalysis.suggested_fix && (
                    <div className="analysis-section">
                      <div className="analysis-section-title">
                        <span>💡</span> Suggested Remediation / Fix
                      </div>
                      <div className="analysis-box" style={{ whiteSpace: 'pre-wrap', borderLeftColor: 'var(--accent-emerald)' }} id="suggested-fix-box">
                        {activeAnalysis.suggested_fix}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-dim)', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                  <div>🔬</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                    Click "Run Automated Code Analysis" to inspect <code>{currentBug.affected_file}</code> and generate diagnostic evidence.
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
