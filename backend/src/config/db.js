const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri) {
    console.warn('MONGO_URI is not set. Skipping MongoDB connection.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    const commonHelp =
      'Make sure MongoDB is running and MONGO_URI in backend/.env is correct.';
    if (error.code === 'EPERM') {
      console.warn(`MongoDB connection blocked by environment: ${error.message}`);
      console.warn(commonHelp);
      return false;
    }
    console.warn(`MongoDB connection failed: ${error.message}`);
    console.warn(commonHelp);
    return false;
  }
};

module.exports = connectDB;
