const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. Add it to backend/.env (see backend/.env.example).');
  }
  const conn = await mongoose.connect(uri);
  return conn;
};

module.exports = connectDB;
