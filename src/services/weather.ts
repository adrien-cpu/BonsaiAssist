import { SpeciesData, getSpeciesWateringData } from '@/lib/utils';

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Represents weather information, including temperature and conditions.
 */
export interface Weather {
  /**
   * The temperature in Celsius.
   */
  temperatureCelsius: number;
  /**
   * The weather conditions (e.g., Sunny, Cloudy, Rainy).
   */
  conditions: string;
}

interface WeatherApiResponse {
  main: {
    temp: number;
  };
  weather: Array<{
    description: string;
  }>;
}

/**
 * Asynchronously retrieves weather information for a given location, and adapt it depending on the bonsai.
 *
 * @param city The city for which to retrieve weather data.
 * @param bonsaiSpecies the bonsaï species
 * @returns A promise that resolves to a Weather object containing temperature and conditions.
 */
export async function getWeather(city: string, bonsaiSpecies: string): Promise<Weather> {
  
  const speciesWateringData = getSpeciesWateringData();
  const bonsaiData = speciesWateringData.find(data => data.species === bonsaiSpecies)
  
  if (!API_KEY) {
    throw new Error('OPENWEATHERMAP_API_KEY is not defined.');
  }

  const url = `${API_BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('City not found.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WeatherApiResponse = await response.json();
    return parseWeatherData(data, bonsaiData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

function parseWeatherData(data: WeatherApiResponse, bonsaiData: SpeciesData | undefined): Weather {
  if (!data || !data.main || !data.weather || data.weather.length === 0) {
    throw new Error('Invalid weather data format');
  }

  const temperatureCelsius = data.main.temp;
  let conditions = data.weather[0].description;

  if(bonsaiData){
    const weatherAdjustments = bonsaiData.weatherAdjustments
    if(weatherAdjustments.coldThreshold && temperatureCelsius < weatherAdjustments.coldThreshold){
      conditions = conditions + " It's too cold for the " + bonsaiData.commonName + " you might want to put it inside."
    }
    if(weatherAdjustments.hotThreshold && temperatureCelsius > weatherAdjustments.hotThreshold){
      conditions = conditions + " It's too hot for the " + bonsaiData.commonName + " you might want to put it in the shade."
    }
  }

  return {
    temperatureCelsius,
    conditions,
  }
}