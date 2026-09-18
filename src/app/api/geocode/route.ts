import { NextRequest, NextResponse } from 'next/server';
import { searchLocations, reverseGeocode } from '@/lib/services/geocoding-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  try {
    if (lat && lng) {
      const location = await reverseGeocode(parseFloat(lat), parseFloat(lng));
      return NextResponse.json({ location });
    }

    const results = await searchLocations(q || '');
    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Geocoding request failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
