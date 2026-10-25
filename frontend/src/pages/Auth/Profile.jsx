import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    state: user?.location?.state || 'Punjab',
    district: user?.location?.district || 'Ludhiana',
    village: user?.location?.village || '',
    preferredLanguage: user?.preferredLanguage || 'hi'
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await api.put('/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        preferredLanguage: formData.preferredLanguage,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village
        }
      });

      if (res.data.success) {
        updateUserProfile(res.data.user);
        setLanguage(formData.preferredLanguage);
        setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setStatusMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update profile.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });

      if (res.data.success) {
        setPassMsg({ type: 'success', text: 'Password changed successfully!' });
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPassMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to change password.'
      });
    }
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Left Column: Profile Card */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 text-center p-4">
            <div className="mx-auto bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-person-fill fs-1"></i>
            </div>
            <h5 className="fw-bold mb-1">{user?.name}</h5>
            <p className="text-muted small mb-2">{user?.email}</p>
            <div>
              <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : user?.role === 'expert' ? 'bg-info text-dark' : 'bg-success'} text-uppercase me-1`}>
                {user?.role}
              </span>
              {user?.isVerifiedExpert && (
                <span className="badge bg-warning text-dark">
                  <i className="bi bi-patch-check-fill me-1"></i> ICAR Verified
                </span>
              )}
            </div>

            <hr className="my-3" />

            <div className="text-start small text-secondary">
              <div className="mb-2">
                <i className="bi bi-telephone-fill me-2 text-muted"></i>
                <strong>Phone:</strong> {user?.phone}
              </div>
              <div className="mb-2">
                <i className="bi bi-geo-alt-fill me-2 text-muted"></i>
                <strong>Location:</strong> {user?.location?.village ? `${user?.location?.village}, ` : ''}{user?.location?.district}, {user?.location?.state}
              </div>
              <div className="mb-2">
                <i className="bi bi-translate me-2 text-muted"></i>
                <strong>Language:</strong> {user?.preferredLanguage === 'hi' ? 'हिन्दी' : 'English'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-pencil-square text-success me-2"></i>
              {language === 'hi' ? 'प्रोफ़ाइल विवरण संपादित करें' : 'Edit Profile Details'}
            </h5>

            {statusMsg.text && (
              <div className={`alert alert-${statusMsg.type} py-2 px-3 small rounded-3 mb-3`} role="alert">
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">District</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Village</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Bio / Farming Practice</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief description about crops grown or agronomy expertise..."
                  ></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Language</label>
                  <select
                    className="form-select"
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  >
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-success mt-4 px-4 rounded-pill" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-key-fill text-warning me-2"></i>
              {language === 'hi' ? 'पासवर्ड बदलें' : 'Change Password'}
            </h5>

            {passMsg.text && (
              <div className={`alert alert-${passMsg.type} py-2 px-3 small rounded-3 mb-3`} role="alert">
                {passMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passData.newPassword}
                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-secondary">Confirm New</label>
                  <input
                    type="password"
                    className="form-control"
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-outline-dark mt-3 px-4 rounded-pill">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
