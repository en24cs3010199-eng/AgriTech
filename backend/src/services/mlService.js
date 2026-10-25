/**
 * Explainable Machine Learning Crop Recommendation Engine
 * Trained on the Kaggle Agricultural Crop Recommendation Dataset (2,200 records, 22 crops)
 * Features:
 *  - N: Nitrogen level in soil (kg/ha)
 *  - P: Phosphorus level in soil (kg/ha)
 *  - K: Potassium level in soil (kg/ha)
 *  - temperature: Air temperature (°C)
 *  - humidity: Relative humidity (%)
 *  - ph: Soil pH level (0 - 14)
 *  - rainfall: Annual/seasonal precipitation (mm)
 */

// Statistical profiles (Mean & Standard Deviation) derived from the 2200-sample benchmark dataset
const CROP_PROFILES = {
  rice: {
    name: 'Rice (धान / चावल)',
    nameHi: 'धान (चावल)',
    season: 'Kharif',
    n: { mean: 79.89, std: 11.47, min: 60, max: 100 },
    p: { mean: 47.58, std: 8.07, min: 35, max: 60 },
    k: { mean: 39.87, std: 5.73, min: 35, max: 45 },
    temp: { mean: 23.68, std: 2.27, min: 20, max: 27 },
    humidity: { mean: 82.27, std: 2.92, min: 80, max: 85 },
    ph: { mean: 6.42, std: 0.34, min: 5.0, max: 7.8 },
    rainfall: { mean: 236.18, std: 42.42, min: 180, max: 300 },
    description: 'Paddy requires high water availability, clayey loam soil, and warm humid climate.',
    descriptionHi: 'धान को अधिक पानी, मटियार दोमट मिट्टी और गर्म-आर्द्र मौसम की आवश्यकता होती है।'
  },
  maize: {
    name: 'Maize (मक्का)',
    nameHi: 'मक्का',
    season: 'Kharif / Rabi',
    n: { mean: 77.76, std: 11.87, min: 60, max: 100 },
    p: { mean: 48.44, std: 8.16, min: 35, max: 60 },
    k: { mean: 19.79, std: 2.87, min: 15, max: 25 },
    temp: { mean: 22.38, std: 3.32, min: 18, max: 27 },
    humidity: { mean: 65.09, std: 5.40, min: 55, max: 75 },
    ph: { mean: 6.24, std: 0.32, min: 5.5, max: 7.0 },
    rainfall: { mean: 84.76, std: 19.46, min: 60, max: 110 },
    description: 'Well-drained loamy soil with moderate rainfall. Highly responsive to nitrogen.',
    descriptionHi: 'अच्छी जल निकासी वाली दोमट मिट्टी और मध्यम वर्षा में मक्का की उत्तम पैदावार होती है।'
  },
  chickpea: {
    name: 'Chickpea / Gram (चना)',
    nameHi: 'चना',
    season: 'Rabi',
    n: { mean: 40.09, std: 11.75, min: 20, max: 60 },
    p: { mean: 67.79, std: 8.13, min: 55, max: 80 },
    k: { mean: 79.92, std: 5.76, min: 75, max: 85 },
    temp: { mean: 18.87, std: 1.41, min: 17, max: 21 },
    humidity: { mean: 16.86, std: 1.76, min: 14, max: 20 },
    ph: { mean: 7.33, std: 0.44, min: 6.0, max: 8.5 },
    rainfall: { mean: 80.05, std: 9.38, min: 65, max: 95 },
    description: 'Cool dry climate with moderate soil moisture and high phosphorus availability.',
    descriptionHi: 'ठंडा व शुष्क मौसम, मध्यम नमी तथा फास्फोरस युक्त मिट्टी चने की खेती के लिए श्रेष्ठ है।'
  },
  kidneybeans: {
    name: 'Kidney Beans / Rajma (राजमा)',
    nameHi: 'राजमा',
    season: 'Rabi / Kharif',
    n: { mean: 20.75, std: 11.58, min: 0, max: 40 },
    p: { mean: 67.54, std: 8.01, min: 55, max: 80 },
    k: { mean: 20.05, std: 2.89, min: 15, max: 25 },
    temp: { mean: 20.11, std: 4.67, min: 15, max: 25 },
    humidity: { mean: 21.60, std: 1.83, min: 18, max: 25 },
    ph: { mean: 5.74, std: 0.17, min: 5.5, max: 6.0 },
    rainfall: { mean: 105.91, std: 27.27, min: 60, max: 150 },
    description: 'Requires slightly acidic to neutral soils with low nitrogen input.',
    descriptionHi: 'हल्की अम्लीय मिट्टी और कम नाइट्रोजन वाले खेतों में राजमा अच्छा पनपता है।'
  },
  pigeonpeas: {
    name: 'Pigeonpeas / Arhar (अरहर / तुअर)',
    nameHi: 'अरहर (तुअर)',
    season: 'Kharif',
    n: { mean: 20.73, std: 11.89, min: 0, max: 40 },
    p: { mean: 67.73, std: 8.16, min: 55, max: 80 },
    k: { mean: 20.29, std: 2.92, min: 15, max: 25 },
    temp: { mean: 27.74, std: 5.37, min: 20, max: 35 },
    humidity: { mean: 48.06, std: 12.28, min: 30, max: 70 },
    ph: { mean: 5.79, std: 0.70, min: 4.5, max: 7.5 },
    rainfall: { mean: 149.45, std: 39.81, min: 90, max: 200 },
    description: 'Drought-tolerant pulse with deep tap roots that enrich soil nitrogen.',
    descriptionHi: 'गहरी जड़ों वाली सूखा-सहनशील दलहनी फसल जो मिट्टी में नाइट्रोजन बढ़ाती है।'
  },
  mothbeans: {
    name: 'Mothbeans (मोठ)',
    nameHi: 'मोठ',
    season: 'Kharif',
    n: { mean: 21.44, std: 11.90, min: 0, max: 40 },
    p: { mean: 48.01, std: 7.91, min: 35, max: 60 },
    k: { mean: 20.23, std: 2.91, min: 15, max: 25 },
    temp: { mean: 28.19, std: 2.87, min: 24, max: 32 },
    humidity: { mean: 53.16, std: 7.42, min: 40, max: 65 },
    ph: { mean: 6.83, std: 0.99, min: 3.5, max: 9.9 },
    rainfall: { mean: 51.19, std: 14.88, min: 30, max: 75 },
    description: 'Extremely resilient in arid regions with low rainfall and sandy soils.',
    descriptionHi: 'कम वर्षा और रेतीली मिट्टी वाले शुष्क क्षेत्रों के लिए अत्यंत उपयुक्त।'
  },
  mungbean: {
    name: 'Mungbean (मूंग)',
    nameHi: 'मूंग',
    season: 'Zaid / Kharif',
    n: { mean: 20.99, std: 12.18, min: 0, max: 40 },
    p: { mean: 47.28, std: 7.95, min: 35, max: 60 },
    k: { mean: 19.87, std: 2.89, min: 15, max: 25 },
    temp: { mean: 28.18, std: 0.79, min: 27, max: 30 },
    humidity: { mean: 85.94, std: 2.81, min: 80, max: 90 },
    ph: { mean: 6.72, std: 0.17, min: 6.2, max: 7.2 },
    rainfall: { mean: 48.40, std: 7.40, min: 35, max: 60 },
    description: 'Short duration pulse crop (60-65 days), ideal for crop rotations.',
    descriptionHi: 'कम अवधि (60-65 दिन) में तैयार होने वाली दलहनी फसल, फसल चक्र के लिए उत्तम।'
  },
  blackgram: {
    name: 'Blackgram / Urad (उड़द)',
    nameHi: 'उड़द',
    season: 'Kharif',
    n: { mean: 40.14, std: 11.97, min: 20, max: 60 },
    p: { mean: 67.47, std: 8.04, min: 55, max: 80 },
    k: { mean: 19.24, std: 2.82, min: 15, max: 25 },
    temp: { mean: 29.98, std: 2.68, min: 25, max: 35 },
    humidity: { mean: 65.11, std: 3.12, min: 60, max: 70 },
    ph: { mean: 7.13, std: 0.19, min: 6.5, max: 7.5 },
    rainfall: { mean: 67.88, std: 4.88, min: 60, max: 75 },
    description: 'Thrives in loamy to heavy soils under warm tropical climate.',
    descriptionHi: 'गर्म मौसम और दोमट से मध्यम भारी मिट्टी में अच्छी उपज देती है।'
  },
  lentil: {
    name: 'Lentil / Masoor (मसूर)',
    nameHi: 'मसूर',
    season: 'Rabi',
    n: { mean: 18.77, std: 11.77, min: 0, max: 40 },
    p: { mean: 68.36, std: 8.27, min: 55, max: 80 },
    k: { mean: 19.41, std: 2.85, min: 15, max: 25 },
    temp: { mean: 24.50, std: 4.80, min: 15, max: 30 },
    humidity: { mean: 64.80, std: 3.13, min: 60, max: 70 },
    ph: { mean: 6.92, std: 0.69, min: 5.5, max: 8.0 },
    rainfall: { mean: 45.68, std: 4.95, min: 35, max: 55 },
    description: 'Winter pulse requiring low moisture and tolerant of moderate soil salinity.',
    descriptionHi: 'सर्दियों की दलहनी फसल जिसे कम पानी की जरूरत होती है।'
  },
  cotton: {
    name: 'Cotton (कपास)',
    nameHi: 'कपास',
    season: 'Kharif',
    n: { mean: 117.77, std: 11.83, min: 100, max: 140 },
    p: { mean: 46.24, std: 8.07, min: 35, max: 60 },
    k: { mean: 19.56, std: 2.86, min: 15, max: 25 },
    temp: { mean: 23.98, std: 1.43, min: 22, max: 26 },
    humidity: { mean: 79.84, std: 1.74, min: 75, max: 85 },
    ph: { mean: 6.91, std: 0.58, min: 6.0, max: 8.0 },
    rainfall: { mean: 80.39, std: 11.73, min: 60, max: 100 },
    description: 'Deep black soils (Regur) with high nitrogen availability and frost-free days.',
    descriptionHi: 'काली मिट्टी (रेगुर) और उच्च नाइट्रोजन वाली उपजाऊ भूमि में कपास उत्तम होता है।'
  },
  jute: {
    name: 'Jute (पटसन)',
    nameHi: 'पटसन',
    season: 'Kharif',
    n: { mean: 78.40, std: 11.98, min: 60, max: 100 },
    p: { mean: 46.86, std: 8.02, min: 35, max: 60 },
    k: { mean: 39.99, std: 5.76, min: 35, max: 45 },
    temp: { mean: 24.95, std: 2.37, min: 23, max: 26 },
    humidity: { mean: 79.63, std: 7.78, min: 70, max: 90 },
    ph: { mean: 6.73, std: 0.59, min: 6.0, max: 7.5 },
    rainfall: { mean: 174.79, std: 18.06, min: 150, max: 200 },
    description: 'High rainfall and alluvium soil required for fiber retting and growth.',
    descriptionHi: 'उच्च वर्षा और जलोढ़ मिट्टी में रेशे के विकास के लिए उपयुक्त।'
  },
  coffee: {
    name: 'Coffee (कॉफ़ी)',
    nameHi: 'कॉफ़ी',
    season: 'Perennial',
    n: { mean: 101.20, std: 11.66, min: 80, max: 120 },
    p: { mean: 28.74, std: 7.91, min: 15, max: 40 },
    k: { mean: 29.94, std: 5.77, min: 25, max: 35 },
    temp: { mean: 25.54, std: 1.48, min: 23, max: 28 },
    humidity: { mean: 58.86, std: 3.42, min: 50, max: 65 },
    ph: { mean: 6.79, std: 0.38, min: 6.0, max: 7.5 },
    rainfall: { mean: 158.06, std: 27.60, min: 115, max: 200 },
    description: 'Hill slopes with well-drained loamy soil rich in organic matter.',
    descriptionHi: 'पहाड़ी ढलानों पर अच्छी जल निकासी वाली उपजाऊ दोमट मिट्टी में कॉफ़ी होती है।'
  }
};

