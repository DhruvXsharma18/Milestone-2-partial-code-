// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios'); // For making HTTP requests

// Initialize Express app
const app = express();

// Body parser middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/urban_mobility_app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Define mongoose schema for User model
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  car: {
    type: Boolean,
    default: false
  },
  availableSeats: {
    type: Number,
    default: 0
  },
  bike: {
    type: Boolean,
    default: false
  }
});

// Define mongoose model for User
const User = mongoose.model('User', UserSchema);

// Define mongoose schema for CarPoolingRequest model
const CarPoolingRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  seatsNeeded: {
    type: Number,
    required: true
  }
});

// Define mongoose model for CarPoolingRequest
const CarPoolingRequest = mongoose.model('CarPoolingRequest', CarPoolingRequestSchema);

// Define mongoose schema for BikePoolingRequest model
const BikePoolingRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  }
});

// Define mongoose model for BikePoolingRequest
const BikePoolingRequest = mongoose.model('BikePoolingRequest', BikePoolingRequestSchema);

// Routes

// Create car pooling request
app.post('/api/car-pooling/request', async (req, res) => {
  const { user, origin, destination, seatsNeeded } = req.body;

  try {
    const newRequest = new CarPoolingRequest({
      user,
      origin,
      destination,
      seatsNeeded
    });

    await newRequest.save();
    res.json(newRequest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create bike pooling request
app.post('/api/bike-pooling/request', async (req, res) => {
  const { user, origin, destination } = req.body;

  try {
    const newRequest = new BikePoolingRequest({
      user,
      origin,
      destination
    });

    await newRequest.save();
    res.json(newRequest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get car pooling requests
app.get('/api/car-pooling/requests', async (req, res) => {
  try {
    const requests = await CarPoolingRequest.find().populate('user', 'username');
    res.json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get bike pooling requests
app.get('/api/bike-pooling/requests', async (req, res) => {
  try {
    const requests = await BikePoolingRequest.find().populate('user', 'username');
    res.json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Advanced route system
app.get('/api/routes', async (req, res) => {
  const { origin, destination } = req.query;

  try {
    // Make a request to Google Maps Directions API
    const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}&avoid=ferries&mode=bicycling`);

    // Extract traffic-free route from the response
    const route = response.data.routes[0]; // Assuming only one route is returned

    res.json(route);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
