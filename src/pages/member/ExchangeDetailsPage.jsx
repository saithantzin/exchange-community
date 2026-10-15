import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';

export default function ExchangeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { exchanges, completeExchange, confirmReceipt, updateCourierDispatch, fileDispute } = useExchange();

  const exchange = exchanges.find(e => e.id === id) || exchanges[0];

  const isIntercity = Boolean(
    exchange.isIntercity ||
    exchange.handoverMethod?.toLowerCase().includes('courier') ||
    exchange.handoverMethod?.toLowerCase().includes('express') ||
    (exchange.partyA && exchange.partyB) ||
    (exchange.itemA?.ownerCity && exchange.itemB?.ownerCity && exchange.itemA.ownerCity !== exchange.itemB.ownerCity)
  );

  const [toastMessage, setToastMessage] = useState(null);

  // Dispatch tracking modal state for intercity
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [courierName, setCourierName] = useState(exchange.partyA?.courier || 'Royal Express');
  const [trackingNumber, setTrackingNumber] = useState(exchange.partyA?.trackingNumber || '');

  // Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('Misleading Item Condition');
  const [disputeReason, setDisputeReason] = useState('');

  // Handle direct in-person completion (Same City)
  const handleCompleteInPerson = () => {
    completeExchange(exchange.id, 'In-person handover verified by members.');
    setToastMessage('Exchange marked as completed! Thank you for participating.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle two-sided receipt confirmation (Other City / Intercity)
  const handleConfirmIntercityReceipt = () => {
    confirmReceipt(exchange.id, 'partyA', 'Verified item condition from courier parcel.');
    setToastMessage('Receipt confirmed! Once both sides verify, status is finalized.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle courier dispatch submission (Other City)
  const handleSaveDispatch = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      alert('Please enter a valid courier tracking or waybill number.');
      return;
    }
    updateCourierDispatch(exchange.id, 'partyA', {
      courier: courierName,
      trackingNumber
    });
    setShowDispatchModal(false);
    setToastMessage('Courier tracking information updated successfully.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileDispute = (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      alert('Please state the reason for this problem report.');
      return;
    }
    fileDispute({
      exchangeId: exchange.id,
      itemTitle: exchange.itemB?.title || 'Exchanged Item',
      reportedUser: exchange.itemB?.ownerName || 'Partner',
      category: disputeCategory,
      reason: disputeReason
    });
    setShowDisputeModal(false);
    setToastMessage('Report submitted. Platform moderators have been notified.');
    setTimeout(() => setToastMessage(null), 5000);
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
            <i className="bi bi-check-circle-fill fs-4 text-success"></i>
            <div className="flex-grow-1" style={{ fontSize: '0.85rem' }}>
              <div className="fw-bold">Exchange Status</div>
              <div className="text-muted">{toastMessage}</div>
            </div>
            <button onClick={() => setToastMessage(null)} className="btn btn-sm btn-link text-muted p-0">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Breadcrumb & Header */}
        <div className="mb-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1" style={{ fontSize: '0.82rem' }}>
              <li className="breadcrumb-item"><Link to="/dashboard" className="text-muted text-decoration-none">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/history" className="text-muted text-decoration-none">Exchanges</Link></li>
              <li className="breadcrumb-item active text-dark">{exchange.id}</li>
            </ol>
          </nav>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <span className="section-pre-title mb-0">
                {isIntercity ? 'Intercity Courier Exchange (Other City)' : 'Local Community Exchange (In-Person)'}
              </span>
              <h1 className="font-serif fw-bold h3 mb-0 text-dark">
                Exchange Details: #{exchange.id}
              </h1>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge rounded-pill px-3 py-2 fw-semibold"
                style={{
                  backgroundColor: exchange.isCompleted ? '#EAF2EC' : '#F9F1E2',
                  color: exchange.isCompleted ? '#2E693D' : '#87571B',
                  fontSize: '0.86rem'
                }}
              >
                Status: {exchange.status || (exchange.isCompleted ? 'Completed' : 'In Progress')}
              </span>
              <button
                type="button"
                onClick={() => setShowDisputeModal(true)}
                className="btn btn-sm btn-outline-danger"
              >
                <i className="bi bi-flag"></i> Report Problem
              </button>
            </div>
          </div>
        </div>

        {/* Overview Banner */}
        <div className="bg-white p-4 rounded-3 border mb-4 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: isIntercity ? '#2C5B7C' : 'var(--primary-brown)',
                    fontSize: '1.15rem'
                  }}
                >
                  <i className={`bi ${isIntercity ? 'bi-truck' : 'bi-geo-alt'}`}></i>
                </div>
                <div>
                  <span className="text-muted small d-block" style={{ fontSize: '0.78rem' }}>Handover Type:</span>
                  <strong className="text-dark" style={{ fontSize: '0.92rem' }}>
                    {isIntercity ? 'Intercity Courier / Express' : 'Local In-Person Meetup'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-muted border flex-shrink-0"
                  style={{ width: '44px', height: '44px', backgroundColor: '#F8F9FA', fontSize: '1.15rem' }}
                >
                  <i className={`bi ${isIntercity ? 'bi-signpost-split' : 'bi-pin-map'}`}></i>
                </div>
                <div>
                  <span className="text-muted small d-block" style={{ fontSize: '0.78rem' }}>
                    {isIntercity ? 'Transit Route:' : 'Meetup Location:'}
                  </span>
                  <span className="text-dark fw-medium" style={{ fontSize: '0.90rem' }}>
                    {isIntercity
                      ? (exchange.courierTracking?.route || `${exchange.itemA?.ownerCity || 'Mandalay'} ⇄ ${exchange.itemB?.ownerCity || 'Yangon'} Express Freight`)
                      : (exchange.meetupLocation || 'Convenient public location in city')}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-2.5">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-muted border flex-shrink-0"
                  style={{ width: '44px', height: '44px', backgroundColor: '#F8F9FA', fontSize: '1.15rem' }}
                >
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div>
                  <span className="text-muted small d-block" style={{ fontSize: '0.78rem' }}>Timeline:</span>
                  <span className="text-dark fw-medium" style={{ fontSize: '0.88rem' }}>
                    Initiated: {exchange.initiatedDate}
                    {exchange.completedDate ? ` • Finished: ${exchange.completedDate}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* INTERCITY ONLY: Courier Progress & Two-Sided Completion */}
        {/* ======================================================== */}
        {isIntercity && (
          <div className="bg-white p-4 p-md-5 rounded-3 border mb-4 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-2">
              <div>
                <span className="section-pre-title text-primary mb-0">
                  <i className="bi bi-truck me-1"></i> Other City Exchange Process
                </span>
                <h4 className="font-serif fw-bold text-dark mb-0">Two-Sided Completion Progress</h4>
              </div>
              <button
                onClick={() => setShowDispatchModal(true)}
                className="btn btn-sm btn-outline-primary py-1.5 px-3"
                style={{ fontSize: '0.82rem' }}
              >
                <i className="bi bi-pencil me-1"></i> Update Waybill / Tracking
              </button>
            </div>

            {/* Courier Freight Stages */}
            <div className="row g-2 text-center mb-4">
              <div className="col-12 col-sm">
                <div className="p-2 rounded bg-success-subtle text-success fw-semibold small">
                  <i className="bi bi-check2-circle me-1"></i> 1. Proposal Accepted
                </div>
              </div>
              <div className="col-12 col-sm">
                <div className={`p-2 rounded fw-semibold small ${exchange.partyA?.dispatched && exchange.partyB?.dispatched ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}>
                  <i className="bi bi-box-seam me-1"></i> 2. Courier Dispatched
                </div>
              </div>
              <div className="col-12 col-sm">
                <div className={`p-2 rounded fw-semibold small ${exchange.status === 'In Transit' || exchange.status === 'Partially Received' || exchange.isCompleted ? 'bg-primary-subtle text-primary' : 'bg-light text-muted'}`}>
                  <i className="bi bi-truck me-1"></i> 3. Express In Transit
                </div>
              </div>
              <div className="col-12 col-sm">
                <div className={`p-2 rounded fw-semibold small ${exchange.isCompleted ? 'bg-success-subtle text-success' : (exchange.partyA?.confirmedReceipt || exchange.partyB?.confirmedReceipt ? 'bg-warning-subtle text-warning-emphasis' : 'bg-light text-muted')}`}>
                  <i className="bi bi-people me-1"></i> 4. Two-Sided Receipt
                </div>
              </div>
              <div className="col-12 col-sm">
                <div className={`p-2 rounded fw-semibold small ${exchange.isCompleted ? 'bg-success text-white' : 'bg-light text-muted'}`}>
                  <i className="bi bi-patch-check-fill me-1"></i> 5. Completed
                </div>
              </div>
            </div>

            {/* Two-Sided Cards (Member A vs Member B) */}
            <div className="row g-4 mb-4">
              {/* Member A (You) */}
              <div className="col-12 col-md-6">
                <div className="p-3.5 rounded-3 border h-100" style={{ backgroundColor: '#FAF8F5', borderColor: 'var(--border-medium)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="text-dark">
                      <i className="bi bi-person-circle me-1 text-primary"></i> You ({exchange.partyA?.city || exchange.itemA?.ownerCity || 'Your City'})
                    </strong>
                    {exchange.partyA?.confirmedReceipt ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1" style={{ fontSize: '0.74rem' }}>
                        <i className="bi bi-check-circle-fill me-1"></i> Confirmed Receipt
                      </span>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2.5 py-1" style={{ fontSize: '0.74rem' }}>
                        <i className="bi bi-hourglass-split me-1"></i> Awaiting Your Confirmation
                      </span>
                    )}
                  </div>
                  <div className="small text-muted mb-1">
                    Dispatched Parcel: <strong>{exchange.itemA?.title}</strong>
                  </div>
                  <div className="small text-muted mb-1">
                    Courier: <strong>{exchange.partyA?.courier || 'Royal Express'}</strong>
                  </div>
                  <div className="small text-muted">
                    Waybill Tracking #: <span className="font-monospace text-dark fw-bold">{exchange.partyA?.trackingNumber || 'Pending Entry'}</span>
                  </div>
                </div>
              </div>

              {/* Member B (Partner) */}
              <div className="col-12 col-md-6">
                <div className="p-3.5 rounded-3 border h-100" style={{ backgroundColor: '#FAF8F5', borderColor: 'var(--border-medium)' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="text-dark">
                      <i className="bi bi-person me-1 text-secondary"></i> {exchange.partyB?.name || exchange.itemB?.ownerName || 'Partner'} ({exchange.partyB?.city || exchange.itemB?.ownerCity || 'Other City'})
                    </strong>
                    {exchange.partyB?.confirmedReceipt ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1" style={{ fontSize: '0.74rem' }}>
                        <i className="bi bi-check-circle-fill me-1"></i> Confirmed Receipt
                      </span>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2.5 py-1" style={{ fontSize: '0.74rem' }}>
                        <i className="bi bi-hourglass-split me-1"></i> Awaiting Partner Confirmation
                      </span>
                    )}
                  </div>
                  <div className="small text-muted mb-1">
                    Dispatched Parcel: <strong>{exchange.itemB?.title}</strong>
                  </div>
                  <div className="small text-muted mb-1">
                    Courier: <strong>{exchange.partyB?.courier || 'Elite Cargo Express'}</strong>
                  </div>
                  <div className="small text-muted">
                    Waybill Tracking #: <span className="font-monospace text-dark fw-bold">{exchange.partyB?.trackingNumber || 'Pending Entry'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Sided Completion Rule Explanation */}
            <div className="p-3 rounded-3 bg-light border text-muted small d-flex align-items-start gap-2.5">
              <i className="bi bi-info-circle-fill text-primary mt-0.5 fs-5"></i>
              <div style={{ lineHeight: 1.6 }}>
                <strong>Why Two-Sided Confirmation is required for Other Cities:</strong> Since items are shipped between different cities via courier freight, no intercity exchange is marked completed until <strong>both members independently inspect their received parcel and click Confirm Receipt</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Side-by-side Items Comparison Card */}
        <div className="row g-4 mb-4">
          {/* Item A (You Provide) */}
          <div className="col-12 col-lg-6">
            <div className="bg-white p-4 rounded-3 border h-100 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <span className="badge bg-light text-dark border mb-3 px-3 py-1.5" style={{ fontSize: '0.78rem' }}>
                Item You Give
              </span>
              <div className="d-flex align-items-center gap-3 pb-3 border-bottom mb-3">
                <img
                  src={exchange.itemA?.image}
                  alt={exchange.itemA?.title}
                  className="rounded"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
                <div>
                  <h5 className="font-serif fw-bold text-dark mb-1" style={{ fontSize: '1.2rem' }}>
                    {exchange.itemA?.title}
                  </h5>
                  <span className="text-muted small" style={{ fontSize: '0.86rem' }}>
                    From: <strong>{exchange.itemA?.ownerName}</strong> ({exchange.itemA?.ownerCity || 'Local'})
                  </span>
                </div>
              </div>
              <p className="text-muted mb-0 small" style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
                {isIntercity
                  ? 'Please package securely and dispatch via recorded courier service with tracking number.'
                  : 'Please bring this item to the agreed public meetup location in clean, inspected condition.'}
              </p>
            </div>
          </div>

          {/* Item B (Partner Provides) */}
          <div className="col-12 col-lg-6">
            <div className="bg-white p-4 rounded-3 border h-100 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <span className="badge bg-light text-dark border mb-3 px-3 py-1.5" style={{ fontSize: '0.78rem' }}>
                Item You Receive
              </span>
              <div className="d-flex align-items-center gap-3 pb-3 border-bottom mb-3">
                <img
                  src={exchange.itemB?.image}
                  alt={exchange.itemB?.title}
                  className="rounded"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
                <div>
                  <h5 className="font-serif fw-bold text-dark mb-1" style={{ fontSize: '1.2rem' }}>
                    {exchange.itemB?.title}
                  </h5>
                  <span className="text-muted small" style={{ fontSize: '0.86rem' }}>
                    From: <strong>{exchange.itemB?.ownerName}</strong> ({exchange.itemB?.ownerCity || 'Other City'})
                  </span>
                </div>
              </div>
              <p className="text-muted mb-0 small" style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
                {isIntercity
                  ? 'Verify parcel contents upon courier delivery before providing your receipt confirmation.'
                  : 'Inspect this item carefully during the in-person meeting before finalizing the swap.'}
              </p>
            </div>
          </div>
        </div>

        {/* Completion Action Box */}
        {!exchange.isCompleted ? (
          <div className="bg-white p-4 p-md-5 rounded-3 border text-center shadow-sm mb-5" style={{ borderColor: 'var(--border-light)' }}>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 text-white shadow-sm"
              style={{
                width: '58px',
                height: '58px',
                backgroundColor: isIntercity ? '#2C5B7C' : 'var(--primary-brown)',
                fontSize: '1.5rem'
              }}
            >
              <i className={`bi ${isIntercity ? 'bi-patch-check' : 'bi-arrow-repeat'}`}></i>
            </div>

            {/* Condition 1: Intercity Exchange Action */}
            {isIntercity ? (
              <>
                <h4 className="font-serif fw-bold text-dark mb-2">Intercity Receipt Confirmation</h4>
                {!exchange.partyA?.confirmedReceipt ? (
                  <>
                    <p className="text-muted mx-auto mb-4" style={{ maxWidth: '580px', fontSize: '0.94rem', lineHeight: 1.75 }}>
                      Once you receive the courier package from {exchange.itemB?.ownerName}, physically inspect the item to verify it matches description. Then click below to confirm receipt.
                    </p>
                    <button
                      type="button"
                      onClick={handleConfirmIntercityReceipt}
                      className="btn py-3 px-5 fw-semibold shadow-sm text-white"
                      style={{ backgroundColor: '#2C5B7C', fontSize: '1rem', borderRadius: '8px' }}
                    >
                      <i className="bi bi-check2-circle me-2"></i> Confirm Receipt &amp; Verify Parcel
                    </button>
                  </>
                ) : (
                  <div className="alert alert-info py-3 mx-auto" style={{ maxWidth: '640px' }}>
                    <i className="bi bi-hourglass-split me-2 fs-5"></i>
                    <strong>You have verified and confirmed receipt!</strong>
                    <div className="mt-1 small">
                      Waiting for {exchange.partyB?.name || exchange.itemB?.ownerName || 'your partner'} to inspect and confirm receipt of your dispatched parcel to finalize this exchange.
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Condition 2: Local In-Person Handover Action */
              <>
                <h4 className="font-serif fw-bold text-dark mb-2">Ready to Complete This Exchange?</h4>
                <p className="text-muted mx-auto mb-4" style={{ maxWidth: '540px', fontSize: '0.94rem', lineHeight: 1.75 }}>
                  Once you have met your exchange partner in person, inspected the items, and handed them over, click the button below to mark this swap as completed.
                </p>
                <button
                  type="button"
                  onClick={handleCompleteInPerson}
                  className="btn-nordic-primary py-3 px-5 shadow-sm"
                  style={{ fontSize: '1rem' }}
                >
                  <i className="bi bi-check-circle-fill me-2"></i> Mark Exchange as Completed
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="p-4 p-md-5 rounded-3 border text-center shadow-sm mb-5" style={{ backgroundColor: '#EAF2EC', borderColor: '#C3E2CB' }}>
            <i className="bi bi-patch-check-fill text-success fs-1 mb-2 d-block"></i>
            <h4 className="font-serif fw-bold text-success mb-2">Exchange Successfully Completed!</h4>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '520px', fontSize: '0.94rem', lineHeight: 1.7 }}>
              {isIntercity
                ? 'Both members have confirmed receipt of their parcels via intercity courier. Thank you for circular community exchange!'
                : 'Both items have been swapped successfully in person. Thank you for giving pre-loved items a second life!'}
            </p>
            <Link to="/history" className="btn btn-outline-success px-4 py-2" style={{ fontSize: '0.90rem' }}>
              <i className="bi bi-clock-history me-1"></i> View in Exchange History
            </Link>
          </div>
        )}

      </div>

      {/* Courier Dispatch Waybill Modal (Intercity) */}
      {showDispatchModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 24, 20, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title font-serif fw-bold text-dark">
                  <i className="bi bi-truck me-2 text-primary"></i> Update Courier Dispatch Info
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDispatchModal(false)}></button>
              </div>
              <form onSubmit={handleSaveDispatch}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Courier / Express Service</label>
                    <select
                      className="form-select form-select-sm"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                    >
                      <option value="Royal Express">Royal Express</option>
                      <option value="Elite Cargo Express">Elite Cargo Express</option>
                      <option value="Aung Express">Aung Express</option>
                      <option value="Speed Express Freight">Speed Express Freight</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Airway Bill / Tracking Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RX-8921-MY"
                      className="form-control form-control-sm font-monospace"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    <small className="text-muted">Recorded so both members and platform admins can track intercity transport.</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowDispatchModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Save Dispatch Info
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 24, 20, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title font-serif fw-bold text-danger">Report Problem with Exchange</h5>
                <button type="button" className="btn-close" onClick={() => setShowDisputeModal(false)}></button>
              </div>
              <form onSubmit={handleFileDispute}>
                <div className="modal-body p-4">
                  <p className="text-muted small mb-3" style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
                    If the item differs significantly from the listing, has undisclosed damage, or the other party did not show up/ship, let moderators know:
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nature of Issue</label>
                    <select
                      className="form-select form-select-sm"
                      value={disputeCategory}
                      onChange={(e) => setDisputeCategory(e.target.value)}
                    >
                      <option value="Misleading Item Condition">Misleading Item Condition / Hidden Defects</option>
                      <option value="Damaged in Courier Transit">Damaged in Courier Transit</option>
                      <option value="Handover No-Show">Member Did Not Show Up / Did Not Ship</option>
                      <option value="Suspicious Member Behavior">Suspicious Member Behavior / Harassment</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Explanation</label>
                    <textarea
                      rows="3"
                      required
                      className="form-control form-control-sm"
                      placeholder="Provide details about what was wrong upon inspection..."
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowDisputeModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-danger">
                    Submit Dispute
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
