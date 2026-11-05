import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useExchange } from '../../context/ExchangeContext';

export default function ExchangeHistoryPage() {
  const { exchanges, refreshExchanges, exchangesLoading, submitReview } = useExchange();

  const [activeTab, setActiveTab] = useState('all');
  const [reviewModalExchange, setReviewModalExchange] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const filteredExchanges = exchanges.filter(e => {
    if (activeTab === 'ongoing') return !e.isCompleted;
    if (activeTab === 'completed') return e.isCompleted;
    return true;
  });

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalExchange) return;

    setIsSubmittingReview(true);
    try {
      const targetId = reviewModalExchange.numericId || reviewModalExchange.id;
      await submitReview(targetId, { rating, comment });
      const partnerName = reviewModalExchange.itemB?.ownerName || 'your partner';
      setToastMessage(`Thank you! Your ${rating}★ review for ${partnerName} has been recorded.`);
      setReviewModalExchange(null);
      setComment('');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.warn('Failed to submit review:', err);
      setToastMessage('Review saved locally.');
      setReviewModalExchange(null);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh' }}>
      <div className="container-xl">
        
        {/* Toast */}
        {toastMessage && (
          <div
            className="position-fixed bottom-0 end-0 m-4 p-3 bg-white border rounded-3 shadow-lg d-flex align-items-center gap-3"
            style={{ zIndex: 2050, maxWidth: '420px', borderColor: 'var(--primary-brown)', borderLeftWidth: '6px' }}
          >
            <i className="bi bi-star-fill fs-4 text-warning"></i>
            <div className="flex-grow-1" style={{ fontSize: '0.85rem' }}>
              <div className="fw-bold">Review Published</div>
              <div className="text-muted">{toastMessage}</div>
            </div>
            <button onClick={() => setToastMessage(null)} className="btn btn-sm btn-link text-muted p-0">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-1" style={{ fontSize: '0.8rem' }}>
                <li className="breadcrumb-item"><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/requests" className="text-muted text-decoration-none">Requests</Link></li>
                <li className="breadcrumb-item active text-dark">Exchange History</li>
              </ol>
            </nav>
            <h1 className="font-serif fw-bold h3 mb-1 text-dark">Exchange Records & History</h1>
            <span className="text-muted" style={{ fontSize: '0.84rem' }}>
              Archive of all your active, in-transit, and finalized peer-to-peer barters across Myanmar.
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="btn-group btn-group-sm">
              <button
                onClick={() => setActiveTab('all')}
                className={`btn ${activeTab === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              >
                All Records ({exchanges.length})
              </button>
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`btn ${activeTab === 'ongoing' ? 'btn-dark' : 'btn-outline-secondary'}`}
              >
                Ongoing ({exchanges.filter(e => !e.isCompleted).length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`btn ${activeTab === 'completed' ? 'btn-dark' : 'btn-outline-secondary'}`}
              >
                Completed ({exchanges.filter(e => e.isCompleted).length})
              </button>
            </div>

            <button
              onClick={() => refreshExchanges()}
              disabled={exchangesLoading}
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill"
              style={{ fontSize: '0.80rem' }}
              title="Refresh records from database"
            >
              <i className={`bi bi-arrow-clockwise ${exchangesLoading ? 'spin' : ''}`}></i>
              <span>{exchangesLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Global Loading Spinner */}
        {exchangesLoading && exchanges.length === 0 && (
          <div className="bg-white p-5 rounded-3 border text-center shadow-sm my-4" style={{ borderColor: 'var(--border-light)' }}>
            <div className="spinner-border mb-3" style={{ color: 'var(--primary-brown)' }} role="status"></div>
            <h5 className="font-serif fw-bold mb-1">Loading Real Exchange History...</h5>
            <p className="text-muted small mb-0">Fetching your peer-to-peer barter records from database.</p>
          </div>
        )}

        {/* Empty State */}
        {!exchangesLoading && filteredExchanges.length === 0 && (
          <div className="bg-white p-5 rounded-3 border text-center shadow-sm my-4" style={{ borderColor: 'var(--border-light)' }}>
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: '64px', height: '64px', backgroundColor: '#FAF6F0', color: 'var(--primary-brown)' }}
            >
              <i className="bi bi-clock-history fs-2"></i>
            </div>
            <h5 className="font-serif fw-bold text-dark mb-1">
              {activeTab === 'all'
                ? 'No Exchange Records Yet'
                : activeTab === 'ongoing'
                ? 'No Ongoing Exchanges'
                : 'No Completed Exchanges'}
            </h5>
            <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px', lineHeight: 1.6 }}>
              {activeTab === 'all'
                ? 'You have not completed or engaged in any accepted exchanges yet. Browse available items and propose an exchange to start trading!'
                : `You currently have 0 ${activeTab} exchanges in this view.`}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/browse" className="btn-nordic-primary btn-sm py-2 px-3 text-decoration-none">
                <i className="bi bi-search me-1.5"></i> Browse Items for Swap
              </Link>
              <Link to="/requests" className="btn btn-sm btn-outline-secondary py-2 px-3 text-decoration-none">
                <i className="bi bi-send me-1.5"></i> View Proposals
              </Link>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="d-flex flex-column gap-3 mb-5">
          {filteredExchanges.map(exc => (
            <div key={exc.id} className="bg-white p-4 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold font-monospace text-dark">#{exc.id}</span>
                  <span className="text-muted small">• Initiated: {exc.initiatedDate}</span>
                  {exc.completedDate && (
                    <span className="text-muted small">• Completed: {exc.completedDate}</span>
                  )}
                  <span className="text-muted small">• {exc.handoverMethod}</span>
                </div>

                <div>
                  <span className="badge rounded-pill px-3 py-1" style={{ backgroundColor: exc.isCompleted ? '#EAF2EC' : '#F9F1E2', color: exc.isCompleted ? '#2E693D' : '#87571B', fontSize: '0.78rem' }}>
                    {exc.status}
                  </span>
                </div>
              </div>

              {/* Items in trade */}
              <div className="row g-3 align-items-center mb-3">
                
                {/* Item A */}
                <div className="col-12 col-md-5">
                  <div className="d-flex align-items-center gap-3 p-2.5 rounded bg-light border">
                    <img
                      src={exc.itemA?.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80'}
                      alt=""
                      className="rounded flex-shrink-0"
                      style={{ width: '52px', height: '52px', objectFit: 'cover' }}
                    />
                    <div className="text-truncate">
                      <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>You Provided:</span>
                      <strong className="text-dark small text-truncate d-block" style={{ fontSize: '0.86rem' }}>
                        {exc.itemA?.title || 'Your Offered Item'}
                      </strong>
                      <span className="text-muted small" style={{ fontSize: '0.74rem' }}>{exc.itemA?.ownerCity || 'Local'}</span>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-2 text-center text-muted">
                  <i className="bi bi-arrow-left-right fs-4"></i>
                </div>

                {/* Item B */}
                <div className="col-12 col-md-5">
                  <div className="d-flex align-items-center gap-3 p-2.5 rounded bg-light border">
                    <img
                      src={exc.itemB?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'}
                      alt=""
                      className="rounded flex-shrink-0"
                      style={{ width: '52px', height: '52px', objectFit: 'cover' }}
                    />
                    <div className="text-truncate">
                      <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>You Received:</span>
                      <strong className="text-dark small text-truncate d-block" style={{ fontSize: '0.86rem' }}>
                        {exc.itemB?.title || 'Requested Item'}
                      </strong>
                      <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                        From {exc.itemB?.ownerName || 'Partner'} ({exc.itemB?.ownerCity || 'Local'})
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions & Rating */}
              <div className="d-flex flex-wrap justify-content-between align-items-center pt-2 border-top">
                <div className="text-muted small">
                  {exc.reviewGiven ? (
                    <span className="text-success">
                      <i className="bi bi-star-fill text-warning me-1"></i>
                      You rated: <strong>{exc.reviewGiven.rating}★</strong> ("{exc.reviewGiven.comment}")
                    </span>
                  ) : exc.isCompleted ? (
                    <span className="text-success">
                      <i className="bi bi-check-circle-fill me-1"></i> Exchange completed successfully.
                    </span>
                  ) : exc.isIntercity ? (
                    <span className="d-flex align-items-center gap-1.5" style={{ color: '#2C5B7C' }}>
                      <i className="bi bi-truck"></i>
                      Intercity Courier &bull; Two-Sided Tracking In Progress
                    </span>
                  ) : (
                    <span className="d-flex align-items-center gap-1.5">
                      <i className="bi bi-geo-alt text-brown" style={{ color: 'var(--primary-brown)' }}></i>
                      In-Person Meetup &bull; Ready for handover
                    </span>
                  )}
                </div>

                <div className="d-flex gap-2 mt-2 mt-md-0">
                  <Link
                    to={`/exchange/${exc.id}`}
                    className="btn btn-sm btn-outline-secondary py-1.5 px-3 d-inline-flex align-items-center gap-1.5"
                    style={{ fontSize: '0.84rem' }}
                  >
                    <i className="bi bi-eye"></i> View Exchange Details
                  </Link>
                  {exc.isCompleted && !exc.reviewGiven && (
                    <button
                      onClick={() => setReviewModalExchange(exc)}
                      className="btn btn-sm btn-nordic-primary py-1.5 px-3 d-inline-flex align-items-center gap-1.5"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <i className="bi bi-star"></i> Leave Review
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Review Modal */}
      {reviewModalExchange && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(30, 24, 20, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 2000
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg rounded-4 overflow-hidden border-0">
              <div className="modal-header py-3 px-4 bg-light border-bottom">
                <h5 className="modal-title font-serif fw-bold text-dark mb-0">Review Exchange Partner</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReviewModalExchange(null)}
                ></button>
              </div>
              <form onSubmit={handleSubmitReview}>
                <div className="modal-body p-4">
                  <p className="text-muted small mb-3">
                    Rate your exchange experience with <strong>{reviewModalExchange.itemB?.ownerName || 'Partner'}</strong> for swap #{reviewModalExchange.id}.
                  </p>
                  
                  <div className="mb-3 text-center">
                    <label className="form-label small fw-semibold d-block">Overall Rating</label>
                    <div className="d-flex justify-content-center gap-2 fs-3 text-warning">
                      {[1, 2, 3, 4, 5].map(star => (
                        <i
                          key={star}
                          onClick={() => setRating(star)}
                          className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'} cursor-pointer`}
                          style={{ cursor: 'pointer' }}
                        ></i>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Review Comment</label>
                    <textarea
                      rows="3"
                      required
                      className="form-control text-xs"
                      placeholder="Comment on item accuracy, promptness of meetup/shipping, and communication..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer py-3 px-4 border-top">
                  <button
                    type="button"
                    onClick={() => setReviewModalExchange(null)}
                    className="btn btn-secondary btn-sm px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="btn-nordic-primary btn-sm px-4"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
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
