import config from "../config";

const BASE_URL = "http://api.weatherstack.com/current";

export const getWeatherUrl = (city: string) => {
  const params = new URLSearchParams({
    access_key: config.WEATHER_API_KEY as string,
    query: city,
    units: "m" // For metric units
  });
  
  return `${BASE_URL}?${params.toString()}`;
};