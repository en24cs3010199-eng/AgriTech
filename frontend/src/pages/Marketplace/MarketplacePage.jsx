import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const MarketplacePage = ({ cart, setCart, showCartModal, setShowCartModal }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'orders'
  const [loading, setLoading] = useState(true);
  const [orderSubmitting, setOrderSubmitting] = useState(false);

  // Checkout address form
  const [shippingAddress, setShippingAddress] = useState({
    recipientName: user?.name || '',
    phone: user?.phone || '',
    village: user?.location?.village || '',
    district: user?.location?.district || 'Ludhiana',
    state: user?.location?.state || 'Punjab',
    pincode: '141001'
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const fetchResources = async () => {
    try {
      const res = await api.get(`/resources?category=${selectedCategory}&search=${searchTerm}`);
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
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
    fetchResources();
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setOrderSubmitting(true);

    try {
      const itemsPayload = cart.map((i) => ({
        resourceId: i.product._id,
        quantity: i.quantity
      }));

      const res = await api.post('/orders', {
        items: itemsPayload,
        shippingAddress,
        paymentMethod
      });

      if (res.data.success) {
        setCart([]);
        setShowCartModal(false);
        setActiveTab('orders');
        fetchOrders();
        fetchResources(); // Refresh updated stock quantities
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.put(`/orders/${orderId}/cancel`);
        fetchOrders();
        fetchResources();
      } catch (err) {
        alert(err.response?.data?.message || 'Error cancelling order.');
      }
    }
  };

  const categories = [
    { key: 'all', label: t('marketplace.all') },
    { key: 'seeds', label: t('marketplace.seeds') },
    { key: 'fertilizers', label: t('marketplace.fertilizers') },
    { key: 'pesticides', label: t('marketplace.pesticides') },
    { key: 'equipment', label: t('marketplace.equipment') },
    { key: 'irrigation', label: t('marketplace.irrigation') }
  ];

  return (
    <div className="container py-4">
      {/* Title & Cart Pill */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="bi bi-shop text-success me-2"></i>
            {t('marketplace.title')}
          </h3>
          <p className="text-secondary small mb-0">{t('marketplace.subtitle')}</p>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={() => setActiveTab('shop')}
            className={`btn btn-sm rounded-pill px-4 ${activeTab === 'shop' ? 'btn-success' : 'btn-outline-secondary'}`}
          >
            <i className="bi bi-grid-fill me-1"></i> {t('marketplace.title')}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm rounded-pill px-4 ${activeTab === 'orders' ? 'btn-success' : 'btn-outline-secondary'}`}
          >
            <i className="bi bi-truck me-1"></i> {t('marketplace.my_orders')} ({orders.length})
          </button>
          <button
            onClick={() => setShowCartModal(true)}
            className="btn btn-warning btn-sm rounded-pill px-3 fw-semibold shadow-sm"
          >
            <i className="bi bi-cart3 me-1"></i> {t('marketplace.cart')} ({cart.length})
          </button>
        </div>
      </div>

      {/* SHOP VIEW */}
      {activeTab === 'shop' && (
        <>
          {/* Filter Bar */}
          <div className="card shadow-sm border-0 rounded-4 p-3 mb-4 bg-light">
            <div className="row g-2 align-items-center">
              <div className="col-md-7">
                <div className="d-flex gap-1 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
                  {categories.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setSelectedCategory(c.key)}
                      className={`btn btn-sm rounded-pill px-3 ${
                        selectedCategory === c.key ? 'btn-success text-white' : 'btn-outline-secondary'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-md-5">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search seeds, fertilizer brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="row g-4">
            {resources.map((item) => (
              <div key={item._id} className="col-sm-6 col-lg-4 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 overflow-hidden hover-card">
                  <div className="position-relative" style={{ height: '170px', backgroundColor: '#e9ecef' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop';
                      }}
                    />
                    <span className="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75 rounded-pill">
                      {item.category}
                    </span>
                    <span className="position-absolute top-0 end-0 m-2 badge bg-warning text-dark rounded-pill">
                      ⭐ {item.rating}
                    </span>
                  </div>

                  <div className="card-body p-3 d-flex flex-column">
                    <small className="text-muted d-block">{item.brand}</small>
                    <h6 className="fw-bold text-dark mb-1 text-truncate">
                      {language === 'hi' ? item.titleHi || item.title : item.title}
                    </h6>
                    <p className="small text-secondary mb-3 line-clamp-2" style={{ fontSize: '0.78rem' }}>
                      {language === 'hi' ? item.descriptionHi || item.description : item.description}
                    </p>

                    <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fs-5 fw-bold text-success">₹{item.price}</span>
                        <small className="text-muted d-block" style={{ fontSize: '0.68rem' }}>per {item.unit}</small>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="btn btn-outline-success btn-sm rounded-pill px-3"
                        disabled={item.stockQuantity <= 0}
                      >
                        {item.stockQuantity > 0 ? `+ ${t('marketplace.add_to_cart')}` : t('marketplace.out_of_stock')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ORDERS & TRACKING VIEW */}
      {activeTab === 'orders' && (
        <div className="d-flex flex-column gap-4">
          {orders.length === 0 ? (
            <div className="card shadow-sm border-0 rounded-4 p-5 text-center text-muted">
              <i className="bi bi-box-seam fs-1 text-secondary mb-2"></i>
              <h5>No orders placed yet.</h5>
              <button onClick={() => setActiveTab('shop')} className="btn btn-success btn-sm rounded-pill px-4 mx-auto mt-2">
                Browse Agricultural Catalogue
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="card shadow-sm border-0 rounded-4 p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-3 gap-2">
                  <div>
                    <span className="text-muted small">Order ID: #{order._id.slice(-8).toUpperCase()}</span>
                    <h5 className="fw-bold text-dark mb-0">Total: ₹{order.totalAmount}</h5>
                    <span className="badge bg-light text-secondary border mt-1">
                      Placed: {new Date(order.createdAt).toLocaleDateString()} | Method: {order.paymentMethod}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`badge fs-6 px-3 py-2 text-capitalize ${
                        order.status === 'delivered'
                          ? 'bg-success'
                          : order.status === 'cancelled'
                          ? 'bg-danger'
                          : 'bg-primary'
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.status === 'placed' && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Tracking Progress Indicator */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between text-center small text-secondary position-relative">
                    {['placed', 'confirmed', 'dispatched', 'delivered'].map((step, idx) => {
                      const steps = ['placed', 'confirmed', 'dispatched', 'delivered'];
                      const currentIdx = steps.indexOf(order.status);
                      const isComplete = currentIdx >= idx;

                      return (
                        <div key={step} className="d-flex flex-column align-items-center" style={{ width: '25%' }}>
                          <span
                            className={`rounded-circle d-flex align-items-center justify-content-center text-white mb-1 ${
                              isComplete ? 'bg-success' : 'bg-light text-muted border'
                            }`}
                            style={{ width: '32px', height: '32px' }}
                          >
                            {isComplete ? '✓' : idx + 1}
                          </span>
                          <span className={`fw-semibold text-capitalize ${isComplete ? 'text-success' : 'text-muted'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items & Shipping Address */}
                <div className="row g-3">
                  <div className="col-md-7">
                    <h6 className="fw-bold text-secondary small mb-2">Ordered Items:</h6>
                    <div className="d-flex flex-column gap-1">
                      {order.items?.map((it, i) => (
                        <div key={i} className="small d-flex justify-content-between bg-light p-2 rounded-2">
                          <span>{it.title} × {it.quantity}</span>
                          <strong className="text-dark">₹{it.totalItemPrice}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-5">
                    <h6 className="fw-bold text-secondary small mb-2">Delivery Address:</h6>
                    <div className="bg-light p-2 rounded-2 small text-secondary">
                      <strong>{order.shippingAddress?.recipientName}</strong> ({order.shippingAddress?.phone})<br />
                      {order.shippingAddress?.village}, {order.shippingAddress?.district}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cart & Checkout Drawer Modal */}
      {showCartModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark-green text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-cart3 me-2"></i>
                  {t('marketplace.cart')} ({cart.length} items)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCartModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {cart.length === 0 ? (
                  <p className="text-center py-4 text-muted">Your cart is empty.</p>
                ) : (
                  <div className="row g-4">
                    {/* Items List */}
                    <div className="col-md-7">
                      <h6 className="fw-bold text-dark mb-3">Cart Items</h6>
                      <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '250px' }}>
                        {cart.map((item) => (
                          <div key={item.product._id} className="p-2 border rounded-3 d-flex align-items-center justify-content-between">
                            <div>
                              <strong className="small text-dark d-block">{item.product.title}</strong>
                              <span className="small text-success fw-bold">₹{item.product.price} / {item.product.unit}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <button
                                onClick={() => updateCartQuantity(item.product._id, -1)}
                                className="btn btn-outline-secondary btn-sm px-2 py-0"
                              >
                                -
                              </button>
                              <span className="small fw-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.product._id, 1)}
                                className="btn btn-outline-secondary btn-sm px-2 py-0"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Total Payable:</span>
                        <h4 className="fw-bold text-success mb-0">₹{cartTotal}</h4>
                      </div>
                    </div>

                    {/* Delivery & Payment Form */}
                    <div className="col-md-5 border-start">
                      <h6 className="fw-bold text-dark mb-3">Delivery Information</h6>
                      <form onSubmit={handlePlaceOrder}>
                        <div className="mb-2">
                          <label className="form-label small text-secondary">Recipient Name</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={shippingAddress.recipientName}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, recipientName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label small text-secondary">Contact Phone</label>
                          <input
                            type="tel"
                            className="form-control form-control-sm"
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="mb-2">
                          <label className="form-label small text-secondary">Village & District</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={`${shippingAddress.village ? `${shippingAddress.village}, ` : ''}${shippingAddress.district}`}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, village: e.target.value })}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label small text-secondary">Payment Method</label>
                          <select
                            className="form-select form-select-sm"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          >
                            <option value="Cash on Delivery">Cash on Delivery (गांव में नकद)</option>
                            <option value="Kisan Credit / UPI Demo">Kisan Credit Card / UPI Demo</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="btn btn-success w-100 py-2 rounded-pill fw-semibold shadow-sm"
                          disabled={orderSubmitting || cart.length === 0}
                        >
                          {orderSubmitting ? 'Placing Order...' : `Confirm Order (₹${cartTotal})`}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
