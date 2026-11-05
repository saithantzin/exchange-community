import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';
import { SMART_MATCHES_DATA } from '../../data/mockData';
import ExchangeRequestModal from '../../components/ExchangeRequestModal';
import itemService from '../../services/itemService';

export default function SmartMatchingPage() {
  const { currentUser } = useAuth();
  const { myItems, sendExchangeRequest } = useExchange();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userHasItems, setUserHasItems] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch real dynamic smart matches from Laravel backend
  useEffect(() => {
    setLoading(true);
    itemService.getSmartMatches()
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setMatches(res.data);
          if (res.user_has_items !== undefined) {
            setUserHasItems(Boolean(res.user_has_items));
          } else {
            setUserHasItems(Boolean((myItems && myItems.length > 0) || res.data.length > 0));
          }
        } else {
          setMatches([]);
          setUserHasItems(Boolean(myItems && myItems.length > 0));
        }
      })
      .catch(err => {
        console.warn('Could not load smart matches from backend:', err);
        setMatches([]);
        setUserHasItems(Boolean(myItems && myItems.length > 0));
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id, myItems?.length]);

  // 1. Only show high rating matches with score >= 75%
  const highRatingMatches = matches.filter(m => Number(m.matchScore) >= 75);

  // 2. Filter by location (All, Local, Intercity)
  const filteredMatches = highRatingMatches.filter(m => {
    if (filterType === 'local') return !m.intercity;
    if (filterType === 'intercity') return m.intercity;
    return true;
  });

  const localCount = highRatingMatches.filter(m => !m.intercity).length;
  const intercityCount = highRatingMatches.filter(m => m.intercity).length;

  // 3. Group by user's listed item (e.g. Row 1: User Phone, Row 2: User Bicycle, etc.)
  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const key = match.memberItem.id;
    if (!acc[key]) {
      acc[key] = {
        memberItem: match.memberItem,
        items: []
      };
    }
    acc[key].items.push(match);
    return acc;
  }, {});

  const groupsList = Object.values(groupedMatches);

  const scrollRow = (id, direction) => {
    const el = document.getElementById(`scroll-row-${id}`);
    if (el) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleProposeClick = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleProposalSuccess = async (proposalData) => {
    try {
      await sendExchangeRequest({
        recipient: {
          id: selectedMatch.offeredItem?.ownerId,
          name: selectedMatch.offeredItem?.ownerName || 'Member',
          city: selectedMatch.offeredItem?.city || 'Local'
        },
        requestedItem: selectedMatch.offeredItem,
        offeredItem: proposalData.offeredItemObj || selectedMatch.memberItem,
        handoverMethod: proposalData.handoverType,
        message: proposalData.note || 'Sent via Smart Matching engine recommendation.'
      });
      setToastMessage(`Exchange proposal sent for "${selectedMatch.offeredItem?.title || 'item'}"!`);
      setTimeout(() => setToastMessage(null), 4500);
    } catch {
      setToastMessage('Could not send proposal. Please try again.');
      setTimeout(() => setToastMessage(null), 4500);
    }
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
            <span className="section-pre-title mb-0">High-Compatibility Pairing Engine (≥ 75% Score)</span>
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
            <div className="col-lg-7">
              <h5 className="font-serif fw-bold text-dark mb-1">
                {(!userHasItems || (!loading && (!myItems || myItems.length === 0)))
                  ? 'Personalized Item Barter Engine'
                  : `High Rating Matches for You in ${currentUser?.city || 'Myanmar'}`}
              </h5>
              <p className="text-muted mb-0 small" style={{ lineHeight: 1.55 }}>
                {(!userHasItems || (!loading && (!myItems || myItems.length === 0)))
                  ? 'Smart Matching cross-references your active listings with community items based on wishlist keywords, categories, and condition ratings.'
                  : <span>Displaying top compatibility matches with <strong>75% or higher rating</strong> grouped by your listing rows with horizontal carousels.</span>}
              </p>
            </div>
            {(!(!userHasItems || (!loading && (!myItems || myItems.length === 0)))) && (
              <div className="col-lg-5 text-lg-end">
                <div className="btn-group btn-group-sm">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`btn ${filterType === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  >
                    All High Matches ({highRatingMatches.length})
                  </button>
                  <button
                    onClick={() => setFilterType('local')}
                    className={`btn ${filterType === 'local' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  >
                    Local ({localCount})
                  </button>
                  <button
                    onClick={() => setFilterType('intercity')}
                    className={`btn ${filterType === 'intercity' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  >
                    Intercity ({intercityCount})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-5 my-4 bg-white rounded-3 border">
            <div className="spinner-border text-brown mb-3" style={{ color: 'var(--primary-brown)', width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="font-serif fw-bold text-dark">Calculating High Rating Matches (≥ 75%)...</h5>
            <p className="text-muted small mb-0">Cross-referencing item titles, wishlists, and locations</p>
          </div>
        )}

        {/* Case 1: User has NO listings yet (e.g. New User Login) */}
        {!loading && (!userHasItems || (!myItems || myItems.length === 0)) && (
          <div className="bg-white p-5 rounded-4 border text-center shadow-sm my-4" style={{ borderColor: 'var(--border-light)' }}>
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{ width: '72px', height: '72px', backgroundColor: '#F9F1E2', color: '#87571B' }}
            >
              <i className="bi bi-box-seam fs-1"></i>
            </div>
            <h3 className="font-serif fw-bold text-dark mb-2">You Have No Active Listings Yet</h3>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '560px', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Smart Matching depends on <strong>your item listings</strong>. Once you post an item and tell us what you're looking for, our engine will automatically find and calculate high compatibility trades (≥ 75%) with other members!
            </p>

            <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
              <Link to="/items/add" className="btn-nordic-primary px-4 py-2.5 text-decoration-none shadow-sm">
                <i className="bi bi-plus-circle me-1.5"></i> List Your First Item
              </Link>
              <Link to="/browse" className="btn btn-outline-secondary px-4 py-2.5 rounded-3 text-decoration-none">
                <i className="bi bi-search me-1.5"></i> Browse Community Items
              </Link>
            </div>

            {/* 3 Step Onboarding Card for New User */}
            <div className="p-4 rounded-3 border bg-light text-start" style={{ borderColor: 'var(--border-light)' }}>
              <h6 className="fw-bold text-dark mb-3">
                <i className="bi bi-magic text-primary me-2"></i> How Smart Barter Matching Works:
              </h6>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="d-flex gap-2.5">
                    <span className="badge bg-white text-dark border rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '28px', height: '28px' }}>1</span>
                    <div>
                      <strong className="d-block small text-dark mb-0.5">Post What You Have</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem' }}>Upload photos and specify condition of your pre-loved gadget, phone, or furniture.</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="d-flex gap-2.5">
                    <span className="badge bg-white text-dark border rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '28px', height: '28px' }}>2</span>
                    <div>
                      <strong className="d-block small text-dark mb-0.5">Specify Wishlist</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem' }}>Fill in what you want in return (e.g. "Bicycle", "Keyboard", "Open to offers").</span>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="d-flex gap-2.5">
                    <span className="badge bg-white text-dark border rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '28px', height: '28px' }}>3</span>
                    <div>
                      <strong className="d-block small text-dark mb-0.5">Get 75%+ Matches</strong>
                      <span className="text-muted" style={{ fontSize: '0.78rem' }}>Our algorithm creates horizontal carousels of compatible items for each of your listings!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Case 2: User HAS listings, but no matches reach >= 75% threshold */}
        {!loading && (userHasItems && (myItems && myItems.length > 0)) && groupsList.length === 0 && (
          <div className="bg-white p-5 rounded-4 border text-center shadow-sm my-4" style={{ borderColor: 'var(--border-light)' }}>
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
              style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)' }}
            >
              <i className="bi bi-stars fs-2"></i>
            </div>
            <h4 className="font-serif fw-bold mb-2">No High Compatibility Matches (≥ 75%) Yet</h4>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '480px', fontSize: '0.88rem', lineHeight: 1.55 }}>
              We analyzed your active listing(s), but none have reached the 75% compatibility threshold for this filter ({filterType.toUpperCase()}). Try editing your item wishlist ("Wanted in Exchange") with more keywords, or list another item!
            </p>
            <div className="d-flex justify-content-center gap-2.5">
              <Link to="/my-items" className="btn btn-outline-secondary px-3.5 py-2 text-decoration-none">
                <i className="bi bi-collection me-1.5"></i> Manage Your Listings ({myItems.length})
              </Link>
              <Link to="/items/add" className="btn-nordic-primary px-3.5 py-2 text-decoration-none">
                <i className="bi bi-plus-circle me-1.5"></i> List Another Item
              </Link>
            </div>
          </div>
        )}

        {/* Grouped Horizontal Scroll Sections */}
        {!loading && groupsList.length > 0 && (
          <div className="mb-5 space-y-5">
            {groupsList.map(group => (
              <div key={group.memberItem.id} className="mb-5 pb-3 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
                
                {/* Header Banner for User Listing (e.g. Phone, Bicycle, Camera...) */}
                <div 
                  className="p-3 p-md-4 rounded-3 bg-white border mb-3 shadow-xs d-flex flex-wrap align-items-center justify-content-between gap-3"
                  style={{ borderColor: 'var(--border-light)', borderLeft: '5px solid var(--primary-brown)' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded overflow-hidden bg-light border p-1 shrink-0" style={{ width: '68px', height: '68px' }}>
                      <img 
                        src={group.memberItem.image} 
                        alt={group.memberItem.title} 
                        className="w-100 h-100" 
                        style={{ objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80';
                        }}
                      />
                    </div>
                    <div>
                      <div className="d-flex flex-wrap align-items-center gap-1.5 mb-1">
                        <span className="badge bg-secondary text-white" style={{ fontSize: '0.72rem' }}>
                          Your Listing
                        </span>
                        <span className="badge bg-light text-dark border" style={{ fontSize: '0.72rem' }}>
                          {group.memberItem.category}
                        </span>
                        <span className="badge bg-light text-muted border" style={{ fontSize: '0.72rem' }}>
                          {group.memberItem.condition}
                        </span>
                      </div>
                      <h4 className="font-serif fw-bold text-dark mb-0" style={{ fontSize: '1.2rem' }}>
                        {group.memberItem.title}
                      </h4>
                      <span className="text-muted small">
                        <i className="bi bi-geo-alt me-1 text-danger"></i> {group.memberItem.city}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Scroll Buttons */}
                  <div className="d-flex align-items-center gap-2">
                    <span 
                      className="badge rounded-pill fw-bold px-3 py-2" 
                      style={{ 
                        backgroundColor: '#EAF2EC', 
                        color: '#2E693D', 
                        fontSize: '0.84rem' 
                      }}
                    >
                      <i className="bi bi-stars me-1 text-warning"></i> {group.items.length} High Matches (≥ 75%)
                    </span>

                    {group.items.length > 2 && (
                      <div className="btn-group btn-group-sm ms-2">
                        <button
                          type="button"
                          onClick={() => scrollRow(group.memberItem.id, 'left')}
                          className="btn btn-outline-secondary"
                          title="Scroll left"
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollRow(group.memberItem.id, 'right')}
                          className="btn btn-outline-secondary"
                          title="Scroll right"
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Horizontal Scrollable Carousel Track */}
                <div className="position-relative">
                  <div
                    id={`scroll-row-${group.memberItem.id}`}
                    className="d-flex gap-3 overflow-x-auto pb-3 pt-1 px-1"
                    style={{
                      scrollSnapType: 'x mandatory',
                      scrollbarWidth: 'thin',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {group.items.map(m => (
                      <div
                        key={m.id}
                        className="bg-white rounded-3 border shadow-sm p-3.5 d-flex flex-column flex-shrink-0"
                        style={{
                          width: '320px',
                          minWidth: '320px',
                          scrollSnapAlign: 'start',
                          borderColor: 'var(--border-light)'
                        }}
                      >
                        {/* Score & Route Badges */}
                        <div className="d-flex justify-content-between align-items-center mb-2.5 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
                          <span
                            className="badge rounded-pill fw-bold"
                            style={{
                              backgroundColor: m.matchScore >= 90 ? '#EAF2EC' : '#F9F1E2',
                              color: m.matchScore >= 90 ? '#2E693D' : '#8A5814',
                              fontSize: '0.86rem',
                              padding: '5px 12px'
                            }}
                          >
                            <i className="bi bi-star-fill text-warning me-1"></i> {m.matchScore}% Match
                          </span>
                          <span className="badge bg-light text-muted border" style={{ fontSize: '0.72rem' }}>
                            {m.intercity ? '⇄ Intercity' : '• Local Meetup'}
                          </span>
                        </div>

                        {/* Partner Item Photo */}
                        <div className="rounded-3 overflow-hidden bg-light border mb-2.5 position-relative" style={{ height: '175px' }}>
                          <img
                            src={m.offeredItem.image}
                            alt={m.offeredItem.title}
                            className="w-100 h-100"
                            style={{ objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80';
                            }}
                          />
                          <span className="badge-condition" style={{ top: '8px', left: '8px', fontSize: '0.74rem', padding: '4px 10px' }}>
                            {m.offeredItem.condition}
                          </span>
                        </div>

                        {/* Partner Item Details */}
                        <h6 className="font-serif fw-bold text-dark text-truncate mb-1" title={m.offeredItem.title} style={{ fontSize: '1.02rem' }}>
                          {m.offeredItem.title}
                        </h6>

                        {/* Partner Owner Info */}
                        <div className="d-flex justify-content-between align-items-center text-muted mb-2.5" style={{ fontSize: '0.78rem' }}>
                          <span className="text-truncate" style={{ maxWidth: '170px' }}>
                            <i className="bi bi-person me-1"></i> {m.offeredItem.ownerName}
                          </span>
                          <span>
                            <i className="bi bi-geo-alt me-0.5"></i> {m.offeredItem.city?.split(',')[0]}
                          </span>
                        </div>

                        {/* Why recommended rationale */}
                        <div className="p-2 rounded bg-light border mb-3 flex-grow-1" style={{ fontSize: '0.76rem', lineHeight: 1.45, color: '#5C4033' }}>
                          <i className="bi bi-lightbulb-fill text-warning me-1"></i>
                          <span>{m.matchReason}</span>
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-2 pt-2 border-top mt-auto" style={{ borderColor: 'var(--border-light)' }}>
                          <Link
                            to={`/item/${m.offeredItem.id}`}
                            className="btn btn-sm btn-outline-secondary py-2"
                            style={{ fontSize: '0.78rem', width: '38%' }}
                          >
                            <i className="bi bi-eye"></i> View
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleProposeClick(m)}
                            className="btn-nordic-primary py-2 flex-grow-1"
                            style={{ fontSize: '0.8rem' }}
                          >
                            <i className="bi bi-send-fill me-1"></i> Propose
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex align-items-center justify-content-between text-muted small mt-2 px-1" style={{ fontSize: '0.74rem' }}>
                    <span>
                      <i className="bi bi-arrows-expand me-1"></i> Scroll horizontally to browse more options for this item
                    </span>
                    <span>
                      Showing {group.items.length} options (≥ 75% compatibility)
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

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
