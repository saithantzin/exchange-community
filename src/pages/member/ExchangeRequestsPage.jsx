import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';
import MemberProfileModal from '../../components/MemberProfileModal';

export default function ExchangeRequestsPage() {
  const { currentUser } = useAuth();
  const { requests, acceptRequest, rejectRequest, cancelRequest, exchanges } = useExchange();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('incoming');
  const [toastMessage, setToastMessage] = useState(null);

  // Member Profile Modal state
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const incomingList = requests.filter(r => r.type === 'incoming');
  const outgoingList = requests.filter(r => r.type === 'outgoing');

  const handleAccept = (id) => {
    const createdExchange = acceptRequest(id);
    const exchangeId = createdExchange?.id;

    setToastMessage({
      title: 'Exchange Proposal Accepted!',
      text: createdExchange?.isIntercity
        ? 'Intercity trade workflow initialized! Both parties can now track courier dispatch.'
        : 'Exchange accepted! In-person trade workflow created.',
      exchangeId: exchangeId
    });
  };

  const handleReject = (id) => {
    rejectRequest(id);
    setToastMessage({
      title: 'Proposal Declined',
      text: 'You declined this exchange offer.'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCancel = (id) => {
    cancelRequest(id);
    setToastMessage({
      title: 'Proposal Cancelled',
      text: 'Your outgoing proposal has been withdrawn.'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh' }}>
      <div className="container-xl">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className="position-fixed bottom-0 end-0 m-4 p-3 bg-white border rounded-3 shadow-lg d-flex align-items-center gap-3"
            style={{ zIndex: 1090, maxWidth: '480px', borderColor: 'var(--primary-brown)', borderLeftWidth: '6px' }}
          >
            <i className="bi bi-check-circle-fill fs-3 text-success"></i>
            <div className="flex-grow-1" style={{ fontSize: '0.85rem' }}>
              <div className="fw-bold text-dark">{toastMessage.title}</div>
              <div className="text-muted">{toastMessage.text}</div>
              {toastMessage.exchangeId && (
                <div className="mt-2">
                  <Link
                    to={`/exchange/${toastMessage.exchangeId}`}
                    className="btn btn-sm btn-primary py-1 px-2.5 text-white fw-medium text-decoration-none"
                    style={{ fontSize: '0.80rem' }}
                  >
                    <i className="bi bi-box-seam me-1"></i> Open Exchange &amp; Courier Tracker →
                  </Link>
                </div>
              )}
            </div>
            <button onClick={() => setToastMessage(null)} className="btn btn-sm btn-link text-muted p-0">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1" style={{ fontSize: '0.8rem' }}>
              <li className="breadcrumb-item"><Link to="/dashboard" className="text-muted text-decoration-none">Dashboard</Link></li>
              <li className="breadcrumb-item active text-dark">Exchange Requests</li>
            </ol>
          </nav>
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <div>
              <h1 className="font-serif fw-bold h3 mb-0 text-dark">Exchange Proposals</h1>
              <span className="text-muted" style={{ fontSize: '0.84rem' }}>
                Review incoming offers for your items, verify requester profiles, and manage trades across Myanmar.
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Incoming vs Outgoing) */}
        <div className="d-flex border-bottom mb-4" style={{ borderColor: 'var(--border-light)' }}>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`btn btn-link text-decoration-none py-2 px-4 fw-semibold ${activeTab === 'incoming' ? 'text-dark border-bottom border-3' : 'text-muted'}`}
            style={{ borderColor: activeTab === 'incoming' ? 'var(--primary-brown) !important' : 'transparent', fontSize: '0.94rem' }}
          >
            <i className="bi bi-inbox-fill me-2"></i>
            Incoming Requests ({incomingList.length})
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`btn btn-link text-decoration-none py-2 px-4 fw-semibold ${activeTab === 'outgoing' ? 'text-dark border-bottom border-3' : 'text-muted'}`}
            style={{ borderColor: activeTab === 'outgoing' ? 'var(--primary-brown) !important' : 'transparent', fontSize: '0.94rem' }}
          >
            <i className="bi bi-send-check-fill me-2"></i>
            Outgoing Requests ({outgoingList.length})
          </button>
        </div>

        {/* Incoming Tab Content */}
        {activeTab === 'incoming' && (
          <div>
            {incomingList.length === 0 ? (
              <div className="bg-white p-5 rounded-3 border text-center shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
                <i className="bi bi-inbox fs-2 text-muted mb-2 d-block"></i>
                <h5 className="font-serif fw-bold mb-1">No Incoming Proposals</h5>
                <p className="text-muted small">You haven't received any swap requests for your listed items yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {incomingList.map(req => {
                  const isIntercity = Boolean(
                    req.isIntercity ||
                    req.handoverMethod?.toLowerCase().includes('courier') ||
                    req.handoverMethod?.toLowerCase().includes('express') ||
                    req.handoverMethod?.toLowerCase().includes('delivery') ||
                    (req.requestedItem?.city && req.offeredItem?.city && req.requestedItem.city !== req.offeredItem.city)
                  );

                  return (
                    <div key={req.id} className="bg-white p-4 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
                      <div className="row g-3 align-items-center">
                        
                        {/* Requester Info */}
                        <div className="col-12 col-md-3">
                          <div className="d-flex align-items-center gap-2.5 mb-2">
                            <img
                              src={req.requester.avatar}
                              alt={req.requester.name}
                              className="rounded-circle cursor-pointer border"
                              style={{ width: '48px', height: '48px', objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedMember(req.requester);
                                setSelectedRequest(req);
                              }}
                              title="Click to view full member profile"
                            />
                            <div>
                              <h6
                                className="mb-0 fw-bold text-dark text-decoration-hover cursor-pointer"
                                style={{ fontSize: '0.94rem', cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedMember(req.requester);
                                  setSelectedRequest(req);
                                }}
                                title="Click to view member profile"
                              >
                                {req.requester.name} <i className="bi bi-patch-check-fill text-success" style={{ fontSize: '0.80rem' }}></i>
                              </h6>
                              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                                <i className="bi bi-geo-alt-fill text-danger me-0.5"></i>
                                {req.requester.city} • <span className="text-warning-emphasis font-bold">{req.requester.rating}★</span>
                              </span>
                            </div>
                          </div>

                          <div className="mb-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMember(req.requester);
                                setSelectedRequest(req);
                              }}
                              className="btn btn-sm btn-outline-secondary py-1 px-2.5 rounded-pill d-inline-flex align-items-center gap-1.5"
                              style={{ fontSize: '0.78rem' }}
                            >
                              <i className="bi bi-person-lines-fill text-primary"></i> View Member Profile
                            </button>
                          </div>

                          <div className="d-flex flex-wrap gap-1 align-items-center">
                            {isIntercity ? (
                              <span className="badge px-2.5 py-1 text-white" style={{ backgroundColor: '#2C5B7C', fontSize: '0.73rem' }}>
                                <i className="bi bi-truck me-1"></i> Intercity Courier
                              </span>
                            ) : (
                              <span className="badge px-2.5 py-1 text-dark" style={{ backgroundColor: '#EFE6DB', fontSize: '0.73rem' }}>
                                <i className="bi bi-geo-alt me-1"></i> In-Person Meetup
                              </span>
                            )}
                            <span
                              className="badge px-2.5 py-1"
                              style={{
                                backgroundColor: req.status === 'Pending' ? '#F9F1E2' : req.status === 'Accepted' ? '#EAF2EC' : '#FDE8E8',
                                color: req.status === 'Pending' ? '#87571B' : req.status === 'Accepted' ? '#2E693D' : '#9B1C1C',
                                fontSize: '0.73rem'
                              }}
                            >
                              {req.status}
                            </span>
                          </div>
                        </div>

                        {/* Item Comparison */}
                        <div className="col-12 col-md-6">
                          <div className="p-3.5 rounded-3 bg-light border">
                            <div className="row g-2 align-items-center">
                              
                              <div className="col-5">
                                <span className="text-muted d-block mb-1" style={{ fontSize: '0.74rem' }}>They Offer:</span>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                  <img src={req.offeredItem.image} alt="" className="rounded flex-shrink-0" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                                  <div className="min-w-0">
                                    <span className="fw-semibold small text-truncate d-block text-dark" style={{ fontSize: '0.86rem' }}>
                                      {req.offeredItem.title}
                                    </span>
                                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                      {req.offeredItem.city || req.requester.city}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="col-2 text-center text-muted">
                                <i className="bi bi-arrow-left-right fs-5"></i>
                              </div>

                              <div className="col-5">
                                <span className="text-muted d-block mb-1" style={{ fontSize: '0.74rem' }}>For Your Item:</span>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                  <img src={req.requestedItem.image} alt="" className="rounded flex-shrink-0" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                                  <div className="min-w-0">
                                    <span className="fw-semibold small text-truncate d-block text-dark" style={{ fontSize: '0.86rem' }}>
                                      {req.requestedItem.title}
                                    </span>
                                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                                      {req.requestedItem.city}
                                    </span>
                                  </div>
                                </div>
                              </div>

                            </div>

                            {/* Proposal Message */}
                            {req.message && (
                              <div className="mt-2.5 pt-2 border-top text-muted" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
                                <i className="bi bi-chat-left-quote me-1 text-primary"></i> "{req.message}"
                              </div>
                            )}

                            {/* Handover & City Route Indicator */}
                            <div className="mt-2 pt-1 border-top d-flex flex-wrap justify-content-between align-items-center text-muted" style={{ fontSize: '0.78rem' }}>
                              <span>
                                <i className="bi bi-box-seam me-1 text-brown" style={{ color: 'var(--primary-brown)' }}></i>
                                Handover: <strong className="text-dark">{req.handoverMethod}</strong>
                              </span>
                              <span className="text-muted">
                                Sent: {req.date}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-12 col-md-3 text-md-end">
                          {req.status === 'Pending' && (
                            <div className="d-flex flex-md-column gap-2 justify-content-end">
                              <button
                                onClick={() => handleAccept(req.id)}
                                className="btn btn-sm btn-success py-2 px-3 fw-medium"
                                style={{ fontSize: '0.86rem' }}
                              >
                                <i className="bi bi-check-lg me-1"></i> Accept Proposal
                              </button>
                              
                              <button
                                onClick={() => {
                                  setSelectedMember(req.requester);
                                  setSelectedRequest(req);
                                }}
                                className="btn btn-sm btn-outline-secondary py-1.5 px-3"
                                style={{ fontSize: '0.84rem' }}
                              >
                                <i className="bi bi-person me-1"></i> View Profile
                              </button>

                              <button
                                onClick={() => handleReject(req.id)}
                                className="btn btn-sm btn-outline-danger py-1.5 px-3"
                                style={{ fontSize: '0.84rem' }}
                              >
                                Decline
                              </button>
                            </div>
                          )}

                          {req.status === 'Accepted' && (
                            <div className="d-flex flex-md-column gap-2 justify-content-end">
                              <span className="text-success small fw-bold d-block">
                                <i className="bi bi-check2-circle me-1"></i> Exchange Active
                              </span>
                              
                              <button
                                onClick={() => {
                                  setSelectedMember(req.requester);
                                  setSelectedRequest(req);
                                }}
                                className="btn btn-sm btn-outline-secondary py-1 px-2.5"
                                style={{ fontSize: '0.80rem' }}
                              >
                                <i className="bi bi-person me-1"></i> View Requester Profile
                              </button>

                              {(() => {
                                const relatedExchange = exchanges.find(e =>
                                  e.itemB?.title === req.offeredItem?.title ||
                                  e.itemA?.title === req.requestedItem?.title
                                );
                                const targetUrl = relatedExchange ? `/exchange/${relatedExchange.id}` : '/history';

                                return (
                                  <Link
                                    to={targetUrl}
                                    className="btn btn-sm btn-primary py-2 px-3 fw-medium text-white text-decoration-none shadow-xs"
                                    style={{ fontSize: '0.84rem' }}
                                  >
                                    <i className="bi bi-truck me-1"></i>
                                    {isIntercity ? 'Open Courier Tracking' : 'View Exchange Details'}
                                  </Link>
                                );
                              })()}
                            </div>
                          )}

                          {req.status === 'Rejected' && (
                            <span className="text-muted small">Proposal Declined</span>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Outgoing Tab Content */}
        {activeTab === 'outgoing' && (
          <div>
            {outgoingList.length === 0 ? (
              <div className="bg-white p-5 rounded-3 border text-center shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
                <i className="bi bi-send fs-2 text-muted mb-2 d-block"></i>
                <h5 className="font-serif fw-bold mb-1">No Outgoing Proposals</h5>
                <p className="text-muted small">You haven't sent any proposals to other members yet.</p>
                <Link to="/browse" className="btn-nordic-primary btn-sm py-2 px-3 text-decoration-none">
                  Browse Available Items
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {outgoingList.map(req => (
                  <div key={req.id} className="bg-white p-4 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="row g-3 align-items-center">
                      
                      <div className="col-12 col-md-3">
                        <span className="text-muted d-block small mb-1" style={{ fontSize: '0.78rem' }}>Sent to Member:</span>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          {req.recipient.avatar && (
                            <img
                              src={req.recipient.avatar}
                              alt={req.recipient.name}
                              className="rounded-circle border"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <h6
                              className="mb-0 fw-bold text-dark cursor-pointer"
                              style={{ fontSize: '0.94rem', cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedMember(req.recipient);
                                setSelectedRequest(req);
                              }}
                            >
                              {req.recipient.name}
                            </h6>
                            <span className="text-muted small" style={{ fontSize: '0.80rem' }}>{req.recipient.city}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMember(req.recipient);
                            setSelectedRequest(req);
                          }}
                          className="btn btn-sm btn-outline-secondary py-1 px-2.5 rounded-pill mb-2 d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '0.76rem' }}
                        >
                          <i className="bi bi-person"></i> View Member Profile
                        </button>

                        <div>
                          <span className="badge px-2.5 py-1" style={{ backgroundColor: req.status === 'Pending' ? '#F9F1E2' : '#EAF2EC', color: req.status === 'Pending' ? '#87571B' : '#2E693D', fontSize: '0.76rem' }}>
                            Status: {req.status}
                          </span>
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <div className="p-3.5 rounded-3 bg-light border">
                          <div className="row g-2 align-items-center">
                            <div className="col-5">
                              <span className="text-muted d-block mb-1" style={{ fontSize: '0.74rem' }}>You Offered:</span>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <img src={req.offeredItem.image} alt="" className="rounded flex-shrink-0" style={{ width: '46px', height: '46px', objectFit: 'cover' }} />
                                <span className="fw-semibold small text-truncate text-dark" style={{ fontSize: '0.86rem' }}>{req.offeredItem.title}</span>
                              </div>
                            </div>
                            <div className="col-2 text-center text-muted">
                              <i className="bi bi-arrow-right fs-5"></i>
                            </div>
                            <div className="col-5">
                              <span className="text-muted d-block mb-1" style={{ fontSize: '0.74rem' }}>In Return For:</span>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <img src={req.requestedItem.image} alt="" className="rounded flex-shrink-0" style={{ width: '46px', height: '46px', objectFit: 'cover' }} />
                                <span className="fw-semibold small text-truncate text-dark" style={{ fontSize: '0.86rem' }}>{req.requestedItem.title}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-3 text-md-end">
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => handleCancel(req.id)}
                            className="btn btn-sm btn-outline-secondary py-2 px-3"
                            style={{ fontSize: '0.84rem' }}
                          >
                            Cancel Proposal
                          </button>
                        )}
                        {req.status === 'Cancelled' && (
                          <span className="text-muted small">Proposal Cancelled</span>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Member Profile Modal */}
      <MemberProfileModal
        show={Boolean(selectedMember)}
        onClose={() => {
          setSelectedMember(null);
          setSelectedRequest(null);
        }}
        member={selectedMember}
        requestStatus={selectedRequest?.status}
        isIntercity={Boolean(
          selectedRequest?.isIntercity ||
          selectedRequest?.handoverMethod?.toLowerCase().includes('courier') ||
          selectedRequest?.handoverMethod?.toLowerCase().includes('express')
        )}
        onAccept={selectedRequest?.status === 'Pending' ? () => handleAccept(selectedRequest.id) : null}
      />
    </div>
  );
}
