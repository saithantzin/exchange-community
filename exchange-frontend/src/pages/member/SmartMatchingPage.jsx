import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';
import { SMART_MATCHES_DATA } from '../../data/mockData';
import ExchangeRequestModal from '../../components/ExchangeRequestModal';

export default function SmartMatchingPage() {
  const { currentUser } = useAuth();
  const { sendExchangeRequest } = useExchange();
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const filteredMatches = SMART_MATCHES_DATA.filter(m => {
    if (filterType === 'local') return !m.intercity;
    if (filterType === 'intercity') return m.intercity;
    return true;
  });

  const handleProposeClick = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleProposalSuccess = (proposalData) => {
    sendExchangeRequest({
      recipient: { name: selectedMatch.offeredItem.ownerName, city: selectedMatch.offeredItem.city },
      requestedItem: selectedMatch.offeredItem,
      offeredItem: { title: proposalData.offeredItem, city: currentUser.city, image: selectedMatch.memberItem.image },
      handoverMethod: proposalData.handoverType,
      message: 'Sent via Smart Matching engine recommendation.'
    });
    setToastMessage(`Exchange proposal sent for "${selectedMatch.offeredItem.title}"!`);
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
            <i className="bi bi-check-circle-fill fs-4 text-success"></i>
            <div className="flex-grow-1" style={{ fontSize: '0.85rem' }}>
              <div className="fw-bold">Proposal Sent</div>
              <div className="text-muted">{toastMessage}</div>
            </div>
            <button onClick={() => setToastMessage(null)} className="btn btn-sm btn-link text-muted p-0">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-1" style={{ fontSize: '0.8rem' }}>
                <li className="breadcrumb-item"><Link to="/dashboard" className="text-muted text-decoration-none">Dashboard</Link></li>
                <li className="breadcrumb-item active text-dark">Smart Matching</li>
              </ol>
            </nav>
            <span className="section-pre-title mb-0">Rule-Based Circular Pairing Engine</span>
            <h1 className="font-serif fw-bold h3 mb-0 text-dark">Find Your Best Exchange Match</h1>
          </div>

          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <span className="badge rounded-pill bg-light text-dark border p-2" style={{ fontSize: '0.78rem' }}>
              <i className="bi bi-info-circle text-primary me-1"></i> Recommendations are non-binding
            </span>
          </div>
        </div>

        {/* Explain Rule-based matching box */}
        <div className="p-3 p-md-4 rounded-3 bg-white border mb-4 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
          <div className="row g-3 align-items-center">
            <div className="col-lg-8">
              <h5 className="font-serif fw-bold text-dark mb-1">
                How Our Matching Rules Work for You in {currentUser.city}
              </h5>
              <p className="text-muted mb-0 small" style={{ lineHeight: 1.55 }}>
                Our system compares your listed items with wishlist preferences declared by other community members nationwide. Matches score highest when both parties desire each other's items and are located close for easy in-person handover.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="btn-group btn-group-sm">
                <button
                  onClick={() => setFilterType('all')}
                  className={`btn ${filterType === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                >
                  All Matches ({SMART_MATCHES_DATA.length})
                </button>
                <button
                  onClick={() => setFilterType('local')}
                  className={`btn ${filterType === 'local' ? 'btn-dark' : 'btn-outline-secondary'}`}
                >
                  Local MDY
                </button>
                <button
                  onClick={() => setFilterType('intercity')}
                  className={`btn ${filterType === 'intercity' ? 'btn-dark' : 'btn-outline-secondary'}`}
                >
                  Intercity MDY ⇄ YGN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Matching Cards Grid */}
        <div className="row g-4 mb-5">
          {filteredMatches.map(m => (
            <div key={m.id} className="col-12 col-lg-6">
              <div className="bg-white p-4 rounded-3 border h-100 shadow-sm d-flex flex-column" style={{ borderColor: 'var(--border-light)' }}>
                
                {/* Score & Header */}
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
                  <div>
                    <h5 className="font-serif fw-bold text-dark mb-0" style={{ fontSize: '1.05rem' }}>
                      {m.matchType}
                    </h5>
                    <span className="text-muted" style={{ fontSize: '0.74rem' }}>
                      {m.intercity ? 'Intercity Shipping Supported' : 'Local In-Person Swap'}
                    </span>
                  </div>
                  <span
                    className="badge rounded-pill fw-bold"
                    style={{
                      backgroundColor: m.matchScore >= 95 ? '#EAF2EC' : '#F9F1E2',
                      color: m.matchScore >= 95 ? '#2E693D' : '#8A5814',
                      fontSize: '0.9rem',
                      padding: '7px 14px'
                    }}
                  >
                    {m.matchScore}% Match
                  </span>
                </div>

                {/* Visual Exchange Pair */}
                <div className="p-3 rounded bg-light border mb-3">
                  <div className="row g-2 align-items-center">
                    
                    {/* Your Listing */}
                    <div className="col-5 text-center">
                      <div className="rounded overflow-hidden mx-auto mb-1" style={{ width: '64px', height: '64px' }}>
                        <img src={m.memberItem.image} alt="Your item" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      </div>
                      <span className="fw-bold d-block text-truncate small text-dark">{m.memberItem.title}</span>
                      <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.66rem' }}>
                        Your Item ({m.memberItem.condition})
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="col-2 text-center text-muted">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto text-white"
                        style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-brown)', fontSize: '0.85rem' }}
                      >
                        <i className="bi bi-arrow-left-right"></i>
                      </div>
                    </div>

                    {/* Matched Partner Item */}
                    <div className="col-5 text-center">
                      <div className="rounded overflow-hidden mx-auto mb-1" style={{ width: '64px', height: '64px' }}>
                        <img src={m.offeredItem.image} alt="Partner item" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                      </div>
                      <span className="fw-bold d-block text-truncate small text-dark">{m.offeredItem.title}</span>
                      <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.66rem' }}>
                        {m.offeredItem.ownerName} ({m.offeredItem.city.split(' ')[0]})
                      </span>
                    </div>

                  </div>
                </div>

                {/* Match Reason Rationale (Requirement 3.D) */}
                <div className="p-3 rounded mb-4 flex-grow-1" style={{ backgroundColor: '#FAF7F2', border: '1px dashed var(--border-medium)' }}>
                  <span className="d-block fw-bold text-dark small mb-1">
                    <i className="bi bi-lightbulb text-warning me-1"></i> Why this was recommended:
                  </span>
                  <p className="text-muted mb-0 small" style={{ lineHeight: 1.45 }}>
                    {m.matchReason}
                  </p>
                  {m.shippingNote && (
                    <div className="mt-2 pt-2 border-top text-muted small" style={{ fontSize: '0.72rem' }}>
                      <i className="bi bi-truck me-1"></i> {m.shippingNote}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-auto" style={{ borderColor: 'var(--border-light)' }}>
                  <Link
                    to={`/item/${m.offeredItem.id}`}
                    className="btn btn-sm btn-outline-secondary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleProposeClick(m)}
                    className="btn-nordic-primary py-2 px-3"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <i className="bi bi-send-fill me-1"></i> Propose Exchange
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal */}
      {selectedMatch && (
        <ExchangeRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetItem={selectedMatch.offeredItem}
          currentUser={currentUser}
          onProposalSuccess={handleProposalSuccess}
        />
      )}
    </div>
  );
}
