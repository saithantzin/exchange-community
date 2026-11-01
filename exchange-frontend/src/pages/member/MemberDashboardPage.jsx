import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExchange } from '../../context/ExchangeContext';
import { SMART_MATCHES_DATA } from '../../data/mockData';

export default function MemberDashboardPage() {
  const { currentUser } = useAuth();
  const { myItems, requests, exchanges, notifications } = useExchange();
  const navigate = useNavigate();

  const incomingRequests = requests.filter(r => r.type === 'incoming');
  const outgoingRequests = requests.filter(r => r.type === 'outgoing');
  const pendingIncoming = incomingRequests.filter(r => r.status === 'Pending');
  const ongoingExchanges = exchanges.filter(e => !e.isCompleted);
  const completedExchanges = exchanges.filter(e => e.isCompleted);

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh' }}>
      <div className="container-xl">
        
        {/* Welcome Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <div className="d-flex align-items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="rounded-circle border"
              style={{ width: '56px', height: '56px', objectFit: 'cover', borderColor: 'var(--primary-brown)' }}
            />
            <div>
              <span className="section-pre-title mb-0">Community Member Portal</span>
              <h1 className="font-serif fw-bold h3 mb-1 text-dark" style={{ lineHeight: 1.3 }}>
                Welcome, {currentUser.name}
              </h1>
              <span className="text-muted" style={{ fontSize: '0.86rem' }}>
                <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                Based in <strong>{currentUser.city}</strong> • {currentUser.rating} ★ Community Trust Score
              </span>
            </div>
          </div>

          <div className="d-flex gap-2.5 mt-3 mt-md-0">
            <Link to="/add-item" className="btn-nordic-primary py-2 px-3.5" style={{ fontSize: '0.88rem' }}>
              <i className="bi bi-plus-circle"></i> List New Item
            </Link>
            <Link to="/browse" className="btn-nordic-secondary py-2 px-3.5" style={{ fontSize: '0.88rem' }}>
              <i className="bi bi-search"></i> Browse Community
            </Link>
          </div>
        </div>

        {/* 4 Summary Stat Cards (Requirement 3.A) */}
        <div className="row g-3 mb-5">
          {/* Card 1: My Items */}
          <div className="col-6 col-lg-3">
            <div className="bg-white p-3.5 p-md-4 rounded-3 border h-100 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-semibold" style={{ fontSize: '0.84rem' }}>My Active Items</span>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: '38px', height: '38px', backgroundColor: 'var(--primary-brown)' }}
                >
                  <i className="bi bi-box-seam"></i>
                </div>
              </div>
              <div className="h2 font-serif fw-bold mb-1 text-dark">{myItems.length}</div>
              <Link to="/my-items" className="text-decoration-none small text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
                Manage your listings <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </Link>
            </div>
          </div>

          {/* Card 2: Incoming Requests */}
          <div className="col-6 col-lg-3">
            <div className="bg-white p-3.5 p-md-4 rounded-3 border h-100 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-semibold" style={{ fontSize: '0.84rem' }}>Incoming Requests</span>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: '38px', height: '38px', backgroundColor: '#87571B' }}
                >
                  <i className="bi bi-inbox-fill"></i>
                </div>
              </div>
              <div className="h2 font-serif fw-bold mb-1 text-dark">
                {pendingIncoming.length}
                {pendingIncoming.length > 0 && (
                  <span className="badge bg-warning text-dark ms-2 fw-normal px-2.5 py-1" style={{ fontSize: '0.76rem' }}>Needs Action</span>
                )}
              </div>
              <Link to="/requests" className="text-decoration-none small text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
                Review proposals <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </Link>
            </div>
          </div>

          {/* Card 3: Outgoing Requests */}
          <div className="col-6 col-lg-3">
            <div className="bg-white p-3.5 p-md-4 rounded-3 border h-100 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-semibold" style={{ fontSize: '0.84rem' }}>Outgoing Requests</span>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: '38px', height: '38px', backgroundColor: '#2C5B7C' }}
                >
                  <i className="bi bi-send-check-fill"></i>
                </div>
              </div>
              <div className="h2 font-serif fw-bold mb-1 text-dark">{outgoingRequests.length}</div>
              <Link to="/requests" className="text-decoration-none small text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
                View sent proposals <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </Link>
            </div>
          </div>

          {/* Card 4: Ongoing Exchanges */}
          <div className="col-6 col-lg-3">
            <div className="bg-white p-3.5 p-md-4 rounded-3 border h-100 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-semibold" style={{ fontSize: '0.84rem' }}>Ongoing Swaps</span>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: '38px', height: '38px', backgroundColor: '#3E6347' }}
                >
                  <i className="bi bi-arrow-left-right"></i>
                </div>
              </div>
              <div className="h2 font-serif fw-bold mb-1 text-dark">{ongoingExchanges.length}</div>
              <Link to="/history" className="text-decoration-none small text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
                View active exchanges <i className="bi bi-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="row g-4">
          
          {/* Left Column: Pending Actions & Ongoing Exchanges */}
          <div className="col-12 col-lg-8">
            
            {/* Active Exchange Tracker Alert (Requirement 3.A) */}
            {ongoingExchanges.length > 0 && (
              <div className="p-4 rounded-3 border bg-white mb-4 shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="spinner-grow spinner-grow-sm text-success"></span>
                    <h5 className="font-serif fw-bold mb-0 text-dark">Active Exchange in Progress</h5>
                  </div>
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-1.5" style={{ fontSize: '0.78rem' }}>
                    ID: {ongoingExchanges[0].id}
                  </span>
                </div>

                <div className="p-3.5 rounded bg-light border mb-3">
                  <div className="row g-3 align-items-center">
                    <div className="col-5 text-center">
                      <img
                        src={ongoingExchanges[0].itemA.image}
                        alt="Your Item"
                        className="rounded mb-2"
                        style={{ width: '58px', height: '58px', objectFit: 'cover' }}
                      />
                      <div className="fw-semibold small text-truncate" style={{ fontSize: '0.86rem' }}>{ongoingExchanges[0].itemA.title}</div>
                      <span className="badge bg-light text-dark border px-2.5 py-1 mt-1" style={{ fontSize: '0.74rem' }}>
                        You Provide
                      </span>
                    </div>

                    <div className="col-2 text-center text-muted">
                      <i className="bi bi-arrow-left-right fs-4"></i>
                    </div>

                    <div className="col-5 text-center">
                      <img
                        src={ongoingExchanges[0].itemB.image}
                        alt="Partner Item"
                        className="rounded mb-2"
                        style={{ width: '58px', height: '58px', objectFit: 'cover' }}
                      />
                      <div className="fw-semibold small text-truncate" style={{ fontSize: '0.86rem' }}>{ongoingExchanges[0].itemB.title}</div>
                      <span className="badge bg-light text-dark border px-2.5 py-1 mt-1" style={{ fontSize: '0.74rem' }}>
                        You Receive
                      </span>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div className="small text-muted" style={{ fontSize: '0.86rem' }}>
                    <i className={`bi ${ongoingExchanges[0].isIntercity ? 'bi-truck text-primary' : 'bi-geo-alt text-brown'} me-1.5`}></i>
                    Handover: <strong>{ongoingExchanges[0].handoverMethod || (ongoingExchanges[0].isIntercity ? 'Intercity Courier Delivery' : 'In-Person Meetup')}</strong>
                  </div>
                  <Link
                    to={`/exchange/${ongoingExchanges[0].id}`}
                    className="btn-nordic-primary py-2 px-3.5"
                    style={{ fontSize: '0.85rem' }}
                  >
                    View Exchange Details <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            )}

            {/* Smart Matches Recommendation Snippet (Requirement 3.A & 3.D) */}
            <div className="bg-white p-4 rounded-3 border shadow-sm mb-4" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="section-pre-title mb-0">Rule-Based Recommendations</span>
                  <h5 className="font-serif fw-bold mb-0 text-dark">Suggested Swap Matches</h5>
                </div>
                <Link to="/matches" className="text-decoration-none small fw-semibold" style={{ color: 'var(--primary-brown)', fontSize: '0.86rem' }}>
                  View All Matches <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              <div className="row g-3">
                {SMART_MATCHES_DATA.slice(0, 2).map(m => (
                  <div key={m.id} className="col-12 col-md-6">
                    <div className="p-3.5 rounded border bg-light h-100 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-success text-white px-2.5 py-1" style={{ fontSize: '0.76rem' }}>
                          {m.matchScore}% Compatibility
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {m.intercity ? 'Intercity (MDY ⇄ YGN)' : 'Local MDY'}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-2.5 mb-2.5">
                        <img
                          src={m.offeredItem.image}
                          alt={m.offeredItem.title}
                          className="rounded flex-shrink-0"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1 text-truncate">
                          <h6 className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: '0.90rem' }}>
                            {m.offeredItem.title}
                          </h6>
                          <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                            By {m.offeredItem.ownerName} • {m.offeredItem.city}
                          </span>
                        </div>
                      </div>

                      <p className="text-muted mb-3 flex-grow-1" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                        {m.matchReason}
                      </p>

                      <Link
                        to="/matches"
                        className="btn-nordic-outline w-100 py-1.5 text-center justify-content-center"
                        style={{ fontSize: '0.82rem' }}
                      >
                        Inspect Match
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Listing Table */}
            <div className="bg-white p-4 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="font-serif fw-bold mb-0 text-dark">Your Current Listed Inventory</h5>
                <Link to="/my-items" className="text-decoration-none small text-muted">Manage ({myItems.length})</Link>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.84rem' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Condition</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myItems.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img src={item.image} alt={item.title} className="rounded" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
                            <span className="fw-medium text-dark text-truncate" style={{ maxWidth: '180px' }}>{item.title}</span>
                          </div>
                        </td>
                        <td>{item.categoryName}</td>
                        <td>
                          <span className="badge rounded-pill" style={{ backgroundColor: item.conditionBg, color: item.conditionColor }}>
                            {item.condition}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            {item.status || 'Available'}
                          </span>
                        </td>
                        <td className="text-end">
                          <Link to={`/item/${item.id}`} className="btn btn-sm btn-link text-dark p-0 me-2" title="View">
                            <i className="bi bi-eye"></i>
                          </Link>
                          <Link to={`/edit-item/${item.id}`} className="btn btn-sm btn-link text-muted p-0" title="Edit">
                            <i className="bi bi-pencil"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Notifications & Quick Actions */}
          <div className="col-12 col-lg-4">
            
            {/* Quick Action Shortcuts */}
            <div className="bg-white p-4 rounded-3 border shadow-sm mb-4" style={{ borderColor: 'var(--border-light)' }}>
              <h6 className="fw-bold text-dark font-serif mb-3" style={{ fontSize: '1.05rem' }}>Quick Navigation</h6>
              <div className="d-flex flex-column gap-2.5">
                <Link to="/add-item" className="btn btn-light border text-start d-flex align-items-center justify-content-between p-3 rounded-2" style={{ fontSize: '0.88rem' }}>
                  <span className="d-flex align-items-center gap-2.5">
                    <i className="bi bi-plus-square text-brown fs-6" style={{ color: 'var(--primary-brown)' }}></i>
                    List an Unwanted Item
                  </span>
                  <i className="bi bi-chevron-right text-muted" style={{ fontSize: '0.78rem' }}></i>
                </Link>

                <Link to="/requests" className="btn btn-light border text-start d-flex align-items-center justify-content-between p-3 rounded-2" style={{ fontSize: '0.88rem' }}>
                  <span className="d-flex align-items-center gap-2.5">
                    <i className="bi bi-arrow-left-right text-brown fs-6" style={{ color: 'var(--primary-brown)' }}></i>
                    Incoming Proposals ({pendingIncoming.length})
                  </span>
                  <i className="bi bi-chevron-right text-muted" style={{ fontSize: '0.78rem' }}></i>
                </Link>

                <Link to="/matches" className="btn btn-light border text-start d-flex align-items-center justify-content-between p-3 rounded-2" style={{ fontSize: '0.88rem' }}>
                  <span className="d-flex align-items-center gap-2.5">
                    <i className="bi bi-magic text-brown fs-6" style={{ color: 'var(--primary-brown)' }}></i>
                    Smart Match Recommendations
                  </span>
                  <i className="bi bi-chevron-right text-muted" style={{ fontSize: '0.78rem' }}></i>
                </Link>

                <Link to="/reports" className="btn btn-light border text-start d-flex align-items-center justify-content-between p-3 rounded-2" style={{ fontSize: '0.88rem' }}>
                  <span className="d-flex align-items-center gap-2.5">
                    <i className="bi bi-flag text-danger fs-6"></i>
                    Report Problem / Dispute
                  </span>
                  <i className="bi bi-chevron-right text-muted" style={{ fontSize: '0.78rem' }}></i>
                </Link>

                <Link to="/profile" className="btn btn-light border text-start d-flex align-items-center justify-content-between p-3 rounded-2" style={{ fontSize: '0.88rem' }}>
                  <span className="d-flex align-items-center gap-2.5">
                    <i className="bi bi-person-gear text-muted fs-6"></i>
                    Profile & City Settings
                  </span>
                  <i className="bi bi-chevron-right text-muted" style={{ fontSize: '0.78rem' }}></i>
                </Link>
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="bg-white p-4 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-dark font-serif mb-0" style={{ fontSize: '1.05rem' }}>Recent Alerts</h6>
                <Link to="/notifications" className="text-decoration-none small text-muted">All</Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 rounded-2 bg-light border" style={{ fontSize: '0.84rem' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1.5">
                      <span className="fw-bold text-dark text-truncate">{n.title}</span>
                      <span className="text-muted" style={{ fontSize: '0.74rem' }}>{n.time}</span>
                    </div>
                    <p className="text-muted mb-2" style={{ lineHeight: 1.55 }}>{n.message}</p>
                    <Link to={n.link} className="fw-semibold text-decoration-none" style={{ color: 'var(--primary-brown)', fontSize: '0.78rem' }}>
                      View details <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