/**
 * Normal Gaussian probability density function
 */
const gaussianPdf = (x, mean, std) => {
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(std, 2));
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
};

/**
 * Predicts recommended crops and produces detailed explainability breakdown
 * @param {Object} params - { n, p, k, temperature, humidity, ph, rainfall }
 */
const recommendCrop = (params) => {
  const { n, p, k, temperature, humidity, ph, rainfall } = params;

  const numN = Number(n);
  const numP = Number(p);
  const numK = Number(k);
  const numTemp = Number(temperature);
  const numHum = Number(humidity);
  const numPh = Number(ph);
  const numRain = Number(rainfall);

  const scores = [];

  for (const [key, profile] of Object.entries(CROP_PROFILES)) {
    // Multi-feature Gaussian probabilities
    const probN = gaussianPdf(numN, profile.n.mean, profile.n.std);
    const probP = gaussianPdf(numP, profile.p.mean, profile.p.std);
    const probK = gaussianPdf(numK, profile.k.mean, profile.k.std);
    const probTemp = gaussianPdf(numTemp, profile.temp.mean, profile.temp.std);
    const probHum = gaussianPdf(numHum, profile.humidity.mean, profile.humidity.std);
    const probPh = gaussianPdf(numPh, profile.ph.mean, profile.ph.std);
    const probRain = gaussianPdf(numRain, profile.rainfall.mean, profile.rainfall.std);

    // Log-likelihood to prevent underflow
    const logLikelihood =
      Math.log(probN + 1e-12) +
      Math.log(probP + 1e-12) +
      Math.log(probK + 1e-12) +
      Math.log(probTemp + 1e-12) +
      Math.log(probHum + 1e-12) +
      Math.log(probPh + 1e-12) +
      Math.log(probRain + 1e-12);

    // Feature individual match ratios (0 to 100%)
    const matchRatio = (val, mean, std) => {
      const z = Math.abs(val - mean) / std;
      return Math.max(10, Math.min(100, Math.round(100 * Math.exp(-0.5 * Math.pow(z, 1.5)))));
    };

    const breakdown = {
      nitrogenMatch: matchRatio(numN, profile.n.mean, profile.n.std),
      phosphorusMatch: matchRatio(numP, profile.p.mean, profile.p.std),
      potassiumMatch: matchRatio(numK, profile.k.mean, profile.k.std),
      tempMatch: matchRatio(numTemp, profile.temp.mean, profile.temp.std),
      humidityMatch: matchRatio(numHum, profile.humidity.mean, profile.humidity.std),
      phMatch: matchRatio(numPh, profile.ph.mean, profile.ph.std),
      rainfallMatch: matchRatio(numRain, profile.rainfall.mean, profile.rainfall.std)
    };

    scores.push({
      cropKey: key,
      name: profile.name,
      nameHi: profile.nameHi,
      season: profile.season,
      description: profile.description,
      descriptionHi: profile.descriptionHi,
      logLikelihood,
      breakdown,
      profile
    });
  }

  // Softmax normalization for confidence probability percentages
  const maxLog = Math.max(...scores.map((s) => s.logLikelihood));
  const expScores = scores.map((s) => Math.exp(s.logLikelihood - maxLog));
  const sumExp = expScores.reduce((a, b) => a + b, 0);

  const rankedCrops = scores
    .map((s, idx) => ({
      ...s,
      confidenceScore: Math.round((expScores[idx] / sumExp) * 100)
    }))
    .sort((a, b) => b.logLikelihood - a.logLikelihood);

  const bestCrop = rankedCrops[0];

  // Limiting Factor Identification
  const featureMatches = [
    { name: 'Nitrogen (N)', match: bestCrop.breakdown.nitrogenMatch, current: numN, ideal: bestCrop.profile.n.mean, unit: 'kg/ha' },
    { name: 'Phosphorus (P)', match: bestCrop.breakdown.phosphorusMatch, current: numP, ideal: bestCrop.profile.p.mean, unit: 'kg/ha' },
    { name: 'Potassium (K)', match: bestCrop.breakdown.potassiumMatch, current: numK, ideal: bestCrop.profile.k.mean, unit: 'kg/ha' },
    { name: 'pH Level', match: bestCrop.breakdown.phMatch, current: numPh, ideal: bestCrop.profile.ph.mean, unit: '' },
    { name: 'Rainfall / Irrigation', match: bestCrop.breakdown.rainfallMatch, current: numRain, ideal: bestCrop.profile.rainfall.mean, unit: 'mm' }
  ].sort((a, b) => a.match - b.match);

  const primaryLimitingFactor = featureMatches[0];

  const explanation = {
    summary: `Recommended ${bestCrop.name} with ${bestCrop.confidenceScore}% model confidence based on soil chemistry (N: ${numN}, P: ${numP}, K: ${numK}, pH: ${numPh}) and micro-climate.`,
    summaryHi: `मृदा परीक्षण (N: ${numN}, P: ${numP}, K: ${numK}, pH: ${numPh}) और मौसम के आधार पर ${bestCrop.nameHi} की संस्तुति (${bestCrop.confidenceScore}% विश्वसनीयता) की गई है।`,
    limitingFactor: {
      parameter: primaryLimitingFactor.name,
      currentValue: `${primaryLimitingFactor.current} ${primaryLimitingFactor.unit}`,
      idealTarget: `~${Math.round(primaryLimitingFactor.ideal)} ${primaryLimitingFactor.unit}`,
      impact: primaryLimitingFactor.match < 70 ? 'Moderate limiting constraint' : 'Favorable, well within agronomic threshold',
      advice: primaryLimitingFactor.current < primaryLimitingFactor.ideal
        ? `Increasing ${primaryLimitingFactor.name} by ~${Math.round(primaryLimitingFactor.ideal - primaryLimitingFactor.current)} ${primaryLimitingFactor.unit} will maximize yield potential.`
        : `Soil ${primaryLimitingFactor.name} is higher than benchmark; avoid excess fertilizer to prevent input waste.`
    },
    topAlternatives: rankedCrops.slice(1, 4).map((c) => ({
      name: c.name,
      nameHi: c.nameHi,
      confidenceScore: c.confidenceScore,
      season: c.season
    }))
  };

  return {
    recommendedCrop: bestCrop.name,
    recommendedCropHi: bestCrop.nameHi,
    season: bestCrop.season,
    confidenceScore: bestCrop.confidenceScore,
    description: bestCrop.description,
    descriptionHi: bestCrop.descriptionHi,
    featureBreakdown: bestCrop.breakdown,
    explanation,
    allRankedCrops: rankedCrops.map((c) => ({
      crop: c.name,
      confidence: c.confidenceScore,
      season: c.season
    }))
  };
};

module.exports = {
  recommendCrop,
  CROP_PROFILES
};
