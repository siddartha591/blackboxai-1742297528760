import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrafficDensityChart = ({ data }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  // Keep track of historical data
  const [historicalData, setHistoricalData] = useState([]);
  const maxDataPoints = 20; // Number of data points to show

  useEffect(() => {
    if (data?.regions) {
      const timestamp = new Date().toLocaleTimeString();
      
      // Calculate average density across all regions
      const averageDensity = data.regions.reduce(
        (acc, region) => acc + region.density, 
        0
      ) / data.regions.length;

      // Update historical data
      setHistoricalData(prev => {
        const newData = [...prev, { timestamp, density: averageDensity }];
        return newData.slice(-maxDataPoints);
      });
    }
  }, [data]);

  useEffect(() => {
    // Update chart data whenever historical data changes
    setChartData({
      labels: historicalData.map(d => d.timestamp),
      datasets: [
        {
          label: 'Average Traffic Density',
          data: historicalData.map(d => (d.density * 100).toFixed(1)),
          fill: true,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }
      ]
    });
  }, [historicalData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `Density: ${context.raw}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        borderWidth: 2
      }
    }
  };

  if (!data?.regions) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TrafficDensityChart;