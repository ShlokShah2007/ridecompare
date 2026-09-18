import React from 'react';
import { ProviderId } from '@/lib/types';

interface ProviderBadgeProps {
  providerId: ProviderId;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function ProviderBadge({
  providerId,
  size = 'md',
  showName = false,
  className = '',
}: ProviderBadgeProps) {
  const getBadgeConfig = () => {
    switch (providerId) {
      case 'uber':
        return {
          name: 'Uber',
          bg: 'bg-black text-white',
          border: 'border-neutral-800',
          logoText: 'Uber',
          accent: '#000000',
        };
      case 'rapido':
        return {
          name: 'Rapido',
          bg: 'bg-amber-400 text-black font-extrabold',
          border: 'border-amber-500',
          logoText: 'rapido',
          accent: '#F9C935',
        };
      case 'ola':
        return {
          name: 'Ola',
          bg: 'bg-emerald-600 text-white font-bold',
          border: 'border-emerald-700',
          logoText: 'OLA',
          accent: '#159E50',
        };
      case 'nammayatri':
        return {
          name: 'Namma Yatri',
          bg: 'bg-yellow-300 text-neutral-900 font-bold',
          border: 'border-yellow-400',
          logoText: 'NY',
          accent: '#FFD200',
        };
      case 'blusmart':
        return {
          name: 'BluSmart',
          bg: 'bg-blue-600 text-white font-bold',
          border: 'border-blue-700',
          logoText: 'BLU',
          accent: '#0070F3',
        };
      default:
        return {
          name: providerId,
          bg: 'bg-neutral-800 text-white',
          border: 'border-neutral-700',
          logoText: 'CAB',
          accent: '#6b7280',
        };
    }
  };

  const config = getBadgeConfig();

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center tracking-tight shadow-sm select-none shrink-0 ${config.bg}`}
      >
        <span>{config.logoText}</span>
      </div>
      {showName && (
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
          {config.name}
        </span>
      )}
    </div>
  );
}
