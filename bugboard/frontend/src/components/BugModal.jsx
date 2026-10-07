import React, { useState, useEffect } from 'react';

export default function BugModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  projectName = ''
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [status, setStatus] = useState('OPEN');
  const [affectedFile, setAffectedFile] = useState('app/users.py');
  const [lineNumber, setLineNumber] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setSeverity(initialData.severity || 'MEDIUM');
      setStatus(initialData.status || 'OPEN');
      setAffectedFile(initialData.affected_file || 'app/users.py');
      setLineNumber(initialData.line_number !== null && initialData.line_number !== undefined ? String(initialData.line_number) : '');
    } else {
      setTitle('');
      setDescription('');
      setSeverity('MEDIUM');
      setStatus('OPEN');
      setAffectedFile('app/users.py');
      setLineNumber('');
    }
    setFormError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Bug title is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Bug description is required.');
      return;
    }
    if (!affectedFile.trim()) {
      setFormError('Affected file path is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        severity,
        status,
        affected_file: affectedFile.trim(),
        line_number: lineNumber ? parseInt(lineNumber, 10) : null
      });
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save bug report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {initialData ? 'Edit Bug Report' : 'Report New Bug'}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Target Project: <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{projectName}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {formError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="bug-title-input">Bug Title *</label>
            <input
              id="bug-title-input"
              className="input-text"
              type="text"
              placeholder="e.g. Duplicate email registration error"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="bug-desc-input">Description *</label>
            <textarea
              id="bug-desc-input"
              className="input-textarea"
              rows="3"
              placeholder="Describe symptoms, expected behavior, and observed error..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="input-label" htmlFor="bug-severity-select">Severity Level</label>
              <select
                id="bug-severity-select"
                className="input-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="bug-status-select">Status</label>
              <select
                id="bug-status-select"
                className="input-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label className="input-label" htmlFor="bug-file-input">Affected File Path *</label>
              <input
                id="bug-file-input"
                className="input-text"
                type="text"
                placeholder="e.g. app/users.py"
                value={affectedFile}
                onChange={(e) => setAffectedFile(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="input-label" htmlFor="bug-line-input">Line Number</label>
              <input
                id="bug-line-input"
                className="input-text"
                type="number"
                min="1"
                placeholder="e.g. 18"
                value={lineNumber}
                onChange={(e) => setLineNumber(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Bug' : 'Submit Bug Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
