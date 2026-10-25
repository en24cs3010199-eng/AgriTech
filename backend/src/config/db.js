const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      console.log('Connecting to configured MongoDB instance...');
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    }

    // Graceful in-memory fallback for instant, zero-setup mentor evaluation
    console.log('ℹ️ No MONGODB_URI provided. Initializing local in-memory MongoDB engine...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB Connected at: ${uri}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If standard URI failed, try in-memory fallback before terminating
    if (!mongod) {
      try {
        console.log('⚠️ Attempting fallback to in-memory MongoDB...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`✅ In-Memory MongoDB Fallback Connected at: ${uri}`);
        return;
      } catch (fallbackErr) {
        console.error(`❌ Fallback MongoDB failed: ${fallbackErr.message}`);
      }
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error(`Error disconnecting MongoDB: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };
