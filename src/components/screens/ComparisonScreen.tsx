'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  Clock,
  Navigation,
  Sparkles,
  Tag,
} from 'lucide-react';
import {
  EstimateResponse,
  RideEstimate,
} from '@/lib/types';
import { ProviderBadge } from '../ui/ProviderBadge';
import { VehicleIcon } from '../ui/VehicleIcon';

interface ComparisonScreenProps {
  comparisonData: EstimateResponse | null;
  onSelectEstimate: (estimate: RideEstimate) => void;
  onDirectBookEstimate?: (estimate: RideEstimate) => void;
  onRefreshPrices: () => void;
  isRefreshing: boolean;
  onEditSearch: () => void;
}

export function ComparisonScreen({
  comparisonData,
  onSelectEstimate,
  onDirectBookEstimate,
  onRefreshPrices,
  isRefreshing,
  onEditSearch,
}: ComparisonScreenProps) {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  // Expiration countdown
  useEffect(() => {
    if (!comparisonData?.expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((comparisonData.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [comparisonData]);

  if (!comparisonData) {
    return (
      <div className="p-8 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <Navigation size={22} />
        </div>
        <h3 className="font-bold text-neutral-800 dark:text-neutral-200">No Active Comparison</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Enter your pickup and destination on the search tab to compare live prices.
        </p>
        <button
          onClick={onEditSearch}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition-colors"
        >
          Go to Search
        </button>
      </div>
    );
  }

  const { route, pickup, dropoff, comparisons, timestamp, cheapestOverall } = comparisonData;

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const categoriesTabs = [
    { id: 'all', label: 'All Rides', icon: Sparkles },
    { id: 'bike', label: 'Bikes', icon: 'Bike' },
    { id: 'auto', label: 'Autos', icon: 'Auto' },
    { id: 'cab_economy', label: 'Cabs', icon: 'Car' },
    { id: 'cab_premium', label: 'Premium', icon: 'CarFront' },
    { id: 'cab_xl', label: 'XL / SUV', icon: 'Truck' },
  ];

  const filteredComparisons =
    selectedCategoryTab === 'all'
      ? comparisons
      : comparisons.filter((c) => c.category === selectedCategoryTab);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-150">
      {/* Route & Refresh Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3">
        {/* Route Details */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{pickup.name || pickup.address.split(',')[0]}</span>
              <span className="text-neutral-400">➔</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="truncate">{dropoff.name || dropoff.address.split(',')[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>{route.distanceKm} km</span>
              <span>•</span>
              <span>~{route.durationMinutes} mins</span>
              <span>•</span>
              <span title={`Retrieved at ${formattedTime}`}>Updated {formattedTime}</span>
              <span>•</span>
              <button
                onClick={onEditSearch}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Change Route
              </button>
            </div>
          </div>

          {/* Refresh Button with Countdown */}
          <button
            onClick={onRefreshPrices}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 shrink-0 transition-colors"
          >
            <RotateCw size={13} className={isRefreshing ? 'animate-spin text-emerald-600' : ''} />
            <span>{isRefreshing ? 'Updating...' : `${secondsRemaining}s`}</span>
          </button>
        </div>

        {/* Global Cheapest Highlight Pill */}
        {cheapestOverall && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
                ₹
              </span>
              <div>
                <span className="font-bold text-emerald-950 dark:text-emerald-200">
                  Lowest Fare Overall:
                </span>{' '}
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {cheapestOverall.providerName} {cheapestOverall.vehicleName} (₹
                  {cheapestOverall.estimatedFare})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onSelectEstimate(cheapestOverall)}
                className="font-bold text-neutral-600 dark:text-neutral-300 hover:underline text-[11px]"
              >
                Details
              </button>
              <button
                onClick={() =>
                  onDirectBookEstimate
                    ? onDirectBookEstimate(cheapestOverall)
                    : onSelectEstimate(cheapestOverall)
                }
                className="font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-[11px] shadow-sm hover:bg-emerald-500"
              >
                Book ➔
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categoriesTabs.map((tab) => {
          const isSelected = selectedCategoryTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategoryTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm scale-[1.02]'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              {typeof tab.icon === 'string' ? (
                <VehicleIcon iconName={tab.icon} size={15} />
              ) : (
                <tab.icon size={14} />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Comparison Cards Stack */}
      <div className="space-y-4">
        {filteredComparisons.map((catComp) => {
          const {
            category,
            categoryTitle,
            categoryIcon,
            description,
            lowestPriceEstimate,
            maxSavingsAmount,
            estimates,
          } = catComp;

          return (
            <div
              key={category}
              className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3.5"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                    <VehicleIcon category={category} iconName={categoryIcon} size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      {categoryTitle}
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Savings Pill */}
                {maxSavingsAmount > 0 && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Tag size={10} />
                    Save up to ₹{maxSavingsAmount}
                  </span>
                )}
              </div>

              {/* Lowest Price Banner for this category */}
              {lowestPriceEstimate && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      ✓
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        🟢 Lowest Price
                      </div>
                      <div className="text-xs font-extrabold text-neutral-900 dark:text-white">
                        {lowestPriceEstimate.providerName} — {lowestPriceEstimate.formattedFare}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onSelectEstimate(lowestPriceEstimate)}
                      className="px-2 py-1 bg-white/80 dark:bg-neutral-800 hover:bg-white dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() =>
                        onDirectBookEstimate
                          ? onDirectBookEstimate(lowestPriceEstimate)
                          : onSelectEstimate(lowestPriceEstimate)
                      }
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      Book ➔
                    </button>
                  </div>
                </div>
              )}

              {/* Provider Options List */}
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {estimates.map((est, idx) => {
                  const isLowest = lowestPriceEstimate?.rideType === est.rideType;

                  if (!est.isAvailable) {
                    return (
                      <div
                        key={idx}
                        className="py-2.5 flex items-center justify-between opacity-50 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <ProviderBadge providerId={est.providerId} size="sm" />
                          <div>
                            <div className="font-semibold text-neutral-700 dark:text-neutral-300">
                              {est.vehicleName}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              {est.unavailableReason || 'Price unavailable'}
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-neutral-400">
                          Unavailable
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => onSelectEstimate(est)}
                      className="w-full py-2.5 flex items-center justify-between text-left group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 rounded-xl px-2 transition-colors"
                    >
                      {/* Left: Provider info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ProviderBadge providerId={est.providerId} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                              {est.vehicleName}
                            </span>
                            {isLowest && (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                LOWEST
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Clock size={11} /> {est.etaMinutes}m away
                            </span>
                            {est.surgeMultiplier > 1.0 && (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                {est.surgeMultiplier}x surge
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div
                            className={`text-sm font-black tracking-tight ${
                              isLowest
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}
                          >
                            {est.formattedFare}
                          </div>
                          <div className="text-[10px] text-neutral-400">estimate</div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDirectBookEstimate) {
                              onDirectBookEstimate(est);
                            } else {
                              onSelectEstimate(est);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                        >
                          <span>Book</span>
                        </button>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
