import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

const ControlPanel = () => {
  const [activeControls, setActiveControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDiversionForm, setShowDiversionForm] = useState(false);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);

  const [diversionForm, setDiversionForm] = useState({
    startPoint: '',
    endPoint: '',
    reason: '',
    estimatedDuration: '',
    alternativeRoutes: ''
  });

  const [emergencyForm, setEmergencyForm] = useState({
    vehicleType: '',
    startPoint: '',
    endPoint: '',
    priority: 'high'
  });

  useEffect(() => {
    fetchActiveControls();
  }, []);

  const fetchActiveControls = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/control/active', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setActiveControls(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch active controls');
      console.error('Error fetching active controls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiversionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/control/diversion', diversionForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowDiversionForm(false);
      setDiversionForm({
        startPoint: '',
        endPoint: '',
        reason: '',
        estimatedDuration: '',
        alternativeRoutes: ''
      });
      fetchActiveControls();
    } catch (err) {
      setError('Failed to create diversion');
      console.error('Error creating diversion:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/control/emergency', emergencyForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowEmergencyForm(false);
      setEmergencyForm({
        vehicleType: '',
        startPoint: '',
        endPoint: '',
        priority: 'high'
      });
      fetchActiveControls();
    } catch (err) {
      setError('Failed to create emergency route');
      console.error('Error creating emergency route:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showDiversionForm && !showEmergencyForm) {
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
        <h1 className="text-2xl font-bold text-gray-900">Traffic Control Panel</h1>
        <div className="flex space-x-4">
          <button
            className="btn-primary"
            onClick={() => setShowDiversionForm(true)}
          >
            <FontAwesomeIcon icon="route" className="mr-2" />
            Create Diversion
          </button>
          <button
            className="btn-danger"
            onClick={() => setShowEmergencyForm(true)}
          >
            <FontAwesomeIcon icon="exclamation-triangle" className="mr-2" />
            Emergency Route
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon="exclamation-circle" className="mr-2" />
          {error}
        </div>
      )}

      {/* Diversion Form Modal */}
      {showDiversionForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Create Traffic Diversion</h2>
            <form onSubmit={handleDiversionSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="startPoint">Start Point</label>
                <input
                  type="text"
                  id="startPoint"
                  className="input"
                  value={diversionForm.startPoint}
                  onChange={(e) => setDiversionForm({...diversionForm, startPoint: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="endPoint">End Point</label>
                <input
                  type="text"
                  id="endPoint"
                  className="input"
                  value={diversionForm.endPoint}
                  onChange={(e) => setDiversionForm({...diversionForm, endPoint: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="reason">Reason</label>
                <input
                  type="text"
                  id="reason"
                  className="input"
                  value={diversionForm.reason}
                  onChange={(e) => setDiversionForm({...diversionForm, reason: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="estimatedDuration">Estimated Duration (hours)</label>
                <input
                  type="number"
                  id="estimatedDuration"
                  className="input"
                  value={diversionForm.estimatedDuration}
                  onChange={(e) => setDiversionForm({...diversionForm, estimatedDuration: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="alternativeRoutes">Alternative Routes</label>
                <textarea
                  id="alternativeRoutes"
                  className="input"
                  value={diversionForm.alternativeRoutes}
                  onChange={(e) => setDiversionForm({...diversionForm, alternativeRoutes: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowDiversionForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Diversion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Route Form Modal */}
      {showEmergencyForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Create Emergency Route</h2>
            <form onSubmit={handleEmergencySubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="vehicleType">Vehicle Type</label>
                <select
                  id="vehicleType"
                  className="input"
                  value={emergencyForm.vehicleType}
                  onChange={(e) => setEmergencyForm({...emergencyForm, vehicleType: e.target.value})}
                  required
                >
                  <option value="">Select vehicle type</option>
                  <option value="ambulance">Ambulance</option>
                  <option value="fire_truck">Fire Truck</option>
                  <option value="police">Police Vehicle</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="startPoint">Start Point</label>
                <input
                  type="text"
                  id="startPoint"
                  className="input"
                  value={emergencyForm.startPoint}
                  onChange={(e) => setEmergencyForm({...emergencyForm, startPoint: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="endPoint">End Point</label>
                <input
                  type="text"
                  id="endPoint"
                  className="input"
                  value={emergencyForm.endPoint}
                  onChange={(e) => setEmergencyForm({...emergencyForm, endPoint: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="priority">Priority Level</label>
                <select
                  id="priority"
                  className="input"
                  value={emergencyForm.priority}
                  onChange={(e) => setEmergencyForm({...emergencyForm, priority: e.target.value})}
                  required
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEmergencyForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Emergency Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Controls List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Diversions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Active Diversions</h2>
          <div className="space-y-4">
            {activeControls?.diversions?.map((diversion, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{diversion.reason}</p>
                    <p className="text-sm text-gray-500">
                      {diversion.startPoint} → {diversion.endPoint}
                    </p>
                  </div>
                  <span className="text-xs text-primary-600 font-medium">
                    {new Date(diversion.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Emergency Routes */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Emergency Routes</h2>
          <div className="space-y-4">
            {activeControls?.emergencyRoutes?.map((route, index) => (
              <div key={index} className="p-4 bg-red-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-red-700">
                      {route.vehicleType.charAt(0).toUpperCase() + route.vehicleType.slice(1)}
                    </p>
                    <p className="text-sm text-red-600">Priority: {route.priority}</p>
                  </div>
                  <span className="text-xs text-red-600 font-medium">
                    {new Date(route.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;