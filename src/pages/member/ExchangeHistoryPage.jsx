import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useExchange } from '../../context/ExchangeContext';

export default function ExchangeHistoryPage() {
  const { exchanges } = useExchange();

  const [activeTab, setActiveTab] = useState('all');
  const [reviewModalExchange, setReviewModalExchange] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const filteredExchanges = exchanges.filter(e => {
    if (activeTab === 'ongoing') return !e.isCompleted;
    if (activeTab === 'completed') return e.isCompleted;
    return true;
  });

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setToastMessage(`Thank you! Your ${rating}★ review for ${reviewModalExchange.itemB.ownerName} has been recorded.`);
    setReviewModalExchange(null);
    setTimeout(() => setToastMessage(null), 4000);
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
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-1" style={{ fontSize: '0.8rem' }}>
                <li className="breadcrumb-item"><Link to="/dashboard" className="text-muted text-decoration-none">Dashboard</Link></li>
                <li className="breadcrumb-item active text-dark">Exchange History</li>
              </ol>
            </nav>
            <h1 className="font-serif fw-bold h3 mb-0 text-dark">Exchange Records & History</h1>
            <span className="text-muted" style={{ fontSize: '0.84rem' }}>
              Archive of all your active, in-transit, and finalized peer-to-peer barters.
            </span>
          </div>

          <div className="btn-group btn-group-sm mt-3 mt-md-0">
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
              Ongoing
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`btn ${activeTab === 'completed' ? 'btn-dark' : 'btn-outline-secondary'}`}
            >
              Completed
            </button>
          </div>
        </div>

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
                  <div className="d-flex align-items-center gap-3 p-2 rounded bg-light border">
                    <img src={exc.itemA.image} alt="" className="rounded" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    <div className="text-truncate">
                      <span className="text-muted small d-block">You Provided:</span>
                      <strong className="text-dark small text-truncate d-block">{exc.itemA.title}</strong>
                      <span className="text-muted small">{exc.itemA.ownerCity}</span>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-2 text-center text-muted">
                  <i className="bi bi-arrow-left-right fs-4"></i>
                </div>

                {/* Item B */}
                <div className="col-12 col-md-5">
                  <div className="d-flex align-items-center gap-3 p-2 rounded bg-light border">
                    <img src={exc.itemB.image} alt="" className="rounded" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                    <div className="text-truncate">
                      <span className="text-muted small d-block">You Received:</span>
                      <strong className="text-dark small text-truncate d-block">{exc.itemB.title}</strong>
                      <span className="text-muted small">From {exc.itemB.ownerName} ({exc.itemB.ownerCity})</span>
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
                      Intercity Courier &bull; Two-Sided Confirmation In Progress
                    </span>
                  ) : (
                    <span className="d-flex align-items-center gap-1.5">
                      <i className="bi bi-geo-alt text-brown" style={{ color: 'var(--primary-brown)' }}></i>
                      In-Person Meetup &bull; Ready for handover
                    </span>
                  )}
                </div>

                <div className="d-flex gap-2 mt-2 mt-md-0">
                  <Link to={`/exchange/${exc.id}`} className="btn btn-sm btn-outline-secondary py-1.5 px-3" style={{ fontSize: '0.84rem' }}>
                    View Exchange Details
                  </Link>
                  {exc.isCompleted && !exc.reviewGiven && (
                    <button
                      onClick={() => setReviewModalExchange(exc)}
                      className="btn btn-sm btn-nordic-primary py-1.5 px-3"
                      style={{ fontSize: '0.84rem' }}
                    >
                      <i className="bi bi-star me-1"></i> Leave Review
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 24, 20, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title font-serif fw-bold text-dark">Review Exchange Partner</h5>
                <button type="button" className="btn-close" onClick={() => setReviewModalExchange(null)}></button>
              </div>
              <form onSubmit={handleSubmitReview}>
                <div className="modal-body p-4">
                  <p className="text-muted small mb-3">
                    Rate your exchange experience with <strong>{reviewModalExchange.itemB.ownerName}</strong> for swap #{reviewModalExchange.id}.
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
                      className="form-control"
                      placeholder="Comment on item accuracy, promptness of meetup/shipping, and communication..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setReviewModalExchange(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-nordic-primary px-4">
                    Submit Review
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
