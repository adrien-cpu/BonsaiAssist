import { useState, useEffect } from 'react';
import { WeatherData } from '@/types';

export function useWeather(city?: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (location: string) => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      // Mock weather data for now - replace with actual API call
      const mockWeather: WeatherData = {
        temperature: 22,
        humidity: 65,
        conditions: 'Partly cloudy',
        uvIndex: 6,
        windSpeed: 12,
        pressure: 1013,
        forecast: [
          {
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            temperature: { min: 18, max: 25 },
            conditions: 'Sunny',
            humidity: 60,
          },
          {
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            temperature: { min: 16, max: 23 },
            conditions: 'Cloudy',
            humidity: 70,
          },
          {
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            temperature: { min: 19, max: 26 },
            conditions: 'Rain',
            humidity: 85,
          },
        ],
      };

      setWeather(mockWeather);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city]);

  return {
    weather,
    isLoading,
    error,
    refetch: () => city && fetchWeather(city),
  };
}