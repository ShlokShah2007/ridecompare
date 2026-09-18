'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LocationPoint, RouteData } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface InteractiveMapProps {
  pickup: LocationPoint | null;
  dropoff: LocationPoint | null;
  route: RouteData | null;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

const DynamicMap = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-2xl flex flex-col items-center justify-center text-neutral-400 gap-2 border border-neutral-200 dark:border-neutral-700">
      <MapPin className="w-8 h-8 text-neutral-400 animate-bounce" />
      <span className="text-xs font-medium">Loading interactive route map...</span>
    </div>
  ),
});

export function InteractiveMap(props: InteractiveMapProps) {
  return <DynamicMap {...props} />;
}
