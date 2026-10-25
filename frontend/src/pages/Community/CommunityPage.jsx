import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const CommunityPage = () => {
  const { language, t } = useLanguage();
  const { user, isExpert, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState('forum'); // 'forum' | 'consultation'
  const [posts, setPosts] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Inputs
  const [showPostModal, setShowPostModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [replyInputs, setReplyInputs] = useState({});

  // Prescription modal for experts
  const [prescribeTarget, setPrescribeTarget] = useState(null);
  const [expertAdviceText, setExpertAdviceText] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState([
    { productOrMeasure: '', dosage: '', applicationTiming: '' }
  ]);

  // Form states
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    cropTag: 'Wheat',
    category: 'Pest & Disease'
  });

  const [consultForm, setConsultForm] = useState({
    subject: '',
    cropAffected: 'Wheat',
    symptoms: '',
    severity: 'Moderate'
  });

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/forum?category=${categoryFilter}&search=${searchTerm}`);
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error('Error fetching forum posts:', err);
    }
  };

  const fetchConsultations = async () => {
    try {
      const res = await api.get('/consultations');
      if (res.data.success) {
        setConsultations(res.data.consultations);
      }
    } catch (err) {
      console.error('Error fetching consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter, searchTerm]);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/forum', postForm);
      if (res.data.success) {
        setShowPostModal(false);
        setPostForm({ title: '', content: '', cropTag: 'Wheat', category: 'Pest & Disease' });
        fetchPosts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating discussion.');
    }
  };

  const handleToggleUpvote = async (postId) => {
    try {
      await api.put(`/forum/${postId}/upvote`);
      fetchPosts();
    } catch (err) {
      console.error('Error upvoting post:', err);
    }
  };

  const handleAddReply = async (postId) => {
    const text = replyInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/forum/${postId}/reply`, { content: text });
      if (res.data.success) {
        setReplyInputs({ ...replyInputs, [postId]: '' });
        fetchPosts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting reply.');
    }
  };

  const handleCreateConsultation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/consultations', consultForm);
      if (res.data.success) {
        setShowConsultModal(false);
        setConsultForm({ subject: '', cropAffected: 'Wheat', symptoms: '', severity: 'Moderate' });
        fetchConsultations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting consultation.');
    }
  };

  const handlePrescribeSubmit = async (e) => {
    e.preventDefault();
    if (!prescribeTarget) return;

    try {
      const res = await api.put(`/consultations/${prescribeTarget._id}/prescribe`, {
        expertAdvice: expertAdviceText,
        prescription: prescriptionItems.filter((p) => p.productOrMeasure.trim() !== '')
      });

      if (res.data.success) {
        setPrescribeTarget(null);
        setExpertAdviceText('');
        fetchConsultations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting prescription.');
    }
  };

  const categories = [
    'All',
    'Pest & Disease',
    'Fertilizer & Nutrition',
    'Irrigation & Weather',
    'Seed Quality',
    'General Farming'
  ];

  return (
    <div className="container py-4">
      {/* Title & Action Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="bi bi-people-fill text-success me-2"></i>
            {t('community.title')}
          </h3>
          <p className="text-secondary small mb-0">
            {language === 'hi'
              ? 'किसान समुदाय से प्रश्न पूछें अथवा प्रमाणित कृषि वैज्ञानिकों से सीधा परामर्श प्राप्त करें'
              : 'Community peer knowledge sharing and direct agronomy consultations with ICAR experts'}
          </p>
        </div>

        <div className="d-flex gap-2">
          {activeTab === 'forum' ? (
            <button
              onClick={() => setShowPostModal(true)}
              className="btn btn-success btn-sm rounded-pill px-4 shadow-sm"
            >
              <i className="bi bi-chat-dots-fill me-1"></i> {t('community.start_discussion')}
            </button>
          ) : (
            <button
              onClick={() => setShowConsultModal(true)}
              className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm"
            >
              <i className="bi bi-patch-question-fill me-1"></i> {t('community.request_consultation')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills custom-pills mb-4 p-1 bg-light rounded-pill border">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'forum' ? 'active bg-success text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('forum')}
          >
            <i className="bi bi-chat-left-text me-2"></i>
            {t('community.forum_tab')}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'consultation' ? 'active bg-primary text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('consultation')}
          >
            <i className="bi bi-award me-2"></i>
            {t('community.expert_tab')} ({consultations.length})
          </button>
        </li>
      </ul>

      {/* FORUM TAB */}
      {activeTab === 'forum' && (
        <>
          {/* Categories & Search */}
          <div className="card shadow-sm border-0 rounded-4 p-3 mb-4 bg-light">
            <div className="row g-2 align-items-center">
              <div className="col-md-7">
                <div className="d-flex gap-1 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`btn btn-sm rounded-pill px-3 ${
                        categoryFilter === cat ? 'btn-success text-white' : 'btn-outline-secondary'
                      }`}
                    >
                      {cat}
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
                    placeholder="Search discussions by crop or pest keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="d-flex flex-column gap-3">
            {posts.length === 0 ? (
              <div className="card shadow-sm border-0 rounded-4 p-5 text-center text-muted">
                <i className="bi bi-chat-square-dots fs-1 mb-2"></i>
                <p>No community questions found. Click "Ask the Community" to start one!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="card shadow-sm border-0 rounded-4 p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-success bg-opacity-10 text-success rounded-circle p-2">
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <div>
                        <strong className="text-dark small d-block">{post.author?.name}</strong>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="badge bg-light text-dark border me-1">{post.cropTag}</span>
                      <span className="badge bg-secondary">{post.category}</span>
                    </div>
                  </div>

                  <h5 className="fw-bold text-dark mt-2 mb-2">{post.title}</h5>
                  <p className="text-secondary small mb-3">{post.content}</p>

                  <div className="d-flex align-items-center gap-3 border-top pt-2 mb-3">
                    <button
                      onClick={() => handleToggleUpvote(post._id)}
                      className={`btn btn-sm rounded-pill px-3 ${
                        post.upvotes?.includes(user?.id) ? 'btn-success' : 'btn-outline-success'
                      }`}
                    >
                      <i className="bi bi-hand-thumbs-up me-1"></i> {post.upvotes?.length || 0} Upvotes
                    </button>
                    <span className="text-muted small">
                      <i className="bi bi-chat-left-text me-1"></i> {post.replies?.length || 0} Replies
                    </span>
                  </div>

                  {/* Replies List */}
                  {post.replies && post.replies.length > 0 && (
                    <div className="bg-light p-3 rounded-4 mb-3 d-flex flex-column gap-2">
                      {post.replies.map((reply, rIdx) => (
                        <div
                          key={rIdx}
                          className={`p-2 rounded-3 border ${
                            reply.isExpertReply ? 'bg-success bg-opacity-10 border-success' : 'bg-white'
                          }`}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <div>
                              <strong className="small text-dark">{reply.author?.name}</strong>
                              {reply.isExpertReply && (
                                <span className="badge bg-success ms-2" style={{ fontSize: '0.65rem' }}>
                                  ✓ {t('community.verified_expert')}
                                </span>
                              )}
                            </div>
                            <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <p className="small text-secondary mb-0">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Form */}
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('community.reply_placeholder')}
                      value={replyInputs[post._id] || ''}
                      onChange={(e) => setReplyInputs({ ...replyInputs, [post._id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddReply(post._id)}
                    />
                    <button
                      onClick={() => handleAddReply(post._id)}
                      className="btn btn-success"
                      disabled={!replyInputs[post._id]?.trim()}
                    >
                      {t('community.send_reply')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* CONSULTATION TAB */}
      {activeTab === 'consultation' && (
        <div className="d-flex flex-column gap-4">
          {consultations.length === 0 ? (
            <div className="card shadow-sm border-0 rounded-4 p-5 text-center text-muted">
              <i className="bi bi-award fs-1 text-primary mb-2"></i>
              <h5>No consultation requests recorded.</h5>
              <button
                onClick={() => setShowConsultModal(true)}
                className="btn btn-primary btn-sm rounded-pill px-4 mx-auto mt-2"
              >
                {t('community.request_consultation')}
              </button>
            </div>
          ) : (
            consultations.map((c) => (
              <div key={c._id} className="card shadow-sm border-0 rounded-4 p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-3 gap-2">
                  <div>
                    <span className="badge bg-light text-dark border me-2">Crop: {c.cropAffected}</span>
                    <span
                      className={`badge ${
                        c.severity === 'Urgent / High' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}
                    >
                      {c.severity} Severity
                    </span>
                    <h5 className="fw-bold text-dark mt-2 mb-0">{c.subject}</h5>
                    <small className="text-muted">
                      Requested by {c.farmer?.name} ({c.farmer?.location?.district}) on {new Date(c.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  <div>
                    <span
                      className={`badge fs-6 px-3 py-2 text-capitalize ${
                        c.status === 'answered' ? 'bg-success' : 'bg-warning text-dark'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <strong className="small text-secondary d-block">Reported Symptoms:</strong>
                  <p className="small text-dark mb-0 bg-light p-3 rounded-3">{c.symptoms}</p>
                </div>

                {/* Expert Prescription & Advice Display */}
                {c.expertAdvice ? (
                  <div className="bg-success bg-opacity-10 p-3 rounded-4 border border-success border-opacity-25 mb-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-success">
                        <i className="bi bi-patch-check-fill me-1"></i> Agronomist Prescription
                      </span>
                      <small className="text-secondary fw-semibold">
                        by {c.expert?.name} ({c.expert?.bio || 'PAU Expert'})
                      </small>
                    </div>
                    <p className="small text-dark mb-3">{c.expertAdvice}</p>

                    {c.prescription && c.prescription.length > 0 && (
                      <div className="table-responsive bg-white rounded-3 p-2 border">
                        <table className="table table-sm table-borderless mb-0 small">
                          <thead>
                            <tr className="text-muted border-bottom">
                              <th>Prescribed Product / Bio-Agent</th>
                              <th>Dosage</th>
                              <th>Application Timing</th>
                            </tr>
                          </thead>
                          <tbody>
                            {c.prescription.map((pr, pIdx) => (
                              <tr key={pIdx}>
                                <td><strong>{pr.productOrMeasure}</strong></td>
                                <td>{pr.dosage}</td>
                                <td>{pr.applicationTiming}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  (isExpert || isAdmin) && (
                    <div className="mt-2">
                      <button
                        onClick={() => {
                          setPrescribeTarget(c);
                          setExpertAdviceText('');
                        }}
                        className="btn btn-outline-primary btn-sm rounded-pill px-4"
                      >
                        <i className="bi bi-prescription2 me-1"></i> Provide Expert Advice & Prescription
                      </button>
                    </div>
                  )
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Start Discussion Modal */}
      {showPostModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark-green text-white">
                <h5 className="modal-title fw-bold">Ask the Farming Community</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPostModal(false)}></button>
              </div>
              <form onSubmit={handleCreatePost}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Question / Topic Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. How to manage aphids in mustard without chemical residue?"
                      value={postForm.title}
                      onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Crop Tag</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Mustard, Wheat"
                        value={postForm.cropTag}
                        onChange={(e) => setPostForm({ ...postForm, cropTag: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Category</label>
                      <select
                        className="form-select"
                        value={postForm.category}
                        onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      >
                        <option value="Pest & Disease">Pest & Disease</option>
                        <option value="Fertilizer & Nutrition">Fertilizer & Nutrition</option>
                        <option value="Irrigation & Weather">Irrigation & Weather</option>
                        <option value="Seed Quality">Seed Quality</option>
                        <option value="General Farming">General Farming</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Detailed Description *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Describe symptoms, weather, soil type, and actions already tried..."
                      value={postForm.content}
                      onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowPostModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success rounded-pill px-4">Post Discussion</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Request Expert Consultation Modal */}
      {showConsultModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Submit Agronomy Consultation</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConsultModal(false)}></button>
              </div>
              <form onSubmit={handleCreateConsultation}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Subject / Concern *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sudden leaf yellowing and necrotic lesions"
                      value={consultForm.subject}
                      onChange={(e) => setConsultForm({ ...consultForm, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Affected Crop *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Wheat, Tomato"
                        value={consultForm.cropAffected}
                        onChange={(e) => setConsultForm({ ...consultForm, cropAffected: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Severity</label>
                      <select
                        className="form-select"
                        value={consultForm.severity}
                        onChange={(e) => setConsultForm({ ...consultForm, severity: e.target.value })}
                      >
                        <option value="Low">Low (Watch)</option>
                        <option value="Moderate">Moderate (Spreading)</option>
                        <option value="Urgent / High">Urgent / High (Severe Loss)</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Observed Symptoms & Timeline *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Specify color changes, insect appearance, stage of crop, days since onset..."
                      value={consultForm.symptoms}
                      onChange={(e) => setConsultForm({ ...consultForm, symptoms: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowConsultModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4">Submit to Agronomist</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expert Prescription Modal (For Agronomists/Admins) */}
      {prescribeTarget && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Agronomic Prescription for {prescribeTarget.farmer?.name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPrescribeTarget(null)}></button>
              </div>
              <form onSubmit={handlePrescribeSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Expert Diagnostic Advice *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Explain root cause, pathogen, physiological stress, or pest lifecycle..."
                      value={expertAdviceText}
                      onChange={(e) => setExpertAdviceText(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <h6 className="fw-bold text-dark small mb-2">Prescription Items:</h6>
                  {prescriptionItems.map((item, idx) => (
                    <div key={idx} className="row g-2 mb-2">
                      <div className="col-5">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Product (e.g. Neem Oil 1500ppm / Propiconazole)"
                          value={item.productOrMeasure}
                          onChange={(e) => {
                            const updated = [...prescriptionItems];
                            updated[idx].productOrMeasure = e.target.value;
                            setPrescriptionItems(updated);
                          }}
                        />
                      </div>
                      <div className="col-3">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Dosage (e.g. 5ml/L)"
                          value={item.dosage}
                          onChange={(e) => {
                            const updated = [...prescriptionItems];
                            updated[idx].dosage = e.target.value;
                            setPrescriptionItems(updated);
                          }}
                        />
                      </div>
                      <div className="col-4">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Timing (e.g. Evening spray)"
                          value={item.applicationTiming}
                          onChange={(e) => {
                            const updated = [...prescriptionItems];
                            updated[idx].applicationTiming = e.target.value;
                            setPrescriptionItems(updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setPrescriptionItems([
                        ...prescriptionItems,
                        { productOrMeasure: '', dosage: '', applicationTiming: '' }
                      ])
                    }
                    className="btn btn-outline-secondary btn-sm rounded-pill mt-1"
                  >
                    + Add Another Item
                  </button>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setPrescribeTarget(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success rounded-pill px-4">Submit Prescription</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
