import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onLoginSuccess }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Mandalay (MDY)');
  const [phone, setPhone] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess({
      name: email.includes('yangon') ? 'Aung Myo Tun' : 'Thant Zin',
      email: email || 'thantzin@exchange.mm',
      city: email.includes('yangon') ? 'Yangon (YGN)' : 'Mandalay (MDY)',
      cityCode: email.includes('yangon') ? 'YGN' : 'MDY',
      avatar: email.includes('yangon')
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
    });
    onClose();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess({
      name: name || 'New Community Member',
      email: email || 'member@exchange.mm',
      city: city,
      cityCode: city.includes('MDY') ? 'MDY' : 'YGN',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80'
    });
    onClose();
  };

  const handleQuickDemo = (cityName) => {
    if (cityName === 'MDY') {
      onLoginSuccess({
        name: 'Thant Zin (Mandalay)',
        email: 'thantzin@exchange.mm',
        city: 'Mandalay (MDY)',
        cityCode: 'MDY',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
      });
    } else {
      onLoginSuccess({
        name: 'Kyaw Zin (Yangon)',
        email: 'kyawzin@exchange.mm',
        city: 'Yangon (YGN)',
        cityCode: 'YGN',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80'
      });
    }
    onClose();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(30, 24, 20, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1070 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg">
          
          <div className="modal-header">
            <div>
              <span className="section-pre-title mb-0">Community Access</span>
              <h5 className="modal-title font-serif fw-bold text-dark">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Member Account'}
              </h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            {/* Tab switch */}
            <div className="d-flex rounded p-1 bg-light border mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`btn btn-sm w-50 ${activeTab === 'login' ? 'bg-white shadow-sm fw-bold' : 'text-muted'}`}
                style={{ fontSize: '0.85rem' }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`btn btn-sm w-50 ${activeTab === 'register' ? 'bg-white shadow-sm fw-bold' : 'text-muted'}`}
                style={{ fontSize: '0.85rem' }}
              >
                Register
              </button>
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="p-2 mb-3 rounded bg-light border text-center">
              <span className="text-muted d-block small mb-1">Instant Demo Switch for Reviewer:</span>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('MDY')}
                  className="btn btn-sm btn-outline-dark"
                  style={{ fontSize: '0.74rem' }}
                >
                  <i className="bi bi-person-fill"></i> Log In as Mandalay Member
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('YGN')}
                  className="btn btn-sm btn-outline-dark"
                  style={{ fontSize: '0.74rem' }}
                >
                  <i className="bi bi-person-fill"></i> Log In as Yangon Member
                </button>
              </div>
            </div>

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email or Phone Number</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. thantzin@exchange.mm or 09xxxxxxxxx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Password</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-nordic-primary w-100 py-2 mt-2">
                  Log In to Platform
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Thant Zin Oo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Email</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="e.g. name@domain.mm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Home City</label>
                    <select
                      className="form-select"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="Mandalay (MDY)">Mandalay (MDY)</option>
                      <option value="Yangon (YGN)">Yangon (YGN)</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Phone (Verification)</label>
                    <input
                      type="tel"
                      required
                      className="form-control"
                      placeholder="09xxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Create Password</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-nordic-primary w-100 py-2">
                  Create Member Account
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
