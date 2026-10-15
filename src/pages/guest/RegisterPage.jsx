import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mandalay (MDY)');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
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
    setTimeout(() => {
      const res = register({
        name,
        email,
        city,
        phone,
        password
      });
      setLoading(false);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    }, 450);
  };

  return (
    <div className="py-5 d-flex align-items-center" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh' }}>
      <div className="container-xl">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-6">
            
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

                  {/* City & Phone */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Home City Location <span className="text-danger">*</span></label>
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
