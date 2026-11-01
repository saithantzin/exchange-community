import React from 'react';

export default function ItemDetailModal({ item, onClose, onProposeExchange, isLoggedIn, onOpenAuthModal }) {
  if (!item) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 24, 20, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg">
          
          {/* Header */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <div>
              <span className="badge mb-1" style={{ backgroundColor: item.conditionBg, color: item.conditionColor }}>
                {item.condition}
              </span>
              <h5 className="modal-title font-serif fw-bold text-dark mb-0" style={{ fontSize: '1.25rem' }}>
                {item.title}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <div className="row g-4">
              
              {/* Left Column: Image with City tag */}
              <div className="col-12 col-md-6">
                <div className="position-relative rounded overflow-hidden shadow-sm bg-light mb-3" style={{ height: '300px' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                  <span className="badge-city">
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                    {item.city}
                  </span>
                </div>

                {/* Handover Method Badge */}
                <div className="p-3 rounded bg-light border" style={{ fontSize: '0.8rem' }}>
                  <div className="fw-bold mb-1 text-dark">
                    <i className="bi bi-box-seam text-primary me-1"></i> Handover Options:
                  </div>
                  <div className="text-muted" style={{ lineHeight: 1.55 }}>
                    Local in-person meetup in {item.city || 'local area'}, or registered express courier with Two-Sided Confirmation for other cities.
                  </div>
                </div>
              </div>

              {/* Right Column: Specifications, Owner & Trade Preference */}
              <div className="col-12 col-md-6 d-flex flex-column">
                
                {/* Desired Exchange Box */}
                <div
                  className="p-3 rounded-3 mb-3"
                  style={{
                    backgroundColor: 'var(--bg-accent-banner)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  <span className="text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.72rem', color: 'var(--primary-brown)', letterSpacing: '0.08em' }}>
                    <i className="bi bi-arrow-left-right me-1"></i> Owner's Wishlist / Trade Preference:
                  </span>
                  <p className="mb-0 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                    {item.exchangePreference}
                  </p>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.86rem' }}>
                    Item Description & Condition Notes:
                  </h6>
                  <p className="text-muted mb-0" style={{ fontSize: '0.84rem', lineHeight: 1.55 }}>
                    {item.description}
                  </p>
                </div>

                {/* Owner Card */}
                <div className="p-3 rounded border bg-white mb-4 mt-auto" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={item.owner.avatar}
                        alt={item.owner.name}
                        className="rounded-circle"
                        style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                      />
                      <div>
                        <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                          {item.owner.name}
                        </h6>
                        <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                          {item.owner.joined} • <strong className="text-success">{item.owner.exchanges} completed swaps</strong>
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-warning text-dark fw-bold">
                        {item.owner.rating} ★
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-2">
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        onClose();
                        onOpenAuthModal('login');
                      } else {
                        onProposeExchange(item);
                      }
                    }}
                    className="btn-nordic-primary w-100 py-2"
                  >
                    <i className="bi bi-send-fill"></i> Propose Exchange
                  </button>
                  <button
                    onClick={() => alert(`Item "${item.title}" reported to moderators for verification check.`)}
                    className="btn btn-outline-secondary py-2 px-3"
                    title="Report Listing"
                  >
                    <i className="bi bi-flag"></i>
                  </button>
                </div>

                {!isLoggedIn && (
                  <span className="text-muted text-center d-block mt-2" style={{ fontSize: '0.74rem' }}>
                    <i className="bi bi-info-circle"></i> Log in as a member to send exchange offers.
                  </span>
                )}

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
