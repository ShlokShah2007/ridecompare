'use client';

import React from 'react';
import { X, Clock, Navigation, ShieldCheck, ArrowRight, Zap, Info } from 'lucide-react';
import { LocationPoint, RideEstimate } from '@/lib/types';
import { ProviderBadge } from '../ui/ProviderBadge';
import { VehicleIcon } from '../ui/VehicleIcon';

interface RideDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: RideEstimate | null;
  pickup: LocationPoint | null;
  dropoff: LocationPoint | null;
  onBookRide: (estimate: RideEstimate) => void;
}

export function RideDetailsModal({
  isOpen,
  onClose,
  estimate,
  pickup,
  dropoff,
  onBookRide,
}: RideDetailsModalProps) {
  if (!isOpen || !estimate) return null;

  const { fareBreakdown } = estimate;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <ProviderBadge providerId={estimate.providerId} size="md" />
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 leading-tight">
                {estimate.vehicleName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span>By {estimate.providerName}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Clock size={12} /> {estimate.etaMinutes} mins arrival
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Price Banner */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-wider">
                Estimated Price
              </div>
              <div className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-0.5">
                {estimate.formattedFare}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Guaranteed fair comparison
              </div>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200">
              <VehicleIcon category={estimate.category} iconName={estimate.vehicleIcon} size={28} />
            </div>
          </div>

          {/* Surge Warning if applicable */}
          {estimate.surgeMultiplier > 1.0 && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs">
              <Zap size={16} className="text-amber-500 shrink-0" />
              <div>
                <span className="font-bold">{estimate.surgeMultiplier}x Surge Pricing Active:</span> High
                demand in this area is temporarily adjusting fares on {estimate.providerName}.
              </div>
            </div>
          )}

          {/* Journey Route Recap */}
          <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-700/60 space-y-3">
            <div className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
              Journey Overview
            </div>

            <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-300 dark:before:bg-neutral-700">
              {/* Pickup */}
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950" />
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 truncate">
                  {pickup?.name || 'Pickup Point'}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {pickup?.address}
                </div>
              </div>

              {/* Destination */}
              <div className="relative">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950" />
                <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 truncate">
                  {dropoff?.name || 'Destination'}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {dropoff?.address}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Navigation size={14} className="text-emerald-500" />
                <span>{estimate.distanceKm} km trip distance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-blue-500" />
                <span>~{estimate.estimatedDurationMinutes} mins travel time</span>
              </div>
            </div>
          </div>

          {/* Detailed Fare Breakdown */}
          {fareBreakdown && (
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2.5">
              <div className="text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center justify-between">
                <span>Transparent Fare Breakdown</span>
                <Info size={14} className="text-neutral-400" />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Base Fare</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    ₹{fareBreakdown.baseFare}
                  </span>
                </div>

                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Distance Rate ({estimate.distanceKm} km)</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    ₹{fareBreakdown.distanceFare}
                  </span>
                </div>

                {fareBreakdown.timeFare > 0 && (
                  <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Ride Time ({estimate.estimatedDurationMinutes} min)</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                      ₹{fareBreakdown.timeFare}
                    </span>
                  </div>
                )}

                {fareBreakdown.surgeFare > 0 && (
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-medium">
                    <span>Surge Demand Factor ({estimate.surgeMultiplier}x)</span>
                    <span>+₹{fareBreakdown.surgeFare}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>GST & Platform Taxes</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                    ₹{fareBreakdown.taxesAndFees}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  <span>Total Estimated Fare</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-base">
                    ₹{fareBreakdown.totalFare}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Legal / Handoff Disclaimer */}
          <div className="flex items-start gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/40 p-3 rounded-xl">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>
              RideCompare never marks up rides or charges booking fees. Tapping <strong>Book Ride</strong> will open the official {estimate.providerName} app or web portal with this trip pre-filled.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <button
            onClick={() => onBookRide(estimate)}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>Book Ride with {estimate.providerName}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
