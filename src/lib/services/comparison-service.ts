import { ProviderRegistry } from '../providers/registry';
import { getRouteDetails } from './routing-service';
import {
  CategoryComparison,
  EstimateRequest,
  EstimateResponse,
  RideCategory,
  RideEstimate,
} from '../types';

const CATEGORY_METADATA: Record<
  RideCategory,
  { title: string; icon: string; description: string; order: number }
> = {
  bike: {
    title: 'Bike Taxi',
    icon: 'Bike',
    description: 'Fastest for solo travel, beats city traffic jams',
    order: 1,
  },
  auto: {
    title: 'Auto Rickshaw',
    icon: 'Auto',
    description: 'Affordable, breezy city commuting for up to 3 passengers',
    order: 2,
  },
  cab_economy: {
    title: 'Economy Cab',
    icon: 'Car',
    description: 'AC hatchback or compact sedan for everyday city journeys',
    order: 3,
  },
  cab_premium: {
    title: 'Premium Sedan',
    icon: 'CarFront',
    description: 'Comfortable spacious sedans with top-rated drivers',
    order: 4,
  },
  cab_xl: {
    title: 'XL / SUV (6 Seater)',
    icon: 'Truck',
    description: 'Spacious SUVs with extra legroom and large luggage boot space',
    order: 5,
  },
};

export class ComparisonService {
  private registry: ProviderRegistry;

  constructor() {
    this.registry = ProviderRegistry.getInstance();
  }

  public async compareRides(request: EstimateRequest): Promise<EstimateResponse> {
    const { pickup, dropoff, selectedProviders, pricingMode = 'dynamic', departureTime } = request;

    // 1. Fetch real road route distance, duration, and coordinates from OSRM
    const route = await getRouteDetails(pickup, dropoff);

    // 2. Determine which adapters to query
    const allAdapters = this.registry.getAllAdapters();
    const targetAdapters = selectedProviders && selectedProviders.length > 0
      ? allAdapters.filter((a) => selectedProviders.includes(a.providerId))
      : allAdapters;

    // 3. Query all adapters concurrently with Promise.allSettled
    const estimatePromises = targetAdapters.map(async (adapter) => {
      try {
        return await adapter.getRideEstimates({
          pickup,
          dropoff,
          route,
          pricingMode,
          departureTime,
        });
      } catch (err) {
        console.error(`Error querying provider ${adapter.providerId}:`, err);
        return [];
      }
    });

    const results = await Promise.allSettled(estimatePromises);
    const rawEstimates: RideEstimate[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        rawEstimates.push(...result.value);
      }
    }

    // 4. Group estimates strictly by category
    const categoryBuckets = new Map<RideCategory, RideEstimate[]>();
    for (const cat of Object.keys(CATEGORY_METADATA) as RideCategory[]) {
      categoryBuckets.set(cat, []);
    }

    for (const est of rawEstimates) {
      const bucket = categoryBuckets.get(est.category);
      if (bucket) {
        bucket.push(est);
      }
    }

    // 5. Build category comparisons with lowest price calculation
    const comparisons: CategoryComparison[] = [];
    let cheapestOverall: RideEstimate | null = null;

    const orderedCategories = (Object.keys(CATEGORY_METADATA) as RideCategory[]).sort(
      (a, b) => CATEGORY_METADATA[a].order - CATEGORY_METADATA[b].order
    );

    for (const cat of orderedCategories) {
      const bucket = categoryBuckets.get(cat) || [];
      if (bucket.length === 0) continue;

      // Sort estimates by price ascending, placing unavailable ones at the bottom
      bucket.sort((a, b) => {
        if (!a.isAvailable && !b.isAvailable) return 0;
        if (!a.isAvailable) return 1;
        if (!b.isAvailable) return -1;
        return a.estimatedFare - b.estimatedFare;
      });

      const availableEstimates = bucket.filter((e) => e.isAvailable && e.estimatedFare > 0);
      const lowest = availableEstimates.length > 0 ? availableEstimates[0] : null;
      const highest =
        availableEstimates.length > 0 ? availableEstimates[availableEstimates.length - 1] : null;

      const maxSavings =
        lowest && highest && highest.estimatedFare > lowest.estimatedFare
          ? highest.estimatedFare - lowest.estimatedFare
          : 0;

      if (lowest) {
        if (!cheapestOverall || lowest.estimatedFare < cheapestOverall.estimatedFare) {
          cheapestOverall = lowest;
        }
      }

      comparisons.push({
        category: cat,
        categoryTitle: CATEGORY_METADATA[cat].title,
        categoryIcon: CATEGORY_METADATA[cat].icon,
        description: CATEGORY_METADATA[cat].description,
        lowestPriceEstimate: lowest,
        highestPriceEstimate: highest,
        maxSavingsAmount: maxSavings,
        estimates: bucket,
      });
    }

    const now = Date.now();
    const expiresAt = now + 2 * 60 * 1000; // Estimates valid for 2 minutes

    return {
      route,
      pickup,
      dropoff,
      comparisons,
      totalEstimatesFound: rawEstimates.filter((e) => e.isAvailable).length,
      cheapestOverall,
      timestamp: now,
      expiresAt,
      pricingMode,
    };
  }
}
