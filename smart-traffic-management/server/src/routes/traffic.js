const express = require('express');
const router = express.Router();
const WebSocket = require('ws');
const { createTrafficLogger } = require('../utils/logger');
const { getTrafficData, calculateOptimalRoute, analyzeTrafficImage } = require('../utils/trafficAnalysis');
const logger = createTrafficLogger();

// WebSocket connection for real-time updates
const wss = new WebSocket.Server({ port: 8080 });

// Start periodic traffic data broadcast
setInterval(async () => {
  try {
    const trafficData = await getTrafficData();
    broadcastUpdate(trafficData);
  } catch (error) {
    logger.error('Error broadcasting traffic data', { error: error.message });
  }
}, 5000); // Update every 5 seconds

// Store connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  clients.add(ws);
  logger.info('New client connected');

  ws.on('close', () => {
    clients.delete(ws);
    logger.info('Client disconnected');
  });
});

// Broadcast updates to all connected clients
const broadcastUpdate = (data) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Get current traffic status
router.get('/status', async (req, res, next) => {
  try {
    const trafficData = await getTrafficData();
    logger.info('Traffic status retrieved', { data: trafficData });
    res.json(trafficData);
  } catch (error) {
    logger.error('Error fetching traffic status', { error: error.message });
    next(error);
  }
});

// AI-powered traffic analysis
const analyzeTrafficImage = async (imageData) => {
  try {
    // TODO: Implement actual AI analysis
    // This is where we would integrate with a computer vision API
    return {
      vehicleCount: 45,
      vehicleTypes: {
        car: 30,
        truck: 10,
        bus: 5
      },
      congestionLevel: 'medium',
      incidents: []
    };
  } catch (error) {
    logger.error('Error analyzing traffic image', { error: error.message });
    throw error;
  }
};

// Get optimal route with real-time data
router.get('/route', async (req, res, next) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination coordinates are required'
      });
    }

    const route = await calculateOptimalRoute(origin, destination);
    logger.info('Optimal route calculated', { origin, destination, route });
    res.json(route);
  } catch (error) {
    logger.error('Error calculating optimal route', { error: error.message });
    next(error);
  }
});

// Get parking availability with real-time updates
router.get('/parking', async (req, res, next) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    const [lat, lng] = location.split(',').map(Number);
    const trafficData = await getTrafficData();
    
    // Find nearby sensors that might indicate parking availability
    const nearbySensors = trafficData.regions.filter(region => {
      const distance = Math.sqrt(
        Math.pow(region.lat - lat, 2) + Math.pow(region.lng - lng, 2)
      );
      return distance < 0.01; // Within roughly 1km
    });

    // Calculate parking availability based on traffic density
    const parkingData = {
      timestamp: new Date(),
      parkingLots: nearbySensors.map(sensor => ({
        id: sensor.id,
        name: `Parking ${sensor.id}`,
        location: { lat: sensor.lat, lng: sensor.lng },
        availableSpots: Math.floor((1 - sensor.density) * 100),
        totalSpots: 100,
        predictedAvailability: `${Math.floor((1 - sensor.density) * 100)}% in 1 hour`
      }))
    };

    logger.info('Parking availability retrieved', { 
      location, 
      data: parkingData 
    });
    
    res.json(parkingData);
  } catch (error) {
    logger.error('Error fetching parking availability', { error: error.message });
    next(error);
  }
});

// Get traffic density analysis with AI predictions
router.get('/density', async (req, res, next) => {
  try {
    const { region } = req.query;
    const trafficData = await getTrafficData();

    // Find the specified region
    const regionData = trafficData.regions.find(r => r.id === region) || trafficData.regions[0];
    
    // Calculate predictions based on current density trends
    const densityTrend = regionData.density > 0.5 ? 0.1 : -0.1;
    const densityData = {
      timestamp: new Date(),
      currentDensity: regionData.density,
      prediction: {
        nextHour: Math.min(1, Math.max(0, regionData.density + densityTrend)),
        nextTwoHours: Math.min(1, Math.max(0, regionData.density + densityTrend * 2))
      },
      recommendations: generateRecommendations(regionData, trafficData)
    };

    logger.info('Traffic density analysis retrieved', { 
      region, 
      data: densityData 
    });
    
    res.json(densityData);
  } catch (error) {
    logger.error('Error analyzing traffic density', { error: error.message });
    next(error);
  }
});

module.exports = router;