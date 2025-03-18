import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('traffic_density');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, selectedMetric]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/traffic/analytics`, {
        params: { timeRange, metric: selectedMetric },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const trafficTrendData = {
    labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
    datasets: [
      {
        label: 'Traffic Density',
        data: [30, 25, 45, 85, 70, 75, 90, 45],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const congestionDistributionData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [35, 45, 20],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 1
      }
    ]
  };

  const peakHoursData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Morning Peak',
        data: [85, 82, 88, 84, 86, 65, 45],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
      {
        label: 'Evening Peak',
        data: [92, 88, 90, 85, 95, 70, 50],
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
      }
    ]
  };

  if (loading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Traffic Analytics</h1>
        <div className="flex space-x-4">
          <select
            className="input"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <select
            className="input"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="traffic_density">Traffic Density</option>
            <option value="congestion">Congestion Levels</option>
            <option value="incidents">Incidents</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon="exclamation-circle" className="mr-2" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Traffic Density</p>
              <p className="text-2xl font-bold">65%</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon="car" className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-success">↑ 8% increase</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Peak Hour Duration</p>
              <p className="text-2xl font-bold">2.5h</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon="clock" className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-danger">↑ 15min longer</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Incidents</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon="exclamation-triangle" className="text-red-600 text-xl" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-success">↓ 12% decrease</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Signal Efficiency</p>
              <p className="text-2xl font-bold">92%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon="traffic-light" className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-success">↑ 3% increase</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trend Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Traffic Density Trend</h2>
          <Line
            data={trafficTrendData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Density (%)'
                  }
                }
              }
            }}
          />
        </div>

        {/* Congestion Distribution Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Congestion Distribution</h2>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut
              data={congestionDistributionData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Peak Hours Analysis</h2>
          <Bar
            data={peakHoursData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: 'Traffic Volume'
                  }
                }
              }
            }}
          />
        </div>

        {/* Key Insights */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Key Insights</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon="chart-line" className="text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium">Peak Traffic Patterns</h3>
                <p className="text-sm text-gray-500">
                  Highest congestion observed during 8-10 AM and 5-7 PM on weekdays
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon="map-marker-alt" className="text-red-600" />
              </div>
              <div>
                <h3 className="font-medium">Congestion Hotspots</h3>
                <p className="text-sm text-gray-500">
                  Harbor Road and Central Market area show consistent high traffic density
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon="clock" className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">Average Delay Time</h3>
                <p className="text-sm text-gray-500">
                  15-20 minutes delay during peak hours, 5-10 minutes during off-peak
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon="lightbulb" className="text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Recommendations</h3>
                <p className="text-sm text-gray-500">
                  Consider signal timing adjustments at Junction 4 and 7 during peak hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;