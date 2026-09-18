'use client';

import React, { useState } from 'react';
import {
  ArrowUpDown,
  Navigation,
  Calendar,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { LocationPoint, Provider, ProviderId, RouteData } from '@/lib/types';
import { InteractiveMap } from '../map/InteractiveMap';
import { ProviderBadge } from '../ui/ProviderBadge';

interface HomeScreenProps {
  pickup: LocationPoint | null;
  dropoff: LocationPoint | null;
  route: RouteData | null;
  onOpenPickupSearch: () => void;
  onOpenDropoffSearch: () => void;
  onSwapLocations: () => void;
  onUseCurrentLocation: () => void;
  isLocatingCurrent: boolean;
  providers: Provider[];
  selectedProviders: ProviderId[];
  onToggleProvider: (id: ProviderId) => void;
  departureTime: string;
  onChangeDepartureTime: (time: string) => void;
  onComparePrices: () => void;
  isLoading: boolean;
  onSelectPresetRoute: (p: LocationPoint, d: LocationPoint) => void;
}

export function HomeScreen({
  pickup,
  dropoff,
  route,
  onOpenPickupSearch,
  onOpenDropoffSearch,
  onSwapLocations,
  onUseCurrentLocation,
  isLocatingCurrent,
  providers,
  selectedProviders,
  onToggleProvider,
  departureTime,
  onChangeDepartureTime,
  onComparePrices,
  isLoading,
  onSelectPresetRoute,
}: HomeScreenProps) {
  const [isScheduled, setIsScheduled] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCompareClick = () => {
    if (!pickup) {
      setErrorMsg('Please select a pickup location');
      return;
    }
    if (!dropoff) {
      setErrorMsg('Please select a drop-off destination');
      return;
    }
    if (selectedProviders.length === 0) {
      setErrorMsg('Please select at least one ride provider to compare');
      return;
    }
    setErrorMsg('');
    onComparePrices();
  };

  // Famous Indian Metro Presets
  const presets = [
    {
      title: 'Bengaluru Tech Corridor',
      subtitle: 'Koramangala ➔ Indiranagar (5.8 km)',
      pickup: {
        name: 'Koramangala Sony World',
        address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru',
        lat: 12.9352,
        lng: 77.6245,
        city: 'Bengaluru',
      },
      dropoff: {
        name: 'Indiranagar 100ft Road',
        address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
        lat: 12.9719,
        lng: 77.6412,
        city: 'Bengaluru',
      },
    },
    {
      title: 'Delhi-NCR Express',
      subtitle: 'Connaught Place ➔ Cyber City Gurugram (27 km)',
      pickup: {
        name: 'Connaught Place Central',
        address: 'Connaught Place, New Delhi, Delhi',
        lat: 28.6315,
        lng: 77.2167,
        city: 'New Delhi',
      },
      dropoff: {
        name: 'Cyber City Gurugram',
        address: 'DLF Cyber City, DLF Phase 2, Gurugram',
        lat: 28.4986,
        lng: 77.0878,
        city: 'Gurugram',
      },
    },
    {
      title: 'Mumbai Sea Link Route',
      subtitle: 'Bandra Bandstand ➔ Mumbai Airport (11 km)',
      pickup: {
        name: 'Bandra Bandstand',
        address: 'Bandstand Promenade, Bandra West, Mumbai',
        lat: 19.0434,
        lng: 72.8197,
        city: 'Mumbai',
      },
      dropoff: {
        name: 'Mumbai Airport T2',
        address: 'CSM International Airport, Mumbai',
        lat: 19.0974,
        lng: 72.8745,
        city: 'Mumbai',
      },
    },
  ];

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-150">
      {/* Interactive Map Card */}
      <div className="relative shadow-md rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
        <InteractiveMap pickup={pickup} dropoff={dropoff} route={route} className="h-48 sm:h-56 w-full" />
        
        {/* Floating Quick Badges on Map */}
        <div className="absolute top-3 left-3 z-[400] flex gap-2">
          <span className="bg-white/95 dark:bg-neutral-900/95 text-neutral-800 dark:text-neutral-200 text-[11px] font-bold px-2.5 py-1 rounded-full shadow backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-800 flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-500" />
            Live Route Preview
          </span>
        </div>

        {route && (
          <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white px-3.5 py-2 rounded-xl shadow-lg backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Navigation size={14} className="text-emerald-500" />
              <span>{route.distanceKm} km</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-500" />
              <span>~{route.durationMinutes} mins drive</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">OSRM Traffic</span>
          </div>
        )}
      </div>

      {/* Location Input Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 relative">
        <div className="space-y-3">
          {/* Pickup Input Button */}
          <div className="relative">
            <button
              onClick={onOpenPickupSearch}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/80 text-left hover:border-emerald-500 transition-colors group"
            >
              <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Pickup Location</div>
                <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                  {pickup?.name || (
                    <span className="text-neutral-400 font-normal">Enter pickup point...</span>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Swap Button & Current Location Button Bar */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={onUseCurrentLocation}
              disabled={isLocatingCurrent}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
            >
              <Navigation size={13} className={isLocatingCurrent ? 'animate-spin' : ''} />
              <span>{isLocatingCurrent ? 'Locating...' : 'Use Current Location'}</span>
            </button>

            <button
              onClick={onSwapLocations}
              title="Swap pickup and destination"
              className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              <ArrowUpDown size={15} />
            </button>
          </div>

          {/* Dropoff Input Button */}
          <div className="relative">
            <button
              onClick={onOpenDropoffSearch}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/80 text-left hover:border-rose-500 transition-colors group"
            >
              <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Drop-off Destination</div>
                <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                  {dropoff?.name || (
                    <span className="text-neutral-400 font-normal">Where are you going?</span>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Departure Time Selection */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsScheduled(false);
                  onChangeDepartureTime('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  !isScheduled
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Depart Now
              </button>
              <button
                type="button"
                onClick={() => setIsScheduled(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isScheduled
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Calendar size={13} />
                <span>Schedule</span>
              </button>
            </div>

            {isScheduled && (
              <input
                type="datetime-local"
                value={departureTime}
                onChange={(e) => onChangeDepartureTime(e.target.value)}
                className="text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            )}
          </div>
        </div>
      </div>

      {/* Provider Selection Section with attractive toggles */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Compare Providers
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select ride apps to compare in real-time
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
            {selectedProviders.length} active
          </span>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {providers.map((provider) => {
            const isSelected = selectedProviders.includes(provider.id);

            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => onToggleProvider(provider.id)}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? 'border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ProviderBadge providerId={provider.id} size="sm" />
                  <div>
                    <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                      {provider.shortName}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'border border-neutral-300 dark:border-neutral-600 text-transparent'
                  }`}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Indian Metro Routes */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase text-neutral-400 tracking-wider px-1">
          Popular Quick Routes
        </div>
        <div className="space-y-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPresetRoute(p.pickup, p.dropoff)}
              className="w-full text-left p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/80 transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                  {p.title}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {p.subtitle}
                </div>
              </div>
              <div className="w-7 h-7 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950 transition-colors">
                <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Compare Prices Button CTA */}
      <div className="pt-2">
        <button
          onClick={handleCompareClick}
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-black text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Comparing Live Fares...</span>
            </>
          ) : (
            <>
              <span>Compare Prices Across Apps</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
