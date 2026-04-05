const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Static folder for file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rent-n-drive';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Global Error Handler
app.use((err, req, res, next) => {
  // Handle MongoDB Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    let message = `The ${field || 'field'} is already in use.`;
    
    if (field === 'registrationNumber') {
      message = 'A vehicle with this registration number already exists.';
    } else if (field === 'email') {
      message = 'An account with this email address already exists.';
    }
    
    return res.status(400).json({ message });
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const firstError = Object.values(err.errors)[0]?.message;
    return res.status(400).json({ message: firstError || 'Validation failed' });
  }

  console.error('[GLOBAL_ERROR] Stack:', err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: err.message
  });
});
