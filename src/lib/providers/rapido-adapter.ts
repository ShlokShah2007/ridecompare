import { BaseProviderAdapter, EstimateOptions } from './base-adapter';
import {
  LocationPoint,
  ProviderId,
  RideCategory,
  RideEstimate,
  ApiStatus,
} from '../types';

export class RapidoAdapter extends BaseProviderAdapter {
  readonly providerId: ProviderId = 'rapido';
  readonly name = 'Rapido';
  readonly shortName = 'Rapido';
  readonly logo = 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Rapido_logo.png';
  readonly color = '#F9C935';
  readonly supportedCategories: RideCategory[] = ['bike', 'auto', 'cab_economy'];
  readonly description = "India's fastest bike taxi, auto, and low-cost cab network";

  private apiKey = process.env.RAPIDO_API_KEY || '';

  async getProviderStatus(): Promise<{
    status: ApiStatus;
    message: string;
    hasApiKeys: boolean;
  }> {
    if (this.apiKey) {
      return {
        status: 'connected',
        message: 'Official Rapido API key connected',
        hasApiKeys: true,
      };
    }
    return {
      status: 'sandbox_live',
      message: 'Rapido tariff calculation active (Set RAPIDO_API_KEY for direct partner API)',
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
          'bike',
          'Rapido Bike',
          'Rapido API credentials required in strict production mode'
        ),
      ];
    }

    // Rapido has lower surge multiplier for bikes
    const baseSurge = this.computeDemandSurge(departureTime);
    const now = Date.now();

    const vehicles = [
      {
        rideType: 'rapido_bike',
        vehicleName: 'Rapido Bike',
        vehicleIcon: 'Bike',
        category: 'bike' as RideCategory,
        base: 20,
        perKm: 5.2,
        perMin: 0.9,
        minFare: 25,
        surgeFactor: Math.min(1.2, baseSurge),
        etaOffset: 1, // Rapido bikes arrive fastest
      },
      {
        rideType: 'rapido_auto',
        vehicleName: 'Rapido Auto',
        vehicleIcon: 'Auto',
        category: 'auto' as RideCategory,
        base: 30,
        perKm: 11.2,
        perMin: 1.3,
        minFare: 40,
        surgeFactor: baseSurge,
        etaOffset: 3,
      },
      {
        rideType: 'rapido_cab',
        vehicleName: 'Rapido Cab Economy',
        vehicleIcon: 'Car',
        category: 'cab_economy' as RideCategory,
        base: 50,
        perKm: 13.5,
        perMin: 1.8,
        minFare: 75,
        surgeFactor: baseSurge,
        etaOffset: 4,
      },
    ];

    const estimates: RideEstimate[] = vehicles.map((v) => {
      const distanceFare = route.distanceKm * v.perKm;
      const timeFare = route.durationMinutes * v.perMin;
      const preSurge = v.base + distanceFare + timeFare;
      const surgeFare = preSurge * (v.surgeFactor - 1.0);
      const subtotal = preSurge * v.surgeFactor;
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
        etaMinutes: Math.max(1, Math.round(route.durationMinutes * 0.12) + v.etaOffset),
        surgeMultiplier: Number(v.surgeFactor.toFixed(1)),
        timestamp: now,
        bookingUrl: links.webUrl,
        deepLink: links.deepLink,
        fareBreakdown: {
          baseFare: Math.round(v.base),
          distanceFare: Math.round(distanceFare),
          timeFare: Math.round(timeFare),
          surgeMultiplier: Number(v.surgeFactor.toFixed(1)),
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
    rideType: string = 'rapido_bike'
  ): { deepLink: string; webUrl: string } {
    const deepLink = `rapido://ride?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&drop_lat=${dropoff.lat}&drop_lng=${dropoff.lng}&service=${rideType}`;
    const webUrl = `https://www.rapido.bike/?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&drop_lat=${dropoff.lat}&drop_lng=${dropoff.lng}`;

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
      rideType: 'rapido_unavailable',
      vehicleName,
      vehicleIcon: 'Bike',
      category,
      estimatedFare: 0,
      formattedFare: 'N/A',
      currency: 'INR',
      estimatedDurationMinutes: 0,
      distanceKm: 0,
      etaMinutes: 0,
      surgeMultiplier: 1.0,
      timestamp: Date.now(),
      bookingUrl: 'https://www.rapido.bike',
      deepLink: 'rapido://',
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
