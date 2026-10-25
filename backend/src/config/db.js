const mongoose = require('mongoose');

let mongod = null;
let connectingPromise = null;

const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is already being established, return that promise
  if (connectingPromise) {
    return connectingPromise;
  }

  connectingPromise = (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI;

      if (mongoUri && mongoUri.trim() !== '') {
        console.log('Connecting to configured MongoDB instance...');
        const conn = await mongoose.connect(mongoUri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        await checkAndSeedDatabase();
        return conn;
      }

      // Graceful in-memory fallback for instant, zero-setup mentor evaluation
      console.log('ℹ️ No MONGODB_URI provided. Initializing local in-memory MongoDB engine...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongodOpts = { instance: { port: 27017, ip: '127.0.0.1' } };
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
      }
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB Connected at: ${uri}`);

      await checkAndSeedDatabase();
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      connectingPromise = null;

      // If standard URI failed, try in-memory fallback before terminating
      if (!mongod) {
        try {
          console.log('⚠️ Attempting fallback to in-memory MongoDB...');
          const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongodOpts = { instance: { port: 27017, ip: '127.0.0.1' } };
          mongod = await MongoMemoryServer.create();
          const uri = mongod.getUri();
          const conn = await mongoose.connect(uri);
          console.log(`✅ In-Memory MongoDB Fallback Connected at: ${uri}`);
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

const checkAndSeedDatabase = async () => {
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Auto-seeding initial agricultural demo data...');
      const { seedData } = require('../utils/seedData');
      await seedData(false);
      console.log('✅ Auto-seeding completed.');
    }
  } catch (err) {
    console.warn(`Auto-seed notice: ${err.message}`);
  }
};

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
