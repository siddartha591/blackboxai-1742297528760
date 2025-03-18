import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons for different traffic elements
const createCustomIcon = (iconName, color) => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-${color}-100 border-2 border-${color}-600">
            <i class="fas fa-${iconName} text-${color}-600"></i>
           </div>`,
    className: 'custom-div-icon',
  });
};

// MapUpdater component to handle map center updates
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const TrafficMap = () => {
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [mapCenter, setMapCenter] = useState([8.7642, 78.1348]); // Tuticorin coordinates
  const [mapZoom, setMapZoom] = useState(13);

  // Icons
  const signalIcon = createCustomIcon('traffic-light', 'green');
  const incidentIcon = createCustomIcon('exclamation-triangle', 'red');
  const parkingIcon = createCustomIcon('parking', 'blue');

  useEffect(() => {
    fetchTrafficData();
    const interval = setInterval(fetchTrafficData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTrafficData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/traffic/status');
      setTrafficData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch traffic data');
      console.error('Error fetching traffic data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to get color based on congestion level
  const getCongestionColor = (level) => {
    switch (level) {
      case 'low':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <FontAwesomeIcon icon="exclamation-circle" className="mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Map Controls */}
      <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Traffic Map</h2>
          <div className="flex space-x-4">
            <button
              className="btn-primary"
              onClick={() => setMapCenter([8.7642, 78.1348])}
            >
              <FontAwesomeIcon icon="location-arrow" className="mr-2" />
              Center Map
            </button>
            <select
              className="input"
              onChange={(e) => setSelectedArea(e.target.value)}
              value={selectedArea || ''}
            >
              <option value="">All Areas</option>
              <option value="central">Central District</option>
              <option value="harbor">Harbor Area</option>
              <option value="industrial">Industrial Zone</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="traffic-map-container">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="traffic-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapUpdater center={mapCenter} />

          {/* Traffic Signals */}
          {trafficData?.signals?.map((signal, index) => (
            <Marker
              key={`signal-${index}`}
              position={[signal.lat, signal.lng]}
              icon={signalIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">Signal #{signal.id}</h3>
                  <p className="text-sm text-gray-600">Status: {signal.status}</p>
                  <p className="text-sm text-gray-600">
                    Wait Time: {signal.waitTime}s
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Traffic Density Areas */}
          {trafficData?.regions?.map((region, index) => (
            <Circle
              key={`region-${index}`}
              center={[region.lat, region.lng]}
              radius={500}
              pathOptions={{
                color: getCongestionColor(region.congestionLevel),
                fillColor: getCongestionColor(region.congestionLevel),
                fillOpacity: 0.3
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{region.name}</h3>
                  <p className="text-sm text-gray-600">
                    Congestion: {region.congestionLevel}
                  </p>
                  <p className="text-sm text-gray-600">
                    Average Speed: {region.averageSpeed} km/h
                  </p>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Incidents */}
          {trafficData?.incidents?.map((incident, index) => (
            <Marker
              key={`incident-${index}`}
              position={[incident.lat, incident.lng]}
              icon={incidentIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{incident.type}</h3>
                  <p className="text-sm text-gray-600">{incident.description}</p>
                  <p className="text-sm text-gray-600">
                    Reported: {new Date(incident.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Parking Areas */}
          {trafficData?.parking?.map((spot, index) => (
            <Marker
              key={`parking-${index}`}
              position={[spot.lat, spot.lng]}
              icon={parkingIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{spot.name}</h3>
                  <p className="text-sm text-gray-600">
                    Available: {spot.available}/{spot.total} spots
                  </p>
                  <p className="text-sm text-gray-600">
                    Predicted in 1h: {spot.predicted}% available
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-white p-4 mt-4 rounded-lg shadow-sm">
        <h3 className="font-semibold mb-2">Map Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm">Low Traffic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Medium Traffic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm">High Traffic</span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon="exclamation-triangle" className="text-red-600" />
            <span className="text-sm">Incident</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficMap;