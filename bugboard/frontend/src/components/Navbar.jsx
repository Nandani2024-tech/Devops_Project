import React from 'react';

export default function Navbar({ stats, backendStatus, onRefresh }) {
  const isHealthy = backendStatus?.status === 'healthy';

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand-section">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 2 1.88 1.88" />
              <path d="M14.12 3.88 16 2" />
              <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
              <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
              <path d="M12 20v-9" />
              <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
              <path d="M6 13H2" />
              <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
              <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
              <path d="M22 13h-4" />
              <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-title">BugBoard</span>
              <span className="brand-badge">DevOps M1</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Static Analysis & Issue Tracker
            </div>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-item" title="Total Uploaded Projects">
            <span className="stat-label">Projects</span>
            <span className="stat-val">{stats.totalProjects}</span>
          </div>

          <div className="stat-item" title="Total Reported Bugs">
            <span className="stat-label">Total Bugs</span>
            <span className="stat-val">{stats.totalBugs}</span>
          </div>

          <div className="stat-item" title="Open Unresolved Bugs">
            <span className="stat-label">Open</span>
            <span className="stat-val" style={{ color: '#a5b4fc' }}>{stats.openBugs}</span>
          </div>

          <div className="stat-item" title="High or Critical Severity Bugs">
            <span className="stat-label">High/Critical</span>
            <span className="stat-val" style={{ color: stats.highCriticalBugs > 0 ? '#f87171' : '#34d399' }}>
              {stats.highCriticalBugs}
            </span>
          </div>

          <div className={`backend-status-pill ${isHealthy ? 'status-online' : 'status-offline'}`} title={backendStatus?.database ? `DB: ${backendStatus.database}` : 'Backend offline'}>
            <span className="pulse-dot"></span>
            <span>{isHealthy ? 'API & DB Ready' : 'Connecting...'}</span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onRefresh} title="Refresh System State">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
