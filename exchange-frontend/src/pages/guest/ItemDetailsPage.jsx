import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useExchange } from '../../context/ExchangeContext';
import { useAuth } from '../../context/AuthContext';
import ExchangeRequestModal from '../../components/ExchangeRequestModal';
import itemService from '../../services/itemService';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, myItems, sendExchangeRequest } = useExchange();
  const { currentUser, isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchedItem, setFetchedItem] = useState(null);

  // Directly query backend for item by ID
  useEffect(() => {
    if (id) {
      setLoading(true);
      setNotFound(false);
      itemService.getItemById(id)
        .then(res => {
          if (res?.success && res.data) {
            const bItem = res.data;
            const primaryImage = bItem.images?.find(i => i.is_primary)?.image_url
              || bItem.images?.[0]?.image_url
              || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80';
            const township = bItem.township?.name || '';
            const region = bItem.township?.state_region?.name || '';
            const city = township && region ? `${township}, ${region}` : (bItem.city || 'Mandalay Region');

            const ownerTownship = bItem.user?.township?.name || '';
            const ownerRegion = bItem.user?.township?.state_region?.name || '';
            const ownerCity = ownerTownship && ownerRegion ? `${ownerTownship}, ${ownerRegion}` : city;

            setFetchedItem({
              id: bItem.id,
              title: bItem.title,
              category: bItem.category?.name || 'General',
              categoryName: bItem.category?.name || 'General',
              categoryId: bItem.category_id,
              condition: bItem.condition,
              conditionColor: '#87571B',
              conditionBg: '#F9F1E2',
              defects: bItem.defects || '',
              description: bItem.description,
              exchangePreference: bItem.looking_for || 'Open to offers',
              city: city,
              cityCode: city.toLowerCase().includes('mandalay') ? 'MDY' : 'YGN',
              images: bItem.images?.map(i => i.image_url) || [primaryImage],
              image: primaryImage,
              ownerId: bItem.user_id,
              owner: {
                id: bItem.user?.id || bItem.user_id,
                name: bItem.user?.name || 'Community Member',
                email: bItem.user?.email || '',
                username: bItem.user?.username || '',
                phone: bItem.user?.phone || '',
                city: ownerCity,
                rating: Number(bItem.user?.rating) || 5.0,
                avatar: bItem.user?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
                joined: bItem.user?.created_at ? `Member since ${new Date(bItem.user.created_at).getFullYear()}` : 'Community Member',
                exchanges: bItem.user?.completed_swaps || 0
              },
              status: bItem.availability_status || 'Available',
              createdAt: bItem.created_at ? new Date(bItem.created_at).toLocaleDateString() : 'Recently',
              views: bItem.views || 0,
              depositAmount: bItem.category?.deposit_amount || 50000
            });
          } else {
            const allItems = [...items, ...myItems];
            const local = allItems.find(i => String(i.id) === String(id));
            if (local) {
              setFetchedItem(local);
            } else {
              setNotFound(true);
            }
          }
        })
        .catch(err => {
          console.warn('Could not fetch item details from API:', err?.message);
          const allItems = [...items, ...myItems];
          const local = allItems.find(i => String(i.id) === String(id));
          if (local) {
            setFetchedItem(local);
          } else {
            setNotFound(true);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, items, myItems]);

  const allItems = [...items, ...myItems];
  const item = fetchedItem || allItems.find(i => String(i.id) === String(id));

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  if (loading) {
    return (
      <div className="py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh' }}>
        <div className="spinner-border mb-3" style={{ color: 'var(--primary-brown)', width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading item details...</span>
        </div>
        <p className="text-muted fw-medium">Loading item details from database...</p>
      </div>
    );
  }

  if (notFound || !item?.title) {
    return (
      <div className="py-5 text-center" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh' }}>
        <div className="container-xl">
          <div className="p-5 bg-white rounded-4 border mx-auto shadow-sm" style={{ maxWidth: '500px', borderColor: 'var(--border-light)' }}>
            <i className="bi bi-box-seam fs-1 text-muted mb-3 d-block"></i>
            <h4 className="fw-bold mb-2 font-serif text-dark">Item Not Found</h4>
            <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>The requested item does not exist or has been removed from the platform.</p>
            <Link to="/browse" className="btn px-4 py-2 text-white" style={{ backgroundColor: 'var(--primary-brown)', borderRadius: '8px' }}>
              Browse Available Items
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const imagesList = item.images && item.images.length > 0 ? item.images : [item.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'];

  // Check if current logged-in user is the owner of this post
  const isOwner = Boolean(
    currentUser && item && (
      (item.ownerId && String(currentUser.id) === String(item.ownerId)) ||
      (item.owner?.id && String(currentUser.id) === String(item.owner.id)) ||
      (item.owner?.name && currentUser.name && item.owner.name.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) ||
      (item.owner?.email && currentUser.email && item.owner.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim())
    )
  );

  const handleProposeClick = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/item/${item.id}` } });
    } else {
      setIsProposalModalOpen(true);
    }
  };

  const handleProposalSuccess = async (proposalData) => {
    try {
      await sendExchangeRequest({
        recipient: item.owner,
        requestedItem: item,
        offeredItem: proposalData.offeredItemObj || {
          title: proposalData.offeredItem,
          city: currentUser?.city,
          image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80'
        },
        handoverMethod: proposalData.handoverType,
        message: proposalData.note || `I'd love to exchange my item for your ${item.title}.`
      });
      setToastMessage(`Your proposal has been sent to ${item.owner?.name || 'the listing owner'}! Waiting for review.`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch {
      setToastMessage('Could not transmit exchange proposal. Please try again.');
      setTimeout(() => setToastMessage(null), 5000);
    }
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
            <div className="position-relative rounded-3 overflow-hidden shadow-sm bg-light border mb-3 d-flex align-items-center justify-content-center" style={{ height: '420px', borderColor: 'var(--border-light)' }}>
              <img
                src={imagesList[activeImageIndex] || item.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80'}
                alt={item.title}
                className="w-100 h-100"
                style={{ objectFit: 'contain', maxHeight: '420px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80';
                }}
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
              <div className="d-flex gap-2 flex-wrap">
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
                    <img
                      src={img}
                      alt=""
                      className="w-100 h-100 rounded"
                      style={{ objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80';
                      }}
                    />
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
                    src={item.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'}
                    alt={item.owner?.name || 'Owner'}
                    className="rounded-circle"
                    style={{ width: '52px', height: '52px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.98rem' }}>
                      {item.owner?.name || 'Community Member'}
                    </h6>
                    <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {item.owner?.city || item.city} • {item.owner?.joined || 'Active Member'}
                    </span>
                    <div className="d-flex align-items-center gap-2 mt-1.5">
                      <span className="badge bg-light text-dark border px-2.5 py-1" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-check-circle-fill text-success me-1"></i> {item.owner?.exchanges || 0} completed swaps
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <span className="badge bg-warning text-dark fw-bold px-3 py-1.5" style={{ fontSize: '0.92rem' }}>
                    {item.owner?.rating || 5.0} ★
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

            {/* CTA Buttons / Owner Actions */}
            {isOwner ? (
              <div>
                <div className="alert alert-secondary py-3 px-3 mb-3 d-flex align-items-center gap-2 rounded-3 border" style={{ fontSize: '0.86rem', borderColor: 'var(--border-medium)' }}>
                  <i className="bi bi-person-check-fill text-primary fs-5 flex-shrink-0"></i>
                  <div>
                    <strong className="text-dark">This is your item listing.</strong> You cannot propose an exchange for your own post.
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <Link
                    to={`/edit-item/${item.id}`}
                    className="btn-nordic-primary flex-grow-1 py-3 text-center text-decoration-none shadow-sm d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-pencil-square"></i> Edit Listing
                  </Link>

                  <Link
                    to="/my-items"
                    className="btn btn-outline-dark px-4 py-3 text-center text-decoration-none d-flex align-items-center justify-content-center gap-2"
                  >
                    <i className="bi bi-collection"></i> Manage in My Items
                  </Link>
                </div>
              </div>
            ) : (
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
            )}

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
