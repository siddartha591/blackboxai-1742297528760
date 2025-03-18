const { createTrafficLogger } = require('./logger');
const logger = createTrafficLogger();

// Simulated IoT sensor data (replace with actual IoT integration)
const sensorData = new Map();

// Initialize some sensor locations
const sensorLocations = [
  { id: 'sensor_1', lat: 8.7642, lng: 78.1348 },
  { id: 'sensor_2', lat: 8.7680, lng: 78.1375 },
  { id: 'sensor_3', lat: 8.7700, lng: 78.1400 }
];

// Update sensor data periodically
setInterval(() => {
  sensorLocations.forEach(location => {
    sensorData.set(location.id, {
      vehicleCount: Math.floor(Math.random() * 50) + 10,
      averageSpeed: Math.floor(Math.random() * 40) + 20,
      timestamp: new Date()
    });
  });
}, 5000); // Update every 5 seconds

// Get traffic data from all sources
async function getTrafficData() {
  try {
    const regions = [];
    
    // Process sensor data
    sensorLocations.forEach(location => {
      const sensor = sensorData.get(location.id);
      if (sensor) {
        const density = calculateDensity(sensor.vehicleCount);
        regions.push({
          id: location.id,
          lat: location.lat,
          lng: location.lng,
          congestionLevel: getCongestionLevel(density),
          averageSpeed: sensor.averageSpeed,
          density: density,
          lastUpdated: sensor.timestamp,
          incidents: [] // To be populated with actual incident data
        });
      }
    });

    return {
      timestamp: new Date(),
      regions: regions,
      metadata: {
        sensorCount: sensorLocations.length,
        dataQuality: 'high',
        updateInterval: '5s'
      }
    };
  } catch (error) {
    logger.error('Error getting traffic data', { error: error.message });
    throw error;
  }
}

// Calculate optimal route based on real-time conditions
async function calculateOptimalRoute(origin, destination) {
  try {
    const trafficData = await getTrafficData();
    
    // Convert origin and destination strings to coordinates
    const [originLat, originLng] = origin.split(',').map(Number);
    const [destLat, destLng] = destination.split(',').map(Number);
    
    // Find least congested path
    const waypoints = calculateWaypoints(
      { lat: originLat, lng: originLng },
      { lat: destLat, lng: destLng },
      trafficData
    );
    
    const route = {
      origin: { lat: originLat, lng: originLng },
      destination: { lat: destLat, lng: destLng },
      waypoints: waypoints,
      estimatedTime: calculateEstimatedTime(waypoints, trafficData),
      distance: calculateRouteDistance(waypoints),
      alternativeRoutes: generateAlternativeRoutes(
        { lat: originLat, lng: originLng },
        { lat: destLat, lng: destLng },
        trafficData
      )
    };

    return route;
  } catch (error) {
    logger.error('Error calculating route', { error: error.message });
    throw error;
  }
}

// Helper functions
function calculateDensity(vehicleCount) {
  // Simple density calculation (can be enhanced with road capacity data)
  return Math.min(vehicleCount / 100, 1);
}

function getCongestionLevel(density) {
  if (density < 0.4) return 'low';
  if (density < 0.7) return 'medium';
  return 'high';
}

function calculateWaypoints(origin, destination, trafficData) {
  // Simple waypoint calculation - can be enhanced with actual routing algorithm
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;
  
  // Find least congested regions near the route
  const nearbyRegions = trafficData.regions.filter(region => {
    const distance = calculateDistance(
      { lat: midLat, lng: midLng },
      { lat: region.lat, lng: region.lng }
    );
    return distance < 2; // Within 2km of midpoint
  });
  
  // Sort by congestion level
  nearbyRegions.sort((a, b) => a.density - b.density);
  
  // Use least congested region as via-point
  const viaPoint = nearbyRegions[0] || { lat: midLat, lng: midLng };
  
  return [
    origin,
    { lat: viaPoint.lat, lng: viaPoint.lng },
    destination
  ];
}

function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

function calculateRouteDistance(waypoints) {
  let distance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    distance += calculateDistance(waypoints[i], waypoints[i + 1]);
  }
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function calculateEstimatedTime(waypoints, trafficData) {
  const distance = calculateRouteDistance(waypoints);
  const avgSpeed = calculateAverageSpeed(waypoints, trafficData);
  const time = (distance / avgSpeed) * 60; // Convert to minutes
  return Math.round(time) + ' minutes';
}

function calculateAverageSpeed(waypoints, trafficData) {
  let totalSpeed = 0;
  let count = 0;
  
  waypoints.forEach(point => {
    const nearbyRegions = trafficData.regions.filter(region => 
      calculateDistance(point, { lat: region.lat, lng: region.lng }) < 1
    );
    
    if (nearbyRegions.length > 0) {
      totalSpeed += nearbyRegions.reduce((acc, region) => acc + region.averageSpeed, 0) / nearbyRegions.length;
      count++;
    }
  });
  
  return count > 0 ? totalSpeed / count : 35; // Default to 35 km/h if no data
}

function generateAlternativeRoutes(origin, destination, trafficData) {
  // Generate two alternative routes with different via-points
  const routes = [];
  const baseWaypoints = calculateWaypoints(origin, destination, trafficData);
  
  // Shift via-point north
  const northRoute = {
    waypoints: [
      origin,
      {
        lat: baseWaypoints[1].lat + 0.01,
        lng: baseWaypoints[1].lng
      },
      destination
    ]
  };
  northRoute.distance = calculateRouteDistance(northRoute.waypoints);
  northRoute.estimatedTime = calculateEstimatedTime(northRoute.waypoints, trafficData);
  
  // Shift via-point south
  const southRoute = {
    waypoints: [
      origin,
      {
        lat: baseWaypoints[1].lat - 0.01,
        lng: baseWaypoints[1].lng
      },
      destination
    ]
  };
  southRoute.distance = calculateRouteDistance(southRoute.waypoints);
  southRoute.estimatedTime = calculateEstimatedTime(southRoute.waypoints, trafficData);
  
  return [northRoute, southRoute];
}

module.exports = {
  getTrafficData,
  calculateOptimalRoute,
  analyzeTrafficImage: async (imageData) => {
    // Placeholder for actual image analysis
    return {
      vehicleCount: 45,
      vehicleTypes: { car: 30, truck: 10, bus: 5 },
      congestionLevel: 'medium',
      incidents: []
    };
  }
};