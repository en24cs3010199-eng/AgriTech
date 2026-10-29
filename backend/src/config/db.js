const mongoose = require('mongoose');

let mongod = null;
let connectingPromise = null;

/**
 * Connect to MongoDB.
 * - In production, a real MongoDB URI must be provided via MONGODB_URI.
 * - In development / test, use the supplied URI if present, otherwise fall back to an in‑memory server.
 */
const connectDB = async () => {
  // Return existing connection if already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Return ongoing connection promise if one exists
  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI;

      // Production: require a real URI – never fall back to in‑memory
      if (process.env.NODE_ENV === 'production') {
        if (!mongoUri || mongoUri.trim() === '') {
          throw new Error('MONGODB_URI environment variable is required in production');
        }
        console.log('Connecting to configured MongoDB instance (production)...');
        const conn = await mongoose.connect(mongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        await checkAndSeedDatabase();
        return conn;
      }

      // Development / test: use provided URI if any
      if (mongoUri && mongoUri.trim() !== '') {
        console.log('Connecting to configured MongoDB instance...');
        const conn = await mongoose.connect(mongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        await checkAndSeedDatabase();
        return conn;
      }

      // No URI – fall back to in‑memory MongoDB (use default options, random port)
      console.log('ℹ️ No MONGODB_URI provided. Initialising in‑memory MongoDB server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
      }
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In‑Memory MongoDB Connected at: ${uri}`);
      await checkAndSeedDatabase();
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      connectingPromise = null;
      // Attempt in‑memory fallback if not already instantiated
      if (!mongod) {
        try {
          console.log('⚠️ Attempting fallback to in‑memory MongoDB...');
          const { MongoMemoryServer } = require('mongodb-memory-server');
          mongod = await MongoMemoryServer.create();
          const uri = mongod.getUri();
          const conn = await mongoose.connect(uri);
          console.log(`✅ In‑Memory MongoDB Fallback Connected at: ${uri}`);
          await checkAndSeedDatabase();
          return conn;
        } catch (fallbackErr) {
          console.error(`❌ Fallback MongoDB failed: ${fallbackErr.message}`);
        }
      }
      throw error;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
};

/** Seed demo data if the database is empty */
const checkAndSeedDatabase = async () => {
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Auto‑seeding initial agricultural demo data...');
      const { seedData } = require('../utils/seedData');
      await seedData(false);
      console.log('✅ Auto‑seeding completed.');
    }
  } catch (err) {
    console.warn(`Auto‑seed notice: ${err.message}`);
  }
};

/** Disconnect from MongoDB and stop in‑memory server if used */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error(`Error disconnecting MongoDB: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };