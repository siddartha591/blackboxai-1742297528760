import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IncidentList = ({ data }) => {
  // Get all incidents from all regions
  const incidents = data?.regions?.reduce((acc, region) => {
    if (region.incidents && region.incidents.length > 0) {
      return [...acc, ...region.incidents.map(incident => ({
        ...incident,
        regionId: region.id,
        location: region.location
      }))];
    }
    return acc;
  }, []) || [];

  // Sort incidents by timestamp (most recent first)
  const sortedIncidents = [...incidents].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  if (!sortedIncidents.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FontAwesomeIcon icon="check-circle" className="text-3xl mb-2" />
        <p>No active incidents</p>
      </div>
    );
  }

  const getIncidentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'accident':
        return 'car-crash';
      case 'construction':
        return 'hard-hat';
      case 'weather':
        return 'cloud-rain';
      case 'event':
        return 'calendar-alt';
      default:
        return 'exclamation-circle';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      {sortedIncidents.map((incident, index) => (
        <div
          key={incident.id || index}
          className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start space-x-4">
            <div className={`p-2 rounded-full ${getSeverityColor(incident.severity)} flex-shrink-0`}>
              <FontAwesomeIcon icon={getIncidentIcon(incident.type)} />
            </div>
            
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {incident.type}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Region: {incident.regionId}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
              </div>
              
              {incident.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {incident.description}
                </p>
              )}
              
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>
                  <FontAwesomeIcon icon="clock" className="mr-1" />
                  {new Date(incident.timestamp).toLocaleTimeString()}
                </span>
                {incident.location && (
                  <span>
                    <FontAwesomeIcon icon="map-marker-alt" className="mr-1" />
                    {`${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IncidentList;