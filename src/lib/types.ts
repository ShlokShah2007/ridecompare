export type ProviderId = 'uber' | 'rapido' | 'ola' | 'nammayatri' | 'blusmart';

export type RideCategory = 'bike' | 'auto' | 'cab_economy' | 'cab_premium' | 'cab_xl';

export type ApiStatus = 'connected' | 'sandbox_live' | 'unavailable' | 'unsupported_area';

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
  name?: string;
  city?: string;
}

export interface RouteData {
  distanceKm: number;
  durationMinutes: number;
  polylineCoords: [number, number][]; // [lat, lng]
  summary?: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  surgeFare: number;
  taxesAndFees: number;
  totalFare: number;
  currency: string;
}

export interface RideEstimate {
  providerId: ProviderId;
  providerName: string;
  providerLogo: string;
  providerColor: string;
  rideType: string;
  vehicleName: string;
  vehicleIcon: string;
  category: RideCategory;
  estimatedFare: number;
  formattedFare: string;
  currency: string;
  estimatedDurationMinutes: number;
  distanceKm: number;
  etaMinutes: number;
  surgeMultiplier: number;
  timestamp: number;
  bookingUrl: string;
  deepLink: string;
  fareBreakdown: FareBreakdown;
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface CategoryComparison {
  category: RideCategory;
  categoryTitle: string;
  categoryIcon: string;
  description: string;
  lowestPriceEstimate: RideEstimate | null;
  highestPriceEstimate: RideEstimate | null;
  maxSavingsAmount: number;
  estimates: RideEstimate[];
}

export interface Provider {
  id: ProviderId;
  name: string;
  shortName: string;
  logo: string;
  badgeColor: string;
  enabled: boolean;
  apiStatus: ApiStatus;
  statusMessage: string;
  supportedCategories: RideCategory[];
  description: string;
}

export interface EstimateRequest {
  pickup: LocationPoint;
  dropoff: LocationPoint;
  selectedProviders?: ProviderId[];
  pricingMode?: 'strict' | 'dynamic';
  departureTime?: string;
}

export interface EstimateResponse {
  route: RouteData;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  comparisons: CategoryComparison[];
  totalEstimatesFound: number;
  cheapestOverall: RideEstimate | null;
  timestamp: number;
  expiresAt: number;
  pricingMode: 'strict' | 'dynamic';
}

export interface TripHistoryItem {
  id: string;
  timestamp: number;
  pickup: LocationPoint;
  dropoff: LocationPoint;
  distanceKm: number;
  durationMinutes: number;
  bookedProvider?: {
    id: ProviderId;
    name: string;
    vehicleName: string;
    fare: number;
    category: RideCategory;
  };
  lowestPriceFound?: number;
  highestPriceFound?: number;
  savedAmount?: number;
}
