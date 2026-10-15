import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.success) {
        navigate(destination, { replace: true });
      } else {
        setError(res.message || 'Invalid credentials. Please verify your email.');
      }
    }, 400);
  };

  const handleQuickDemo = (city) => {
    quickLogin(city);
    navigate(destination, { replace: true });
  };

  return (
    <div className="py-5 d-flex align-items-center" style={{ backgroundColor: 'var(--bg-warm)', minHeight: '80vh' }}>
      <div className="container-xl">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            
            <div className="bg-white p-4 p-md-5 rounded-3 border shadow-sm" style={{ borderColor: 'var(--border-light)' }}>
              
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary-brown)', color: '#fff', fontSize: '1.25rem' }}
                >
                  <i className="bi bi-arrow-repeat"></i>
                </div>
                <h2 className="font-serif fw-bold text-dark mb-1">Welcome Back</h2>
                <p className="text-muted" style={{ fontSize: '0.86rem' }}>
                  Sign in to manage your exchanges and discover local matches.
                </p>
              </div>

              {/* Quick Demo Fill Buttons for Reviewers */}
              <div className="p-3 mb-4 rounded-3 border text-center" style={{ backgroundColor: '#FAF7F2', borderColor: 'var(--border-light)' }}>
                <span className="text-muted d-block small mb-2 fw-medium">
                  ⚡ 1-Click Demo Logins for Faculty / Reviewer:
                </span>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('MDY')}
                    className="btn btn-sm btn-outline-dark"
                    style={{ fontSize: '0.74rem' }}
                  >
                    <i className="bi bi-person-fill me-1"></i> Mandalay Member (Thant Zin)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('YGN')}
                    className="btn btn-sm btn-outline-dark"
                    style={{ fontSize: '0.74rem' }}
                  >
                    <i className="bi bi-person-fill me-1"></i> Yangon Member (Kyaw Zin)
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.84rem' }}>
                  <i className="bi bi-exclamation-octagon-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Email Address or Phone</label>
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
                  <div className="d-flex justify-content-between">
                    <label className="form-label small fw-semibold text-dark">Password</label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to demo registered email.'); }} className="text-decoration-none small text-muted">
                      Forgot?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="rememberMe" defaultChecked />
                  <label className="form-check-label small text-muted" htmlFor="rememberMe">
                    Keep me signed in on this browser
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-nordic-primary w-100 py-2 mb-3"
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                  )}
                  Log In to Community
                </button>
              </form>

              <div className="text-center pt-3 border-top" style={{ borderColor: 'var(--border-light)' }}>
                <span className="text-muted small">New to the platform? </span>
                <Link to="/register" className="fw-semibold text-dark text-decoration-none small">
                  Create an account
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
