import { openWeatherClient, airQualityClient, geocodingClient } from './apiClient';
import { AirQualityData, WeatherData, CityInfo } from '../types';

export const climateService = {
  /**
   * Search cities by name using Open-Meteo Geocoding API
   * @param query Search string (e.g., "Sao Paulo")
   */
  async searchCities(query: string): Promise<CityInfo[]> {
    if (!query || query.trim().length < 2) return [];
    
    const response = await geocodingClient.get<{
      results?: Array<{
        name: string;
        latitude: number;
        longitude: number;
        country: string;
        admin1?: string; // State / Region
      }>;
    }>('/search', {
      params: {
        name: query,
        count: 10,
        language: 'pt', // Request Portuguese labels if possible
      },
    });

    if (!response.data.results) return [];

    return response.data.results.map(city => ({
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      country: city.country,
      state: city.admin1,
    }));
  },

  /**
   * Fetch satellite-based Air Quality indicators for coordinates
   */
  async getAirQuality(latitude: number, longitude: number): Promise<AirQualityData> {
    const response = await airQualityClient.get<AirQualityData>('/air-quality', {
      params: {
        latitude,
        longitude,
        hourly: 'pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone',
        timezone: 'auto',
      },
    });
    return response.data;
  },

  /**
   * Fetch standard Weather data for coordinates
   */
  async getWeather(latitude: number, longitude: number, useMetric: boolean): Promise<WeatherData> {
    const response = await openWeatherClient.get<WeatherData>('/weather', {
      params: {
        lat: latitude,
        lon: longitude,
        units: useMetric ? 'metric' : 'imperial',
        lang: 'pt_br',
      },
    });
    return response.data;
  },

  /**
   * Compute a simple composite Air Quality Index rating (0 to 100 scale, lower is better)
   * based on common WHO guidance metrics for PM2.5, NO2 and Ozone.
   */
  calculateAQIIndex(latestPm25: number, latestNo2: number, latestO3: number): {
    score: number; // 0-100
    label: string; // 'Bom', 'Moderado', 'Insalubre', etc.
    color: string; // Hex color code
  } {
    // Basic weight scale
    // PM2.5 limit ~15 µg/m³, NO2 limit ~25 µg/m³, O3 limit ~100 µg/m³
    const pmFactor = Math.min((latestPm25 / 25) * 100, 100) * 0.4;
    const no2Factor = Math.min((latestNo2 / 40) * 100, 100) * 0.3;
    const o3Factor = Math.min((latestO3 / 120) * 100, 100) * 0.3;

    const score = Math.round(pmFactor + no2Factor + o3Factor);

    if (score <= 30) {
      return { score, label: 'Excelente', color: '#10B981' }; // Green
    } else if (score <= 55) {
      return { score, label: 'Moderado', color: '#F59E0B' }; // Orange
    } else if (score <= 75) {
      return { score, label: 'Insalubre (Sensíveis)', color: '#FF7E00' }; // Dark Orange
    } else {
      return { score, label: 'Insalubre / Perigoso', color: '#EF4444' }; // Red
    }
  }
};
