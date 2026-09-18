import React from 'react';
import { Bike, Car, CarFront, Truck } from 'lucide-react';
import { RideCategory } from '@/lib/types';

interface VehicleIconProps {
  category?: RideCategory | string;
  iconName?: string;
  className?: string;
  size?: number;
}

export function VehicleIcon({ category, iconName, className = '', size = 20 }: VehicleIconProps) {
  const normCategory = category?.toLowerCase();

  if (normCategory === 'bike' || iconName === 'Bike') {
    return <Bike size={size} className={className} />;
  }

  if (normCategory === 'auto' || iconName === 'Auto') {
    // Custom SVG for Indian Auto Rickshaw
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M4 11h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" />
        <path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="17" cy="19" r="2" />
        <path d="M12 4v7" />
      </svg>
    );
  }

  if (normCategory === 'cab_xl' || iconName === 'Truck') {
    return <Truck size={size} className={className} />;
  }

  if (normCategory === 'cab_premium' || iconName === 'CarFront') {
    return <CarFront size={size} className={className} />;
  }

  // Default economy cab
  return <Car size={size} className={className} />;
}
