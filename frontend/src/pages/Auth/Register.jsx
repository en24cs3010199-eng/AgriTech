import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'farmer',
    preferredLanguage: 'hi',
    state: 'Punjab',
    district: 'Ludhiana',
    village: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        preferredLanguage: formData.preferredLanguage,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village
        }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check the entered details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-9 col-lg-7">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="bg-dark-green text-white text-center p-4">
              <span className="fs-1 d-block mb-1">🌱</span>
              <h4 className="fw-bold mb-1">{t('app_name')}</h4>
              <p className="small text-white-50 mb-0">
                {language === 'hi' ? 'किसान पंजीकरण फॉर्म' : 'Farmer Registration'}
              </p>
            </div>

            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">
                      {language === 'hi' ? 'पूरा नाम' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">
                      {language === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">
                      {language === 'hi' ? 'ईमेल पता' : 'Email Address'} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="farmer@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">
                      {language === 'hi' ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (Min 6 chars)'} *
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">
                      {language === 'hi' ? 'राज्य' : 'State'}
                    </label>
                    <input
                      type="text"
                      name="state"
                      className="form-control"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">
                      {language === 'hi' ? 'जिला' : 'District'}
                    </label>
                    <input
                      type="text"
                      name="district"
                      className="form-control"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">
                      {language === 'hi' ? 'गांव / कस्बा' : 'Village / Town'}
                    </label>
                    <input
                      type="text"
                      name="village"
                      className="form-control"
                      placeholder="e.g. Samrala"
                      value={formData.village}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">
                      {language === 'hi' ? 'पसंदीदा भाषा' : 'Preferred Language'}
                    </label>
                    <select
                      name="preferredLanguage"
                      className="form-select"
                      value={formData.preferredLanguage}
                      onChange={handleChange}
                    >
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-secondary">
                      {language === 'hi' ? 'खाता प्रकार' : 'Account Role'}
                    </label>
                    <select
                      name="role"
                      className="form-select"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="farmer">Farmer / किसान</option>
                      <option value="expert">Agronomist / कृषि विशेषज्ञ</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-2 rounded-3 fw-semibold shadow-sm mt-4 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-person-plus-fill me-2"></i>
                  )}
                  {t('nav.register')}
                </button>
              </form>

              <div className="text-center small text-secondary">
                {language === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
                <Link to="/login" className="text-success fw-bold text-decoration-none">
                  {t('nav.login')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
