const generateRecommendations = (regionData, trafficData) => {
  const recommendations = [];
  const currentHour = new Date().getHours();

  // Peak hours recommendation
  if (currentHour >= 8 && currentHour <= 10) {
    recommendations.push('Morning peak hours: Consider delaying non-essential travel');
  } else if (currentHour >= 17 && currentHour <= 19) {
    recommendations.push('Evening peak hours: Consider alternative routes');
  }

  // Density-based recommendations
  if (regionData.density > 0.8) {
    recommendations.push(`Heavy traffic in ${regionData.id}: Consider alternative routes`);
  } else if (regionData.density > 0.6) {
    recommendations.push(`Moderate congestion in ${regionData.id}: Expect delays`);
  }

  // Alternative route suggestions
  const lessCongestedRegions = trafficData.regions.filter(r => 
    r.id !== regionData.id && r.density < regionData.density - 0.2
  );

  if (lessCongestedRegions.length > 0) {
    recommendations.push(
      `Consider routes through ${lessCongestedRegions[0].id} for better traffic flow`
    );
  }

  return recommendations;
};

module.exports = { generateRecommendations };