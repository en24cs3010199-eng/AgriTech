const axios = require('axios');

// WMO Weather Interpretation Codes (Standardized across meteorological organizations)
const WMO_CODES = {
  0: { en: 'Clear Sky', hi: 'साफ आसमान', icon: 'bi-sun-fill', severity: 'normal' },
  1: { en: 'Mainly Clear', hi: 'मुख्यतः साफ', icon: 'bi-sun', severity: 'normal' },
  2: { en: 'Partly Cloudy', hi: 'आंशिक रूप से बादल', icon: 'bi-cloud-sun', severity: 'normal' },
  3: { en: 'Overcast / Cloudy', hi: 'बादल छाए रहेंगे', icon: 'bi-clouds-fill', severity: 'normal' },
  45: { en: 'Foggy Conditions', hi: 'कोहरा / धुंध', icon: 'bi-cloud-fog2', severity: 'advisory' },
  48: { en: 'Depositing Rime Fog', hi: 'घना कोहरा', icon: 'bi-cloud-fog2-fill', severity: 'advisory' },
  51: { en: 'Light Drizzle', hi: 'हल्की बूंदाबांदी', icon: 'bi-cloud-drizzle', severity: 'normal' },
  53: { en: 'Moderate Drizzle', hi: 'मध्यम बूंदाबांदी', icon: 'bi-cloud-drizzle-fill', severity: 'normal' },
  55: { en: 'Dense Drizzle', hi: 'तेज बूंदाबांदी', icon: 'bi-cloud-rain', severity: 'advisory' },
  61: { en: 'Slight Rain', hi: 'हल्की बारिश', icon: 'bi-cloud-rain', severity: 'normal' },
  63: { en: 'Moderate Rain', hi: 'मध्यम बारिश', icon: 'bi-cloud-rain-heavy', severity: 'advisory' },
  65: { en: 'Heavy Rain', hi: 'भारी बारिश', icon: 'bi-cloud-rain-heavy-fill', severity: 'warning' },
  71: { en: 'Slight Snow / Hail', hi: 'हल्की बर्फबारी / ओलावृष्टि', icon: 'bi-snow', severity: 'warning' },
  80: { en: 'Slight Rain Showers', hi: 'हल्की बौछारें', icon: 'bi-cloud-sun-rain', severity: 'normal' },
  81: { en: 'Moderate Showers', hi: 'मध्यम बौछारें', icon: 'bi-cloud-rain', severity: 'advisory' },
  82: { en: 'Violent Rain Showers', hi: 'मूसलाधार बौछारें', icon: 'bi-cloud-lightning-rain', severity: 'warning' },
  95: { en: 'Thunderstorm', hi: 'गरज के साथ आंधी-तूफान', icon: 'bi-cloud-lightning-fill', severity: 'danger' }
};

// ---------------------------------------------------------------------------
// In-process weather cache — keyed by normalised "lat:lng" (rounded to 2dp).
// Each entry: { data, expiresAt, fetchingPromise }
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes — fresh enough, well under rate limits
const weatherCache = new Map();

/**
 * Normalise a coordinate to 2 decimal places so nearby requests share a cache entry.
 */
const cacheKey = (lat, lng) =>
  `${Number(lat).toFixed(2)}:${Number(lng).toFixed(2)}`;

/**
 * Sleep for `ms` milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Parse the upstream Retry-After response header.
 * Supports both numeric-seconds format ("120") and HTTP-date format
 * ("Thu, 30 Oct 2026 12:00:00 GMT"). Returns the wait in milliseconds,
 * or 0 if the header is absent / unparseable.
 */
const parseRetryAfterMs = (headerValue) => {
  if (!headerValue) return 0;
  const trimmed = headerValue.trim();

  // Numeric seconds: e.g. "60" or "120"
  if (/^\d+$/.test(trimmed)) {
    const secs = parseInt(trimmed, 10);
    return secs > 0 ? secs * 1000 : 0;
  }

  // HTTP-date: e.g. "Thu, 30 Oct 2026 12:00:00 GMT"
  const retryDate = new Date(trimmed);
  if (!Number.isNaN(retryDate.getTime())) {
    const waitMs = retryDate.getTime() - Date.now();
    return waitMs > 0 ? waitMs : 0;
  }

  return 0;
};

/**
 * Fetch from Open-Meteo with exponential backoff on HTTP 429 / 502 / 503.
 * Respects the Retry-After header (numeric-seconds OR HTTP-date).
 * Bounded to maxAttempts (default 3) and a maximum back-off of 30 s.
 */
