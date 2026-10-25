const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

let mongod;
let app;
let farmerToken = '';
let testFarmId = '';
let testCropId = '';

before(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
  app = require('../src/server');
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('1. System Health & Gateway Verification', () => {
  test('GET /api/health returns 200 and operational status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });
});

describe('2. Farmer Registration & Authentication Flow', () => {
  test('POST /api/auth/register creates farmer account and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Farmer Jagjit',
        email: 'jagjit@agritech.com',
        password: 'Password@123',
        phone: '+91 98888 77777',
        role: 'farmer',
        preferredLanguage: 'hi',
        location: { state: 'Punjab', district: 'Ludhiana', village: 'Doraha' }
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'jagjit@agritech.com');
  });

  test('POST /api/auth/login authenticates farmer with valid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jagjit@agritech.com',
        password: 'Password@123'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    farmerToken = res.body.token;
  });

  test('POST /api/auth/login rejects incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jagjit@agritech.com',
        password: 'WrongPassword'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });
});

describe('3. Farm & Plot Management CRUD', () => {
  test('POST /api/farms creates a new farm record for authenticated farmer', async () => {
    const res = await request(app)
      .post('/api/farms')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        name: 'Jagjit Organic Wheat Fields',
        totalArea: 5.0,
        areaUnit: 'Acres',
        soilType: 'Alluvial',
        irrigationSource: 'Borewell / Tubewell',
        location: { state: 'Punjab', district: 'Ludhiana', latitude: 30.9010, longitude: 75.8573 }
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.farm._id);
    testFarmId = res.body.farm._id;
  });

  test('GET /api/farms retrieves all registered farms of farmer', async () => {
    const res = await request(app)
      .get('/api/farms')
      .set('Authorization', `Bearer ${farmerToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.farms.length, 1);
    assert.equal(res.body.farms[0].name, 'Jagjit Organic Wheat Fields');
  });
});

describe('4. Crop Records & Personalized Timeline Generation', () => {
  test('POST /api/crops automatically creates crop with stage-by-stage agronomic timeline', async () => {
    const res = await request(app)
      .post('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        farm: testFarmId,
        cropName: 'Wheat',
        variety: 'HD-3086',
        season: 'Rabi',
        sowingDate: new Date().toISOString(),
        areaPlanted: 4.0,
        expectedYield: 80
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.crop.timeline.length > 5); // Check that agronomic timeline was generated
    assert.equal(res.body.crop.timeline[0].stage, 'Basal Nutrition & Sowing');
    testCropId = res.body.crop._id;
  });

  test('PUT /api/crops/:id/activity/:activityId updates activity completion status', async () => {
    const cropRes = await request(app)
      .get(`/api/crops/${testCropId}`)
      .set('Authorization', `Bearer ${farmerToken}`);

    const activityId = cropRes.body.crop.timeline[0]._id;

    const updateRes = await request(app)
      .put(`/api/crops/${testCropId}/activity/${activityId}`)
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        completed: true,
        notes: 'Applied DAP and MOP at sowing.'
      });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.crop.timeline[0].completed, true);
  });
});

describe('5. Soil Health Analysis & Diagnostics', () => {
  test('POST /api/soil evaluates NPK, pH and returns recommendations', async () => {
    const res = await request(app)
      .post('/api/soil')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        farm: testFarmId,
        nitrogen: 210, // Deficient
        phosphorus: 15, // Deficient
        potassium: 180, // Medium
        phLevel: 7.2 // Optimal
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.record.deficiencyAlerts.length > 0);
    assert.ok(res.body.record.recommendations.length > 0);
  });
});

describe('6. Unique Feature: Explainable ML Crop Recommendation', () => {
  test('POST /api/ai/recommend-crop computes top crop with confidence and feature explanation', async () => {
    const res = await request(app)
      .post('/api/ai/recommend-crop')
      .send({
        n: 80,
        p: 45,
        k: 40,
        temperature: 24,
        humidity: 82,
        ph: 6.5,
        rainfall: 240
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.prediction.recommendedCrop, /Rice/i);
    assert.ok(res.body.prediction.confidenceScore > 50);
    assert.ok(res.body.prediction.explanation.limitingFactor);
  });
});

describe('7. Unique Feature: Hindi Agricultural Assistant (Kisan Saathi)', () => {
  test('POST /api/ai/kisan-saathi returns grounded advisory in Hindi', async () => {
    const res = await request(app)
      .post('/api/ai/kisan-saathi')
      .send({
        query: 'पीएम किसान योजना की किस्त कैसे मिलेगी?',
        language: 'hi'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.answer.includes('₹6,000') || res.body.data.answer.includes('किसान'));
  });
});
