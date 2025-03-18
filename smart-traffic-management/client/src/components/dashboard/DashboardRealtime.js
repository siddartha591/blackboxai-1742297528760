import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TrafficMapNew from '../maps/TrafficMapNew';
import TrafficStats from '../stats/TrafficStats';
import IncidentList from '../incidents/IncidentList';
import TrafficDensityChart from '../charts/TrafficDensityChart';
import useWebSocket from '../../hooks/useWebSocket';

const DashboardRealtime = () => {
  const { data, isConnected, error } = useWebSocket('ws://localhost:8080');

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center text-red-700">
          <FontAwesomeIcon icon="exclamation-circle" className="mr-2" />
          <span>Error connecting to traffic data: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Connection Status */}
      <div className={`p-3 rounded-lg ${
        isConnected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
      }`}>
        <div className="flex items-center">
          <FontAwesomeIcon 
            icon={isConnected ? 'check-circle' : 'exclamation-triangle'} 
            className="mr-2"
          />
          <span>
            {isConnected ? 'Connected to traffic monitoring system' : 'Connecting to traffic data...'}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Regions</p>
              <h3 className="text-2xl font-bold">
                {data?.regions?.length || 0}
              </h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <FontAwesomeIcon icon="map-marker-alt" className="text-blue-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Incidents</p>
              <h3 className="text-2xl font-bold">
                {data?.regions?.reduce((acc, region) => acc + (region.incidents?.length || 0), 0) || 0}
              </h3>
            </div>
            <div className="bg-red-50 p-3 rounded-full">
              <FontAwesomeIcon icon="exclamation-triangle" className="text-red-500 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Speed</p>
              <h3 className="text-2xl font-bold">
                {data?.regions?.length ? 
                  Math.round(
                    data.regions.reduce((acc, region) => acc + region.averageSpeed, 0) / 
                    data.regions.length
                  ) : 0
                } km/h
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <FontAwesomeIcon icon="tachometer-alt" className="text-green-500 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section - Takes up 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Traffic Map</h2>
          <div className="h-[600px]">
            <TrafficMapNew />
          </div>
        </div>

        {/* Sidebar - Takes up 1 column */}
        <div className="space-y-6">
          {/* Incidents List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Active Incidents</h2>
            <IncidentList data={data} />
          </div>

          {/* Traffic Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Traffic Statistics</h2>
            <TrafficStats data={data} />
          </div>
        </div>
      </div>

      {/* Traffic Density Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Traffic Density Trends</h2>
        <div className="h-[300px]">
          <TrafficDensityChart data={data} />
        </div>
      </div>
    </div>
  );
};

export default DashboardRealtime;