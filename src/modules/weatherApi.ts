import axios from 'axios';
import { getWeatherUrl } from '../utils/weather';

interface WeatherAPIResponse {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
  };
}

export const fetchWeather = async (query: string) => {
  try {
    const response = await axios.get<WeatherAPIResponse>(getWeatherUrl(query));
    const data = response.data;

    // Check if the response data is valid
    if (!data || !data.location || !data.current) {
      throw new Error('Invalid weather data received from API');
    }

    // Validate required fields before accessing them
    if (!data.location.name || 
        typeof data.current.temp_c === 'undefined' ||
        !data.current.condition?.text ||
        !data.current.condition?.icon) {
      throw new Error('Missing required weather data fields');
    }

    return {
      name: data.location.name,
      main: {
        temp: data.current.temp_c,
        humidity: data.current.humidity || 0
      },
      weather: [{
        description: data.current.condition.text,
        icon: `https:${data.current.condition.icon}` // WeatherAPI.com provides relative URLs, so we add https:
      }],
      wind: {
        speed: data.current.wind_kph / 3.6 // Convert km/h to m/s
      }
    };
  } catch (err: any) {
    console.error('Error fetching weather:', err.message);
    throw new Error(`Failed to fetch weather data: ${err.message}`);
  }
};
