import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Dynamic Location state from Database
  const [locations, setLocations] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedTownshipId, setSelectedTownshipId] = useState('');

  // Fetch dynamic Myanmar locations on mount
  useEffect(() => {
    authService.getLocations()
      .then(res => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          setLocations(res.data);
          setSelectedRegionId(res.data[0].id);
          if (res.data[0].townships?.length > 0) {
            setSelectedTownshipId(res.data[0].townships[0].id);
          }
        }
      })
      .catch(err => console.warn('Could not load dynamic locations:', err));
  }, []);

  // Update townships when region changes
  const handleRegionChange = (regionId) => {
    setSelectedRegionId(regionId);
    const region = locations.find(r => r.id === Number(regionId));
    if (region && region.townships?.length > 0) {
      setSelectedTownshipId(region.townships[0].id);
    } else {
      setSelectedTownshipId('');
    }
  };

  const currentRegion = locations.find(r => r.id === Number(selectedRegionId));
  const availableTownships = currentRegion?.townships || [];
  
  // Communication Contact Information (Requirement 1)
  const [telegram, setTelegram] = useState('');
  const [viber, setViber] = useState('');
  const [facebook, setFacebook] = useState('');
  const [alternative, setAlternative] = useState('');
  const [preferredMethod, setPreferredMethod] = useState('viber');
  const [enabledMethods, setEnabledMethods] = useState({
    viber: true,
    telegram: false,
    facebook: false,
    alternative: false
  });

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the honest condition description and safe community exchange guidelines.');
      return;
    }

    setLoading(true);
    try {
      const selectedTownship = availableTownships.find(t => t.id === Number(selectedTownshipId));
      const cityFormatted = selectedTownship && currentRegion
        ? `${selectedTownship.name}, ${currentRegion.name}`
        : 'Yangon Region';

      const res = await register({
        name,
        email,
        city: cityFormatted,
        phone,
        password,
        state_region_id: selectedRegionId,
        township_id: selectedTownshipId,
        communicationContacts: {
          telegram: enabledMethods.telegram ? telegram : '',
          viber: enabledMethods.viber ? (viber || phone) : '',
          facebook: enabledMethods.facebook ? facebook : '',
          alternative: enabledMethods.alternative ? alternative : '',
          preferredMethod
        }
      });
      setLoading(false);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setLoading(false);
      setError('Registration failed. Please check connection to server.');
    }
  };

  return (
    <div className="py-5 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '100vh' }}>
      <div className="container-xl">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-6">
            <div className="mb-3">
              <Link to="/" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 hover-dark">
                <i className="bi bi-arrow-left"></i> Back to Homepage
              </Link>
            </div>
            
            <div className="bg-white p-4 p-md-5 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary-brown)', color: '#fff', fontSize: '1.25rem' }}
                >
                  <i className="bi bi-person-plus"></i>
                </div>
                <h2 className="font-serif fw-bold text-dark mb-1">Join the Exchange Community</h2>
                <p className="text-muted" style={{ fontSize: '0.86rem' }}>
                  Connect with neighbors in Mandalay & Yangon to give useful belongings a second life.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.84rem' }}>
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  
                  {/* Name */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">Full Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Thant Zin Oo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">Email Address <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="e.g. name@student.university.mm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Dynamic State / Region */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">
                      State / Region <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedRegionId}
                      onChange={(e) => handleRegionChange(e.target.value)}
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Township */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">
                      Township <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={selectedTownshipId}
                      onChange={(e) => setSelectedTownshipId(e.target.value)}
                    >
                      {availableTownships.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">Mobile Number (Verification)</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="09xxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Password & Confirm */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Password <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Confirm Password <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      required
                      className="form-control"
                      placeholder="Re-type password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                  </div>

                  {/* Communication Contact Information Section (Requirement 1) */}
                  <div className="col-12 mt-4 pt-3 border-top" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <label className="form-label fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-chat-heart-fill text-primary"></i>
                        Communication Contact Information
                      </label>
                      <span className="badge bg-secondary-subtle text-secondary small" style={{ fontSize: '0.70rem' }}>
                        Optional at Sign Up
                      </span>
                    </div>
                    
                    <p className="text-muted small mb-3" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                      Select which external apps you use to coordinate courier exchanges across cities. You can update these anytime in your Profile Settings.
                    </p>

                    {/* Privacy & Escrow Guarantee Box */}
                    <div className="p-2.5 rounded-3 border mb-3.5 bg-light d-flex align-items-start gap-2.5" style={{ fontSize: '0.76rem', borderColor: '#EBE2D8' }}>
                      <i className="bi bi-shield-lock-fill text-success fs-6 mt-0.5 flex-shrink-0"></i>
                      <div className="text-muted" style={{ lineHeight: 1.5 }}>
                        <strong className="text-dark">Strict Privacy Protocol:</strong> Your private contact details are <strong>never shown publicly</strong> on item listings or public profiles. They are automatically unlocked and shared with your exchange partner <strong>only after both deposits have been verified</strong> for an Intercity Exchange.
                      </div>
                    </div>

                    {/* Method Selection Toggles */}
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setEnabledMethods(prev => ({ ...prev, viber: !prev.viber }))}
                        className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1 ${enabledMethods.viber ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.76rem' }}
                      >
                        <i className="bi bi-telephone-fill"></i>
                        <span>Viber</span>
                        {enabledMethods.viber && <i className="bi bi-check2"></i>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEnabledMethods(prev => ({ ...prev, telegram: !prev.telegram }))}
                        className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1 ${enabledMethods.telegram ? 'btn-info text-white' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.76rem' }}
                      >
                        <i className="bi bi-telegram"></i>
                        <span>Telegram</span>
                        {enabledMethods.telegram && <i className="bi bi-check2"></i>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEnabledMethods(prev => ({ ...prev, facebook: !prev.facebook }))}
                        className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1 ${enabledMethods.facebook ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.76rem', backgroundColor: enabledMethods.facebook ? '#1877F2' : 'transparent', borderColor: enabledMethods.facebook ? '#1877F2' : '' }}
                      >
                        <i className="bi bi-facebook"></i>
                        <span>Facebook Messenger</span>
                        {enabledMethods.facebook && <i className="bi bi-check2"></i>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEnabledMethods(prev => ({ ...prev, alternative: !prev.alternative }))}
                        className={`btn btn-sm rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1 ${enabledMethods.alternative ? 'btn-secondary text-white' : 'btn-outline-secondary'}`}
                        style={{ fontSize: '0.76rem' }}
                      >
                        <i className="bi bi-plus-circle"></i>
                        <span>Alternative</span>
                        {enabledMethods.alternative && <i className="bi bi-check2"></i>}
                      </button>
                    </div>

                    {/* Inputs for selected methods */}
                    <div className="row g-2.5 mb-3">
                      {enabledMethods.viber && (
                        <div className="col-12 col-md-6">
                          <label className="form-label small text-muted mb-1" style={{ fontSize: '0.75rem' }}>
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
                      )}

                      {enabledMethods.telegram && (
                        <div className="col-12 col-md-6">
                          <label className="form-label small text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-telegram text-info me-1"></i> Telegram Username or Phone
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. @username or 09..."
                            value={telegram}
                            onChange={(e) => setTelegram(e.target.value)}
                          />
                        </div>
                      )}

                      {enabledMethods.facebook && (
                        <div className="col-12 col-md-6">
                          <label className="form-label small text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-facebook text-primary me-1"></i> Facebook Messenger Profile URL
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. facebook.com/username or m.me/..."
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                          />
                        </div>
                      )}

                      {enabledMethods.alternative && (
                        <div className="col-12 col-md-6">
                          <label className="form-label small text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-chat-square-dots text-secondary me-1"></i> Alternative Contact (e.g. Signal / WhatsApp)
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Signal: +959..."
                            value={alternative}
                            onChange={(e) => setAlternative(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Preferred Method Selector */}
                    {(enabledMethods.viber || enabledMethods.telegram || enabledMethods.facebook || enabledMethods.alternative) && (
                      <div className="mb-2">
                        <label className="form-label small fw-semibold text-dark mb-1" style={{ fontSize: '0.75rem' }}>
                          Choose Your Preferred Communication Method:
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={preferredMethod}
                          onChange={(e) => setPreferredMethod(e.target.value)}
                          style={{ fontSize: '0.80rem' }}
                        >
                          {enabledMethods.viber && <option value="viber">Viber (Primary)</option>}
                          {enabledMethods.telegram && <option value="telegram">Telegram (Primary)</option>}
                          {enabledMethods.facebook && <option value="facebook">Facebook Messenger (Primary)</option>}
                          {enabledMethods.alternative && <option value="alternative">Alternative Method</option>}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Community Agreement */}
                  <div className="col-12">
                    <div className="form-check pt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="agreeTermsCheck"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                      />
                      <label className="form-check-label small text-muted" htmlFor="agreeTermsCheck">
                        I agree to upload <strong>honest, unedited photos</strong> and adhere to safe in-person community exchange guidelines.
                      </label>
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-nordic-primary w-100 py-2 mt-4 mb-3"
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-check-circle me-1"></i>
                  )}
                  Create Free Account
                </button>
              </form>

              <div className="text-center pt-3 border-top" style={{ borderColor: 'var(--border-light)' }}>
                <span className="text-muted small">Already have an account? </span>
                <Link to="/login" className="fw-semibold text-dark text-decoration-none small">
                  Sign in here
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
