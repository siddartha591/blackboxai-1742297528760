import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Line } from 'react-chartjs-2';
import useWebSocket from '../../hooks/useWebSocket';
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

const DashboardNew = () => {
  const { data: trafficData, error, isConnected } = useWebSocket('ws://localhost:8080');

  // Chart configuration
  const chartData = {
    labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    datasets: [
      {
        label: 'Traffic Density',
        data: trafficData?.regions?.map(r => r.density) || [0.3, 0.2, 0.5, 0.8, 0.6, 0.7, 0.9, 0.4],
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
        text: 'Real-time Traffic Density'
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

  if (!isConnected) {
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

  // Calculate statistics from real-time data
  const stats = {
    activeSensors: trafficData?.regions?.length || 0,
    averageDensity: trafficData?.regions?.reduce((acc, r) => acc + r.density, 0) / 
                    (trafficData?.regions?.length || 1),
    activeIncidents: trafficData?.regions?.reduce((acc, r) => acc + (r.incidents?.length || 0), 0) || 0
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className={`text-sm p-2 ${isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} rounded-md`}>
        <FontAwesomeIcon icon={isConnected ? 'check-circle' : 'exclamation-circle'} className="mr-2" />
        {isConnected ? 'Live traffic data connected' : 'Connecting to traffic data...'}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Traffic Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FontAwesomeIcon icon="clock" />
          <span>Last updated: {new Date(trafficData?.timestamp || Date.now()).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Sensors */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Sensors</p>
              <p className="text-2xl font-bold">{stats.activeSensors}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon="signal" className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-success">
              <FontAwesomeIcon icon="arrow-up" className="mr-1" />
              <span>100% operational</span>
            </div>
          </div>
        </div>

        {/* Current Traffic Density */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Traffic Density</p>
              <p className="text-2xl font-bold">{Math.round(stats.averageDensity * 100)}%</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon="car" className="text-yellow-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-warning">
              <FontAwesomeIcon icon="arrow-up" className="mr-1" />
              <span>{stats.averageDensity > 0.7 ? 'High' : stats.averageDensity > 0.4 ? 'Medium' : 'Low'} congestion</span>
            </div>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-