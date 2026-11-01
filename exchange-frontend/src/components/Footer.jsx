import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="nordic-footer">
      <div className="container-xl">
        
        {/* Pre-Footer Newsletter Bar */}
        <div
          className="p-4 p-md-5 rounded-3 mb-5 position-relative overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-accent-banner)',
            border: '1px solid var(--border-medium)'
          }}
        >
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <h3 className="font-serif fw-bold mb-2" style={{ fontSize: '1.75rem', lineHeight: 1.35 }}>
                Join Our Circular Community
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: '0.94rem', lineHeight: 1.7 }}>
                Receive weekly alerts for newly listed items in Mandalay & Yangon and tips for mindful reuse.
              </p>
            </div>
            <div className="col-lg-6">
              {subscribed ? (
                <div className="alert alert-success mb-0 py-3 px-4 text-center" style={{ fontSize: '0.90rem' }}>
                  <i className="bi bi-check-circle-fill me-2"></i> Thank you! You're subscribed to local swap updates.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="d-flex flex-wrap flex-sm-nowrap gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    placeholder="Enter your email address"
                    style={{ height: '48px', fontSize: '0.92rem' }}
                  />
                  <button
                    type="submit"
                    className="btn-nordic-primary text-nowrap px-4"
                    style={{ height: '48px' }}
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="row g-4 mb-5">
          {/* Col 1: Brand & Purpose */}
          <div className="col-12 col-lg-4">
            <div className="d-flex align-items-center mb-3">
              <div
                className="d-flex align-items-center justify-content-center me-2.5"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-brown)',
                  color: '#fff',
                  fontSize: '1.15rem'
                }}
              >
                <i className="bi bi-arrow-repeat"></i>
              </div>
              <div>
                <span className="brand-title">RECIRCULATE</span>
                <span className="brand-subtitle">COMMUNITY EXCHANGE</span>
              </div>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: '0.92rem', lineHeight: 1.75, maxWidth: '340px' }}>
              A peer-to-peer bartering and item exchange platform built for sustainable living. Connecting communities nationwide across Myanmar to give pre-loved belongings a second life.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge p-2 px-3" style={{ backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)', fontSize: '0.80rem' }}>
                <i className="bi bi-geo-alt-fill me-1 text-danger"></i> Nationwide Community Hubs
              </span>
              <span className="badge p-2 px-3" style={{ backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)', fontSize: '0.80rem' }}>
                <i className="bi bi-truck me-1 text-primary"></i> Local & Intercity Delivery
              </span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="footer-title">Browse Items</h6>
            <Link to="/browse?cat=electronics" className="footer-link">Electronics</Link>
            <Link to="/browse?cat=books" className="footer-link">Books & Study</Link>
            <Link to="/browse?cat=clothing" className="footer-link">Clothing</Link>
            <Link to="/browse?cat=household" className="footer-link">Household Items</Link>
            <Link to="/browse?cat=furniture" className="footer-link">Furniture</Link>
            <Link to="/browse?cat=other" className="footer-link">Other Items</Link>
          </div>

          {/* Col 3: Public Platform Links */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="footer-title">Platform</h6>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/browse" className="footer-link">Browse Marketplace</Link>
            <Link to="/how-it-works" className="footer-link">How It Works & Safety</Link>
            <Link to="/login" className="footer-link">Member Sign In</Link>
            <Link to="/register" className="footer-link">Join Community</Link>
            <Link to="/admin/login" className="footer-link">Admin Portal</Link>
          </div>

          {/* Col 4: Community & Safety */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="footer-title">Trust & Policies</h6>
            <Link to="/how-it-works" className="footer-link">In-Person &amp; Courier Rules</Link>
            <Link to="/how-it-works" className="footer-link">Two-Sided Completion</Link>
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service: Items exchanged must be honest condition with no cash surcharge allowed.'); }} className="footer-link">Terms of Service</a>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy: User mobile numbers and precise street addresses are confidential until swap acceptance.'); }} className="footer-link">Privacy Policy</a>
            <Link to="/reports" className="footer-link">Dispute Mediation</Link>
          </div>

          {/* Col 5: University & About */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="footer-title">About Project</h6>
            <span className="text-muted d-block mb-2" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
              Final-Year University Capstone Project
            </span>
            <span className="text-muted d-block mb-3" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
              Tech Stack: React.js, Bootstrap 5, Laravel REST API, MySQL
            </span>
            <div className="d-flex gap-2">
              <span className="btn btn-sm btn-light border p-2" title="GitHub Repository"><i className="bi bi-github"></i></span>
              <span className="btn btn-sm btn-light border p-2" title="Community Forum"><i className="bi bi-chat-heart"></i></span>
              <span className="btn btn-sm btn-light border p-2" title="Contact University Hub"><i className="bi bi-envelope"></i></span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-4 border-top d-flex flex-wrap justify-content-between align-items-center" style={{ borderColor: 'var(--border-light)' }}>
          <span className="text-muted" style={{ fontSize: '0.84rem' }}>
            © {new Date().getFullYear()} ReCirculate Community Market. Community-Based Item Exchange Platform.
          </span>
          <span className="text-muted" style={{ fontSize: '0.84rem' }}>
            Serving Communities Nationwide • Giving Items a Second Life
          </span>
        </div>

      </div>
    </footer>
  );
}
