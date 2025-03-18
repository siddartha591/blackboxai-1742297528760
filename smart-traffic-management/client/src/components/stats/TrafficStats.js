import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TrafficStats = ({ data }) => {
  if (!data?.regions) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FontAwesomeIcon icon="spinner" spin className="text-3xl mb-2" />
        <p>Loading traffic statistics...</p>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalRegions: data.regions.length,
    averageSpeed: Math.round(
      data.regions.reduce((acc, region) => acc + region.averageSpeed, 0) / 
      data.regions.length
    ),
    highDensityRegions: data.regions.filter(r => r.density >= 0.7).length,
    totalIncidents: data.regions.reduce(
      (acc, region) => acc + (region.incidents?.length || 0), 
      0
    ),
    averageDensity: Math.round(
      (data.regions.reduce((acc, region) => acc + region.density, 0) / 
      data.regions.length) * 100
    )
  };

  const getDensityStatus = (density) => {
    if (density >= 70) return { text: 'Heavy', color: 'text-red-600' };
    if (density >= 40) return { text: 'Moderate', color: 'text-yellow-600' };
    return { text: 'Light', color: 'text-green-600' };
  };

  const densityStatus = getDensityStatus(stats.averageDensity);

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Overall Traffic Status
        </h3>
        <div className={`text-2xl font-bold ${densityStatus.color}`}>
          {densityStatus.text}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Average Density: {stats.averageDensity}%
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon="tachometer-alt" className="text-blue-500" />
            <span className="text-sm text-gray-600">Avg Speed</span>
          </div>
          <div className="text-xl font-semibold mt-1">
            {stats.averageSpeed} km/h
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon="map-marked-alt" className="text-green-500" />
            <span className="text-sm text-gray-600">Active Regions</span>
          </div>
          <div className="text-xl font-semibold mt-1">
            {stats.totalRegions}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon="exclamation-triangle" className="text-red-500" />
            <span className="text-sm text-gray-600">High Density</span>
          </div>
          <div className="text-xl font-semibold mt-1">
            {stats.highDensityRegions}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon="bell" className="text-yellow-500" />
            <span className="text-sm text-gray-600">Incidents</span>
          </div>
          <div className="text-xl font-semibold mt-1">
            {stats.totalIncidents}
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-500">
        <FontAwesomeIcon icon="clock" className="mr-1" />
        Last Updated: {new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default TrafficStats;