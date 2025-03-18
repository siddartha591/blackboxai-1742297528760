import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

const SignalControl = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTimingForm, setShowTimingForm] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [timingForm, setTimingForm] = useState({
    signalId: '',
    timingPattern: 'normal',
    duration: '1',
    greenTime: '30',
    yellowTime: '5',
    redTime: '45'
  });

  useEffect(() => {
    fetchSignals();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchSignals, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSignals = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/control/signals', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSignals(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch signals');
      console.error('Error fetching signals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/control/signal-timing', timingForm, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowTimingForm(false);
      setTimingForm({
        signalId: '',
        timingPattern: 'normal',
        duration: '1',
        greenTime: '30',
        yellowTime: '5',
        redTime: '45'
      });
      fetchSignals();
    } catch (err) {
      setError('Failed to update signal timing');
      console.error('Error updating signal timing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignalSelect = (signal) => {
    setSelectedSignal(signal);
    setTimingForm({
      signalId: signal.id,
      timingPattern: signal.currentPattern || 'normal',
      duration: '1',
      greenTime: signal.timing?.green || '30',
      yellowTime: signal.timing?.yellow || '5',
      redTime: signal.timing?.red || '45'
    });
    setShowTimingForm(true);
  };

  const filteredSignals = signals.filter(signal => {
    const matchesSearch = signal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || signal.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-danger';
      default:
        return 'text-gray-500';
    }
  };

  if (loading && !showTimingForm) {
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
        <h1 className="text-2xl font-bold text-gray-900">Signal Control</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search signals..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FontAwesomeIcon
              icon="search"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          <select
            className="input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="operational">Operational</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon="exclamation-circle" className="mr-2" />
          {error}
        </div>
      )}

      {/* Signal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSignals.map((signal) => (
          <div key={signal.id} className="card p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{signal.name}</h3>
                <p className="text-sm text-gray-500">{signal.location}</p>
              </div>
              <span className={`signal-status-${signal.status}`}>
                {signal.status.charAt(0).toUpperCase() + signal.status.slice(1)}
              </span>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Pattern:</span>
                <span className="font-medium">{signal.currentPattern}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Updated:</span>
                <span className="font-medium">
                  {new Date(signal.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Traffic Flow:</span>
                <span className="font-medium">{signal.trafficFlow} vehicles/hour</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                className="btn-primary w-full"
                onClick={() => handleSignalSelect(signal)}
              >
                <FontAwesomeIcon icon="sliders-h" className="mr-2" />
                Adjust Timing
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Timing Form Modal */}
      {showTimingForm && selectedSignal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">
              Adjust Signal Timing - {selectedSignal.name}
            </h2>
            <form onSubmit={handleTimingSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="timingPattern">Timing Pattern</label>
                <select
                  id="timingPattern"
                  className="input"
                  value={timingForm.timingPattern}
                  onChange={(e) => setTimingForm({...timingForm, timingPattern: e.target.value})}
                  required
                >
                  <option value="normal">Normal</option>
                  <option value="peak">Peak Hours</option>
                  <option value="off_peak">Off Peak</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label" htmlFor="greenTime">Green Time (s)</label>
                  <input
                    type="number"
                    id="greenTime"
                    className="input"
                    value={timingForm.greenTime}
                    onChange={(e) => setTimingForm({...timingForm, greenTime: e.target.value})}
                    required
                    min="5"
                    max="120"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="yellowTime">Yellow Time (s)</label>
                  <input
                    type="number"
                    id="yellowTime"
                    className="input"
                    value={timingForm.yellowTime}
                    onChange={(e) => setTimingForm({...timingForm, yellowTime: e.target.value})}
                    required
                    min="3"
                    max="10"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="redTime">Red Time (s)</label>
                  <input
                    type="number"
                    id="redTime"
                    className="input"
                    value={timingForm.redTime}
                    onChange={(e) => setTimingForm({...timingForm, redTime: e.target.value})}
                    required
                    min="5"
                    max="120"
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="duration">Duration (hours)</label>
                <input
                  type="number"
                  id="duration"
                  className="input"
                  value={timingForm.duration}
                  onChange={(e) => setTimingForm({...timingForm, duration: e.target.value})}
                  required
                  min="1"
                  max="24"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowTimingForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Timing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalControl;