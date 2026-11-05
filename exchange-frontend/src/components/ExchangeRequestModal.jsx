import React, { useState, useEffect } from 'react';
import { useExchange } from '../context/ExchangeContext';

export default function ExchangeRequestModal({
  isOpen,
  onClose,
  targetItem,
  currentUser,
  onProposalSuccess
}) {
  if (!isOpen || !targetItem) return null;

  const { myItems } = useExchange();

  // Determine initial offered item
  const initialItemId = targetItem.memberItem?.id 
    || (myItems?.length > 0 ? myItems[0].id : '');

  const [selectedItemId, setSelectedItemId] = useState(initialItemId);
  const [handoverType, setHandoverType] = useState('In-Person Meetup');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (targetItem.memberItem?.id) {
      setSelectedItemId(targetItem.memberItem.id);
    } else if (myItems?.length > 0 && !selectedItemId) {
      setSelectedItemId(myItems[0].id);
    }
  }, [targetItem, myItems]);

  const selectedItemObj = myItems?.find(it => String(it.id) === String(selectedItemId)) || myItems?.[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const chosenItem = selectedItemObj || {
      id: selectedItemId || null,
      title: 'Offered Item',
      city: currentUser?.city || 'Local'
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onProposalSuccess({
        targetItem: targetItem.title || targetItem.offeredItem?.title,
        offeredItem: chosenItem.title,
        offeredItemObj: chosenItem,
        handoverType,
        note
      });
      onClose();
    }, 400);
  };

  const itemTitle = targetItem.title || targetItem.offeredItem?.title || 'Selected Item';
  const itemOwner = targetItem.owner?.name || targetItem.offeredItem?.ownerName || 'Member';
  const itemCity = targetItem.city || targetItem.offeredItem?.city || 'Myanmar';
  const itemImage = targetItem.image || targetItem.offeredItem?.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80';

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 24, 20, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1070 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4">
          
          <div className="modal-header border-bottom py-3 px-4">
            <div>
              <span className="section-pre-title mb-0" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>Community Barter Proposal</span>
              <h5 className="modal-title font-serif fw-bold text-dark mb-0">Send Exchange Request</h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              
              {/* Target Item Summary */}
              <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light border mb-4">
                <img
                  src={itemImage}
                  alt={itemTitle}
                  className="rounded-3"
                  style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>You are requesting:</span>
                  <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.92rem' }}>{itemTitle}</h6>
                  <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                    Owned by <strong>{itemOwner}</strong> • {itemCity}
                  </span>
                </div>
              </div>

              {/* Select Member's Offered Item (Dynamic from User's Listings) */}
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark d-flex justify-content-between align-items-center">
                  <span>Select Your Item to Offer in Return <span className="text-danger">*</span></span>
                  <span className="text-muted fw-normal" style={{ fontSize: '0.74rem' }}>
                    {myItems?.length || 0} active listing(s)
                  </span>
                </label>
                
                {myItems && myItems.length > 0 ? (
                  <select
                    className="form-select"
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    required
                  >
                    {myItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.title} ({item.condition || 'Used'} • {item.city || 'Local'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-3 bg-warning-subtle border border-warning text-dark small">
                    <i className="bi bi-exclamation-triangle-fill text-warning me-1.5"></i>
                    You do not have any active item listings. Please list an item first before proposing an exchange.
                  </div>
                )}
                <small className="text-muted d-block mt-1">
                  The receiver will see full details of your offered item.
                </small>
              </div>

              {/* Handover Method */}
              <div className="mb-3">
                <label className="form-label fw-semibold small text-dark">Handover Method</label>
                <div className="d-flex flex-column gap-2">
                  <div className="form-check p-2.5 rounded-3 bg-light border d-flex align-items-center gap-2 m-0 cursor-pointer">
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

                  <div className="form-check p-2.5 rounded-3 bg-light border d-flex align-items-center gap-2 m-0 cursor-pointer">
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
                        Required for different cities. Includes courier tracking &amp; two-sided completion.
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Proposal Note */}
              <div className="mb-2">
                <label className="form-label fw-semibold small text-dark">Message to {itemOwner}</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Hello! I would love to trade my item for yours. I can meet in person or arrange express courier..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>

              <div className="p-2.5 rounded-3 bg-light border mt-3 text-muted" style={{ fontSize: '0.72rem' }}>
                <i className="bi bi-shield-check text-success me-1"></i> No trade is finalized until both members inspect and confirm receipt.
              </div>

            </div>

            <div className="modal-footer border-top py-3 px-4">
              <button type="button" onClick={onClose} className="btn btn-outline-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!myItems || myItems.length === 0)}
                className="btn-nordic-primary px-4"
              >
                {isSubmitting ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                    Sending Proposal...
                  </span>
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
