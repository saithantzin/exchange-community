import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';
import MemberProfileModal from '../../components/MemberProfileModal';

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

  // Partner profile modal state
  const [showPartnerProfile, setShowPartnerProfile] = useState(false);

  const partnerProfile = {
    name: exchange.partyB?.name || exchange.itemB?.ownerName || 'Partner',
    city: exchange.partyB?.city || exchange.itemB?.ownerCity || 'Other City',
    avatar: exchange.partyB?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    rating: 5.0,
    exchanges: 22,
    joined: 'Joined Aug 2023',
    phone: '09450987654 (Verified)',
    bio: 'Verified community trader participating in sustainable item exchanges across Myanmar.',
    items: [
      {
        id: 101,
        title: exchange.itemB?.title || 'Exchanged Item',
        image: exchange.itemB?.image,
        category: 'Electronics',
        condition: 'Like New'
      }
    ]
  };

  // Dispatch tracking modal state for intercity
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [courierName, setCourierName] = useState(exchange.partyA?.courier || 'Royal Express');
  const [trackingNumber, setTrackingNumber] = useState(exchange.partyA?.trackingNumber || '');
  const [receiptImage, setReceiptImage] = useState(exchange.partyA?.receiptImage || '');

  // Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('Misleading Item Condition');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeImage, setDisputeImage] = useState('');

  // Image lightbox preview modal
  const [previewImageModal, setPreviewImageModal] = useState(null);

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
      trackingNumber,
      receiptImage: receiptImage || null
    });
    setShowDispatchModal(false);
    setToastMessage('Courier tracking information & waybill slip updated successfully.');
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
      reason: disputeReason,
      evidenceImages: disputeImage ? [disputeImage] : []
    });
    setShowDisputeModal(false);
    setDisputeReason('');
    setDisputeImage('');
    setToastMessage('Report and photo evidence submitted. Platform moderators have been notified.');
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
                  <div className="small text-muted mb-1">
                    Waybill Tracking #: <span className="font-monospace text-dark fw-bold">{exchange.partyA?.trackingNumber || 'Pending Entry'}</span>
                  </div>

                  {exchange.partyA?.receiptImage && (
                    <div className="mt-2.5 pt-2 border-top">
                      <span className="text-muted small d-block mb-1" style={{ fontSize: '0.78rem' }}>
                        <i className="bi bi-receipt me-1"></i> Waybill Slip / Courier Receipt:
                      </span>
                      <img
                        src={exchange.partyA.receiptImage}
                        alt="Your Waybill Slip"
                        className="rounded border shadow-xs"
                        style={{ maxHeight: '65px', maxWidth: '120px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setPreviewImageModal(exchange.partyA.receiptImage)}
                        title="Click to view full receipt"
                      />
                    </div>
                  )}

                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => setShowDispatchModal(true)}
                      className="btn btn-sm btn-outline-primary py-1 px-3 d-inline-flex align-items-center gap-1.5"
                      style={{ fontSize: '0.80rem' }}
                    >
                      <i className="bi bi-box-seam"></i> {exchange.partyA?.trackingNumber ? 'Update Courier & Receipt' : 'Enter Courier Tracking & Slip'}
                    </button>
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
                  <div className="small text-muted mb-1">
                    Waybill Tracking #: <span className="font-monospace text-dark fw-bold">{exchange.partyB?.trackingNumber || 'Pending Entry'}</span>
                  </div>

                  {/* Partner's Dispatch Receipt Sample */}
                  <div className="mt-2.5 pt-2 border-top">
                    <span className="text-muted small d-block mb-1" style={{ fontSize: '0.78rem' }}>
                      <i className="bi bi-receipt me-1"></i> Partner Dispatch Receipt:
                    </span>
                    <img
                      src={exchange.partyB?.receiptImage || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80'}
                      alt="Partner Waybill Slip"
                      className="rounded border shadow-xs"
                      style={{ maxHeight: '65px', maxWidth: '120px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => setPreviewImageModal(exchange.partyB?.receiptImage || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80')}
                      title="Click to view full receipt"
                    />
                  </div>

                  {/* Direct Social Channels to contact partner */}
                  <div className="mt-2.5 pt-2 border-top">
                    <span className="text-muted small d-block mb-1.5" style={{ fontSize: '0.76rem' }}>
                      <i className="bi bi-chat-heart-fill me-1" style={{ color: '#7360F2' }}></i> Contact Partner (Social Channels):
                    </span>
                    <div className="d-flex flex-wrap gap-1.5">
                      <a
                        href={`viber://chat?number=${exchange.partyB?.viber || exchange.partyB?.phone || '09450987654'}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm py-0.5 px-2 rounded-pill text-white d-inline-flex align-items-center gap-1 text-decoration-none"
                        style={{ backgroundColor: '#7360F2', fontSize: '0.74rem' }}
                        title="Chat or call on Viber"
                      >
                        <i className="bi bi-telephone-fill"></i> Viber
                      </a>
                      <a
                        href={`https://t.me/${(exchange.partyB?.telegram || 'kyawzin_htet').replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm py-0.5 px-2 rounded-pill text-white d-inline-flex align-items-center gap-1 text-decoration-none"
                        style={{ backgroundColor: '#229ED9', fontSize: '0.74rem' }}
                        title="Chat on Telegram"
                      >
                        <i className="bi bi-telegram"></i> Telegram
                      </a>
                      <a
                        href={exchange.partyB?.facebook || 'https://facebook.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm py-0.5 px-2 rounded-pill text-white d-inline-flex align-items-center gap-1 text-decoration-none"
                        style={{ backgroundColor: '#1877F2', fontSize: '0.74rem' }}
                        title="View Facebook Profile"
                      >
                        <i className="bi bi-facebook"></i> Facebook
                      </a>
                      <a
                        href={`tel:${exchange.partyB?.phone || '09450987654'}`}
                        className="btn btn-sm btn-outline-secondary py-0.5 px-2 rounded-pill d-inline-flex align-items-center gap-1 text-decoration-none"
                        style={{ fontSize: '0.74rem' }}
                        title="Direct phone call"
                      >
                        <i className="bi bi-phone"></i> Call
                      </a>
                    </div>
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
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    <span className="text-muted small" style={{ fontSize: '0.86rem' }}>
                      From: <strong>{exchange.itemB?.ownerName}</strong> ({exchange.itemB?.ownerCity || 'Other City'})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPartnerProfile(true)}
                      className="btn btn-sm btn-outline-secondary py-0.5 px-2 rounded-pill d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '0.76rem' }}
                    >
                      <i className="bi bi-person-lines-fill text-primary"></i> View Partner Profile
                    </button>
                  </div>
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
                <h4 className="font-serif fw-bold text-dark mb-2">Intercity Two-Sided Completion</h4>
                
                {/* Notice if Partner already confirmed receipt first */}
                {!exchange.partyA?.confirmedReceipt && exchange.partyB?.confirmedReceipt && (
                  <div className="alert alert-warning py-2.5 px-3 mx-auto mb-3 text-start d-flex align-items-center gap-2" style={{ maxWidth: '640px', fontSize: '0.86rem' }}>
                    <i className="bi bi-info-circle-fill text-warning-emphasis fs-5"></i>
                    <div>
                      <strong>{exchange.partyB?.name || 'Partner'} has already confirmed receipt of your item!</strong>
                      <div>Once you inspect the parcel and click Confirm Receipt below, this exchange will be completed immediately.</div>
                    </div>
                  </div>
                )}

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
                  <div className="alert alert-info py-3 mx-auto text-start" style={{ maxWidth: '640px' }}>
                    <div className="d-flex align-items-center gap-2.5 mb-2">
                      <i className="bi bi-check-circle-fill text-success fs-4"></i>
                      <div>
                        <strong className="text-dark">You have verified and confirmed receipt! (1 of 2 Confirmed)</strong>
                        <div className="small text-muted">
                          Waiting for {exchange.partyB?.name || exchange.itemB?.ownerName || 'your partner'} to inspect and confirm receipt of your dispatched parcel to finalize this exchange.
                        </div>
                      </div>
                    </div>

                    {!exchange.partyB?.confirmedReceipt && (
                      <div className="mt-3 pt-3 border-top text-center">
                        <span className="text-muted small d-block mb-2">
                          Ready to test the entire process to completion?
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            confirmReceipt(exchange.id, 'partyB', 'Partner verified parcel arrival in other city.');
                            setToastMessage('Partner verified and confirmed receipt! Both members confirmed. Exchange is 100% Completed!');
                            setTimeout(() => setToastMessage(null), 5000);
                          }}
                          className="btn btn-sm btn-success px-4 py-2 fw-medium shadow-xs"
                          style={{ fontSize: '0.86rem' }}
                        >
                          <i className="bi bi-patch-check-fill me-1.5"></i>
                          Simulate Partner ({exchange.partyB?.name || 'Partner'}) Confirming Receipt (Complete Exchange)
                        </button>
                      </div>
                    )}
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

                  {/* Courier Receipt / Waybill Slip Upload */}
                  <div className="mb-2">
                    <label className="form-label small fw-semibold d-flex align-items-center justify-content-between">
                      <span><i className="bi bi-camera me-1"></i> Courier Receipt Slip / Waybill Photo</span>
                      <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>Proof of dispatch</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control form-control-sm"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setReceiptImage(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.74rem' }}>
                      Photograph the paper waybill slip or dispatch voucher given by the courier office.
                    </small>

                    {receiptImage ? (
                      <div className="mt-2.5 p-2 bg-light rounded border position-relative d-inline-block">
                        <img
                          src={receiptImage}
                          alt="Waybill Preview"
                          className="rounded"
                          style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                        <button
                          type="button"
                          onClick={() => setReceiptImage('')}
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 py-0 px-1.5"
                          title="Remove photo"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReceiptImage('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80')}
                        className="btn btn-sm btn-link p-0 text-muted mt-1.5 text-decoration-none d-inline-block"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <i className="bi bi-image me-1"></i> + Insert sample courier receipt slip
                      </button>
                    )}
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

                  {/* Photo Evidence Upload (Optional) */}
                  <div className="mb-2">
                    <label className="form-label small fw-semibold d-flex align-items-center justify-content-between">
                      <span><i className="bi bi-camera me-1"></i> Upload Photo Evidence (Optional)</span>
                      <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.70rem' }}>Optional</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control form-control-sm"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setDisputeImage(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <small className="text-muted d-block mt-1" style={{ fontSize: '0.74rem' }}>
                      Upload photos showing defects, packaging tears, broken seals, or waybill barcode.
                    </small>

                    {disputeImage ? (
                      <div className="mt-2.5 p-2 bg-light rounded border position-relative d-inline-block">
                        <img
                          src={disputeImage}
                          alt="Dispute Evidence Preview"
                          className="rounded"
                          style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }}
                        />
                        <button
                          type="button"
                          onClick={() => setDisputeImage('')}
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 py-0 px-1.5"
                          title="Remove photo"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDisputeImage('https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80')}
                        className="btn btn-sm btn-link p-0 text-muted mt-1.5 text-decoration-none d-inline-block"
                        style={{ fontSize: '0.78rem' }}
                      >
                        <i className="bi bi-image me-1"></i> + Insert sample damage photo
                      </button>
                    )}
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

      {/* Lightbox Image Preview Modal */}
      {previewImageModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(20, 15, 10, 0.85)', backdropFilter: 'blur(5px)', zIndex: 1100 }}
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-transparent border-0 text-center position-relative">
              <button
                type="button"
                className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle shadow"
                onClick={() => setPreviewImageModal(null)}
                style={{ width: '38px', height: '38px' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
              <img
                src={previewImageModal}
                alt="Enlarged View"
                className="img-fluid rounded-3 shadow-lg mx-auto"
                style={{ maxHeight: '80vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Member Profile Modal */}
      <MemberProfileModal
        show={showPartnerProfile}
        onClose={() => setShowPartnerProfile(false)}
        member={partnerProfile}
        isIntercity={isIntercity}
      />

    </div>
  );
}
