import React, { useState } from 'react';
import { SMART_MATCHES_DATA } from '../data/mockData';

export default function SmartMatchingPreview({
  isLoggedIn,
  onOpenAuthModal,
  onSendExchangeRequest,
  onOpenItemDetail,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredMatches = SMART_MATCHES_DATA.filter(match => {
    if (activeTab === 'local') return !match.intercity;
    if (activeTab === 'intercity') return match.intercity;
    return true;
  });

  return (
    <section id="matching" className="py-5" style={{ backgroundColor: '#F5EFEB', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
      <div className="container-xl py-3">
        
        {/* Section Header */}
        <div className="text-center max-w-700 mx-auto mb-5" style={{ maxWidth: '680px' }}>
          <span className="section-pre-title text-center">Rule-Based Item Recommendation</span>
          <h2 className="section-main-title text-center mb-3">Find Your Best Exchange Match</h2>
          <p className="text-muted" style={{ fontSize: '0.98rem', lineHeight: 1.75 }}>
            Our smart algorithm cross-references what you have in your home with what other members in Mandalay &amp; Yangon are looking for — pairing compatible trades automatically.
          </p>
        </div>

        {/* If Guest View */}
        {!isLoggedIn ? (
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div
                className="bg-white p-4 p-md-5 rounded-3 shadow-sm border text-center position-relative overflow-hidden"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4"
                  style={{ width: '76px', height: '76px', backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)' }}
                >
                  <i className="bi bi-magic fs-2"></i>
                </div>

                <h3 className="font-serif fw-bold mb-3" style={{ fontSize: '1.65rem' }}>How Smart Matching Works</h3>
                <p className="text-muted mx-auto mb-5" style={{ maxWidth: '620px', fontSize: '0.98rem', lineHeight: 1.8 }}>
                  When you list an item, specify what kind of things you are willing to trade for. Our engine continuously scans active listings in your city (MDY/YGN) or intercity routes to recommend high-compatibility swap partners with mutual willingness.
                </p>

                {/* 3 Value Pillars */}
                <div className="row g-4 text-start mb-5 justify-content-center">
                  <div className="col-md-4">
                    <div className="p-4 rounded-3 bg-light border h-100">
                      <div className="fw-bold mb-2 d-flex align-items-center gap-2 text-dark" style={{ fontSize: '0.92rem' }}>
                        <i className="bi bi-bullseye text-brown" style={{ color: 'var(--primary-brown)' }}></i>
                        <span>Mutual Needs Check</span>
                      </div>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.84rem', lineHeight: 1.65 }}>
                        Matches items where both parties desire each other's category or exact item.
                      </p>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-4 rounded-3 bg-light border h-100">
                      <div className="fw-bold mb-2 d-flex align-items-center gap-2 text-dark" style={{ fontSize: '0.92rem' }}>
                        <i className="bi bi-geo-alt-fill text-brown" style={{ color: 'var(--primary-brown)' }}></i>
                        <span>City Compatibility</span>
                      </div>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.84rem', lineHeight: 1.65 }}>
                        Prioritizes local members in your city for quick, seamless, and convenient in-person handovers.
                      </p>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-4 rounded-3 bg-light border h-100">
                      <div className="fw-bold mb-2 d-flex align-items-center gap-2 text-dark" style={{ fontSize: '0.92rem' }}>
                        <i className="bi bi-shield-lock text-brown" style={{ color: 'var(--primary-brown)' }}></i>
                        <span>Never Auto-Completed</span>
                      </div>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.84rem', lineHeight: 1.65 }}>
                        You retain full control to review proposals and inspect items before agreeing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <button
                    onClick={() => onOpenAuthModal('login')}
                    className="btn-nordic-primary px-4 py-3"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Log In to Find Matches
                  </button>
                  <button
                    onClick={() => onOpenAuthModal('register')}
                    className="btn-nordic-secondary px-4 py-3"
                  >
                    Register as Member
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Logged-In Member View with Live Personalized Recommendations */
          <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
                <span
                  className="badge p-2 px-3 rounded-pill"
                  style={{ backgroundColor: 'var(--primary-brown)', color: '#fff', fontSize: '0.82rem', letterSpacing: '0.02em' }}
                >
                  <i className="bi bi-person-check-fill me-1"></i> Personalized for {currentUser.name}
                </span>
                <span className="text-muted" style={{ fontSize: '0.88rem' }}>
                  Based on your listings in {currentUser.city}
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="btn-group btn-group-sm">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`btn px-3 py-2 ${activeTab === 'all' ? 'btn-dark' : 'btn-outline-dark'}`}
                  style={{ fontSize: '0.82rem' }}
                >
                  All Matches ({SMART_MATCHES_DATA.length})
                </button>
                <button
                  onClick={() => setActiveTab('local')}
                  className={`btn px-3 py-2 ${activeTab === 'local' ? 'btn-dark' : 'btn-outline-dark'}`}
                  style={{ fontSize: '0.82rem' }}
                >
                  Local MDY Only
                </button>
                <button
                  onClick={() => setActiveTab('intercity')}
                  className={`btn px-3 py-2 ${activeTab === 'intercity' ? 'btn-dark' : 'btn-outline-dark'}`}
                  style={{ fontSize: '0.82rem' }}
                >
                  Intercity MDY ⇄ YGN
                </button>
              </div>
            </div>

            {/* Smart Match Cards Grid */}
            <div className="row g-4 g-lg-5">
              {filteredMatches.map(match => (
                <div key={match.id} className="col-12 col-lg-4">
                  <div className="match-card h-100 d-flex flex-column p-4">
                    
                    {/* Header: Score & Type */}
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
                      <div>
                        <span className="fw-bold d-block text-dark" style={{ fontSize: '0.94rem' }}>
                          {match.matchType}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {match.intercity ? 'Intercity Shipping Supported' : 'Local In-Person Swap'}
                        </span>
                      </div>
                      <div className="text-end">
                        <span
                          className="badge rounded-pill fw-bold"
                          style={{
                            backgroundColor: match.matchScore >= 95 ? '#EAF2EC' : '#F9F1E2',
                            color: match.matchScore >= 95 ? '#2E693D' : '#8A5814',
                            fontSize: '0.88rem',
                            padding: '7px 14px'
                          }}
                        >
                          {match.matchScore}% Match
                        </span>
                      </div>
                    </div>

                    {/* Swap Visual: Member Item ⇄ Matched Partner Item */}
                    <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light mb-3 border">
                      {/* Your Item */}
                      <div className="text-center" style={{ width: '42%' }}>
                        <div className="position-relative mx-auto rounded overflow-hidden mb-2" style={{ width: '64px', height: '64px' }}>
                          <img src={match.memberItem.image} alt="Your Item" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        </div>
                        <span className="fw-semibold d-block text-truncate text-dark" style={{ fontSize: '0.82rem' }}>
                          Your Listing
                        </span>
                        <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.72rem' }}>
                          {match.memberItem.city.split(' ')[0]}
                        </span>
                      </div>

                      {/* Direction Icon */}
                      <div className="text-center" style={{ width: '16%' }}>
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                          style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary-brown)', color: '#fff', fontSize: '0.82rem' }}
                        >
                          <i className="bi bi-arrow-left-right"></i>
                        </div>
                      </div>

                      {/* Matched Offered Item */}
                      <div className="text-center" style={{ width: '42%' }}>
                        <div className="position-relative mx-auto rounded overflow-hidden mb-2" style={{ width: '64px', height: '64px' }}>
                          <img src={match.offeredItem.image} alt={match.offeredItem.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                        </div>
                        <span className="fw-semibold d-block text-truncate text-dark" style={{ fontSize: '0.82rem' }}>
                          {match.offeredItem.title}
                        </span>
                        <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.72rem' }}>
                          {match.offeredItem.city.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Match Reason Explanation with Relaxed Leading */}
                    <div className="p-3 rounded-3 mb-4 flex-grow-1" style={{ backgroundColor: 'var(--bg-warm)', border: '1px dashed var(--border-medium)' }}>
                      <span className="d-block fw-bold mb-1.5" style={{ fontSize: '0.82rem', color: 'var(--primary-brown)' }}>
                        <i className="bi bi-lightbulb me-1"></i> Why this matches:
                      </span>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                        {match.matchReason}
                      </p>
                      {match.shippingNote && (
                        <div className="mt-2 pt-2 border-top text-muted" style={{ fontSize: '0.76rem' }}>
                          <i className="bi bi-truck me-1"></i> {match.shippingNote}
                        </div>
                      )}
                    </div>

                    {/* Owner summary & Action Buttons */}
                    <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto" style={{ borderColor: 'var(--border-light)' }}>
                      <div className="d-flex align-items-center gap-1">
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                          Listed by <strong>{match.offeredItem.ownerName}</strong> &nbsp;({match.offeredItem.ownerRating}★)
                        </span>
                      </div>
                      
                      <button
                        onClick={() => onSendExchangeRequest(match)}
                        className="btn-nordic-primary py-2 px-3"
                        style={{ fontSize: '0.82rem' }}
                      >
                        <i className="bi bi-send me-1"></i> Send Proposal
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
