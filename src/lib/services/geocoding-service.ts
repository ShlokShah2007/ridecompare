import { LocationPoint } from '../types';

export const POPULAR_LOCATIONS: LocationPoint[] = [
  // Bengaluru
  {
    name: 'Koramangala Sony World Signal',
    address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    lat: 12.9352,
    lng: 77.6245,
    city: 'Bengaluru',
  },
  {
    name: 'Indiranagar 100ft Road',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    lat: 12.9719,
    lng: 77.6412,
    city: 'Bengaluru',
  },
  {
    name: 'Kempegowda Intl Airport (BLR)',
    address: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300',
    lat: 13.1986,
    lng: 77.7066,
    city: 'Bengaluru',
  },
  {
    name: 'Electronic City Phase 1',
    address: 'Hosur Rd, Electronic City, Bengaluru, Karnataka 560100',
    lat: 12.8452,
    lng: 77.6602,
    city: 'Bengaluru',
  },
  // Delhi-NCR
  {
    name: 'Connaught Place Central',
    address: 'Connaught Place, New Delhi, Delhi 110001',
    lat: 28.6315,
    lng: 77.2167,
    city: 'New Delhi',
  },
  {
    name: 'Cyber City Gurugram',
    address: 'DLF Cyber City, DLF Phase 2, Sector 24, Gurugram, Haryana 122002',
    lat: 28.4986,
    lng: 77.0878,
    city: 'Gurugram',
  },
  {
    name: 'Indira Gandhi Intl Airport (DEL)',
    address: 'Terminal 3, New Delhi, Delhi 110037',
    lat: 28.5562,
    lng: 77.1000,
    city: 'New Delhi',
  },
  // Mumbai
  {
    name: 'Bandra Bandstand',
    address: 'Bandstand Promenade, Bandra West, Mumbai, Maharashtra 400050',
    lat: 19.0434,
    lng: 72.8197,
    city: 'Mumbai',
  },
  {
    name: 'Chhatrapati Shivaji Terminus (CSMT)',
    address: 'Fort, Mumbai, Maharashtra 400001',
    lat: 18.9401,
    lng: 72.8355,
    city: 'Mumbai',
  },
  {
    name: 'Mumbai Airport Terminal 2 (BOM)',
    address: 'Chhatrapati Shivaji Maharaj Intl Airport, Mumbai 400099',
    lat: 19.0974,
    lng: 72.8745,
    city: 'Mumbai',
  },
  // Hyderabad
  {
    name: 'Hitech City Cyber Towers',
    address: 'Hitech City Main Rd, HITEC City, Hyderabad, Telangana 500081',
    lat: 17.4504,
    lng: 78.3808,
    city: 'Hyderabad',
  },
  {
    name: 'Rajiv Gandhi Intl Airport (HYD)',
    address: 'Shamshabad, Hyderabad, Telangana 500409',
    lat: 17.2403,
    lng: 78.4294,
    city: 'Hyderabad',
  },
];

/**
 * Searches places via Nominatim OpenStreetMap with local fallback
 */
export async function searchLocations(query: string): Promise<LocationPoint[]> {
  if (!query || query.trim().length < 2) {
    return POPULAR_LOCATIONS.slice(0, 6);
  }

  const cleanQuery = query.toLowerCase().trim();

  // First check matches in popular locations for instantaneous response
  const matchingPopular = POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name?.toLowerCase().includes(cleanQuery) ||
      loc.address.toLowerCase().includes(cleanQuery) ||
      loc.city?.toLowerCase().includes(cleanQuery)
  );

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&countrycodes=in&limit=5&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RideCompare-App/1.0',
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const nominatimResults: LocationPoint[] = data.map(
        (item: {
          display_name: string;
          lat: string;
          lon: string;
          address?: {
            city?: string;
            state_district?: string;
            town?: string;
            state?: string;
          };
        }) => {
          const displayName = item.display_name;
          const parts = displayName.split(', ');
          const shortName = parts.slice(0, 2).join(', ');
          const city =
            item.address?.city ||
            item.address?.state_district ||
            item.address?.town ||
            item.address?.state;

          return {
            name: shortName,
            address: displayName,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            city,
          };
        }
      );

      // Combine and deduplicate
      const combined = [...matchingPopular, ...nominatimResults];
      const seen = new Set<string>();
      return combined.filter((item) => {
        const key = `${item.lat.toFixed(3)},${item.lng.toFixed(3)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
  } catch (err) {
    console.warn('Nominatim geocode request timed out, using popular locations:', err);
  }

  return matchingPopular.length > 0 ? matchingPopular : POPULAR_LOCATIONS.slice(0, 5);
}

/**
 * Reverse geocodes coordinates to a human-readable address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationPoint> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RideCompare-App/1.0',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const item = await res.json();
      const parts = item.display_name.split(', ');
      return {
        name: parts.slice(0, 2).join(', '),
        address: item.display_name,
        lat,
        lng,
        city: item.address?.city || item.address?.town || 'Current Location',
      };
    }
  } catch (err) {
    console.warn('Reverse geocode failed, using coords format:', err);
  }

  return {
    name: 'Current Location',
    address: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    lat,
    lng,
  };
}
