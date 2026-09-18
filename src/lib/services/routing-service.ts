import { LocationPoint, RouteData } from '../types';

/**
 * Calculates straight line distance using Haversine formula in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generates an interpolated polyline between two points if routing API is unreachable
 */
function generateDirectPath(
  pickup: LocationPoint,
  dropoff: LocationPoint
): [number, number][] {
  const steps = 15;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const lat = pickup.lat + (dropoff.lat - pickup.lat) * ratio;
    const lng = pickup.lng + (dropoff.lng - pickup.lng) * ratio;
    coords.push([lat, lng]);
  }
  return coords;
}

/**
 * Fetches turn-by-turn driving route, road distance, travel duration, and polyline coordinates.
 * Defaults to OSRM (Open Source Routing Machine) with fallback to Haversine road model.
 */
export async function getRouteDetails(
  pickup: LocationPoint,
  dropoff: LocationPoint
): Promise<RouteData> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`;
    
    // Set 4 second timeout for high responsiveness
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RideCompare-App/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = Math.max(0.5, Number((route.distance / 1000).toFixed(1)));
        const durationMinutes = Math.max(2, Math.round(route.duration / 60));
        // OSRM returns GeoJSON coordinates in [lng, lat]; Leaflet requires [lat, lng]
        const polylineCoords: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        return {
          distanceKm,
          durationMinutes,
          polylineCoords,
          summary: route.legs?.[0]?.summary || 'Fastest Route',
        };
      }
    }
  } catch (err) {
    console.warn('OSRM routing request timed out or failed, using geometric fallback:', err);
  }

  // Graceful fallback when network or OSRM is slow/down:
  // Use Haversine multiplied by 1.35 (standard Indian urban road curvature index)
  const aerialDistance = calculateHaversineDistance(
    pickup.lat,
    pickup.lng,
    dropoff.lat,
    dropoff.lng
  );
  const roadDistanceKm = Math.max(0.5, Number((aerialDistance * 1.35).toFixed(1)));
  // Urban average speed: ~22 km/h plus 4 mins base waiting/signals
  const estimatedDurationMinutes = Math.max(3, Math.round((roadDistanceKm / 22) * 60 + 3));

  return {
    distanceKm: roadDistanceKm,
    durationMinutes: estimatedDurationMinutes,
    polylineCoords: generateDirectPath(pickup, dropoff),
    summary: 'Estimated Driving Route',
  };
}
