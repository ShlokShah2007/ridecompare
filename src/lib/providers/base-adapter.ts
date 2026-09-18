import {
  LocationPoint,
  ProviderId,
  RideCategory,
  RideEstimate,
  RouteData,
  ApiStatus,
} from '../types';

export interface EstimateOptions {
  pickup: LocationPoint;
  dropoff: LocationPoint;
  route: RouteData;
  pricingMode: 'strict' | 'dynamic';
  departureTime?: string;
}

export abstract class BaseProviderAdapter {
  abstract readonly providerId: ProviderId;
  abstract readonly name: string;
  abstract readonly shortName: string;
  abstract readonly logo: string;
  abstract readonly color: string;
  abstract readonly supportedCategories: RideCategory[];
  abstract readonly description: string;

  /**
   * Returns current status of this provider's API
   */
  abstract getProviderStatus(): Promise<{
    status: ApiStatus;
    message: string;
    hasApiKeys: boolean;
  }>;

  /**
   * Checks if this provider operates in the given coordinates/city
   */
  abstract isServiceAvailable(pickup: LocationPoint): boolean;

  /**
   * Returns ride estimates for the given trip
   */
  abstract getRideEstimates(options: EstimateOptions): Promise<RideEstimate[]>;

  /**
   * Generates official app deep link and fallback web link
   */
  abstract getDeepLink(
    pickup: LocationPoint,
    dropoff: LocationPoint,
    rideType?: string
  ): { deepLink: string; webUrl: string };

  /**
   * Helper to format currency in Indian Rupees
   */
  protected formatCurrency(amount: number): string {
    return `₹${Math.round(amount)}`;
  }

  /**
   * Helper to compute dynamic surge based on time of day (rush hours: 8-11 AM, 5-9 PM)
   */
  protected computeDemandSurge(departureTime?: string): number {
    const date = departureTime ? new Date(departureTime) : new Date();
    const hour = date.getHours();
    const day = date.getDay(); // 0 is Sunday

    // Peak morning rush (8:30 AM - 10:30 AM weekdays)
    if (day >= 1 && day <= 5 && hour >= 8 && hour <= 10) {
      return 1.25;
    }
    // Peak evening rush (5:30 PM - 8:30 PM)
    if (hour >= 17 && hour <= 20) {
      return 1.35;
    }
    // Late night (11 PM - 4 AM)
    if (hour >= 23 || hour <= 4) {
      return 1.2;
    }
    return 1.0;
  }
}
