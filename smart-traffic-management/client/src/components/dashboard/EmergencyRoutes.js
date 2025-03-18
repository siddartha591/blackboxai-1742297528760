import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

const EmergencyRoutes = () => {
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const [routeForm, setRouteForm] = useState({
    vehicleType: '',
    vehicleId: '',
    startPoint: '',
    endPoint: '',
    priority: 'high',
    description: ''
  });

  useEffect(() => {
    fetchActiveRoutes();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchActiveRoutes, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveRoutes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/control/emergency', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setActiveRoutes(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch emergency routes');
      console.error('Error fetching emergency routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/control/emergency', routeForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowRouteForm(false);
      setRouteForm({
        vehicleType: '',
        vehicleId: '',
        startPoint: '',
        endPoint: '',
        priority: 'high',
        description: ''
      });
      fetchActiveRoutes();
    } catch (err) {
      setError('Failed to create emergency route');
      console.error('Error creating emergency route:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRoute = async (routeId) => {
    try {
      await axios.post(`http://localhost:3000/api/control/emergency/${routeId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchActiveRoutes();
    } catch (err) {
      setError('Failed to cancel emergency route');
      console.error('Error canceling emergency route:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'low':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && !showRouteForm) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Emergency Routes</h1>
        <button
          className="btn-danger"
          onClick={() => setShowRouteForm(true)}
        >
          <FontAwesomeIcon icon="plus" className="mr-2" />
          New Emergency Route
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon="exclamation-circle" className="mr-2" />
          {error}
        </div>
      )}

      {/* Active Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeRoutes.map((route) => (
          <div key={route.id} className="card p-6 border-l-4 border-red-500">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-lg">
                    {route.vehicleType.toUpperCase()} - {route.vehicleId}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(route.priority)}`}>
                    {route.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{route.description}</p>
              </div>
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => handleCancelRoute(route.id)}
              >
                <FontAwesomeIcon icon="times" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm">
                <FontAwesomeIcon icon="map-marker-alt" className="text-gray-400 mr-2" />
                <span>From: {route.startPoint}</span>
              </div>
              <div className="flex items-center text-sm">
                <FontAwesomeIcon icon="map-marker-alt" className="text-gray-400 mr-2" />
                <span>To: {route.endPoint}</span>
              </div>
              <div className="flex items-center text-sm">
                <FontAwesomeIcon icon="clock" className="text-gray-400 mr-2" />
                <span>ETA: {route.estimatedTime} minutes</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status: {route.status}</span>
                <span className="text-gray-500">
                  Created: {new Date(route.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Route Form Modal */}
      {showRouteForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Create Emergency Route</h2>
            <form onSubmit={handleRouteSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="vehicleType">Vehicle Type</label>
                  <select
                    id="vehicleType"
                    className="input"
                    value={routeForm.vehicleType}
                    onChange={(e) => setRouteForm({...routeForm, vehicleType: e.target.value})}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="ambulance">Ambulance</option>
                    <option value="fire_truck">Fire Truck</option>
                    <option value="police">Police Vehicle</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="vehicleId">Vehicle ID</label>
                  <input
                    type="text"
                    id="vehicleId"
                    className="input"
                    value={routeForm.vehicleId}
                    onChange={(e) => setRouteForm({...routeForm, vehicleId: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="startPoint">Start Point</label>
                <input
                  type="text"
                  id="startPoint"
                  className="input"
                  value={routeForm.startPoint}
                  onChange={(e) => setRouteForm({...routeForm, startPoint: e.target.value})}
                  required
                  placeholder="Enter starting location"
                />
              </div>

              <div>
                <label className="label" htmlFor="endPoint">End Point</label>
                <input
                  type="text"
                  id="endPoint"
                  className="input"
                  value={routeForm.endPoint}
                  onChange={(e) => setRouteForm({...routeForm, endPoint: e.target.value})}
                  required
                  placeholder="Enter destination"
                />
              </div>

              <div>
                <label className="label" htmlFor="priority">Priority Level</label>
                <select
                  id="priority"
                  className="input"
                  value={routeForm.priority}
                  onChange={(e) => setRouteForm({...routeForm, priority: e.target.value})}
                  required
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  className="input"
                  value={routeForm.description}
                  onChange={(e) => setRouteForm({...routeForm, description: e.target.value})}
                  rows="3"
                  placeholder="Enter emergency details"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowRouteForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyRoutes;