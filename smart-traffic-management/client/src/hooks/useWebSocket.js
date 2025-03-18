import { useState, useEffect, useCallback } from 'react';

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Mock data generator for development
  const generateMockData = useCallback(() => {
    // Fixed locations for consistent map display
    const fixedLocations = [
      { lat: 40.7128, lng: -74.0060 }, // New York City
      { lat: 40.7214, lng: -73.9970 }, // East Village
      { lat: 40.7505, lng: -73.9934 }, // Midtown
      { lat: 40.7831, lng: -73.9712 }, // Upper East Side
      { lat: 40.7527, lng: -73.9772 }  // Murray Hill
    ];

    const regions = fixedLocations.map((location, i) => ({
      id: `Region-${i + 1}`,
      location: location,
      density: Math.random(),
      averageSpeed: Math.floor(Math.random() * 60) + 20,
      incidents: Math.random() > 0.7 ? [
        {
          id: `INC-${i}-${Date.now()}`,
          type: ['Accident', 'Construction', 'Weather', 'Event'][Math.floor(Math.random() * 4)],
          severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          timestamp: new Date().toISOString(),
          description: 'Mock incident description'
        }
      ] : []
    }));

    return {
      timestamp: new Date().toISOString(),
      regions: regions
    };
  }, []);

  useEffect(() => {
    let mockInterval;
    
    const connect = () => {
      try {
        // For development, use mock data instead of actual WebSocket
        setIsConnected(true);
        mockInterval = setInterval(() => {
          const mockData = generateMockData();
          setData(mockData);
        }, 3000);

        // Uncomment below for production WebSocket implementation
        /*
        const ws = new WebSocket(url);
        setSocket(ws);

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            setData(parsedData);
          } catch (err) {
            setError('Failed to parse data');
          }
        };

        ws.onerror = (event) => {
          setError('WebSocket error');
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          setTimeout(connect, 5000); // Reconnect after 5 seconds
        };
        */

      } catch (err) {
        setError(err.message);
        setIsConnected(false);
      }
    };

    connect();

    // Cleanup function
    return () => {
      if (mockInterval) {
        clearInterval(mockInterval);
      }
      /* For production:
      if (socket) {
        socket.close();
      }
      */
    };
  }, [url, generateMockData]);

  // Send message function (for future use)
  const sendMessage = useCallback((message) => {
    if (!isConnected) {
      setError('Not connected');
      return;
    }

    try {
      if (typeof message === 'object') {
        message = JSON.stringify(message);
      }
      // For production: socket.send(message);
      console.log('Message sent:', message);
    } catch (err) {
      setError('Failed to send message');
    }
  }, [isConnected]);

  return {
    isConnected,
    error,
    data,
    sendMessage
  };
};

export default useWebSocket;