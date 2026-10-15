import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';

export default function ReportsDisputesPage() {
  const { currentUser } = useAuth();
  const { disputes, fileDispute } = useExchange();

  const [showFileModal, setShowFileModal] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [reportedUser, setReportedUser] = useState('');
  const [category, setCategory] = useState('Misleading Item Condition');
  const [reason, setReason] = useState('');
  const [evidenceCount, setEvidenceCount] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemTitle.trim() || !reason.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    fileDispute({
      itemTitle,
      reportedUser: reportedUser || 'Unknown Member',
      category,
      reason,
      evidenceCount
    });

    setShowFileModal(false);
    setItemTitle('');
    setReportedUser('');
    setReason('');
    setToastMessage('Report filed successfully. Case assigned to platform moderation queue.');
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh' }}>
      <div className="container-xl">
        
        {/* Toast */}
        {toastMessage && (
          <div
            className="position-fixed bottom-0 end-0 m-4 p-3 bg-white border rounded-3 shadow-lg d-flex align-items-center gap-3"
            style={{ zIndex: 1090, maxWidth: '420px', borderColor: 'var(--primary-brown)', borderLeftWidth: '6px' }}
          >
            <i className="bi bi-shield-check fs-4 text-success"></i>
            <div className="flex-grow-1" style={{ fontSize: '0.85rem' }}>
              <div className="fw-bold">Report Filed</div>
              <div className="text-muted">{toastMessage}</div>
            </div>
            <button onClick={() => setToastMessage(null)} className="btn btn-sm btn-link text-muted p-0">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-1" style={{ fontSize: '0.8rem' }}>
                <li className="breadcrumb-item"><Link to="/dashboard" className="text-muted text-decoration-none">Dashboard</Link></li>
                <li className="breadcrumb-item active text-dark">Reports & Disputes</li>
              </ol>
            </nav>
            <h1 className="font-serif fw-bold h3 mb-0 text-dark">Trust & Safety Reports</h1>
            <span className="text-muted" style={{ fontSize: '0.84rem' }}>
              Confidential logs of disputes filed by you and formal admin resolution reviews.
            </span>
          </div>

          <button
            onClick={() => setShowFileModal(true)}
            className="btn btn-danger btn-sm py-2 px-3 mt-3 mt-md-0"
          >
            <i className="bi bi-flag-fill me-1"></i> File New Report
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3 rounded-3 bg-white border mb-4 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <i className="bi bi-shield-lock-fill text-brown" style={{ color: 'var(--primary-brown)' }}></i>
            <span className="fw-bold text-dark small">Fair Community Investigation Protocol</span>
          </div>
          <p className="text-muted small mb-0" style={{ lineHeight: 1.5 }}>
            All reports are confidentially handled by our university research administrators. Members cannot modify recorded evidence or view private disputes filed by other individuals.
          </p>
        </div>

        {/* Disputes List */}
        <div className="d-flex flex-column gap-3 mb-5">
          {disputes.length === 0 ? (
            <div className="bg-white p-5 rounded-3 border text-center shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <i className="bi bi-patch-check fs-2 text-success mb-2 d-block"></i>
              <h5 className="font-serif fw-bold mb-1">Clean Record</h5>
              <p className="text-muted small">You have no active disputes or reports filed.</p>
            </div>
          ) : (
            disputes.map(d => (
              <div key={d.id} className="bg-white p-4 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold font-monospace text-dark">Case ID: {d.id}</span>
                    <span className="text-muted small">• Filed on {d.date}</span>
                  </div>
                  <span className="badge bg-warning-subtle text-warning-emphasis border" style={{ fontSize: '0.76rem' }}>
                    {d.status}
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="text-muted small mb-1">Reported Item / Subject:</div>
                    <h6 className="fw-bold text-dark mb-2">{d.reportedItemTitle}</h6>
                    <span className="text-muted small d-block">Against: <strong>{d.reportedUser}</strong></span>
                    <span className="badge bg-secondary-subtle text-secondary mt-1">{d.category}</span>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded bg-light border small">
                      <div className="fw-bold text-dark mb-1">Filed Member Reason:</div>
                      <p className="text-muted mb-2">{d.reason}</p>
                      
                      <div className="fw-bold text-dark mb-1 border-top pt-2">
                        <i className="bi bi-person-badge-fill me-1 text-primary"></i> Admin Finding & Outcome:
                      </div>
                      <p className="text-muted mb-0">{d.adminResolution}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* File Dispute Modal */}
      {showFileModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 24, 20, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title font-serif fw-bold text-danger">File a Platform Incident Report</h5>
                <button type="button" className="btn-close" onClick={() => setShowFileModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Item Title or Listing Reference</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Sony WH-1000XM4 or Listing ID"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reported Member Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Member Name or City"
                      value={reportedUser}
                      onChange={(e) => setReportedUser(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category of Incident</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Misleading Item Condition">Misleading Item Condition / Hidden Defects</option>
                      <option value="Damaged in Courier Transit">Damaged during Courier Transit (Other City)</option>
                      <option value="Handover No-Show">Member Did Not Show Up / Did Not Ship Item</option>
                      <option value="Suspicious Member Behavior">Suspicious Member Behavior / Harassment</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Incident Details & Evidence Description</label>
                    <textarea
                      rows="3"
                      required
                      className="form-control"
                      placeholder="Explain what happened upon inspection and what photos you have..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Supporting Photo Evidence Count</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-control"
                      value={evidenceCount}
                      onChange={(e) => setEvidenceCount(e.target.value)}
                    />
                  </div>

                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowFileModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger px-4">
                    Submit Formal Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
