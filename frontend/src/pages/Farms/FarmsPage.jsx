import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const FarmsPage = () => {
  const { language, t } = useLanguage();

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [farmDetails, setFarmDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    totalArea: '',
    areaUnit: 'Acres',
    soilType: 'Alluvial',
    irrigationSource: 'Borewell / Tubewell',
    state: 'Punjab',
    district: 'Ludhiana',
    village: '',
    notes: ''
  });

  const fetchFarms = async () => {
    try {
      const res = await api.get('/farms');
      if (res.data.success) {
        setFarms(res.data.farms);
      }
    } catch (err) {
      console.error('Error fetching farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/farms', {
        name: formData.name,
        totalArea: Number(formData.totalArea),
        areaUnit: formData.areaUnit,
        soilType: formData.soilType,
        irrigationSource: formData.irrigationSource,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village
        },
        notes: formData.notes
      });

      if (res.data.success) {
        setShowModal(false);
        setFormData({
          name: '',
          totalArea: '',
          areaUnit: 'Acres',
          soilType: 'Alluvial',
          irrigationSource: 'Borewell / Tubewell',
          state: 'Punjab',
          district: 'Ludhiana',
          village: '',
          notes: ''
        });
        fetchFarms();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating farm.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (farmId) => {
    try {
      const res = await api.get(`/farms/${farmId}`);
      if (res.data.success) {
        setFarmDetails(res.data);
      }
    } catch (err) {
      console.error('Error fetching farm details:', err);
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (window.confirm('Are you sure you want to delete this farm? Associated crops and soil tests will also be removed.')) {
      try {
        await api.delete(`/farms/${farmId}`);
        if (farmDetails && farmDetails.farm._id === farmId) {
          setFarmDetails(null);
        }
        fetchFarms();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting farm.');
      }
    }
  };

  return (
    <div className="container py-4">
      {/* Title & Action Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="bi bi-geo-alt-fill text-success me-2"></i>
            {t('farms.title')}
          </h3>
          <p className="text-secondary small mb-0">{t('farms.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-success rounded-pill px-4 shadow-sm"
        >
          <i className="bi bi-plus-circle me-1"></i> {t('farms.register_new')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success"></div>
        </div>
      ) : farms.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 p-5 text-center">
          <i className="bi bi-tree text-success fs-1 mb-2"></i>
          <h5>{t('farms.no_farms')}</h5>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-outline-success rounded-pill px-4 mt-3 mx-auto"
          >
            {t('farms.register_new')}
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {farms.map((farm) => (
            <div key={farm._id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0 rounded-4 h-100 p-3 hover-card">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <h5 className="fw-bold text-dark mb-0">{farm.name}</h5>
                  <span className="badge bg-success bg-opacity-10 text-success fs-6">
                    {farm.totalArea} {farm.areaUnit || 'Acres'}
                  </span>
                </div>

                <div className="small text-muted mb-3">
                  <i className="bi bi-geo-alt me-1"></i>
                  {farm.location?.village ? `${farm.location?.village}, ` : ''}
                  {farm.location?.district}, {farm.location?.state}
                </div>

                <div className="bg-light p-3 rounded-3 small mb-3">
                  <div className="mb-1">
                    <strong className="text-secondary">{t('farms.soil_type')}:</strong> {farm.soilType}
                  </div>
                  <div>
                    <strong className="text-secondary">{t('farms.irrigation')}:</strong> {farm.irrigationSource}
                  </div>
                </div>

                {farm.notes && (
                  <p className="small text-secondary fst-italic mb-3" style={{ fontSize: '0.8rem' }}>
                    "{farm.notes}"
                  </p>
                )}

                <div className="mt-auto d-flex gap-2">
                  <button
                    onClick={() => handleViewDetails(farm._id)}
                    className="btn btn-outline-success btn-sm w-100 rounded-pill"
                  >
                    <i className="bi bi-eye me-1"></i> {t('farms.view_details')}
                  </button>
                  <button
                    onClick={() => handleDeleteFarm(farm._id)}
                    className="btn btn-outline-danger btn-sm rounded-circle px-2"
                    title="Delete Farm"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Farm Detail Viewer (Crops & Soil Records under selected plot) */}
      {farmDetails && (
        <div className="card shadow border-0 rounded-4 p-4 mt-5 bg-white border-top border-4 border-success">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
            <div>
              <h4 className="fw-bold text-dark mb-0">{farmDetails.farm.name} — Plot Dashboard</h4>
              <span className="text-muted small">
                {farmDetails.farm.totalArea} {farmDetails.farm.areaUnit} | Soil: {farmDetails.farm.soilType}
              </span>
            </div>
            <button
              onClick={() => setFarmDetails(null)}
              className="btn btn-sm btn-outline-secondary rounded-pill"
            >
              Close View
            </button>
          </div>

          <div className="row g-4">
            {/* Crops Under This Farm */}
            <div className="col-md-6">
              <h6 className="fw-bold text-success mb-3">
                <i className="bi bi-flower1 me-1"></i> Cultivated Crops ({farmDetails.crops.length})
              </h6>
              {farmDetails.crops.length === 0 ? (
                <p className="small text-muted">No crop records registered for this plot yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {farmDetails.crops.map((crop) => (
                    <div key={crop._id} className="p-3 bg-light rounded-3 border">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="text-dark">{crop.cropName} ({crop.variety})</strong>
                        <span className="badge bg-success text-capitalize">{crop.status}</span>
                      </div>
                      <div className="small text-muted mt-1">
                        Sown: {new Date(crop.sowingDate).toLocaleDateString()} | Area: {crop.areaPlanted} Acres
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Soil Health Tests Under This Farm */}
            <div className="col-md-6">
              <h6 className="fw-bold text-info mb-3">
                <i className="bi bi-clipboard2-pulse me-1"></i> Soil Health History ({farmDetails.soilRecords.length})
              </h6>
              {farmDetails.soilRecords.length === 0 ? (
                <p className="small text-muted">No soil health tests logged yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {farmDetails.soilRecords.map((soil) => (
                    <div key={soil._id} className="p-3 bg-light rounded-3 border">
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="text-dark">Date: {new Date(soil.sampleDate).toLocaleDateString()}</strong>
                        <span className="badge bg-info text-dark">{soil.fertilityRating}</span>
                      </div>
                      <div className="small text-muted mt-1">
                        N: {soil.nitrogen} kg/ha | P: {soil.phosphorus} kg/ha | K: {soil.potassium} kg/ha | pH: {soil.phLevel}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register Farm Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark-green text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-plus-circle me-2"></i>
                  {t('farms.register_new')}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreateFarm}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('farms.farm_name')} *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Green Field Alluvial Plot"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('farms.area')} *
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          step="0.1"
                          className="form-control"
                          placeholder="e.g. 5.5"
                          value={formData.totalArea}
                          onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                          required
                        />
                        <select
                          className="form-select"
                          style={{ maxWidth: '100px' }}
                          value={formData.areaUnit}
                          onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                        >
                          <option value="Acres">Acres</option>
                          <option value="Hectares">Hectares</option>
                          <option value="Bigha">Bigha</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('farms.soil_type')} *
                      </label>
                      <select
                        className="form-select"
                        value={formData.soilType}
                        onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                        required
                      >
                        <option value="Alluvial">Alluvial (जलोढ़)</option>
                        <option value="Black Soil">Black Soil (काली मिट्टी)</option>
                        <option value="Red Soil">Red Soil (लाल मिट्टी)</option>
                        <option value="Laterite">Laterite (लैटेराइट)</option>
                        <option value="Sandy Loam">Sandy Loam (बलुई दोमट)</option>
                        <option value="Clay Loam">Clay Loam (चिकनी दोमट)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        {t('farms.irrigation')} *
                      </label>
                      <select
                        className="form-select"
                        value={formData.irrigationSource}
                        onChange={(e) => setFormData({ ...formData, irrigationSource: e.target.value })}
                        required
                      >
                        <option value="Borewell / Tubewell">Borewell / Tubewell (नलकूप)</option>
                        <option value="Canal Irrigation">Canal Irrigation (नहरी पानी)</option>
                        <option value="Drip Irrigation">Drip Irrigation (ड्रिप/टपक)</option>
                        <option value="Sprinkler System">Sprinkler System (फव्वारा)</option>
                        <option value="Rainfed">Rainfed (वर्षा आधारित)</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">District</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Village</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Village name"
                        value={formData.village}
                        onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Notes / Remarks</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Optional remarks about drainage, boundary markers, or previous crop history..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success rounded-pill px-4"
                    disabled={submitting}
                  >
                    {submitting ? 'Registering...' : 'Register Farm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmsPage;
