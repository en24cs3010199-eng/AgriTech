import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const AdminDashboard = () => {
  const { language } = useLanguage();

  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'orders' | 'alerts'
  const [loading, setLoading] = useState(true);

  // User search/filter
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Emergency Alert Form
  const [alertForm, setAlertForm] = useState({
    state: 'Punjab',
    district: 'Ludhiana',
    alertType: 'High Pest Risk',
    severity: 'Warning',
    title: '',
    titleHi: '',
    description: '',
    descriptionHi: '',
    affectedCrops: 'Wheat, Mustard',
    recommendedAction: '',
    recommendedActionHi: ''
  });
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/admin/metrics');
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users?role=${userRoleFilter}&search=${userSearch}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchUsers();
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userRoleFilter, userSearch]);

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      fetchUsers();
      fetchMetrics();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user.');
    }
  };

  const handleToggleVerified = async (userId, currentVerified) => {
    try {
      await api.put(`/admin/users/${userId}`, { isVerifiedExpert: !currentVerified });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating verification status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user and all associated farms/crops?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
        fetchMetrics();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting user.');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      fetchMetrics();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status.');
    }
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    setAlertSubmitting(true);
    setAlertSuccess(false);

    try {
      const cropsArr = alertForm.affectedCrops.split(',').map((c) => c.trim());
      const res = await api.post('/weather/alerts', {
        ...alertForm,
        affectedCrops: cropsArr
      });

      if (res.data.success) {
        setAlertSuccess(true);
        setAlertForm({
          state: 'Punjab',
          district: 'Ludhiana',
          alertType: 'High Pest Risk',
          severity: 'Warning',
          title: '',
          titleHi: '',
          description: '',
          descriptionHi: '',
          affectedCrops: 'Wheat, Mustard',
          recommendedAction: '',
          recommendedActionHi: ''
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error broadcasting alert.');
    } finally {
      setAlertSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="bi bi-shield-lock-fill text-danger me-2"></i>
            Administrator Control Center
          </h3>
          <p className="text-secondary small mb-0">
            Platform governance, user verification, marketplace transactions, and regional advisory broadcasts.
          </p>
        </div>
        <span className="badge bg-danger fs-6 px-3 py-2 rounded-pill">
          Master Administrator
        </span>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills custom-pills mb-4 p-1 bg-light rounded-pill border">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'overview' ? 'active bg-dark text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-speedometer2 me-2"></i> System Metrics
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'users' ? 'active bg-dark text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people-fill me-2"></i> User Management ({users.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'orders' ? 'active bg-dark text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="bi bi-truck me-2"></i> Order Fulfillment ({orders.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'alerts' ? 'active bg-danger text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('alerts')}
          >
            <i className="bi bi-megaphone-fill me-2"></i> Broadcast Alert
          </button>
        </li>
      </ul>

      {/* OVERVIEW / METRICS TAB */}
      {activeTab === 'overview' && metrics && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <div className="card shadow-sm border-0 rounded-4 p-3 bg-light">
              <span className="text-muted small">Total Farmers</span>
              <h3 className="fw-bold text-success mb-0">{metrics.totalFarmers}</h3>
              <small className="text-muted">Registered Cultivators</small>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card shadow-sm border-0 rounded-4 p-3 bg-light">
              <span className="text-muted small">Registered Farms</span>
              <h3 className="fw-bold text-primary mb-0">{metrics.totalFarms}</h3>
              <small className="text-muted">Across India</small>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card shadow-sm border-0 rounded-4 p-3 bg-light">
              <span className="text-muted small">Total Revenue</span>
              <h3 className="fw-bold text-success mb-0">₹{metrics.totalRevenue}</h3>
              <small className="text-muted">{metrics.totalOrders} Marketplace Orders</small>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card shadow-sm border-0 rounded-4 p-3 bg-light">
              <span className="text-muted small">Pending Consultations</span>
              <h3 className="fw-bold text-warning mb-0">{metrics.pendingConsultations}</h3>
              <small className="text-muted">Awaiting Agronomist Review</small>
            </div>
          </div>

          <div className="col-12 mt-4">
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h5 className="fw-bold text-dark mb-3">System Health & Data Integrity Audit</h5>
              <div className="row g-3 small">
                <div className="col-md-3">
                  <div className="p-3 border rounded-3 bg-light">
                    <span className="text-muted d-block">Active Crop Cycles</span>
                    <strong className="fs-5 text-dark">{metrics.totalCrops}</strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 border rounded-3 bg-light">
                    <span className="text-muted d-block">Soil Tests Logged</span>
                    <strong className="fs-5 text-dark">{metrics.totalSoilTests}</strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 border rounded-3 bg-light">
                    <span className="text-muted d-block">Forum Community Threads</span>
                    <strong className="fs-5 text-dark">{metrics.forumPostsCount}</strong>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 border rounded-3 bg-light">
                    <span className="text-muted d-block">Catalogue SKUs</span>
                    <strong className="fs-5 text-dark">{metrics.totalResources}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <div className="row g-2 align-items-center mb-3">
            <div className="col-md-8">
              <div className="d-flex gap-2">
                {['all', 'farmer', 'expert', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`btn btn-sm rounded-pill px-3 text-capitalize ${
                      userRoleFilter === role ? 'btn-dark' : 'btn-outline-secondary'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control form-control-sm rounded-pill"
                placeholder="Search by name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Verified Expert</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong className="text-dark d-block">{u.name}</strong>
                      <span className="text-muted">{u.email} | {u.phone}</span>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: '110px' }}
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                      >
                        <option value="farmer">Farmer</option>
                        <option value="expert">Expert</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      {u.location?.district}, {u.location?.state}
                    </td>
                    <td>
                      {u.role === 'expert' ? (
                        <button
                          onClick={() => handleToggleVerified(u._id, u.isVerifiedExpert)}
                          className={`btn btn-sm rounded-pill px-2 py-0 ${
                            u.isVerifiedExpert ? 'btn-success' : 'btn-outline-secondary'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {u.isVerifiedExpert ? '✓ ICAR Verified' : '+ Verify Expert'}
                        </button>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="btn btn-outline-danger btn-sm rounded-circle px-2"
                        title="Delete User"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS FULFILLMENT TAB */}
      {activeTab === 'orders' && (
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <h5 className="fw-bold text-dark mb-3">Order Status Controller</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Farmer</th>
                  <th>Items & Amount</th>
                  <th>Current Status</th>
                  <th className="text-end">Update Progress</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <strong>#{o._id.slice(-8).toUpperCase()}</strong>
                      <span className="d-block text-muted">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <strong>{o.farmer?.name}</strong>
                      <span className="d-block text-muted">{o.shippingAddress?.district}, {o.shippingAddress?.phone}</span>
                    </td>
                    <td>
                      <span className="fw-bold text-success">₹{o.totalAmount}</span>
                      <small className="d-block text-muted">{o.items?.length} items ({o.paymentMethod})</small>
                    </td>
                    <td>
                      <span
                        className={`badge text-capitalize px-3 py-1 ${
                          o.status === 'delivered' ? 'bg-success' : o.status === 'cancelled' ? 'bg-danger' : 'bg-primary'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {['confirmed', 'dispatched', 'delivered'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateOrderStatus(o._id, st)}
                            disabled={o.status === st || o.status === 'delivered' || o.status === 'cancelled'}
                            className="btn btn-outline-dark btn-sm text-capitalize px-2 py-0"
                            style={{ fontSize: '0.7rem' }}
                          >
                            Mark {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BROADCAST ALERT TAB */}
      {activeTab === 'alerts' && (
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <h5 className="fw-bold text-danger mb-2">
            <i className="bi bi-megaphone-fill me-2"></i>
            Broadcast Regional Agro Alert
          </h5>
          <p className="small text-secondary mb-4">
            Alerts published here immediately appear in the alert banner on farmer dashboards across the target district.
          </p>

          {alertSuccess && (
            <div className="alert alert-success py-2 px-3 small rounded-3 mb-3">
              Alert broadcasted successfully across farmers' dashboards!
            </div>
          )}

          <form onSubmit={handleBroadcastAlert}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">State *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={alertForm.state}
                  onChange={(e) => setAlertForm({ ...alertForm, state: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">District *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={alertForm.district}
                  onChange={(e) => setAlertForm({ ...alertForm, district: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Alert Type *</label>
                <select
                  className="form-select form-select-sm"
                  value={alertForm.alertType}
                  onChange={(e) => setAlertForm({ ...alertForm, alertType: e.target.value })}
                >
                  <option value="High Pest Risk">High Pest Risk</option>
                  <option value="Disease Outbreak Warning">Disease Outbreak Warning</option>
                  <option value="Heavy Rainfall">Heavy Rainfall</option>
                  <option value="Heatwave">Heatwave</option>
                  <option value="Frost Warning">Frost Warning</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold text-secondary">Severity *</label>
                <select
                  className="form-select form-select-sm"
                  value={alertForm.severity}
                  onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                >
                  <option value="Advisory">Advisory</option>
                  <option value="Watch">Watch</option>
                  <option value="Warning">Warning</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Alert Title (English) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Yellow Rust Outbreak Warning in Wheat"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Alert Title (Hindi)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="उदा. गेहूं में पीला रतुआ रोग की चेतावनी"
                  value={alertForm.titleHi}
                  onChange={(e) => setAlertForm({ ...alertForm, titleHi: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Detailed Description (English) *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={alertForm.description}
                  onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Detailed Description (Hindi)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={alertForm.descriptionHi}
                  onChange={(e) => setAlertForm({ ...alertForm, descriptionHi: e.target.value })}
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-secondary">Recommended Action / Mitigation *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Inspect under-canopy and spray Propiconazole 25 EC (1 ml/L) within 48 hours."
                  value={alertForm.recommendedAction}
                  onChange={(e) => setAlertForm({ ...alertForm, recommendedAction: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-danger mt-4 rounded-pill px-4 fw-semibold"
              disabled={alertSubmitting}
            >
              {alertSubmitting ? 'Broadcasting...' : 'Broadcast Emergency Advisory'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
