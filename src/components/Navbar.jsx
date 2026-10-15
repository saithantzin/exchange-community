import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExchange } from '../context/ExchangeContext';

export default function Navbar() {
  const { currentUser, isLoggedIn, logout, quickLogin } = useAuth();
  const { unreadCount } = useExchange();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Main Sticky Navbar */}
      <nav className="nordic-navbar py-3">
        <div className="container-fluid px-4 px-lg-5 d-flex align-items-center justify-content-between">
          
          {/* Logo */}
          <Link to="/" className="d-flex align-items-center text-decoration-none">
            <div
              className="d-flex align-items-center justify-content-center me-3"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-brown)',
                color: '#fff',
                fontSize: '1.25rem'
              }}
            >
              <i className="bi bi-arrow-repeat"></i>
            </div>
            <div>
              <span className="brand-title">RECIRCULATE</span>
              <span className="brand-subtitle">COMMUNITY EXCHANGE</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="d-none d-lg-flex align-items-center gap-2">
            <NavLink to="/" className={({ isActive }) => `nav-link-nordic ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
            <NavLink to="/browse" className={({ isActive }) => `nav-link-nordic ${isActive ? 'active' : ''}`}>
              Browse Items
            </NavLink>
            <NavLink to="/how-it-works" className={({ isActive }) => `nav-link-nordic ${isActive ? 'active' : ''}`}>
              How It Works &amp; Safety
            </NavLink>
            {isLoggedIn && (
              <>
                <NavLink to="/matches" className={({ isActive }) => `nav-link-nordic ${isActive ? 'active' : ''}`}>
                  Smart Matches
                </NavLink>
                <NavLink to="/requests" className={({ isActive }) => `nav-link-nordic ${isActive ? 'active' : ''}`}>
                  Requests
                </NavLink>
              </>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="d-none d-md-flex align-items-center gap-3">
            {/* List an Item Button */}
            <Link
              to={isLoggedIn ? "/add-item" : "/login"}
              className="btn py-2 px-3 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
              style={{
                backgroundColor: 'var(--primary-brown)',
                color: '#FFFFFF',
                fontSize: '0.88rem',
                borderRadius: '8px',
                border: 'none',
                letterSpacing: '0.02em'
              }}
            >
              <i className="bi bi-plus-circle me-1"></i> List an Item
            </Link>

            {/* If Member is Logged in, show Notifications Bell */}
            {isLoggedIn && (
              <Link
                to="/notifications"
                className="btn position-relative border rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '40px', height: '40px', backgroundColor: '#FFFFFF', borderColor: '#C8B9A6' }}
                title="Notifications"
              >
                <i className="bi bi-bell text-dark fs-6"></i>
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: '0.64rem', padding: '3px 6px' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Guest vs Member View */}
            {!isLoggedIn ? (
              <div className="d-flex align-items-center gap-3">
                <Link
                  to="/login"
                  className="text-decoration-none fw-semibold px-2"
                  style={{ color: '#2C1D15', fontSize: '0.92rem', letterSpacing: '0.02em' }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn py-2 px-4 fw-semibold shadow-sm"
                  style={{
                    backgroundColor: 'var(--primary-brown)',
                    color: '#FFFFFF',
                    fontSize: '0.92rem',
                    borderRadius: '8px',
                    border: 'none'
                  }}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="position-relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="d-flex align-items-center gap-2.5 btn btn-link text-decoration-none p-1.5 pe-3 border rounded-pill shadow-sm"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#C8B9A6' }}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="rounded-circle"
                    style={{ width: '34px', height: '34px', objectFit: 'cover' }}
                  />
                  <div className="text-start pe-2 d-none d-xl-block">
                    <span className="d-block fw-bold text-dark" style={{ fontSize: '0.86rem', lineHeight: 1.2 }}>
                      {currentUser.name}
                    </span>
                    <span style={{ color: 'var(--primary-brown)', fontSize: '0.74rem', fontWeight: 500 }}>
                      {currentUser.city}
                    </span>
                  </div>
                  <i className="bi bi-chevron-down text-dark pe-1" style={{ fontSize: '0.75rem' }}></i>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-3"
                    style={{ minWidth: '240px', zIndex: 1050, borderColor: 'var(--border-light)' }}
                  >
                    <div className="px-2 py-2 border-bottom mb-2">
                      <span className="fw-bold d-block text-truncate" style={{ fontSize: '0.92rem' }}>{currentUser.name}</span>
                      <span className="text-muted d-block text-truncate" style={{ fontSize: '0.78rem' }}>{currentUser.email}</span>
                      <span className="badge mt-2" style={{ backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)', fontSize: '0.74rem', padding: '4px 10px' }}>
                        Member &nbsp;•&nbsp; {currentUser.city}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="dropdown-item py-2 px-3 rounded d-flex align-items-center gap-2 mb-1"
                      style={{ fontSize: '0.88rem' }}
                    >
                      <i className="bi bi-speedometer2 text-muted"></i> Member Dashboard
                    </Link>
                    <Link
                      to="/my-items"
                      onClick={() => setUserDropdownOpen(false)}
                      className="dropdown-item py-2 px-3 rounded d-flex align-items-center gap-2 mb-1"
                      style={{ fontSize: '0.88rem' }}
                    >
                      <i className="bi bi-box-seam text-muted"></i> My Listed Items
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="dropdown-item py-2 px-3 rounded d-flex align-items-center gap-2 mb-1"
                      style={{ fontSize: '0.88rem' }}
                    >
                      <i className="bi bi-clock-history text-muted"></i> Exchange History
                    </Link>
                    <Link
                      to="/reports"
                      onClick={() => setUserDropdownOpen(false)}
                      className="dropdown-item py-2 px-3 rounded d-flex align-items-center gap-2 mb-1"
                      style={{ fontSize: '0.88rem' }}
                    >
                      <i className="bi bi-flag text-muted"></i> Reports &amp; Disputes
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="dropdown-item py-2 px-3 rounded d-flex align-items-center gap-2 mb-2"
                      style={{ fontSize: '0.88rem' }}
                    >
                      <i className="bi bi-person-gear text-muted"></i> Profile &amp; Settings
                    </Link>

                    <div className="dropdown-divider my-2"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dropdown-item py-2 px-3 rounded text-danger d-flex align-items-center gap-2"
                      style={{ fontSize: '0.88rem' }}
                    >
                      <i className="bi bi-box-arrow-right"></i> Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="d-flex d-lg-none align-items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-outline-secondary border-0 p-2"
              aria-label="Toggle Navigation"
            >
              <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-4 text-dark`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="d-lg-none mt-3 p-3 bg-white rounded-3 shadow-lg border" style={{ borderColor: 'var(--border-light)' }}>
            <div className="d-flex flex-column gap-2 mb-3">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                Home
              </Link>
              <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                Browse Items
              </Link>
              <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                How It Works &amp; Safety
              </Link>
              {isLoggedIn && (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                    Dashboard
                  </Link>
                  <Link to="/my-items" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                    My Listed Items
                  </Link>
                  <Link to="/requests" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                    Exchange Requests
                  </Link>
                  <Link to="/matches" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                    Smart Matches
                  </Link>
                  <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                    Exchange History
                  </Link>
                  <Link to="/reports" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                    Reports &amp; Disputes
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                    Profile &amp; Settings
                  </Link>
                  <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="py-2 text-decoration-none text-dark fw-medium border-bottom">
                    Notifications ({unreadCount})
                  </Link>
                </>
              )}
            </div>

            <div className="py-2 d-flex flex-column gap-2 pb-3">
              <Link
                to={isLoggedIn ? "/add-item" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="btn-nordic-secondary w-100 py-2 text-center text-decoration-none"
              >
                <i className="bi bi-plus-circle me-1"></i> List an Item
              </Link>

              {!isLoggedIn ? (
                <div className="d-flex gap-2 mt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline-dark w-50 py-2 text-center text-decoration-none">
                    Log In
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-nordic-primary w-50 py-2 text-center text-decoration-none">
                    Register
                  </Link>
                </div>
              ) : (
                <div className="border rounded p-3 bg-light mt-2">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <img src={currentUser.avatar} alt={currentUser.name} className="rounded-circle" style={{ width: '36px', height: '36px' }} />
                    <div>
                      <div className="fw-bold" style={{ fontSize: '0.88rem' }}>{currentUser.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.76rem' }}>{currentUser.city}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="btn btn-sm btn-outline-danger w-100 mt-2"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
