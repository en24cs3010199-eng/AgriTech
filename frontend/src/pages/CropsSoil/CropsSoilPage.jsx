import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const CropsSoilPage = () => {
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState('crops'); // 'crops' | 'soil' | 'ml'
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [soilRecords, setSoilRecords] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCropModal, setShowCropModal] = useState(false);
  const [showSoilModal, setShowSoilModal] = useState(false);

  // Forms
  const [cropForm, setCropForm] = useState({
    farm: '',
    cropName: 'Wheat',
    variety: 'HD-3086 (Pusa Gautami)',
    season: 'Rabi',
    sowingDate: new Date().toISOString().split('T')[0],
    areaPlanted: '',
    expectedYield: '',
    notes: ''
  });

  const [soilForm, setSoilForm] = useState({
    farm: '',
    nitrogen: 240,
    phosphorus: 25,
    potassium: 160,
    phLevel: 6.8,
    organicCarbon: 0.5,
    electricalConductivity: 0.35,
    moisture: 30
  });

  // ML Recommendation State
  const [mlInputs, setMlInputs] = useState({
    n: 80,
    p: 45,
    k: 40,
    temperature: 24,
    humidity: 82,
    ph: 6.5,
    rainfall: 240
  });
  const [mlResult, setMlResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [farmsRes, cropsRes, soilRes] = await Promise.all([
        api.get('/farms'),
        api.get('/crops'),
        api.get('/soil')
      ]);

      if (farmsRes.data.success) {
        setFarms(farmsRes.data.farms);
        if (farmsRes.data.farms.length > 0 && !cropForm.farm) {
          setCropForm((prev) => ({ ...prev, farm: farmsRes.data.farms[0]._id }));
          setSoilForm((prev) => ({ ...prev, farm: farmsRes.data.farms[0]._id }));
        }
      }
      if (cropsRes.data.success) {
        setCrops(cropsRes.data.crops);
        if (cropsRes.data.crops.length > 0 && !selectedCrop) {
          setSelectedCrop(cropsRes.data.crops[0]);
        }
      }
      if (soilRes.data.success) {
        setSoilRecords(soilRes.data.records);
      }
    } catch (err) {
      console.error('Error fetching crop/soil records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/crops', {
        ...cropForm,
        areaPlanted: Number(cropForm.areaPlanted),
        expectedYield: Number(cropForm.expectedYield) || 0
      });

      if (res.data.success) {
        setShowCropModal(false);
        fetchData();
        setSelectedCrop(res.data.crop);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording crop cycle.');
    }
  };

  const handleCreateSoil = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/soil', {
        ...soilForm,
        nitrogen: Number(soilForm.nitrogen),
        phosphorus: Number(soilForm.phosphorus),
        potassium: Number(soilForm.potassium),
        phLevel: Number(soilForm.phLevel),
        organicCarbon: Number(soilForm.organicCarbon),
        electricalConductivity: Number(soilForm.electricalConductivity),
        moisture: Number(soilForm.moisture)
      });

      if (res.data.success) {
        setShowSoilModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error logging soil test.');
    }
  };

  const handleToggleActivity = async (cropId, activityId, completed) => {
    try {
      const res = await api.put(`/crops/${cropId}/activity/${activityId}`, {
        completed: !completed
      });

      if (res.data.success) {
        setSelectedCrop(res.data.crop);
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling activity:', err);
    }
  };

  const handleRunMLRecommendation = async (e) => {
    e.preventDefault();
    setMlLoading(true);
    try {
      const res = await api.post('/ai/recommend-crop', mlInputs);
      if (res.data.success) {
        setMlResult(res.data.prediction);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error predicting crop.');
    } finally {
      setMlLoading(false);
    }
  };

  const applySoilPreset = (n, p, k, ph, temp, hum, rain) => {
    setMlInputs({ n, p, k, ph, temperature: temp, humidity: hum, rainfall: rain });
  };

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="bi bi-flower1 text-success me-2"></i>
            {t('crops_soil.title')}
          </h3>
          <p className="text-secondary small mb-0">
            {language === 'hi'
              ? 'फसलों के जीवन चक्र की समयसारिणी, मिट्टी की उर्वरा जांच एवं मशीन लर्निंग फसल संस्तुति'
              : 'Crop cycle tracking, personalized DAS timeline, NPK diagnostics, and ML crop predictor'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => setShowCropModal(true)}
            className="btn btn-success btn-sm rounded-pill px-3 shadow-sm"
          >
            + {t('crops_soil.add_crop')}
          </button>
          <button
            onClick={() => setShowSoilModal(true)}
            className="btn btn-outline-info text-dark btn-sm rounded-pill px-3 shadow-sm"
          >
            + {t('crops_soil.log_soil_test')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills custom-pills mb-4 p-1 bg-light rounded-pill border">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'crops' ? 'active bg-success text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('crops')}
          >
            <i className="bi bi-calendar-range me-2"></i>
            {t('crops_soil.crop_tab')}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'soil' ? 'active bg-success text-white' : 'text-secondary'}`}
            onClick={() => setActiveTab('soil')}
          >
            <i className="bi bi-clipboard2-pulse me-2"></i>
            {t('crops_soil.soil_tab')}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'ml' ? 'active bg-warning text-dark fw-bold' : 'text-secondary'}`}
            onClick={() => setActiveTab('ml')}
          >
            <i className="bi bi-cpu-fill text-dark me-2"></i>
            {t('crops_soil.ai_tab')}
          </button>
        </li>
      </ul>

      {/* TAB 1: CROPS & PERSONALIZED ACTIVITY TIMELINE */}
      {activeTab === 'crops' && (
        <div className="row g-4">
          {/* Crop List / Selector */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
              <h6 className="fw-bold text-dark mb-3">
                <i className="bi bi-list-task me-2 text-success"></i>
                Active Crop Cycles ({crops.length})
              </h6>

              {crops.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No crops recorded. Click "+ Record New Crop Cycle" to get started.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '550px' }}>
                  {crops.map((crop) => (
                    <div
                      key={crop._id}
                      onClick={() => setSelectedCrop(crop)}
                      className={`p-3 rounded-3 border cursor-pointer transition ${
                        selectedCrop?._id === crop._id ? 'border-success bg-success bg-opacity-10' : 'bg-white'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="text-dark">{crop.cropName}</strong>
                        <span className={`badge ${crop.status === 'vegetative' ? 'bg-primary' : crop.status === 'flowering' ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {crop.status}
                        </span>
                      </div>
                      <div className="small text-muted mt-1">
                        Variety: {crop.variety} | Farm: {crop.farm?.name}
                      </div>
                      <div className="small text-secondary mt-1">
                        Sown: {new Date(crop.sowingDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timeline View for Selected Crop */}
          <div className="col-lg-8">
            {selectedCrop ? (
              <div className="card shadow-sm border-0 rounded-4 p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 border-bottom pb-3 gap-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">
                      {selectedCrop.cropName} — {selectedCrop.variety}
                    </h5>
                    <span className="text-muted small">
                      Planted: {selectedCrop.areaPlanted} Acres | Farm: {selectedCrop.farm?.name} | Season: {selectedCrop.season}
                    </span>
                  </div>
                  <div className="text-md-end">
                    <span className="badge bg-light text-dark border px-3 py-2">
                      Est. Harvest: {new Date(selectedCrop.expectedHarvestDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <h6 className="fw-bold text-success mb-3">
                  <i className="bi bi-clock-history me-1"></i>
                  {t('crops_soil.timeline_title')}
                </h6>

                {/* Timeline Items */}
                <div className="timeline-container position-relative ps-4 border-start border-3 border-success ms-2">
                  {selectedCrop.timeline?.map((task) => (
                    <div key={task._id} className="position-relative mb-4">
                      {/* Timeline Dot */}
                      <span
                        className={`position-absolute top-0 start-0 translate-middle rounded-circle d-flex align-items-center justify-content-center text-white ${
                          task.completed ? 'bg-success' : 'bg-secondary'
                        }`}
                        style={{ width: '22px', height: '22px', left: '-1px' }}
                      >
                        <i className={`bi ${task.completed ? 'bi-check' : 'bi-circle-fill'}`} style={{ fontSize: '0.65rem' }}></i>
                      </span>

                      {/* Timeline Content Box */}
                      <div className={`p-3 rounded-4 border ${task.completed ? 'bg-success bg-opacity-5 border-success' : 'bg-white'}`}>
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className="fw-bold text-dark mb-0">{task.stage}</h6>
                          <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                            Day {task.daysAfterSowing} (DAS)
                          </span>
                        </div>

                        <p className="small text-secondary mb-2" style={{ fontSize: '0.82rem' }}>
                          {language === 'hi' ? task.taskDescriptionHi || task.taskDescription : task.taskDescription}
                        </p>

                        <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                          <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-calendar-event me-1"></i>
                            Scheduled: {new Date(task.scheduledDate).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleToggleActivity(selectedCrop._id, task._id, task.completed)}
                            className={`btn btn-sm rounded-pill px-3 ${
                              task.completed ? 'btn-outline-success' : 'btn-success text-white'
                            }`}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {task.completed ? `✓ ${t('crops_soil.completed')}` : t('crops_soil.mark_done')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card shadow-sm border-0 rounded-4 p-5 text-center text-muted">
                Select a crop to inspect its personalized agronomic timeline.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SOIL HEALTH & NPK DIAGNOSTICS */}
      {activeTab === 'soil' && (
        <div className="row g-4">
          {soilRecords.length === 0 ? (
            <div className="col-12 text-center py-5">
              <i className="bi bi-clipboard2-pulse text-muted fs-1 mb-2 d-block"></i>
              <p className="text-muted">No soil health cards logged yet.</p>
              <button onClick={() => setShowSoilModal(true)} className="btn btn-success rounded-pill px-4">
                {t('crops_soil.log_soil_test')}
              </button>
            </div>
          ) : (
            soilRecords.map((record) => (
              <div key={record._id} className="col-lg-6">
                <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-2">
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{record.farm?.name || 'Farm Plot'}</h5>
                      <span className="small text-muted">
                        Test Date: {new Date(record.sampleDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`badge fs-6 ${
                        record.fertilityRating === 'Optimal / High'
                          ? 'bg-success'
                          : record.fertilityRating === 'Medium'
                          ? 'bg-primary'
                          : 'bg-warning text-dark'
                      }`}
                    >
                      {record.fertilityRating}
                    </span>
                  </div>

                  {/* NPK & pH Metrics Grid */}
                  <div className="row g-2 text-center mb-3">
                    <div className="col-3">
                      <div className="bg-light p-2 rounded-3 border">
                        <span className="small text-muted d-block">Nitrogen (N)</span>
                        <strong className="fs-5 text-dark">{record.nitrogen}</strong>
                        <small className="d-block text-muted" style={{ fontSize: '0.65rem' }}>kg/ha</small>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="bg-light p-2 rounded-3 border">
                        <span className="small text-muted d-block">Phosphorus (P)</span>
                        <strong className="fs-5 text-dark">{record.phosphorus}</strong>
                        <small className="d-block text-muted" style={{ fontSize: '0.65rem' }}>kg/ha</small>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="bg-light p-2 rounded-3 border">
                        <span className="small text-muted d-block">Potassium (K)</span>
                        <strong className="fs-5 text-dark">{record.potassium}</strong>
                        <small className="d-block text-muted" style={{ fontSize: '0.65rem' }}>kg/ha</small>
                      </div>
                    </div>
                    <div className="col-3">
                      <div className="bg-light p-2 rounded-3 border">
                        <span className="small text-muted d-block">pH Level</span>
                        <strong className="fs-5 text-dark">{record.phLevel}</strong>
                        <small className="d-block text-muted" style={{ fontSize: '0.65rem' }}>0 - 14</small>
                      </div>
                    </div>
                  </div>

                  {/* Deficiency Alerts */}
                  {record.deficiencyAlerts && record.deficiencyAlerts.length > 0 && (
                    <div className="mb-3">
                      <strong className="small text-danger d-block mb-1">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        {t('crops_soil.deficiencies')}:
                      </strong>
                      <ul className="list-unstyled mb-0 small text-secondary ps-2">
                        {record.deficiencyAlerts.map((alert, i) => (
                          <li key={i} className="mb-1">• {alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actionable Fertilizer Plan */}
                  {record.recommendations && record.recommendations.length > 0 && (
                    <div className="bg-success bg-opacity-10 p-3 rounded-3 border border-success border-opacity-25 mt-auto">
                      <strong className="small text-success d-block mb-2">
                        <i className="bi bi-clipboard2-check-fill me-1"></i>
                        {t('crops_soil.fertilizer_plan')}:
                      </strong>
                      {record.recommendations.map((rec, i) => (
                        <div key={i} className="small text-dark mb-2 border-bottom pb-1">
                          <div className="fw-semibold">{rec.fertilizerName} (~{rec.dosageKgPerAcre} kg/acre)</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Timing: {rec.timing}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: EXPLAINABLE ML CROP RECOMMENDATION TOOL (UNIQUE FEATURE 1) */}
      {activeTab === 'ml' && (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-sliders text-success me-2"></i>
                  Soil & Climate Predictors
                </h5>
                <span className="badge bg-warning text-dark">Kaggle Benchmark Model</span>
              </div>
              <p className="small text-secondary mb-3">
                Trained on 2,200 empirical agricultural rows across 22 crops. Adjust your soil chemistry and climatic parameters below.
              </p>

              {/* Quick Presets */}
              <div className="mb-3">
                <span className="small text-muted d-block mb-1">Load Indian Agri Preset:</span>
                <div className="d-flex gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applySoilPreset(80, 48, 40, 6.4, 24, 82, 235)}
                    className="btn btn-outline-success btn-sm rounded-pill py-0 px-2"
                    style={{ fontSize: '0.72rem' }}
                  >
                    Punjab Paddy
                  </button>
                  <button
                    type="button"
                    onClick={() => applySoilPreset(78, 48, 20, 6.2, 22, 65, 85)}
                    className="btn btn-outline-success btn-sm rounded-pill py-0 px-2"
                    style={{ fontSize: '0.72rem' }}
                  >
                    Kharif Maize
                  </button>
                  <button
                    type="button"
                    onClick={() => applySoilPreset(40, 68, 80, 7.3, 19, 17, 80)}
                    className="btn btn-outline-success btn-sm rounded-pill py-0 px-2"
                    style={{ fontSize: '0.72rem' }}
                  >
                    Rabi Chickpea
                  </button>
                  <button
                    type="button"
                    onClick={() => applySoilPreset(118, 46, 20, 6.9, 24, 80, 80)}
                    className="btn btn-outline-success btn-sm rounded-pill py-0 px-2"
                    style={{ fontSize: '0.72rem' }}
                  >
                    Black Soil Cotton
                  </button>
                </div>
              </div>

              <form onSubmit={handleRunMLRecommendation}>
                <div className="mb-2">
                  <div className="d-flex justify-content-between small">
                    <label className="fw-semibold">Nitrogen (N): {mlInputs.n} kg/ha</label>
                    <span className="text-muted">0 - 140</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="140"
                    value={mlInputs.n}
                    onChange={(e) => setMlInputs({ ...mlInputs, n: Number(e.target.value) })}
                  />
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between small">
                    <label className="fw-semibold">Phosphorus (P): {mlInputs.p} kg/ha</label>
                    <span className="text-muted">5 - 145</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="5"
                    max="145"
                    value={mlInputs.p}
                    onChange={(e) => setMlInputs({ ...mlInputs, p: Number(e.target.value) })}
                  />
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between small">
                    <label className="fw-semibold">Potassium (K): {mlInputs.k} kg/ha</label>
                    <span className="text-muted">5 - 205</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="5"
                    max="205"
                    value={mlInputs.k}
                    onChange={(e) => setMlInputs({ ...mlInputs, k: Number(e.target.value) })}
                  />
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between small">
                    <label className="fw-semibold">Soil pH: {mlInputs.ph}</label>
                    <span className="text-muted">3.5 - 9.5</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    step="0.1"
                    min="3.5"
                    max="9.5"
                    value={mlInputs.ph}
                    onChange={(e) => setMlInputs({ ...mlInputs, ph: Number(e.target.value) })}
                  />
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between small">
                    <label className="fw-semibold">Rainfall: {mlInputs.rainfall} mm</label>
                    <span className="text-muted">20 - 300</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="20"
                    max="300"
                    value={mlInputs.rainfall}
                    onChange={(e) => setMlInputs({ ...mlInputs, rainfall: Number(e.target.value) })}
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-secondary">Temperature (°C)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={mlInputs.temperature}
                      onChange={(e) => setMlInputs({ ...mlInputs, temperature: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-secondary">Humidity (%)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={mlInputs.humidity}
                      onChange={(e) => setMlInputs({ ...mlInputs, humidity: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-2 rounded-pill fw-semibold shadow-sm"
                  disabled={mlLoading}
                >
                  {mlLoading ? 'Calculating ML Probabilities...' : 'Predict Best Crop & Explain Factors'}
                </button>
              </form>
            </div>
          </div>

          {/* Explainability & Results Column */}
          <div className="col-lg-7">
            {mlResult ? (
              <div className="card shadow-sm border-0 rounded-4 p-4">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
                  <div>
                    <span className="badge bg-success bg-opacity-10 text-success mb-1">
                      Target Match: {mlResult.season} Season
                    </span>
                    <h3 className="fw-bold text-success mb-0">
                      {language === 'hi' ? mlResult.recommendedCropHi : mlResult.recommendedCrop}
                    </h3>
                  </div>
                  <div className="text-end">
                    <h2 className="fw-bold text-dark mb-0">{mlResult.confidenceScore}%</h2>
                    <small className="text-muted">Model Confidence</small>
                  </div>
                </div>

                <p className="text-secondary small mb-3">
                  {language === 'hi' ? mlResult.descriptionHi : mlResult.description}
                </p>

                {/* Feature Contribution Breakdown */}
                <h6 className="fw-bold text-dark mb-2">
                  <i className="bi bi-bar-chart-fill text-primary me-2"></i>
                  Feature Suitability Decomposition
                </h6>
                <div className="d-flex flex-column gap-2 mb-4">
                  {Object.entries(mlResult.featureBreakdown).map(([key, val]) => (
                    <div key={key}>
                      <div className="d-flex justify-content-between small text-secondary">
                        <span className="text-capitalize">{key.replace('Match', '')}</span>
                        <strong>{val}% match</strong>
                      </div>
                      <div className="progress" style={{ height: '7px' }}>
                        <div
                          className={`progress-bar ${val > 75 ? 'bg-success' : val > 50 ? 'bg-info' : 'bg-warning'}`}
                          style={{ width: `${val}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Primary Limiting Factor Box */}
                {mlResult.explanation?.limitingFactor && (
                  <div className="bg-warning bg-opacity-10 p-3 rounded-4 border border-warning mb-4">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-lightbulb-fill text-warning me-2"></i>
                      Primary Agronomic Limiting Factor
                    </h6>
                    <p className="small text-secondary mb-1">
                      <strong>Constraint:</strong> {mlResult.explanation.limitingFactor.parameter} is currently at{' '}
                      <strong>{mlResult.explanation.limitingFactor.currentValue}</strong> (Optimal benchmark target:{' '}
                      {mlResult.explanation.limitingFactor.idealTarget}).
                    </p>
                    <p className="small text-dark fw-semibold mb-0">
                      <strong>Agronomist Advice:</strong> {mlResult.explanation.limitingFactor.advice}
                    </p>
                  </div>
                )}

                {/* Top Alternative Runner-up Crops */}
                <h6 className="fw-bold text-dark mb-2">
                  <i className="bi bi-arrow-repeat text-secondary me-2"></i>
                  Top Alternative Crop Matches
                </h6>
                <div className="row g-2">
                  {mlResult.explanation?.topAlternatives?.map((alt, i) => (
                    <div key={i} className="col-4">
                      <div className="p-2 border rounded-3 bg-light text-center">
                        <strong className="small text-dark d-block text-truncate">
                          {language === 'hi' ? alt.nameHi : alt.name}
                        </strong>
                        <span className="text-success small fw-bold">{alt.confidenceScore}%</span>
                        <div className="text-muted" style={{ fontSize: '0.65rem' }}>{alt.season}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card shadow-sm border-0 rounded-4 p-5 text-center text-muted">
                <i className="bi bi-cpu text-success fs-1 mb-2 d-block"></i>
                <h5>Explainable Machine Learning Engine Ready</h5>
                <p className="small">
                  Adjust soil nutrients and rainfall on the left, then click "Predict Best Crop & Explain Factors" to view real probabilistic predictions and limiting factor analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Crop Modal */}
      {showCropModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark-green text-white">
                <h5 className="modal-title fw-bold">Record Crop Cycle</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCropModal(false)}></button>
              </div>
              <form onSubmit={handleCreateCrop}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Farm Plot *</label>
                    <select
                      className="form-select"
                      value={cropForm.farm}
                      onChange={(e) => setCropForm({ ...cropForm, farm: e.target.value })}
                      required
                    >
                      {farms.map((f) => (
                        <option key={f._id} value={f._id}>{f.name} ({f.totalArea} {f.areaUnit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Crop Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Wheat, Rice, Mustard"
                        value={cropForm.cropName}
                        onChange={(e) => setCropForm({ ...cropForm, cropName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Variety</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. HD-3086"
                        value={cropForm.variety}
                        onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Season</label>
                      <select
                        className="form-select"
                        value={cropForm.season}
                        onChange={(e) => setCropForm({ ...cropForm, season: e.target.value })}
                      >
                        <option value="Rabi">Rabi (Winter / रबी)</option>
                        <option value="Kharif">Kharif (Monsoon / खरीफ)</option>
                        <option value="Zaid">Zaid (Summer / जायद)</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Sowing Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={cropForm.sowingDate}
                        onChange={(e) => setCropForm({ ...cropForm, sowingDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Planted Area (Acres) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="e.g. 4.0"
                        value={cropForm.areaPlanted}
                        onChange={(e) => setCropForm({ ...cropForm, areaPlanted: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Expected Yield (Quintals)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 80"
                        value={cropForm.expectedYield}
                        onChange={(e) => setCropForm({ ...cropForm, expectedYield: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowCropModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success rounded-pill px-4">Initialize Timeline</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Record Soil Test Modal */}
      {showSoilModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark-green text-white">
                <h5 className="modal-title fw-bold">Log Soil Health Card</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSoilModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSoil}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Farm Plot *</label>
                    <select
                      className="form-select"
                      value={soilForm.farm}
                      onChange={(e) => setSoilForm({ ...soilForm, farm: e.target.value })}
                      required
                    >
                      {farms.map((f) => (
                        <option key={f._id} value={f._id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Nitrogen (N kg/ha) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={soilForm.nitrogen}
                        onChange={(e) => setSoilForm({ ...soilForm, nitrogen: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Phosphorus (P kg/ha) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={soilForm.phosphorus}
                        onChange={(e) => setSoilForm({ ...soilForm, phosphorus: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Potassium (K kg/ha) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={soilForm.potassium}
                        onChange={(e) => setSoilForm({ ...soilForm, potassium: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">pH Level (0-14) *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={soilForm.phLevel}
                        onChange={(e) => setSoilForm({ ...soilForm, phLevel: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowSoilModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success rounded-pill px-4">Generate Diagnostics</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropsSoilPage;
