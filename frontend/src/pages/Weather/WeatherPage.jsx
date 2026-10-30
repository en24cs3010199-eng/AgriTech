import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const WeatherPage = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [district, setDistrict] = useState(user?.location?.district || 'Ludhiana');
  const [state, setState] = useState(user?.location?.state || 'Punjab');

  const fetchWeather = async (locDistrict = district, locState = state) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/weather/forecast?district=${locDistrict}&state=${locState}`);
      if (res.data.success) {
        setWeatherData(res.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 503
          ? 'Weather data is temporarily unavailable. Please try again in a few minutes.'
          : 'Unable to load weather forecast. Check your connection and try again.');
      setError(msg);
      console.error('Error fetching weather:', err.response?.status, msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    fetchWeather(district, state);
  };

  return (
    <div className="container py-4">
      {/* Title & Location Search */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="bi bi-cloud-sun-fill text-warning me-2"></i>
            {t('weather.title')}
          </h3>
          <p className="text-secondary small mb-0">
            {language === 'hi'
              ? 'ओपन-मेटियो (Open-Meteo) वास्तविक समय कृषि-मौसम डेटा एवं कीट प्रकोप जोखिम पूर्वानुमान'
              : 'Real-time agro-meteorological forecast & predictive pest outbreak monitoring'}
          </p>
        </div>

        <form onSubmit={handleLocationSubmit} className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm rounded-pill px-3"
            placeholder="District (e.g. Ludhiana)"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            style={{ maxWidth: '160px' }}
          />
          <input
            type="text"
            className="form-control form-control-sm rounded-pill px-3"
            placeholder="State (e.g. Punjab)"
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={{ maxWidth: '140px' }}
          />
          <button type="submit" className="btn btn-success btn-sm rounded-pill px-3">
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success"></div>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <i className="bi bi-cloud-slash fs-1 text-warning d-block mb-3"></i>
          <p className="text-muted mb-3">{error}</p>
          <button className="btn btn-outline-success btn-sm rounded-pill px-4" onClick={() => fetchWeather()}>
            <i className="bi bi-arrow-clockwise me-1"></i> Retry
          </button>
        </div>
      ) : weatherData ? (
        <>
          {/* Stale-data notice when upstream was rate-limited */}
          {weatherData.stale && (
            <div className="alert alert-warning alert-dismissible fade show py-2 small mb-3" role="alert">
              <i className="bi bi-clock-history me-1"></i>
              Showing cached forecast (weather provider is temporarily busy). Data was last refreshed at {new Date(weatherData.lastUpdated).toLocaleTimeString()}.
              <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          )}
          {/* Current Weather Card */}
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4 bg-gradient-green text-white p-4">
            <div className="row align-items-center">
              <div className="col-md-7">
                <span className="badge bg-light text-dark px-3 py-1 rounded-pill mb-2">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  {weatherData.location?.district}, {weatherData.location?.state} (Lat: {weatherData.location?.latitude.toFixed(2)}°, Lon: {weatherData.location?.longitude.toFixed(2)}°)
                </span>
                <div className="d-flex align-items-baseline gap-3">
                  <h1 className="display-4 fw-bold mb-0">{weatherData.current.temperature}°C</h1>
                  <div>
                    <h5 className="mb-0">
                      {language === 'hi' ? weatherData.current.conditionHi : weatherData.current.condition}
                    </h5>
                    <small className="text-white-50">
                      {t('weather.feels_like')}: {weatherData.current.apparentTemperature}°C
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-md-5 text-md-end mt-3 mt-md-0">
                <i className={`bi ${weatherData.current.icon} display-2 text-warning`}></i>
                <div className="small text-white-50 mt-1">Source: {weatherData.source}</div>
              </div>
            </div>

            <hr className="border-white border-opacity-25 my-3" />

            <div className="row text-center g-2">
              <div className="col-3">
                <div className="bg-white bg-opacity-10 rounded-3 p-2">
                  <span className="small text-white-50 d-block">{t('weather.humidity')}</span>
                  <strong className="fs-5">{weatherData.current.humidity}%</strong>
                </div>
              </div>
              <div className="col-3">
                <div className="bg-white bg-opacity-10 rounded-3 p-2">
                  <span className="small text-white-50 d-block">{t('weather.precipitation')}</span>
                  <strong className="fs-5">{weatherData.current.precipitation} mm</strong>
                </div>
              </div>
              <div className="col-3">
                <div className="bg-white bg-opacity-10 rounded-3 p-2">
                  <span className="small text-white-50 d-block">{t('weather.wind_speed')}</span>
                  <strong className="fs-5">{weatherData.current.windSpeed} km/h</strong>
                </div>
              </div>
              <div className="col-3">
                <div className="bg-white bg-opacity-10 rounded-3 p-2">
                  <span className="small text-white-50 d-block">Elevation</span>
                  <strong className="fs-5">{weatherData.location?.elevation || 240} m</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Outlook Cards */}
          <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-calendar3 me-2 text-primary"></i>
              {t('weather.daily_forecast')}
            </h5>
            <div className="row g-2">
              {weatherData.dailyForecast?.map((day, idx) => (
                <div key={idx} className="col-6 col-md-4 col-lg">
                  <div className="border rounded-4 p-3 text-center bg-light h-100">
                    <span className="small fw-semibold text-secondary d-block mb-1">
                      {new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' })}
                    </span>
                    <i className={`bi ${day.icon} fs-2 text-warning d-block my-2`}></i>
                    <div className="fw-bold text-dark">
                      {day.maxTemp}° / <span className="text-muted fw-normal">{day.minTemp}°</span>
                    </div>
                    <div className="small text-secondary mt-1" style={{ fontSize: '0.72rem' }}>
                      {language === 'hi' ? day.conditionHi : day.condition}
                    </div>
                    <div className="mt-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '0.68rem' }}>
                        ☔ {day.rainProbability}% Rain
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agro Advisories & Pest Outbreak Monitoring */}
          <div className="row g-4">
            {/* Agro Advisories */}
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                <h5 className="fw-bold text-success mb-3">
                  <i className="bi bi-shield-check me-2"></i>
                  {t('weather.agro_advisories')}
                </h5>
                <div className="d-flex flex-column gap-3">
                  {weatherData.agroAdvisories?.map((adv, i) => (
                    <div key={i} className="p-3 rounded-3 bg-light border-start border-4 border-success">
                      <strong className="text-dark d-block mb-1">
                        {language === 'hi' ? adv.titleHi : adv.title}
                      </strong>
                      <p className="small text-secondary mb-0">
                        {language === 'hi' ? adv.messageHi : adv.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pest Outbreak Watch */}
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                <h5 className="fw-bold text-danger mb-3">
                  <i className="bi bi-bug-fill me-2"></i>
                  {t('weather.pest_alerts')}
                </h5>
                <div className="d-flex flex-column gap-3">
                  {weatherData.pestAlerts && weatherData.pestAlerts.length > 0 ? (
                    weatherData.pestAlerts.map((pest, i) => (
                      <div key={i} className="p-3 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-danger">
                            {language === 'hi' ? pest.pestNameHi : pest.pestName}
                          </strong>
                          <span className="badge bg-danger">{pest.riskLevel} Risk</span>
                        </div>
                        <p className="small text-dark mb-2">
                          {language === 'hi' ? pest.descriptionHi : pest.description}
                        </p>
                        <div className="small fw-semibold text-success bg-white p-2 rounded-2 border">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          {language === 'hi' ? pest.preventiveMeasureHi : pest.preventiveMeasure}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted small">
                      <i className="bi bi-emoji-smile fs-3 text-success d-block mb-1"></i>
                      Atmospheric conditions are stable. Low fungal and insect proliferation risk today.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-cloud-slash fs-1 d-block mb-2 text-warning"></i>
          Unable to load weather forecast. Please try refreshing the page.
        </div>
      )}
    </div>
  );
};

export default WeatherPage;
