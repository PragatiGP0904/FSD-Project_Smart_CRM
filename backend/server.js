const dotenv = require('dotenv');

dotenv.config();

const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');
mongoose.set('strictQuery', true);

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace_with_a_long_random_secret') {
    console.error('JWT_SECRET is missing or still the example value. Set a long random secret in backend/.env.');
    process.exit(1);
  }
  try {
    const conn = await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`MongoDB connected: ${conn.connection.host}`);
    });
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

module.exports = app;
