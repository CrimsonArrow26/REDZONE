import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

const RouteMap = ({ 
  waypoints, 
  redZones, 
  onRouteFound 
}: { 
  waypoints: L.LatLng[]; 
  redZones: { lat: number; lng: number; name?: string }[]; 
  onRouteFound: (coords: { lat: number; lng: number }[]) => void 
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      router: new L.Routing.OSRMv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
      }),
    }).addTo(map);

    // Hide default markers (if needed)
    control.getPlan().options.createMarker = (i: number, wp: any) => {
      return L.marker(wp.latLng); // Keep markers
    };

    // Listen for route found
    control.on('routesfound', function (e: any) {
      const route = e.routes[0];
      if (route && route.coordinates) {
        const coords = route.coordinates.map((coord: any) => ({
          lat: coord.lat,
          lng: coord.lng,
        }));
        onRouteFound(coords);
      }
    });

    // Show red zones as markers
    redZones.forEach(zone => {
      const marker = L.circleMarker([zone.lat, zone.lng], {
        color: 'red',
        radius: 6,
      }).addTo(map);
      marker.bindPopup(zone.name || 'Red Zone');
    });

    // Cleanup
    return () => {
      map.removeControl(control);
    };
  }, [map, waypoints, redZones, onRouteFound]);

  return null;
};

export default RouteMap;
