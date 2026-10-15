import React, { useState } from 'react';

export default function ExchangeRequestModal({
  isOpen,
  onClose,
  targetItem,
  currentUser,
  onProposalSuccess
}) {
  if (!isOpen || !targetItem) return null;

  const [selectedOfferItem, setSelectedOfferItem] = useState('Teak Study Desk (Like New)');
  const [handoverType, setHandoverType] = useState('In-Person Meetup');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onProposalSuccess({
        targetItem: targetItem.title || targetItem.offeredItem?.title,
        offeredItem: selectedOfferItem,
        handoverType
      });
      onClose();
    }, 600);
  };

  const itemTitle = targetItem.title || targetItem.offeredItem?.title;
  const itemOwner = targetItem.owner?.name || targetItem.offeredItem?.ownerName || 'Member';
  const itemCity = targetItem.city || targetItem.offeredItem?.city;
  const itemImage = targetItem.image || targetItem.offeredItem?.image;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 24, 20, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1070 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg">
          
          <div className="modal-header">
            <div>
              <span className="section-pre-title mb-0">Community Barter Proposal</span>
              <h5 className="modal-title font-serif fw-bold text-dark">Send Exchange Request</h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              
              {/* Target Item Summary */}
              <div className="d-flex align-items-center gap-3 p-3 rounded bg-light border mb-4">
                <img
                  src={itemImage}
                  alt={itemTitle}
                  className="rounded"
                  style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                />
                <div>
                  <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>You are requesting:</span>
                  <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.92rem' }}>{itemTitle}</h6>
                  <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                    Owned by <strong>{itemOwner}</strong> • {itemCity}
                  </span>
                </div>
              </div>

              {/* Select Member's Offered Item */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Select Your Item to Offer in Return</label>
                <select
                  className="form-select"
                  value={selectedOfferItem}
                  onChange={(e) => setSelectedOfferItem(e.target.value)}
                >
                  <option value="Teak Study Desk (Like New)">Solid Teak Study Desk (Like New, MDY)</option>
                  <option value="Kindle Paperwhite 11th Gen">Kindle Paperwhite 11th Gen (Like New, MDY)</option>
                  <option value="Ceramic Pour-Over Coffee Set">Ceramic Pour-Over Coffee Set (New, MDY)</option>
                </select>
                <small className="text-muted">Items from your active listings inventory in {currentUser.city}.</small>
              </div>

              {/* Handover Method */}
              <div className="mb-3">
                <label className="form-label fw-semibold small">Handover Method</label>
                <div className="d-flex flex-column gap-2">
                  <div className="form-check p-2.5 rounded-3 bg-light border d-flex align-items-center gap-2 m-0">
                    <input
                      className="form-check-input ms-1 mt-0"
                      type="radio"
                      name="handoverChoice"
                      id="optInPerson"
                      checked={handoverType === 'In-Person Meetup'}
                      onChange={() => setHandoverType('In-Person Meetup')}
                    />
                    <label className="form-check-label small cursor-pointer flex-grow-1" htmlFor="optInPerson">
                      <strong>In-Person Meetup (Same City / Local)</strong>
                      <div className="text-muted" style={{ fontSize: '0.76rem' }}>
                        Meet at a public spot in town. Direct handover without courier.
                      </div>
                    </label>
                  </div>

                  <div className="form-check p-2.5 rounded-3 bg-light border d-flex align-items-center gap-2 m-0">
                    <input
                      className="form-check-input ms-1 mt-0"
                      type="radio"
                      name="handoverChoice"
                      id="optCourier"
                      checked={handoverType === 'Intercity Courier Delivery'}
                      onChange={() => setHandoverType('Intercity Courier Delivery')}
                    />
                    <label className="form-check-label small cursor-pointer flex-grow-1" htmlFor="optCourier">
                      <strong>Intercity Courier / Express Delivery (Other City)</strong>
                      <div className="text-muted" style={{ fontSize: '0.76rem' }}>
                        Required for different cities. Includes courier tracking &amp; Two-Sided Completion progress.
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Proposal Note */}
              <div className="mb-2">
                <label className="form-label fw-semibold small">Message to {itemOwner}</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Hi! I would love to trade my desk for your item. I can meet in Chanayethazan or ship tomorrow..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>

              <div className="p-2 rounded bg-light border mt-3 text-muted" style={{ fontSize: '0.72rem' }}>
                <i className="bi bi-shield-check text-success me-1"></i> No trade is finalized until both of you physically inspect and confirm receipt in the platform.
              </div>

            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-nordic-primary px-4"
              >
                {isSubmitting ? (
                  <span>Sending Proposal...</span>
                ) : (
                  <span><i className="bi bi-send-fill me-1"></i> Send Exchange Proposal</span>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
