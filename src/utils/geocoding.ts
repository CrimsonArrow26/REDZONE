// src/utils/geocoding.ts

export const geocodeAddress = async (
  address: string
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev
      ? 'http://localhost:5000'
      : 'https://redzone-y2yb.onrender.com';

    const url = `${baseUrl}/api/geocode?q=${encodeURIComponent(address)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();

    // 🛡️ Ensure it's an array
    if (!Array.isArray(data)) {
      console.error('Expected array in geocoding response but got:', data);
      return null;
    }

    if (data.length === 0) {
      console.warn('Geocoding returned no results for:', address);
      return null;
    }

    // 📍 Sort by proximity to Pune (optional)
    const reference = { lat: 18.5204, lon: 73.8567 };
    const sorted = data.sort((a, b) => {
      const distA =
        Math.pow(parseFloat(a.lat) - reference.lat, 2) +
        Math.pow(parseFloat(a.lon) - reference.lon, 2);
      const distB =
        Math.pow(parseFloat(b.lat) - reference.lat, 2) +
        Math.pow(parseFloat(b.lon) - reference.lon, 2);
      return distA - distB;
    });

    const top = sorted[0];
    return top
      ? {
          lat: parseFloat(top.lat),
          lng: parseFloat(top.lon),
        }
      : null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
