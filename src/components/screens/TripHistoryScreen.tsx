'use client';

import React from 'react';
import { History, Trash2, RotateCw, Tag } from 'lucide-react';
import { TripHistoryItem, LocationPoint } from '@/lib/types';
import { ProviderBadge } from '../ui/ProviderBadge';

interface TripHistoryScreenProps {
  history: TripHistoryItem[];
  onSelectTripToRecompare: (pickup: LocationPoint, dropoff: LocationPoint) => void;
  onClearHistory: () => void;
  isLoading: boolean;
}

export function TripHistoryScreen({
  history,
  onSelectTripToRecompare,
  onClearHistory,
  isLoading,
}: TripHistoryScreenProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-neutral-400 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium">Loading your trip history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">Trip History</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Past price comparisons & booked journeys
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-neutral-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-8 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <History size={22} />
          </div>
          <h4 className="font-bold text-neutral-800 dark:text-neutral-200">No Trips Yet</h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
            When you compare prices and book rides across apps, they will be saved here for easy re-booking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((trip) => {
            const date = new Date(trip.timestamp).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={trip.id}
                className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3"
              >
                {/* Header info */}
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{date}</span>
                  <div className="flex items-center gap-2">
                    <span>{trip.distanceKm} km</span>
                    <span>•</span>
                    <span>~{trip.durationMinutes} mins</span>
                  </div>
                </div>

                {/* Route points */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {trip.pickup.name || trip.pickup.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {trip.dropoff.name || trip.dropoff.address}
                    </span>
                  </div>
                </div>

                {/* Booked or Lowest Provider Info */}
                {trip.bookedProvider && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ProviderBadge providerId={trip.bookedProvider.id} size="sm" />
                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {trip.bookedProvider.vehicleName}
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          Booked via {trip.bookedProvider.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ₹{trip.bookedProvider.fare}
                      </div>
                      {trip.savedAmount && trip.savedAmount > 0 ? (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 justify-end">
                          <Tag size={10} />
                          Saved ₹{trip.savedAmount}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Re-compare Action */}
                <button
                  onClick={() => onSelectTripToRecompare(trip.pickup, trip.dropoff)}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-neutral-700 dark:text-neutral-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-200/80 dark:border-neutral-700/80"
                >
                  <RotateCw size={13} />
                  <span>Re-compare This Route</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
