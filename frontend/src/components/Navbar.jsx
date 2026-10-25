import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = ({ cartCount = 0, onOpenCart }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark-green sticky-top shadow-sm py-2">
      <div className="container-fluid px-lg-4">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/dashboard">
          <span className="brand-icon bg-light text-success rounded-circle d-flex align-items-center justify-content-center">
            🌱
          </span>
          <div>
            <span className="fs-5 tracking-wide text-white">{t('app_name')}</span>
            <small className="d-block text-white-50" style={{ fontSize: '0.65rem' }}>
              {language === 'hi' ? 'डिजिटल कृषि पोर्टल' : 'Digital Agriculture'}
            </small>
          </div>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#agritechNavbar"
          aria-controls="agritechNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="agritechNavbar">
          {isAuthenticated && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 gap-lg-2">
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link px-2 ${isActive ? 'active-nav' : ''}`} to="/dashboard">
                  <i className="bi bi-speedometer2 me-1"></i> {t('nav.dashboard')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link px-2 ${isActive ? 'active-nav' : ''}`} to="/farms">
                  <i className="bi bi-geo-alt-fill me-1"></i> {t('nav.farms')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link px-2 ${isActive ? 'active-nav' : ''}`} to="/crops-soil">
                  <i className="bi bi-flower1 me-1"></i> {t('nav.crops_soil')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link px-2 ${isActive ? 'active-nav' : ''}`} to="/weather">
                  <i className="bi bi-cloud-sun-fill me-1"></i> {t('nav.weather')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link px-2 ${isActive ? 'active-nav' : ''}`} to="/marketplace">
                  <i className="bi bi-shop me-1"></i> {t('nav.marketplace')}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link px-2 ${isActive ? 'active-nav' : ''}`} to="/community">
                  <i className="bi bi-people-fill me-1"></i> {t('nav.community')}
                </NavLink>
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-2 text-warning ${isActive ? 'active-nav' : ''}`} to="/admin">
                    <i className="bi bi-shield-lock-fill me-1"></i> {t('nav.admin')}
                  </NavLink>
                </li>
              )}
            </ul>
          )}

          <div className="d-flex align-items-center gap-2 ms-auto mt-2 mt-lg-0">
            {/* Cart Button */}
            {isAuthenticated && onOpenCart && (
              <button
                className="btn btn-outline-light btn-sm position-relative me-1"
                onClick={onOpenCart}
                title="View Cart"
              >
                <i className="bi bi-cart3"></i>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 rounded-pill px-3"
              title="Change Language / भाषा बदलें"
            >
              <i className="bi bi-translate"></i>
              <span className="fw-semibold">{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* User Profile & Logout */}
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link to="/profile" className="text-decoration-none text-white d-flex align-items-center gap-2 bg-white bg-opacity-10 px-3 py-1 rounded-pill">
                  <i className="bi bi-person-circle fs-5 text-warning"></i>
                  <span className="small fw-medium text-truncate" style={{ maxWidth: '120px' }}>
                    {user?.name || 'Farmer'}
                  </span>
                  <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : user?.role === 'expert' ? 'bg-info text-dark' : 'bg-success'} text-uppercase`} style={{ fontSize: '0.65rem' }}>
                    {user?.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline-danger text-white rounded-pill px-2"
                  title={t('nav.logout')}
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm rounded-pill px-3">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-success btn-sm rounded-pill px-3">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
