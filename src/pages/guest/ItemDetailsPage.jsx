import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useExchange } from '../../context/ExchangeContext';
import { useAuth } from '../../context/AuthContext';
import ExchangeRequestModal from '../../components/ExchangeRequestModal';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, myItems, sendExchangeRequest } = useExchange();
  const { currentUser, isLoggedIn } = useAuth();

  // Combine items to find
  const allItems = [...items, ...myItems];
  const item = allItems.find(i => String(i.id) === String(id)) || items[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const imagesList = item.images && item.images.length > 0 ? item.images : [item.image];

  const handleProposeClick = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/item/${item.id}` } });
    } else {
      setIsProposalModalOpen(true);
    }
  };

  const handleProposalSuccess = (proposalData) => {
    sendExchangeRequest({
      recipient: item.owner,
      requestedItem: item,
      offeredItem: { title: proposalData.offeredItem, city: currentUser?.city, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80' },
      handoverMethod: proposalData.handoverType,
      message: `I'd love to exchange my item for your ${item.title}.`
    });
    setToastMessage(`Your proposal has been sent to ${item.owner.name}! Waiting for review.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh' }}>
      <div className="container-xl">
        
        {/* Toast */}
        {toastMessage && (
          <div
            className="position-fixed bottom-0 end-0 m-4 p-3 bg-white border rounded-3 shadow-lg d-flex align-items-center gap-3"
            style={{ zIndex: 1090, maxWidth: '420px', borderColor: 'var(--primary-brown)', borderLeftWidth: '6px' }}
          >
            <i className="bi bi-check-circle-fill fs-4 text-success"></i>
            <div className="flex-grow-1" style={{ fontSize: '0.85rem' }}>
              <div className="fw-bold">Exchange Proposal Sent</div>
              <div className="text-muted">{toastMessage}</div>
            </div>
            <button onClick={() => setToastMessage(null)} className="btn btn-sm btn-link text-muted p-0">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb" style={{ fontSize: '0.84rem' }}>
            <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/browse" className="text-muted text-decoration-none">Browse Items</Link></li>
            <li className="breadcrumb-item active text-dark" aria-current="page">{item.title}</li>
          </ol>
        </nav>

        <div className="row g-4 g-lg-5">
          
          {/* Left Column: Image Gallery */}
          <div className="col-12 col-lg-6">
            <div className="position-relative rounded-3 overflow-hidden shadow-sm bg-white border mb-3" style={{ height: '420px', borderColor: 'var(--border-light)' }}>
              <img
                src={imagesList[activeImageIndex] || item.image}
                alt={item.title}
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />

              <span
                className="badge-condition"
                style={{
                  backgroundColor: item.conditionBg || '#F9F1E2',
                  color: item.conditionColor || '#87571B',
                  fontSize: '0.8rem',
                  padding: '6px 14px'
                }}
              >
                {item.condition}
              </span>

              <span className="badge-city" style={{ fontSize: '0.8rem', padding: '5px 12px' }}>
                <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                {item.city}
              </span>
            </div>

            {/* Thumbnails if multiple images exist */}
            {imagesList.length > 1 && (
              <div className="d-flex gap-2">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className="p-1 rounded bg-white border"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderColor: activeImageIndex === idx ? 'var(--primary-brown)' : 'var(--border-light)',
                      borderWidth: activeImageIndex === idx ? '2px' : '1px'
                    }}
                  >
                    <img src={img} alt="" className="w-100 h-100 rounded" style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Platform Guarantee & Inspection Notice */}
            <div className="mt-4 p-4 rounded-3 bg-white border" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-shield-check text-brown fs-5" style={{ color: 'var(--primary-brown)' }}></i>
                <span className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>Platform Handover Rule</span>
              </div>
              <p className="mb-0 text-muted" style={{ fontSize: '0.86rem', lineHeight: 1.65 }}>
                Inspect all physical defects before completing the exchange. Both members must independently click "Confirm Receipt" in their dashboard before ownership is updated.
              </p>
            </div>
          </div>

          {/* Right Column: Information, Defects, Owner & Actions */}
          <div className="col-12 col-lg-6">
            
            {/* Category & Date */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge rounded-pill px-3 py-1.5" style={{ backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)', fontSize: '0.78rem' }}>
                {item.categoryName}
              </span>
              <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                Listed {item.createdAt}
              </span>
            </div>

            <h1 className="font-serif fw-bold mb-3" style={{ fontSize: '2.1rem', lineHeight: 1.3, color: 'var(--text-main)' }}>
              {item.title}
            </h1>

            {/* Desired Item Box */}
            <div
              className="p-4 rounded-3 mb-4"
              style={{
                backgroundColor: 'var(--bg-accent-banner)',
                border: '1px solid var(--border-medium)'
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <i className="bi bi-arrow-left-right text-brown fs-6" style={{ color: 'var(--primary-brown)' }}></i>
                <span className="fw-bold text-uppercase" style={{ fontSize: '0.78rem', color: 'var(--primary-brown)', letterSpacing: '0.1em' }}>
                  Wanted in Exchange:
                </span>
              </div>
              <p className="mb-0 fw-semibold text-dark" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                {item.exchangePreference}
              </p>
            </div>

            {/* Defects Disclosure (Section 2.C & 3.C) */}
            <div className="p-4 rounded-3 bg-white border mb-4" style={{ borderColor: 'var(--border-light)' }}>
              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.92rem' }}>
                <i className="bi bi-exclamation-circle text-warning fs-6"></i> Disclosed Cosmetic Wear & Known Defects:
              </h6>
              <p className="mb-0 text-muted" style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>
                {item.defects || 'Owner reported no functional or cosmetic defects. Daylight inspection recommended.'}
              </p>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.94rem' }}>
                Item Overview:
              </h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.92rem', lineHeight: 1.8 }}>
                {item.description}
              </p>
            </div>

            {/* Handover Options */}
            <div className="p-4 rounded-3 bg-white border mb-4" style={{ borderColor: 'var(--border-light)' }}>
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.90rem' }}>
                <i className="bi bi-box-seam me-1.5 text-primary"></i> Handover Options:
              </h6>
              <div className="text-muted mb-2.5" style={{ fontSize: '0.88rem', lineHeight: 1.65 }}>
                • <strong>Same City:</strong> Safe in-person meetup at a public location in {item.city || 'local area'} (no courier needed).<br />
                • <strong>Other Cities:</strong> Express courier freight with Two-Sided Completion receipt verification.
              </div>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-geo-alt me-1"></i> Local In-Person Meetup
                </span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-truck me-1"></i> Intercity Express Courier
                </span>
              </div>
            </div>

            {/* Owner Profile Card (Without private phone or address) */}
            <div className="p-4 rounded-3 bg-white border mb-4 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.owner.avatar}
                    alt={item.owner.name}
                    className="rounded-circle"
                    style={{ width: '52px', height: '52px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.98rem' }}>
                      {item.owner.name}
                    </h6>
                    <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {item.owner.city} • {item.owner.joined}
                    </span>
                    <div className="d-flex align-items-center gap-2 mt-1.5">
                      <span className="badge bg-light text-dark border px-2.5 py-1" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-check-circle-fill text-success me-1"></i> {item.owner.exchanges} completed swaps
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <span className="badge bg-warning text-dark fw-bold px-3 py-1.5" style={{ fontSize: '0.92rem' }}>
                    {item.owner.rating} ★
                  </span>
                  <span className="d-block text-muted mt-1" style={{ fontSize: '0.74rem' }}>
                    Community Trust
                  </span>
                </div>
              </div>
              
              {/* Privacy Notice */}
              <div className="mt-3 pt-3 border-top text-muted" style={{ fontSize: '0.78rem', lineHeight: 1.55 }}>
                <i className="bi bi-lock-fill me-1"></i> Phone numbers and street addresses are kept confidential until an exchange is mutually accepted.
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="d-flex gap-3">
              <button
                type="button"
                onClick={handleProposeClick}
                className="btn-nordic-primary flex-grow-1 py-3 shadow-sm"
              >
                {isLoggedIn ? (
                  <span><i className="bi bi-send-fill me-2"></i> Send Exchange Proposal</span>
                ) : (
                  <span><i className="bi bi-box-arrow-in-right me-2"></i> Log In to Propose Exchange</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => alert(`Item "${item.title}" reported to moderators for verification.`)}
                className="btn btn-outline-secondary px-3 py-3"
                title="Report Inaccurate Listing"
              >
                <i className="bi bi-flag"></i>
              </button>
            </div>

            {!isLoggedIn && (
              <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                Guests can browse freely. You must be a verified member to propose a trade.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* Exchange Request Modal */}
      <ExchangeRequestModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        targetItem={item}
        currentUser={currentUser || { name: 'Member', city: 'Mandalay (MDY)' }}
        onProposalSuccess={handleProposalSuccess}
      />
    </div>
  );
}
