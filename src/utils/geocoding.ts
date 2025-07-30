// Geocoding utility that works in both development and production
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    // Use direct API call for production, proxy for development
    const isDev = import.meta.env.DEV;
    const url = isDev 
      ? `/nominatim/search?format=json&q=${encodeURIComponent(address)}`
      : `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RouteRiskAnalyzer/1.0 (your-email@example.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data[0]) {
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