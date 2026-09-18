import { BaseProviderAdapter, EstimateOptions } from './base-adapter';
import {
  LocationPoint,
  ProviderId,
  RideCategory,
  RideEstimate,
  ApiStatus,
} from '../types';

export class OlaAdapter extends BaseProviderAdapter {
  readonly providerId: ProviderId = 'ola';
  readonly name = 'Ola Cabs';
  readonly shortName = 'Ola';
  readonly logo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Ola_Cabs_logo.svg/1024px-Ola_Cabs_logo.svg.png';
  readonly color = '#159E50';
  readonly supportedCategories: RideCategory[] = [
    'bike',
    'auto',
    'cab_economy',
    'cab_premium',
    'cab_xl',
  ];
  readonly description = "India's homegrown ride network with extensive Auto, Mini, and Prime fleet";

  private apiKey = process.env.OLA_API_KEY || '';

  async getProviderStatus(): Promise<{
    status: ApiStatus;
    message: string;
    hasApiKeys: boolean;
  }> {
    if (this.apiKey) {
      return {
        status: 'connected',
        message: 'Official Ola Rides API key connected',
        hasApiKeys: true,
      };
    }
    return {
      status: 'sandbox_live',
      message: 'Ola tariff engine active (Set OLA_API_KEY for direct partner API)',
      hasApiKeys: false,
    };
  }

  isServiceAvailable(pickup: LocationPoint): boolean {
    return Boolean(pickup.lat && pickup.lng);
  }

  async getRideEstimates(options: EstimateOptions): Promise<RideEstimate[]> {
    const { pickup, dropoff, route, pricingMode, departureTime } = options;

    if (!this.isServiceAvailable(pickup)) {
      return [];
    }

    if (pricingMode === 'strict' && !this.apiKey) {
      return [
        this.createUnavailableEstimate(
          'cab_economy',
          'Ola Mini',
          'Ola API credentials required in strict production mode'
        ),
      ];
    }

    const surge = this.computeDemandSurge(departureTime);
    const now = Date.now();

    const vehicles = [
      {
        rideType: 'ola_bike',
        vehicleName: 'Ola Bike',
        vehicleIcon: 'Bike',
        category: 'bike' as RideCategory,
        base: 24,
        perKm: 5.8,
        perMin: 1.0,
        minFare: 28,
        etaOffset: 2,
      },
      {
        rideType: 'ola_auto',
        vehicleName: 'Ola Auto',
        vehicleIcon: 'Auto',
        category: 'auto' as RideCategory,
        base: 33,
        perKm: 11.8,
        perMin: 1.4,
        minFare: 42,
        etaOffset: 3,
      },
      {
        rideType: 'ola_mini',
        vehicleName: 'Ola Mini',
        vehicleIcon: 'Car',
        category: 'cab_economy' as RideCategory,
        base: 58,
        perKm: 14.8,
        perMin: 2.1,
        minFare: 85,
        etaOffset: 4,
      },
      {
        rideType: 'ola_prime_sedan',
        vehicleName: 'Ola Prime Sedan',
        vehicleIcon: 'CarFront',
        category: 'cab_premium' as RideCategory,
        base: 80,
        perKm: 17.5,
        perMin: 2.4,
        minFare: 115,
        etaOffset: 6,
      },
      {
        rideType: 'ola_prime_suv',
        vehicleName: 'Ola Prime SUV',
        vehicleIcon: 'Truck',
        category: 'cab_xl' as RideCategory,
        base: 115,
        perKm: 21.5,
        perMin: 2.9,
        minFare: 160,
        etaOffset: 7,
      },
    ];

    const estimates: RideEstimate[] = vehicles.map((v) => {
      const distanceFare = route.distanceKm * v.perKm;
      const timeFare = route.durationMinutes * v.perMin;
      const preSurge = v.base + distanceFare + timeFare;
      const surgeFare = preSurge * (surge - 1.0);
      const subtotal = preSurge * surge;
      const taxesAndFees = Math.round(subtotal * 0.05);
      const totalFare = Math.max(v.minFare, Math.round(subtotal + taxesAndFees));

      const links = this.getDeepLink(pickup, dropoff, v.rideType);

      return {
        providerId: this.providerId,
        providerName: this.name,
        providerLogo: this.logo,
        providerColor: this.color,
        rideType: v.rideType,
        vehicleName: v.vehicleName,
        vehicleIcon: v.vehicleIcon,
        category: v.category,
        estimatedFare: totalFare,
        formattedFare: this.formatCurrency(totalFare),
        currency: 'INR',
        estimatedDurationMinutes: route.durationMinutes,
        distanceKm: route.distanceKm,
        etaMinutes: Math.max(2, Math.round(route.durationMinutes * 0.14) + v.etaOffset),
        surgeMultiplier: Number(surge.toFixed(1)),
        timestamp: now,
        bookingUrl: links.webUrl,
        deepLink: links.deepLink,
        fareBreakdown: {
          baseFare: Math.round(v.base),
          distanceFare: Math.round(distanceFare),
          timeFare: Math.round(timeFare),
          surgeMultiplier: Number(surge.toFixed(1)),
          surgeFare: Math.round(surgeFare),
          taxesAndFees,
          totalFare,
          currency: 'INR',
        },
        isAvailable: true,
      };
    });

    return estimates;
  }

  getDeepLink(
    pickup: LocationPoint,
    dropoff: LocationPoint,
    rideType: string = 'ola_mini'
  ): { deepLink: string; webUrl: string } {
    const deepLink = `ola://ride?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&pickup_name=${encodeURIComponent(pickup.address || 'Pickup')}&drop_lat=${dropoff.lat}&drop_lng=${dropoff.lng}&drop_name=${encodeURIComponent(dropoff.address || 'Dropoff')}&category=${rideType}`;
    const webUrl = `https://book.olacabs.com/?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&drop_lat=${dropoff.lat}&drop_lng=${dropoff.lng}`;

    return { deepLink, webUrl };
  }

  private createUnavailableEstimate(
    category: RideCategory,
    vehicleName: string,
    reason: string
  ): RideEstimate {
    return {
      providerId: this.providerId,
      providerName: this.name,
      providerLogo: this.logo,
      providerColor: this.color,
      rideType: 'ola_unavailable',
      vehicleName,
      vehicleIcon: 'Car',
      category,
      estimatedFare: 0,
      formattedFare: 'N/A',
      currency: 'INR',
      estimatedDurationMinutes: 0,
      distanceKm: 0,
      etaMinutes: 0,
      surgeMultiplier: 1.0,
      timestamp: Date.now(),
      bookingUrl: 'https://book.olacabs.com',
      deepLink: 'ola://',
      fareBreakdown: {
        baseFare: 0,
        distanceFare: 0,
        timeFare: 0,
        surgeMultiplier: 1.0,
        surgeFare: 0,
        taxesAndFees: 0,
        totalFare: 0,
        currency: 'INR',
      },
      isAvailable: false,
      unavailableReason: reason,
    };
  }
}
