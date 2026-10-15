import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettingsPage() {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || 'Mandalay (MDY)');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastMessage, setToastMessage] = useState(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      city,
      cityCode: city.includes('YGN') ? 'YGN' : 'MDY',
      bio,
      phone
    });
    setToastMessage('Profile settings updated successfully!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert('Please fill out password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    setToastMessage('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setToastMessage(null), 4000);
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
              <div className="fw-bold">Success</div>
              <div className="text-muted">{toastMessage}</div>
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
              <li className="breadcrumb-item active text-dark">Profile & Settings</li>
            </ol>
          </nav>
          <h1 className="font-serif fw-bold h3 mb-0 text-dark">Profile & Privacy Settings</h1>
          <span className="text-muted" style={{ fontSize: '0.84rem' }}>
            Manage your public barter persona and confidential contact settings.
          </span>
        </div>

        <div className="row g-4 mb-5">
          
          {/* Left Column: Member Card Summary */}
          <div className="col-12 col-lg-4">
            <div className="bg-white p-4 rounded-3 border shadow-sm text-center mb-4" style={{ borderColor: 'var(--border-light)' }}>
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="rounded-circle border mb-3"
                style={{ width: '96px', height: '96px', objectFit: 'cover', borderColor: 'var(--primary-brown)' }}
              />
              <h5 className="font-serif fw-bold text-dark mb-1">{currentUser?.name}</h5>
              <span className="badge rounded-pill mb-3" style={{ backgroundColor: 'var(--bg-sand)', color: 'var(--primary-brown)' }}>
                {currentUser?.city} • {currentUser?.joined}
              </span>

              {/* Trust Score */}
              <div className="row g-2 border-top pt-3 text-start small">
                <div className="col-6">
                  <span className="text-muted d-block">Trust Rating:</span>
                  <strong className="text-warning fs-6">{currentUser?.rating} ★</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Completed Trades:</span>
                  <strong className="text-success fs-6">{currentUser?.completedExchanges} Verified</strong>
                </div>
              </div>
            </div>

            {/* Privacy Box */}
            <div className="bg-white p-4 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <h6 className="fw-bold font-serif text-dark mb-2">
                <i className="bi bi-shield-lock-fill text-brown me-2" style={{ color: 'var(--primary-brown)' }}></i>
                Privacy Protection
              </h6>
              <p className="text-muted small mb-0" style={{ lineHeight: 1.5 }}>
                Your phone number is kept confidential by default. Public visitors can only view your name, city, and verified reviews.
              </p>
            </div>
          </div>

          {/* Right Column: Edit Profile & Password */}
          <div className="col-12 col-lg-8">
            
            {/* Edit Profile Form */}
            <div className="bg-white p-4 rounded-3 border shadow-sm mb-4" style={{ borderColor: 'var(--border-light)' }}>
              <h5 className="font-serif fw-bold text-dark mb-3">General Information</h5>
              
              <form onSubmit={handleSaveProfile}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Display Name</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Primary City Hub</label>
                    <select
                      className="form-select"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="Mandalay (MDY)">Mandalay (MDY)</option>
                      <option value="Yangon (YGN)">Yangon (YGN)</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Account Email (Permanent)</label>
                    <input
                      type="email"
                      disabled
                      className="form-control bg-light"
                      value={currentUser?.email || ''}
                    />
                    <small className="text-muted">Registered university / student email.</small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Mobile Number (Private Handover)</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <small className="text-muted">Only shared upon mutual exchange agreement.</small>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Public Bio & Community Interests</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Share what things you usually collect or like to exchange..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-top text-end">
                  <button type="submit" className="btn-nordic-primary px-4">
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white p-4 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              <h5 className="font-serif fw-bold text-dark mb-3">Security & Password</h5>
              
              <form onSubmit={handleSavePassword}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-2 border-top text-end">
                  <button type="submit" className="btn btn-outline-dark px-4">
                    Update Password
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
