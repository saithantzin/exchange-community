import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useExchange } from '../../context/ExchangeContext';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, unreadCount } = useExchange();

  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '85vh' }}>
      <div className="container-xl">
        
        {/* Header */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-1" style={{ fontSize: '0.8rem' }}>
                <li className="breadcrumb-item"><Link to="/dashboard" className="text-muted text-decoration-none">Dashboard</Link></li>
                <li className="breadcrumb-item active text-dark">Notifications</li>
              </ol>
            </nav>
            <h1 className="font-serif fw-bold h3 mb-0 text-dark">Community Notifications</h1>
            <span className="text-muted" style={{ fontSize: '0.84rem' }}>
              Real-time updates regarding your proposals, shipping logs, and smart matches.
            </span>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="btn btn-sm btn-outline-secondary mt-3 mt-md-0"
            >
              <i className="bi bi-check2-all me-1"></i> Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="btn-group btn-group-sm">
            <button
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`btn ${filter === 'unread' ? 'btn-dark' : 'btn-outline-secondary'}`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="d-flex flex-column gap-3 mb-5">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white p-5 rounded-3 border text-center shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <i className="bi bi-bell-slash fs-2 text-muted mb-2 d-block"></i>
              <h5 className="font-serif fw-bold mb-1">No Notifications</h5>
              <p className="text-muted small">You are all caught up on your community alerts.</p>
            </div>
          ) : (
            filteredNotifications.map(n => (
              <div
                key={n.id}
                className="bg-white p-3 p-md-4 rounded-3 border shadow-sm d-flex flex-wrap justify-content-between align-items-center"
                style={{
                  borderColor: n.read ? 'var(--border-light)' : 'var(--primary-brown)',
                  borderLeftWidth: n.read ? '1px' : '5px'
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: n.type === 'request' ? '#87571B' : n.type === 'shipping' ? '#3E6347' : 'var(--primary-brown)',
                      fontSize: '1.1rem',
                      flexShrink: 0
                    }}
                  >
                    <i className={`bi ${n.type === 'request' ? 'bi-arrow-left-right' : n.type === 'shipping' ? 'bi-truck' : 'bi-magic'}`}></i>
                  </div>

                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="mb-0 fw-bold text-dark">{n.title}</h6>
                      {!n.read && (
                        <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.62rem' }}>New</span>
                      )}
                    </div>
                    <p className="text-muted mb-0 small mt-1">{n.message}</p>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>{n.time}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
                  <Link
                    to={n.link}
                    onClick={() => markNotificationAsRead(n.id)}
                    className="btn btn-sm btn-nordic-outline"
                    style={{ fontSize: '0.78rem' }}
                  >
                    View Details
                  </Link>

                  {!n.read && (
                    <button
                      onClick={() => markNotificationAsRead(n.id)}
                      className="btn btn-sm btn-link text-muted p-1"
                      title="Mark as read"
                    >
                      <i className="bi bi-check-lg"></i>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
