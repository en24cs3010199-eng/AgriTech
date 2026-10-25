import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const { language } = useLanguage();

  return (
    <footer className="bg-dark text-white-50 py-4 mt-auto border-top border-secondary">
      <div className="container text-center text-md-start">
        <div className="row gy-3 align-items-center">
          <div className="col-md-6">
            <h6 className="text-white fw-bold mb-1">🌱 AgriTech — Digital Agriculture Portal</h6>
            <p className="small mb-0">
              {language === 'hi'
                ? 'कौशल विकास व डिजिटल तकनीक द्वारा भारतीय किसानों की खुशहाली हेतु समर्पित।'
                : 'Dedicated to empowering smallholder farmers through digital agronomy, IoT weather data & ML.'}
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="small">
              <span className="text-success fw-semibold me-3">
                <i className="bi bi-telephone-fill me-1"></i> Kisan Call Center: 1800-180-1551
              </span>
              <span className="text-info fw-semibold">
                <i className="bi bi-shield-check me-1"></i> ICAR Vetted Standards
              </span>
            </div>
            <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.75rem' }}>
              SkillWallet MERN Full Stack Development Program Project.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
