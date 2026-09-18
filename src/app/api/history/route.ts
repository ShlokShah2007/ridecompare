import { NextRequest, NextResponse } from 'next/server';
import {
  getTripHistory,
  saveTripHistoryItem,
  clearTripHistory,
} from '@/lib/storage/history-store';

export async function GET() {
  try {
    const history = getTripHistory();
    return NextResponse.json({ history });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch trip history';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.pickup || !body.dropoff) {
      return NextResponse.json(
        { error: 'Trip must have pickup and dropoff points' },
        { status: 400 }
      );
    }
    const saved = saveTripHistoryItem(body);
    return NextResponse.json({ item: saved });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save trip to history';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearTripHistory();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to clear history';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
