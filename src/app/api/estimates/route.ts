import { NextRequest, NextResponse } from 'next/server';
import { ComparisonService } from '@/lib/services/comparison-service';
import { EstimateRequest } from '@/lib/types';

const comparisonService = new ComparisonService();

export async function POST(req: NextRequest) {
  try {
    const body: EstimateRequest = await req.json();

    if (
      !body.pickup ||
      typeof body.pickup.lat !== 'number' ||
      typeof body.pickup.lng !== 'number' ||
      !body.dropoff ||
      typeof body.dropoff.lat !== 'number' ||
      typeof body.dropoff.lng !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Valid pickup and dropoff coordinates with lat and lng are required.' },
        { status: 400 }
      );
    }

    // Check for identical pickup and dropoff
    if (
      Math.abs(body.pickup.lat - body.dropoff.lat) < 0.0001 &&
      Math.abs(body.pickup.lng - body.dropoff.lng) < 0.0001
    ) {
      return NextResponse.json(
        { error: 'Pickup and dropoff locations cannot be the same spot.' },
        { status: 400 }
      );
    }

    const result = await comparisonService.compareRides(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to compare ride estimates across providers';
    console.error('API /api/estimates error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
