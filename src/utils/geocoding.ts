// Geocoding utility that works in both development and production
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    // Use backend proxy to avoid CORS issues
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? 'http://localhost:5000' : 'https://redzone-y2yb.onrender.com';
    const url = `${baseUrl}/api/geocode?q=${encodeURIComponent(address)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      // Use the first result (prioritized by backend)
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}; 