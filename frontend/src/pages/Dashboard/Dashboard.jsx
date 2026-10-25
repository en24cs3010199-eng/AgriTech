import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [weather, setWeather] = useState(null);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [soilRecords, setSoilRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [weatherRes, farmsRes, cropsRes, soilRes] = await Promise.allSettled([
          api.get('/weather/forecast'),
          api.get('/farms'),
          api.get('/crops'),
          api.get('/soil')
        ]);

        if (weatherRes.status === 'fulfilled' && weatherRes.value.data.success) {
          setWeather(weatherRes.value.data);
        }
        if (farmsRes.status === 'fulfilled' && farmsRes.value.data.success) {
          setFarms(farmsRes.value.data.farms);
        }
        if (cropsRes.status === 'fulfilled' && cropsRes.value.data.success) {
          setCrops(cropsRes.value.data.crops);
        }
        if (soilRes.status === 'fulfilled' && soilRes.value.data.success) {
          setSoilRecords(soilRes.value.data.records);
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalAcreage = farms.reduce((acc, f) => acc + (f.totalArea || 0), 0);

  // Extract upcoming activities from all crops
  const pendingActivities = [];
  crops.forEach((crop) => {
    if (crop.timeline && crop.timeline.length > 0) {
      crop.timeline.forEach((task) => {
        if (!task.completed) {
          pendingActivities.push({
            cropId: crop._id,
            cropName: crop.cropName,
            variety: crop.variety,
            farmName: crop.farm?.name || 'Farm',
            ...task
          });
        }
      });
    }
  });

  // Sort upcoming by scheduled date
  pendingActivities.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  const handleToggleTask = async (cropId, activityId, currentCompleted) => {
    try {
      await api.put(`/crops/${cropId}/activity/${activityId}`, {
        completed: !currentCompleted
      });
      // Re-fetch crops
      const updatedCrops = await api.get('/crops');
      if (updatedCrops.data.success) {
        setCrops(updatedCrops.data.crops);
      }
    } catch (err) {
      console.error('Error toggling activity:', err);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-green text-white p-4 rounded-4 shadow-sm mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <span className="badge bg-warning text-dark px-3 py-1 rounded-pill mb-2">
              <i className="bi bi-geo-alt-fill me-1"></i>
              {user?.location?.district || 'Ludhiana'}, {user?.location?.state || 'Punjab'}
            </span>
            <h3 className="fw-bold mb-1">
              {t('dashboard.welcome')}, {user?.name}! 🌾
            </h3>
            <p className="text-white-50 mb-0 small">
              {language === 'hi'
                ? 'आज का मौसम, फसल गतिविधियां और खेत का संपूर्ण डिजिटल प्रबंधन नीचे देखें।'
                : "Monitor real-time micro-climate, upcoming agronomic tasks, and your farm's health."}
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <Link to="/crops-soil" className="btn btn-light btn-sm rounded-pill fw-semibold shadow-sm px-3 me-2">
              <i className="bi bi-cpu-fill text-success me-1"></i> {t('crops_soil.ai_tab')}
            </Link>
            <Link to="/farms" className="btn btn-outline-light btn-sm rounded-pill px-3">
              + {t('dashboard.add_farm')}
            </Link>
          </div>
        </div>
      </div>

      {/* Regional Emergency / Pest Alerts Ticker */}
      {weather?.regionalAlerts && weather.regionalAlerts.length > 0 && (
        <div className="alert alert-warning border-warning shadow-sm rounded-4 p-3 mb-4 d-flex align-items-start gap-3">
          <span className="fs-3">⚠️</span>
          <div>
            <h6 className="fw-bold mb-1 text-dark">
              {language === 'hi' ? weather.regionalAlerts[0].titleHi || weather.regionalAlerts[0].title : weather.regionalAlerts[0].title}
            </h6>
            <p className="small mb-1 text-secondary">
              {language === 'hi' ? weather.regionalAlerts[0].descriptionHi || weather.regionalAlerts[0].description : weather.regionalAlerts[0].description}
            </p>
            <div className="small fw-semibold text-danger">
              <i className="bi bi-shield-exclamation me-1"></i>
              {language === 'hi' ? weather.regionalAlerts[0].recommendedActionHi || weather.regionalAlerts[0].recommendedAction : weather.regionalAlerts[0].recommendedAction}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small">{t('dashboard.active_farms')}</span>
                <h3 className="fw-bold mb-0 text-success">{farms.length}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success rounded-circle p-3">
                <i className="bi bi-grid-1x2-fill fs-4"></i>
              </div>
            </div>
            <Link to="/farms" className="small text-success text-decoration-none mt-2 d-inline-block">
              {t('farms.view_details')} &rarr;
            </Link>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small">{t('dashboard.total_acreage')}</span>
                <h3 className="fw-bold mb-0 text-primary">{totalAcreage.toFixed(1)} <small className="fs-6">Acres</small></h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                <i className="bi bi-map-fill fs-4"></i>
              </div>
            </div>
            <span className="small text-muted mt-2 d-inline-block">Cultivated Land</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small">{t('dashboard.growing_crops')}</span>
                <h3 className="fw-bold mb-0 text-warning">{crops.length}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3">
                <i className="bi bi-flower2 fs-4"></i>
              </div>
            </div>
            <Link to="/crops-soil" className="small text-warning text-decoration-none mt-2 d-inline-block">
              {t('crops_soil.crop_tab')} &rarr;
            </Link>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small">{t('dashboard.soil_health_score')}</span>
                <h3 className="fw-bold mb-0 text-info">
                  {soilRecords.length > 0 ? soilRecords[0].fertilityRating : 'Standard'}
                </h3>
              </div>
              <div className="bg-info bg-opacity-10 text-info rounded-circle p-3">
                <i className="bi bi-clipboard2-pulse-fill fs-4"></i>
              </div>
            </div>
            <Link to="/crops-soil" className="small text-info text-decoration-none mt-2 d-inline-block">
              {t('crops_soil.soil_tab')} &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Live Weather & Upcoming Tasks */}
      <div className="row g-4">
        {/* Left Column: Live Agro-Weather */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-cloud-sun-fill text-warning me-2"></i>
                {t('dashboard.weather_overview')}
              </h5>
              <span className="badge bg-light text-muted border">Open-Meteo High-Res</span>
            </div>

            {weather?.current ? (
              <div>
                <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded-4 mb-3">
                  <div>
                    <h2 className="fw-bold mb-0 text-dark">
                      {weather.current.temperature}°C
                    </h2>
                    <span className="text-secondary small">
                      {language === 'hi' ? weather.current.conditionHi : weather.current.condition}
                    </span>
                    <div className="small text-muted mt-1">
                      {t('weather.feels_like')}: {weather.current.apparentTemperature}°C
                    </div>
                  </div>
                  <div className="text-center">
                    <i className={`bi ${weather.current.icon} text-warning fs-1`}></i>
                  </div>
                </div>

                <div className="row g-2 text-center small mb-3">
                  <div className="col-4">
                    <div className="border rounded-3 p-2 bg-white">
                      <span className="text-muted d-block">{t('weather.humidity')}</span>
                      <strong>{weather.current.humidity}%</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border rounded-3 p-2 bg-white">
                      <span className="text-muted d-block">{t('weather.precipitation')}</span>
                      <strong>{weather.current.precipitation} mm</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border rounded-3 p-2 bg-white">
                      <span className="text-muted d-block">{t('weather.wind_speed')}</span>
                      <strong>{weather.current.windSpeed} km/h</strong>
                    </div>
                  </div>
                </div>

                {/* Live Agro Advisory Derived from Weather */}
                {weather.agroAdvisories && weather.agroAdvisories.length > 0 && (
                  <div className="bg-success bg-opacity-10 p-3 rounded-3 border border-success border-opacity-25 mb-3">
                    <div className="fw-bold small text-success mb-1">
                      <i className="bi bi-lightbulb-fill me-1"></i>
                      {language === 'hi' ? weather.agroAdvisories[0].titleHi : weather.agroAdvisories[0].title}
                    </div>
                    <p className="small text-dark mb-0" style={{ fontSize: '0.82rem' }}>
                      {language === 'hi' ? weather.agroAdvisories[0].messageHi : weather.agroAdvisories[0].message}
                    </p>
                  </div>
                )}

                <Link to="/weather" className="btn btn-outline-success btn-sm w-100 rounded-pill">
                  {t('dashboard.view_forecast')} &rarr;
                </Link>
              </div>
            ) : (
              <p className="text-muted small">Loading agro-weather feed...</p>
            )}
          </div>
        </div>

        {/* Right Column: Personalized Crop Activity Timeline Checklist */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-calendar-check-fill text-success me-2"></i>
                {t('dashboard.upcoming_tasks')}
              </h5>
              <span className="badge bg-success bg-opacity-10 text-success">
                {pendingActivities.length} Pending
              </span>
            </div>

            {pendingActivities.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-check-circle-fill text-success fs-1 d-block mb-2"></i>
                <p className="mb-0">{t('dashboard.no_tasks')}</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '420px' }}>
                {pendingActivities.slice(0, 5).map((task, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white border rounded-3 d-flex align-items-start gap-3 shadow-xs hover-card"
                  >
                    <button
                      onClick={() => handleToggleTask(task.cropId, task._id, task.completed)}
                      className="btn btn-sm btn-outline-success rounded-circle mt-1 p-0 d-flex align-items-center justify-content-center"
                      style={{ width: '28px', height: '28px', minWidth: '28px' }}
                      title="Mark as Done"
                    >
                      <i className="bi bi-check-lg"></i>
                    </button>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fw-bold small text-dark">
                          {task.stage}
                        </span>
                        <span className="badge bg-secondary" style={{ fontSize: '0.68rem' }}>
                          Day {task.daysAfterSowing} (DAS)
                        </span>
                      </div>
                      <p className="small text-secondary mb-1 mt-1" style={{ fontSize: '0.8rem' }}>
                        {language === 'hi' ? task.taskDescriptionHi || task.taskDescription : task.taskDescription}
                      </p>
                      <div className="small text-muted d-flex gap-3" style={{ fontSize: '0.72rem' }}>
                        <span>
                          <i className="bi bi-flower1 me-1 text-success"></i>
                          {task.cropName} ({task.variety})
                        </span>
                        <span>
                          <i className="bi bi-calendar-event me-1"></i>
                          {new Date(task.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
              <Link to="/crops-soil" className="small text-success fw-semibold text-decoration-none">
                {t('crops_soil.timeline_title')} &rarr;
              </Link>
              <Link to="/crops-soil" className="btn btn-sm btn-success rounded-pill px-3">
                + {t('crops_soil.add_crop')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
