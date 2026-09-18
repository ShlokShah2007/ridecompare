'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Navigation } from 'lucide-react';
import { LocationPoint } from '@/lib/types';
import { POPULAR_LOCATIONS } from '@/lib/services/geocoding-service';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  placeholder?: string;
  onSelectLocation: (location: LocationPoint) => void;
  onUseCurrentLocation?: () => void;
  isLocatingCurrent?: boolean;
}

export function LocationSearchModal({
  isOpen,
  onClose,
  title,
  placeholder = 'Search place, landmark, or address...',
  onSelectLocation,
  onUseCurrentLocation,
  isLocatingCurrent = false,
}: LocationSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setResults(POPULAR_LOCATIONS.slice(0, 6));
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(POPULAR_LOCATIONS.slice(0, 6));
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error('Failed to search locations:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh] border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">{title}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Enter an address or pick a popular landmark
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-neutral-100 text-sm font-medium border border-transparent focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-neutral-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Current Location Option */}
        {onUseCurrentLocation && (
          <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800/60">
            <button
              onClick={() => {
                onUseCurrentLocation();
                onClose();
              }}
              disabled={isLocatingCurrent}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium text-sm transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
                <Navigation
                  size={16}
                  className={isLocatingCurrent ? 'animate-spin' : ''}
                />
              </div>
              <div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {isLocatingCurrent ? 'Detecting GPS location...' : 'Use current location'}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Based on device GPS coordinates
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Results / Presets List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-neutral-800/40">
          {isLoading ? (
            <div className="p-8 text-center text-neutral-400 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Searching locations...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-sm">
              No matching locations found. Try a different landmark or city.
            </div>
          ) : (
            results.map((loc, idx) => (
              <button
                key={`${loc.lat}-${loc.lng}-${idx}`}
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
                className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-left transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/60 flex items-center justify-center shrink-0 transition-colors">
                  <MapPin
                    size={16}
                    className="text-neutral-500 dark:text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm truncate">
                    {loc.name || loc.address.split(',')[0]}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {loc.address}
                  </div>
                </div>
                {loc.city && (
                  <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full shrink-0">
                    {loc.city}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
