import { NextResponse } from 'next/server';
import { ProviderRegistry } from '@/lib/providers/registry';

export async function GET() {
  try {
    const registry = ProviderRegistry.getInstance();
    const providers = await registry.getProvidersList();
    return NextResponse.json({ providers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch provider list';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
