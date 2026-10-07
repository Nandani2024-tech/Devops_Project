import React, { useState, useRef } from 'react';

export default function ProjectUpload({ onProjectUploaded, apiBase = '' }) {
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setUploadError('Only .zip files are supported.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError('');
      if (!projectName.trim()) {
        const cleanName = file.name.replace(/\.zip$/i, '').replace(/[-_]/g, ' ');
        setProjectName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setUploadError('Only .zip files are supported.');
        return;
      }
      setSelectedFile(file);
      setUploadError('');
      if (!projectName.trim()) {
        const cleanName = file.name.replace(/\.zip$/i, '').replace(/[-_]/g, ' ');
        setProjectName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a project .zip archive to upload.');
      return;
    }
    if (!projectName.trim()) {
      setUploadError('Please enter a project name.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('name', projectName.trim());
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${apiBase}/api/projects`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(errData.detail || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      setUploadSuccess(`Project "${data.name}" uploaded & analyzed! (${data.file_count} files)`);
      setProjectName('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onProjectUploaded) onProjectUploaded(data);
    } catch (err) {
      setUploadError(err.message || 'Error uploading project archive.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Upload Project
      </div>
      <p className="card-subtitle">
        Upload a .zip repository archive for automated structure extraction and bug tracing.
      </p>

      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div className="input-group">
            <label className="input-label" htmlFor="project-name-input">Project Name</label>
            <input
              id="project-name-input"
              className="input-text"
              type="text"
              placeholder="e.g. Sample Microservice"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div
            className={`dropzone ${isDragOver ? 'active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <div className="dropzone-icon">📦</div>
            <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.9rem' }}>
              Drag & Drop your .zip file here
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
              or click to browse from disk
            </div>
          </div>

          {selectedFile && (
            <div className="file-chosen-tag">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                style={{ background: 'none', border: 'none', color: '#c7d2fe', cursor: 'pointer', padding: '0 4px' }}
              >
                ✕
              </button>
            </div>
          )}

          {uploadError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
              ⚠️ {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
              ✅ {uploadSuccess}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '12px' }}
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? 'Extracting & Analyzing...' : 'Upload & Process Archive'}
        </button>
      </form>
    </div>
  );
}
