import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap, Marker } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useWebSocket from '../../hooks/useWebSocket';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// MapUpdater component to handle map center updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const TrafficMapNew = () => {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [mapZoom, setMapZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: trafficData } = useWebSocket('ws://localhost:8080');

  // Get current location
  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(15);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Search for locations using OpenStreetMap Nominatim API
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    }
    setIsSearching(false);
  };

  // Handle location selection
  const selectLocation = (location) => {
    setMapCenter([parseFloat(location.lat), parseFloat(location.lon)]);
    setMapZoom(16);
    setSearchResults([]);
    setSearchQuery('');
  };

  const getDensityColor = (density) => {
    if (density >= 0.8) return '#ef4444';
    if (density >= 0.5) return '#f97316';
    return '#22c55e';
  };

  return (
    <div className="relative h-full">
      {/* Search and Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-sm w-full">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              placeholder="Search location..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={searchLocation}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isSearching}
            >
              <FontAwesomeIcon icon={isSearching ? 'spinner' : 'search'} spin={isSearching} />
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => selectLocation(result)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <div className="font-medium">{result.display_name}</div>
                  <div className="text-sm text-gray-500">{result.type}</div>
                </button>
              ))}
            </div>
          )}

          {/* Current Location Button */}
          <button
            onClick={getCurrentLocation}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FontAwesomeIcon icon="location-arrow" className="mr-2" />
            Use Current Location
          </button>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater center={mapCenter} zoom={mapZoom} />

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker position={currentLocation}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}

        {/* Traffic Density Circles */}
        {trafficData?.regions?.map((region, index) => (
          <Circle
            key={`region-${index}`}
            center={[region.location.lat, region.location.lng]}
            radius={500}
            pathOptions={{
              color: getDensityColor(region.density),
              fillColor: getDensityColor(region.density),
              fillOpacity: 0.6
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{region.id}</h3>
                <p className="text-sm text-gray-600">
                  Traffic Density: {Math.round(region.density * 100)}%
                </p>
                <p className="text-sm text-gray-600">
                  Average Speed: {region.averageSpeed} km/h
                </p>
                {region.incidents?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Active Incidents:</p>
                    <ul className="list-disc list-inside text-sm">
                      {region.incidents.map((incident, i) => (
                        <li key={i}>
                          {incident.type} - {incident.severity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-semibold mb-2">Traffic Density</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span>Low (&lt;50%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
            <span>Medium (50-80%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span>High (&gt;80%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficMapNew;