import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrafficData();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchTrafficData, 30000);
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

  // Chart configuration
  const chartData = {
    labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    datasets: [
      {
        label: 'Traffic Density',
        data: [0.3, 0.2, 0.5, 0.8, 0.6, 0.7, 0.9, 0.4],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '24-Hour Traffic Density'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: 'Density Level'
        }
      }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Traffic Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FontAwesomeIcon icon="clock" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {/* Active Signals */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Active Signals</p>
              <p className="stat-value">42</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon="signal" className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-success">
              <FontAwesomeIcon icon="arrow-up" className="mr-1" />
              <span>98% operational</span>
            </div>
          </div>
        </div>

        {/* Current Traffic Density */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Average Traffic Density</p>
              <p className="stat-value">65%</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon="car" className="text-yellow-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-warning">
              <FontAwesomeIcon icon="arrow-up" className="mr-1" />
              <span>Medium congestion</span>
            </div>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Active Incidents</p>
              <p className="stat-value">3</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon="exclamation-triangle" className="text-red-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-danger">
              <FontAwesomeIcon icon="arrow-up" className="mr-1" />
              <span>2 major incidents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Density Chart */}
      <div className="card p-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Recent Incidents */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Incidents</h2>
        <div className="space-y-4">
          {[
            {
              type: 'Accident',
              location: 'Harbor Road Junction',
              status: 'Active',
              time: '10 minutes ago'
            },
            {
              type: 'Road Work',
              location: 'Central Market Area',
              status: 'Scheduled',
              time: '2 hours ago'
            },
            {
              type: 'Signal Malfunction',
              location: 'Beach Road Signal #4',
              status: 'Resolved',
              time: '1 hour ago'
            }
          ].map((incident, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <FontAwesomeIcon 
                  icon={incident.type === 'Accident' ? 'car-crash' : 
                        incident.type === 'Road Work' ? 'road' : 'traffic-light'} 
                  className="text-gray-600"
                />
                <div>
                  <p className="font-medium text-gray-900">{incident.type}</p>
                  <p className="text-sm text-gray-500">{incident.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm ${
                  incident.status === 'Active' ? 'text-red-600' :
                  incident.status === 'Scheduled' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>{incident.status}</p>
                <p className="text-xs text-gray-500">{incident.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;