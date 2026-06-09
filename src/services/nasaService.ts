import { nasaClient } from './apiClient';
import { ApodResponse, Asteroid, EpicResponse } from '../types';

export const nasaService = {
  /**
   * Fetch Astronomy Picture of the Day (APOD)
   * @param date Optional date in YYYY-MM-DD format
   */
  async getApod(date?: string): Promise<ApodResponse> {
    const params = date ? { date } : {};
    const response = await nasaClient.get<ApodResponse>('/planetary/apod', { params });
    return response.data;
  },

  /**
   * Fetch Near-Earth Objects (Asteroids) for a given date range
   * @param startDate YYYY-MM-DD
   * @param endDate YYYY-MM-DD
   */
  async getNearEarthObjects(startDate: string, endDate: string): Promise<Asteroid[]> {
    const response = await nasaClient.get<{
      element_count: number;
      near_earth_objects: { [date: string]: Asteroid[] };
    }>('/neo/rest/v1/feed', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });

    // Flatten the day-by-day object list into a single array
    const dates = Object.keys(response.data.near_earth_objects);
    let allAsteroids: Asteroid[] = [];
    dates.forEach(date => {
      allAsteroids = [...allAsteroids, ...response.data.near_earth_objects[date]];
    });
    
    return allAsteroids;
  },

  /**
   * Fetch Earth Polychromatic Imaging Camera (EPIC) natural color images
   */
  async getEpicImages(): Promise<EpicResponse[]> {
    const response = await nasaClient.get<EpicResponse[]>('/EPIC/api/natural');
    return response.data;
  },

  /**
   * Generate absolute EPIC image URL from metadata
   * Format: https://api.nasa.gov/EPIC/archive/natural/YYYY/MM/DD/png/IMAGE_NAME.png
   */
  getEpicImageUrl(imageMetadata: EpicResponse, apiKey: string = 'kygtdfmYhvlSr7ot0vNtPBcUb359AK6AZkgQbaxt'): string {
    // Extract date segments from "YYYY-MM-DD HH:MM:SS"
    const datePart = imageMetadata.date.split(' ')[0]; // "YYYY-MM-DD"
    const [year, month, day] = datePart.split('-');
    return `https://api.nasa.gov/EPIC/archive/natural/${year}/${month}/${day}/png/${imageMetadata.image}.png?api_key=${apiKey}`;
  }
};
