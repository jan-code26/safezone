// app/components/weather/WeatherPanel.tsx
'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export default function WeatherPanel() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Replace with your weather API endpoint
        const response = await fetch('/api/weather');
        if (!response.ok) throw new Error('Failed to fetch weather');
        
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-gray-600">Loading weather...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Weather Information</h2>
      
      {weatherData && (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">
              {weatherData.temperature}°C
            </div>
            <div className="text-blue-600">{weatherData.description}</div>
            <div className="text-sm text-blue-500">{weatherData.location}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Humidity</div>
              <div className="font-semibold">{weatherData.humidity}%</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Wind</div>
              <div className="font-semibold">{weatherData.windSpeed} m/s</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