const fetchWithBackoff = async (url, timeoutMs = 10000, maxAttempts = 3) => {
  let delay = 2000; // initial back-off: 2 s
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.get(url, { timeout: timeoutMs });
      return response;
    } catch (err) {
      const status = err.response?.status;
      const isRetryable = status === 429 || status === 502 || status === 503;

      if (isRetryable && attempt < maxAttempts) {
        const retryAfterMs = parseRetryAfterMs(err.response?.headers?.['retry-after']);
        const waitMs = retryAfterMs > 0 ? Math.min(retryAfterMs, 60000) : delay;
        console.warn(
          `[WeatherService] Upstream returned ${status}. ` +
          `Waiting ${Math.round(waitMs / 1000)}s before attempt ${attempt + 1}/${maxAttempts}.`
        );
        await sleep(waitMs);
        delay = Math.min(delay * 2, 30000); // cap at 30 s
        continue;
      }
      throw err; // non-retryable or final attempt
    }
  }
};

/**
 * Core data-fetching logic (no caching here — handled in getAgroWeatherData).
 */
const fetchFromUpstream = async (latitude, longitude, district, state) => {
  // 1. OpenWeatherMap — only if an API key is configured
  const owmKey = process.env.OPENWEATHER_API_KEY;
  if (owmKey && owmKey.trim() !== '') {
    try {
      const owmRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${owmKey}&units=metric`,
        { timeout: 10000 }
      );
      if (owmRes.data && owmRes.data.list) {
        return formatOpenWeatherMapData(owmRes.data, district, state);
      }
    } catch (owmErr) {
      console.warn(`[WeatherService] OpenWeatherMap failed, falling back to Open-Meteo: ${owmErr.message}`);
    }
  }

  // 2. Open-Meteo (free, no key required — but can still 429 under heavy load)
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=auto`;

  const response = await fetchWithBackoff(url, 10000, 3);
  const data = response.data;

  const currentCode = data.current?.weather_code ?? 0;
  const currentMeta = WMO_CODES[currentCode] || { en: 'Partly Cloudy', hi: 'बादल', icon: 'bi-cloud', severity: 'normal' };

  // Format 7-Day Forecast
  const dailyForecast = [];
  if (data.daily && data.daily.time) {
    for (let i = 0; i < data.daily.time.length; i++) {
      const dCode = data.daily.weather_code[i] ?? 0;
      const dMeta = WMO_CODES[dCode] || { en: 'Partly Cloudy', hi: 'बादल', icon: 'bi-cloud', severity: 'normal' };
      dailyForecast.push({
        date: data.daily.time[i],
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        precipitationSum: data.daily.precipitation_sum[i],
        rainProbability: data.daily.precipitation_probability_max[i] ?? 0,
        windSpeed: Math.round(data.daily.wind_speed_10m_max[i]),
        condition: dMeta.en,
        conditionHi: dMeta.hi,
        icon: dMeta.icon
      });
    }
  }

  // Generate Agro-Advisories & Pest Warnings derived from real atmospheric data
  const currentTemp = data.current?.temperature_2m ?? 25;
  const currentHumidity = data.current?.relative_humidity_2m ?? 50;
  const currentPrecip = data.current?.precipitation ?? 0;
  const currentWind = data.current?.wind_speed_10m ?? 8;
  const maxRainProb = dailyForecast.length > 0 ? Math.max(...dailyForecast.map(d => d.rainProbability)) : 0;

  const agroAdvisories = [];
  const pestAlerts = [];

  // Rain / Spraying Advisory
  if (maxRainProb > 60 || currentPrecip > 2) {
    agroAdvisories.push({
      id: 'spray-delay',
      type: 'warning',
      title: 'Rain Expected: Postpone Foliar Spraying',
      titleHi: 'वर्षा की संभावना: कीटनाशक/उर्वरक छिड़काव टालें',
      message: `High chance of precipitation (${maxRainProb}%). Avoid spraying fertilizers or insecticides within 24-48 hours to prevent wash-off loss.`,
      messageHi: `बारिश की उच्च संभावना (${maxRainProb}%) है। बहने से बचाने के लिए अगले 24-48 घंटों में कीटनाशक व पर्णीय खाद का छिड़काव न करें।`
    });
    agroAdvisories.push({
      id: 'drainage-check',
      type: 'info',
      title: 'Drainage Preparation',
      titleHi: 'जल निकासी की व्यवस्था',
      message: 'Ensure field drainage channels and furrows are cleared to prevent water stagnation around root zones.',
      messageHi: 'जड़ों के पास जलभराव रोकने के लिए खेत की नालियों की सफाई सुनिश्चित करें।'
    });
  } else {
    agroAdvisories.push({
      id: 'spray-favorable',
      type: 'success',
      title: 'Optimal Spray Window',
      titleHi: 'छिड़काव के लिए अनुकूल मौसम',
      message: 'Low precipitation forecast. Favorable conditions for nutrient top-dressing and protective bio-pesticide applications.',
      messageHi: 'वर्षा की कम संभावना है। पोषक तत्वों व कीटनाशक छिड़काव के लिए मौसम अनुकूल है।'
    });
  }

  // Temperature & Heat Stress
  if (currentTemp > 36) {
    agroAdvisories.push({
      id: 'heat-stress',
      type: 'warning',
      title: 'High Temperature & Evaporation Advisory',
      titleHi: 'अधिक तापमान व वाष्पीकरण परामर्श',
      message: `Current temp is ${currentTemp}°C. Schedule light irrigations during late evening or early morning to prevent thermal stress on standing crops.`,
      messageHi: `तापमान ${currentTemp}°C है। फसलों को गर्मी के तनाव से बचाने के लिए शाम या सुबह हल्की सिंचाई करें।`
    });
  }

  // Humidity & Pest/Fungal Alerts
  if (currentHumidity > 80 && currentTemp >= 20 && currentTemp <= 32) {
    pestAlerts.push({
      id: 'fungal-risk',
      pestName: 'Fungal Blight & Downy Mildew Risk',
      pestNameHi: 'झुलसा व फफूंद जनित रोग का जोखिम',
      riskLevel: 'High',
      description: `High relative humidity (${currentHumidity}%) coupled with warm temperatures creates favorable incubation conditions for fungal pathogens (Blight, Rust, Powdery Mildew).`,
      descriptionHi: `उच्च आर्द्रता (${currentHumidity}%) और अनुकूल तापमान के कारण झुलसा और रतुआ जैसे फफूंद रोगों का खतरा अधिक है।`,
      preventiveMeasure: 'Spray Trichoderma viride (5g/liter) or systemic fungicide (Carbendazim / Mancozeb) upon noticing initial leaf spots.',
      preventiveMeasureHi: 'शुरुआती लक्षण दिखते ही ट्राइकोडर्मा विरिडी (5 ग्राम/लीटर) या मैंकोजेब का छिड़काव करें।'
    });
  }

  if (currentHumidity < 65 && currentTemp > 28) {
    pestAlerts.push({
      id: 'sucking-pest-risk',
      pestName: 'Sucking Pest (Whitefly / Thrips / Aphids) Watch',
      pestNameHi: 'रस चूसक कीट (सफेद मक्खी/थ्रिप्स) निगरानी',
      riskLevel: 'Moderate',
      description: 'Dry and warm weather promotes rapid reproduction of whiteflies and aphids on crop foliage.',
      descriptionHi: 'शुष्क व गर्म मौसम में पत्तियों पर सफेद मक्खी और एफिड्स का फैलाव तेजी से होता है।',
      preventiveMeasure: 'Install yellow sticky traps (10-15 per acre) and spray 5% Neem Seed Kernel Extract (NSKE) or Neem Oil (1500 ppm).',
      preventiveMeasureHi: 'पीले चिपचिपे ट्रैप (10-15 प्रति एकड़) लगाएं और 5% नीम अर्क या नीम तेल का छिड़काव करें।'
    });
  }

  return {
    source: 'Open-Meteo High-Resolution Agro Forecast',
    location: {
      district,
      state,
      latitude,
      longitude,
      elevation: data.elevation ?? 0
    },
    current: {
      temperature: Math.round(currentTemp),
      apparentTemperature: Math.round(data.current?.apparent_temperature ?? currentTemp),
      humidity: currentHumidity,
      precipitation: currentPrecip,
      windSpeed: Math.round(currentWind),
      isDay: data.current?.is_day === 1,
      condition: currentMeta.en,
      conditionHi: currentMeta.hi,
      icon: currentMeta.icon,
      severity: currentMeta.severity
    },
    dailyForecast,
    agroAdvisories,
    pestAlerts,
    lastUpdated: new Date().toISOString()
  };
};

/**
 * Public API — returns agro-weather data, using the in-process cache when possible.
 *
 * Caching strategy:
 *   - Cache key: rounded lat/lng (2 dp) — nearby locations share a single entry.
 *   - TTL: 20 minutes.
 *   - Request coalescing: if a fetch is already in-flight for this key, all concurrent
 *     callers await the same promise rather than launching duplicate upstream requests.
 *   - Stale-on-error: if the upstream fails AND a stale (expired) cache entry exists,
 *     the stale data is returned so the user still sees something useful.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} [district]
 * @param {string} [state]
 */
const getAgroWeatherData = async (latitude = 30.9010, longitude = 75.8573, district = 'Ludhiana', state = 'Punjab') => {
  const key = cacheKey(latitude, longitude);
  const now = Date.now();
  const entry = weatherCache.get(key);

  // --- 1. Serve fresh cache immediately ---
  if (entry && entry.data && entry.expiresAt > now) {
    return { ...entry.data, cached: true };
  }

  // --- 2. Coalesce concurrent requests for the same location ---
  if (entry && entry.fetchingPromise) {
    try {
      return await entry.fetchingPromise;
    } catch {
      // Fall through to stale-data check below
    }
  }

  // --- 3. Launch a new upstream fetch and share the promise ---
  const fetchPromise = (async () => {
    try {
      const freshData = await fetchFromUpstream(latitude, longitude, district, state);
      weatherCache.set(key, {
        data: freshData,
        expiresAt: now + CACHE_TTL_MS,
        fetchingPromise: null
      });
      return freshData;
    } catch (err) {
      // Always clear fetchingPromise so the next caller can issue a new request.
      // Use the current entry (written by the outer .set below) if it exists.
      const current = weatherCache.get(key);
      weatherCache.set(key, {
        data: current?.data || null,
        expiresAt: current?.expiresAt || 0,
        fetchingPromise: null
      });
      throw err;
    }
  })();

  // Register the in-flight promise (preserve any existing stale data)
  weatherCache.set(key, {
    data: entry?.data || null,
    expiresAt: entry?.expiresAt || 0,
    fetchingPromise: fetchPromise
  });

  try {
    return await fetchPromise;
  } catch (error) {
    const status = error.response?.status;
    const logPrefix = '[WeatherService]';

    if (status === 429) {
      console.warn(`${logPrefix} Rate-limited by upstream weather provider (429). Checking stale cache.`);
    } else {
      console.error(`${logPrefix} Weather fetch failed: ${error.message}`);
    }

    // --- 4. Serve stale cache on upstream error rather than crashing ---
    const staleEntry = weatherCache.get(key);
    if (staleEntry && staleEntry.data) {
      console.warn(`${logPrefix} Returning stale cached weather data (age: ${Math.round((now - (staleEntry.expiresAt - CACHE_TTL_MS)) / 60000)} min).`);
      return { ...staleEntry.data, cached: true, stale: true };
    }

    // --- 5. No cache at all — return a clear user-friendly error ---
    throw new Error(
      status === 429
        ? 'Weather data is temporarily unavailable due to high demand. Please try again in a few minutes.'
        : `Unable to fetch real-time weather data. Please try again shortly.`
    );
  }
};

const formatOpenWeatherMapData = (owm, district, state) => {
  const current = owm.list[0];
  return {
    source: 'OpenWeatherMap Global Service',
    location: { district, state, latitude: owm.city.coord.lat, longitude: owm.city.coord.lon },
    current: {
      temperature: Math.round(current.main.temp),
      apparentTemperature: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      precipitation: current.rain ? current.rain['3h'] || 0 : 0,
      windSpeed: Math.round(current.wind.speed * 3.6),
      isDay: true,
      condition: current.weather[0].main,
      conditionHi: current.weather[0].description,
      icon: 'bi-cloud-sun',
      severity: 'normal'
    },
    dailyForecast: owm.list.slice(0, 7).map((item) => ({
      date: item.dt_txt,
      maxTemp: Math.round(item.main.temp_max),
      minTemp: Math.round(item.main.temp_min),
      precipitationSum: item.rain ? item.rain['3h'] || 0 : 0,
      rainProbability: Math.round(item.pop * 100),
      windSpeed: Math.round(item.wind.speed * 3.6),
      condition: item.weather[0].main,
      conditionHi: item.weather[0].description,
      icon: 'bi-cloud-sun'
    })),
    agroAdvisories: [],
    pestAlerts: [],
    lastUpdated: new Date().toISOString()
  };
};

module.exports = {
  getAgroWeatherData,
  WMO_CODES
};
