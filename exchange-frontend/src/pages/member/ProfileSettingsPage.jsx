import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettingsPage() {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || 'Mandalay (MDY)');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Communication Contact Information State (Requirement 1)
  const [telegram, setTelegram] = useState(currentUser?.communicationContacts?.telegram || '');
  const [viber, setViber] = useState(currentUser?.communicationContacts?.viber || currentUser?.phone || '');
  const [facebook, setFacebook] = useState(currentUser?.communicationContacts?.facebook || '');
  const [alternative, setAlternative] = useState(currentUser?.communicationContacts?.alternative || '');
  const [preferredMethod, setPreferredMethod] = useState(currentUser?.communicationContacts?.preferredMethod || 'telegram');
  
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
      phone,
      communicationContacts: {
        telegram,
        viber,
        facebook,
        alternative,
        preferredMethod
      }
    });
    setToastMessage('Profile and communication contact settings updated successfully!');
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

                  {/* Communication Contact Information Section (Requirement 1) */}
                  <div className="col-12 mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <h6 className="font-serif fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-chat-heart-fill text-primary"></i>
                        Communication Contact Information (Intercity Exchanges)
                      </h6>
                      <span className="badge bg-success-subtle text-success small" style={{ fontSize: '0.70rem' }}>
                        Required for Intercity
                      </span>
                    </div>

                    <p className="text-muted small mb-3" style={{ fontSize: '0.80rem', lineHeight: 1.5 }}>
                      Provide your external messaging accounts so trade partners in other cities can contact you via Viber, Telegram, or Facebook Messenger.
                    </p>

                    <div className="p-3 rounded-3 border mb-3.5 bg-light d-flex align-items-start gap-2.5" style={{ fontSize: '0.78rem', borderColor: '#EBE2D8' }}>
                      <i className="bi bi-shield-check text-success fs-5 mt-0.5 flex-shrink-0"></i>
                      <div className="text-muted" style={{ lineHeight: 1.5 }}>
                        <strong className="text-dark">Strict Privacy Guarantee:</strong> These communication details are <strong>never shown publicly</strong> on your profile or item listings. They are only revealed to your verified trade partner <strong>after both deposits are verified</strong>.
                      </div>
                    </div>

                    <div className="row g-3">
                      {/* Telegram */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          <i className="bi bi-telegram text-info me-1"></i> Telegram Username or Phone
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. @username or 09xxxxxxxxx"
                          value={telegram}
                          onChange={(e) => setTelegram(e.target.value)}
                        />
                      </div>

                      {/* Viber */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          <i className="bi bi-telephone-fill text-primary me-1"></i> Viber Phone Number
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. 09798123456 or +959..."
                          value={viber}
                          onChange={(e) => setViber(e.target.value)}
                        />
                      </div>

                      {/* Facebook Messenger */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          <i className="bi bi-facebook text-primary me-1"></i> Facebook Messenger Profile URL or Username
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. https://facebook.com/username or m.me/..."
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                        />
                      </div>

                      {/* Alternative */}
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          <i className="bi bi-plus-circle text-secondary me-1"></i> Alternative Contact Method
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Signal: +959... or WhatsApp"
                          value={alternative}
                          onChange={(e) => setAlternative(e.target.value)}
                        />
                      </div>

                      {/* Preferred Contact Method */}
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Preferred Contact Method for Intercity Trades:
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={preferredMethod}
                          onChange={(e) => setPreferredMethod(e.target.value)}
                          style={{ maxWidth: '320px' }}
                        >
                          <option value="telegram">Telegram (Fastest for Photos & Slips)</option>
                          <option value="viber">Viber (Voice Calls & Direct Chat)</option>
                          <option value="facebook">Facebook Messenger (Profile Trust)</option>
                          <option value="alternative">Alternative Contact Method</option>
                        </select>
                      </div>
                    </div>
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
