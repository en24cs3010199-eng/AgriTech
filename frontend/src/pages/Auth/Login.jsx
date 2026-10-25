import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-dark-green text-white text-center p-4">
              <span className="fs-1 d-block mb-2">🌾</span>
              <h4 className="fw-bold mb-1">{t('app_name')}</h4>
              <p className="small text-white-50 mb-0">{t('tagline')}</p>
            </div>

            <div className="card-body p-4">
              <h5 className="fw-bold text-dark text-center mb-3">
                {language === 'hi' ? 'खाते में प्रवेश करें' : 'Sign In to Your Account'}
              </h5>

              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-secondary">
                    {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      placeholder="farmer@agritech.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-secondary">
                    {language === 'hi' ? 'पासवर्ड' : 'Password'}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-2 rounded-3 fw-semibold shadow-sm mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                  )}
                  {t('nav.login')}
                </button>
              </form>

              {/* Demo Credentials Box */}
              <div className="bg-light p-3 rounded-3 border mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small fw-bold text-secondary">
                    <i className="bi bi-person-badge me-1"></i>
                    {language === 'hi' ? 'डेमो लॉगिन (परीक्षण हेतु)' : 'Quick Demo Credentials'}
                  </span>
                  <span className="badge bg-secondary">Course Evaluator</span>
                </div>
                <div className="d-flex flex-column gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('farmer@agritech.com', 'Farmer@123')}
                    className="btn btn-outline-success btn-sm text-start d-flex justify-content-between align-items-center"
                  >
                    <span>👨‍🌾 <strong>Farmer</strong> (Gurpreet Singh)</span>
                    <small className="text-muted">Auto-fill</small>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('expert@agritech.com', 'Expert@123')}
                    className="btn btn-outline-info text-dark btn-sm text-start d-flex justify-content-between align-items-center"
                  >
                    <span>🔬 <strong>Agronomist</strong> (Dr. Ramesh)</span>
                    <small className="text-muted">Auto-fill</small>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@agritech.com', 'Admin@123')}
                    className="btn btn-outline-danger btn-sm text-start d-flex justify-content-between align-items-center"
                  >
                    <span>🛡️ <strong>Admin</strong> (AgriTech Master)</span>
                    <small className="text-muted">Auto-fill</small>
                  </button>
                </div>
              </div>

              <div className="text-center small text-secondary">
                {language === 'hi' ? 'नया खाता बनाना चाहते हैं?' : "Don't have an account?"}{' '}
                <Link to="/register" className="text-success fw-bold text-decoration-none">
                  {t('nav.register')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
