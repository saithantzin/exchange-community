import React from 'react';
import { Link } from 'react-router-dom';

/**
 * MemberProfileModal Component
 * Allows users to inspect the full verified profile of an exchange requester or partner
 * before or after accepting an exchange request.
 */
export default function MemberProfileModal({
  show,
  onClose,
  member,
  onAccept = null,
  requestStatus = null,
  isIntercity = false
}) {
  if (!show || !member) return null;

  const defaultItems = [
    {
      id: 1,
      title: 'Sony WH-1000XM4 Noise Canceling Headphones',
      category: 'Electronics',
      condition: 'Like New',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
    },
    {
      id: 2,
      title: 'Design & Architecture Hardcover Book Collection',
      category: 'Books',
      condition: 'Good',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80'
    }
  ];

  const memberItems = member.items || defaultItems;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(30, 20, 15, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1080 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          
          {/* Modal Header */}
          <div
            className="modal-header border-bottom py-3 px-4"
            style={{ backgroundColor: 'var(--bg-warm, #F9F6F0)', borderColor: 'var(--border-light, #EBE2D8)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <span className="badge px-2.5 py-1 rounded-pill" style={{ backgroundColor: '#EAF2EC', color: '#2E693D', fontSize: '0.78rem' }}>
                <i className="bi bi-shield-check me-1"></i> Verified Community Member
              </span>
              {isIntercity && (
                <span className="badge px-2.5 py-1 rounded-pill" style={{ backgroundColor: '#E3EDF6', color: '#1B4D7E', fontSize: '0.78rem' }}>
                  <i className="bi bi-truck me-1"></i> Intercity Courier Ready
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4" style={{ backgroundColor: '#ffffff' }}>
            
            {/* Profile Overview Card */}
            <div
              className="p-3.5 rounded-3 mb-4 border d-flex flex-column flex-sm-row align-items-center gap-3.5 text-center text-sm-start"
              style={{ backgroundColor: '#FAF8F5', borderColor: 'var(--border-light, #EBE2D8)' }}
            >
              <img
                src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'}
                alt={member.name}
                className="rounded-circle border shadow-sm flex-shrink-0"
                style={{ width: '84px', height: '84px', objectFit: 'cover', borderColor: 'var(--border-medium, #DDD1BF)' }}
              />
              <div className="flex-grow-1">
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-sm-start gap-2 mb-1">
                  <h4 className="font-serif fw-bold text-dark mb-0">{member.name}</h4>
                  <span className="badge bg-success text-white px-2 py-0.5 rounded-pill" style={{ fontSize: '0.74rem' }}>
                    <i className="bi bi-patch-check-fill me-1"></i> ID Verified
                  </span>
                </div>
                <div className="text-muted small mb-2" style={{ fontSize: '0.84rem' }}>
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  <strong>{member.city || 'Myanmar'}</strong>
                  <span className="mx-2">•</span>
                  <i className="bi bi-calendar3 me-1"></i>
                  {member.joined || 'Member since 2023'}
                </div>
                <p className="small text-muted mb-0" style={{ lineHeight: 1.5, fontSize: '0.85rem' }}>
                  "{member.bio || 'Active trader committed to sustainable second-life item exchange across Myanmar.'}"
                </p>
              </div>
            </div>

            {/* Trust & Community Stats Grid */}
            <div className="row g-3 mb-4 text-center">
              <div className="col-6 col-md-3">
                <div className="p-3 rounded-3 border bg-light h-100">
                  <div className="fw-bold text-warning-emphasis fs-5 mb-0">
                    <i className="bi bi-star-fill text-warning me-1"></i>
                    {member.rating || 5.0}
                  </div>
                  <span className="text-muted small" style={{ fontSize: '0.78rem' }}>Community Rating</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 rounded-3 border bg-light h-100">
                  <div className="fw-bold text-success fs-5 mb-0">
                    <i className="bi bi-arrow-repeat me-1"></i>
                    {member.exchanges || 12}
                  </div>
                  <span className="text-muted small" style={{ fontSize: '0.78rem' }}>Completed Swaps</span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 rounded-3 border bg-light h-100">
                  <div className="fw-bold text-primary fs-5 mb-0">
                    <i className="bi bi-telephone-check me-1"></i> Verified
                  </div>
                  <span className="text-muted small" style={{ fontSize: '0.78rem' }}>
                    {member.phone || '09450987654'}
                  </span>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 rounded-3 border bg-light h-100">
                  <div className="fw-bold text-dark fs-5 mb-0">
                    <i className="bi bi-shield-check text-success me-1"></i> 100%
                  </div>
                  <span className="text-muted small" style={{ fontSize: '0.78rem' }}>Trust Score</span>
                </div>
              </div>
            </div>

            {/* Handover & Delivery Details */}
            <div className="p-3 rounded-3 border mb-4" style={{ backgroundColor: '#F8F9FA' }}>
              <div className="d-flex align-items-start gap-2.5">
                <i className="bi bi-info-circle-fill text-primary fs-5 mt-0.5"></i>
                <div className="small text-muted" style={{ lineHeight: 1.6 }}>
                  <strong>Exchange Protection:</strong> When trading with {member.name}, your exchange is monitored under our platform rules. 
                  {isIntercity 
                    ? ' For this intercity exchange, items will be dispatched via registered courier with live waybill tracking. The trade is only finalized when both of you confirm receipt.' 
                    : ' Please arrange handshakes in safe, public community places.'}
                </div>
              </div>
            </div>

            {/* Verified Social & Direct Channels (Viber, Telegram, Facebook) */}
            <div className="p-3.5 rounded-3 border mb-4" style={{ backgroundColor: '#FAF6FE', borderColor: '#E5D6F9' }}>
              <div className="d-flex align-items-center justify-content-between mb-2.5">
                <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                  <i className="bi bi-chat-heart-fill" style={{ color: '#7360F2' }}></i>
                  Direct Social & Messaging Contacts
                </span>
                <span className="badge bg-white text-secondary border small" style={{ fontSize: '0.70rem' }}>
                  Unlocked for Accepted Trade
                </span>
              </div>
              <p className="text-muted small mb-3" style={{ fontSize: '0.80rem', lineHeight: 1.5 }}>
                Use these social channels to coordinate parcel drop-off, share 10-second item inspection videos, and exchange courier tracking receipts.
              </p>

              <div className="row g-2 text-center">
                {/* Viber */}
                <div className="col-12 col-sm-4">
                  <a
                    href={`viber://chat?number=${member.viber || member.phone || '09450987654'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-3 border bg-white d-flex align-items-center gap-2 text-decoration-none text-dark hover-shadow h-100"
                    style={{ borderColor: '#E2D5F8' }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{ width: '34px', height: '34px', backgroundColor: '#7360F2' }}
                    >
                      <i className="bi bi-telephone-fill small"></i>
                    </div>
                    <div className="text-start min-w-0">
                      <div className="fw-bold small" style={{ fontSize: '0.78rem' }}>Viber</div>
                      <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                        {member.viber || member.phone || '09450987654'}
                      </div>
                    </div>
                  </a>
                </div>

                {/* Telegram */}
                <div className="col-12 col-sm-4">
                  <a
                    href={`https://t.me/${(member.telegram || 'kyawzin_htet').replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-3 border bg-white d-flex align-items-center gap-2 text-decoration-none text-dark hover-shadow h-100"
                    style={{ borderColor: '#C8E4FB' }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{ width: '34px', height: '34px', backgroundColor: '#229ED9' }}
                    >
                      <i className="bi bi-telegram small"></i>
                    </div>
                    <div className="text-start min-w-0">
                      <div className="fw-bold small" style={{ fontSize: '0.78rem' }}>Telegram</div>
                      <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                        {member.telegram || '@kyawzin_htet'}
                      </div>
                    </div>
                  </a>
                </div>

                {/* Facebook */}
                <div className="col-12 col-sm-4">
                  <a
                    href={member.facebook ? (member.facebook.startsWith('http') ? member.facebook : `https://${member.facebook}`) : 'https://facebook.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-3 border bg-white d-flex align-items-center gap-2 text-decoration-none text-dark hover-shadow h-100"
                    style={{ borderColor: '#CCDDF9' }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{ width: '34px', height: '34px', backgroundColor: '#1877F2' }}
                    >
                      <i className="bi bi-facebook small"></i>
                    </div>
                    <div className="text-start min-w-0">
                      <div className="fw-bold small" style={{ fontSize: '0.78rem' }}>Facebook</div>
                      <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                        {member.name}
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Active Listings by Member */}
            <div>
              <h6 className="font-serif fw-bold text-dark mb-2.5 d-flex align-items-center justify-content-between">
                <span>Available Listings by {member.name}</span>
                <span className="text-muted fw-normal small">{memberItems.length} items listed</span>
              </h6>
              <div className="row g-2.5">
                {memberItems.map((item) => (
                  <div key={item.id} className="col-12 col-sm-6">
                    <div className="p-2.5 rounded-3 border d-flex align-items-center gap-2.5 bg-white h-100 hover-shadow transition">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="rounded flex-shrink-0"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                      <div className="min-w-0 flex-grow-1">
                        <div className="fw-semibold text-truncate text-dark small" title={item.title}>
                          {item.title}
                        </div>
                        <div className="d-flex align-items-center gap-1.5 mt-0.5">
                          <span className="badge bg-light text-dark border px-1.5 py-0.5" style={{ fontSize: '0.70rem' }}>
                            {item.category || 'Goods'}
                          </span>
                          <span className="text-success small fw-medium" style={{ fontSize: '0.72rem' }}>
                            {item.condition || 'Good'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div
            className="modal-footer py-3 px-4 d-flex justify-content-between"
            style={{ backgroundColor: 'var(--bg-warm, #F9F6F0)', borderColor: 'var(--border-light, #EBE2D8)' }}
          >
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary py-2 px-3 fw-medium"
              onClick={onClose}
            >
              Close
            </button>

            {requestStatus === 'Pending' && onAccept && (
              <button
                type="button"
                className="btn btn-sm btn-success py-2 px-4 fw-medium shadow-xs"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
              >
                <i className="bi bi-check-lg me-1"></i> Accept Exchange with {member.name}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
