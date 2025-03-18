# Smart Traffic Management System - Real-time Monitoring

A modern, real-time traffic monitoring system built with React, WebSocket, and Tailwind CSS.

## Features

- 🚦 Real-time traffic monitoring with WebSocket integration
- 🗺️ Interactive traffic map with live updates
- 📊 Dynamic traffic density visualization
- 🚨 Incident tracking and management
- 📈 Real-time analytics and statistics
- 🎨 Modern, responsive UI with Tailwind CSS

## Getting Started

1. Clone the repository
2. Run the update script:
   ```bash
   chmod +x update-realtime.sh
   ./update-realtime.sh
   ```

## Architecture

### Frontend Components

- **TrafficMapNew**: Interactive map showing real-time traffic data
- **TrafficStats**: Real-time traffic statistics dashboard
- **TrafficDensityChart**: Live traffic density visualization
- **IncidentList**: Real-time incident tracking
- **DashboardRealtime**: Main dashboard integrating all components

### WebSocket Integration

The system uses WebSocket for real-time updates:
- Continuous data streaming from traffic sensors
- Real-time incident updates
- Live traffic density monitoring
- Instant status changes reflection

### Styling

- Tailwind CSS for utility-first styling
- Custom components and animations
- Responsive design for all screen sizes
- Dark mode support

## Component Structure

```
src/
├── components/
│   ├── incidents/
│   │   └── IncidentList.js
│   ├── stats/
│   │   └── TrafficStats.js
│   ├── charts/
│   │   └── TrafficDensityChart.js
│   ├── maps/
│   │   └── TrafficMapNew.js
│   └── dashboard/
│       └── DashboardRealtime.js
├── hooks/
│   └── useWebSocket.js
└── styles/
    ├── realtime.css
    └── index.css
```

## Real-time Features

### Traffic Map
- Live traffic density visualization
- Real-time incident markers
- Interactive region selection
- Dynamic congestion highlighting

### Traffic Stats
- Live sensor data updates
- Real-time congestion levels
- Active incident counting
- System status monitoring

### Incident Tracking
- Real-time incident reporting
- Live status updates
- Location-based filtering
- Priority-based sorting

### Analytics Dashboard
- Real-time data visualization
- Live trend analysis
- Dynamic chart updates
- Instant metric calculations

## WebSocket Events

The system handles the following real-time events:
- Traffic density updates
- New incident reports
- Sensor status changes
- Emergency notifications

## Development

### Prerequisites
- Node.js 14+
- npm or yarn
- Modern web browser

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your browser

### Environment Variables
```env
REACT_APP_WS_URL=ws://localhost:8080
REACT_APP_API_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- OpenStreetMap for map data
- Tailwind CSS for styling utilities
- React ecosystem for frontend framework
- WebSocket protocol for real-time communication