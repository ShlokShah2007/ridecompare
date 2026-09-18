'use client';

import React, { useEffect, useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Monitor,
  ArrowRight,
  X,
} from 'lucide-react';
import { RideEstimate, LocationPoint } from '@/lib/types';
import { ProviderBadge } from '../ui/ProviderBadge';

interface BookingRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: RideEstimate | null;
  pickup: LocationPoint | null;
  dropoff: LocationPoint | null;
}

export function BookingRedirectModal({
  isOpen,
  onClose,
  estimate,
  pickup,
  dropoff,
}: BookingRedirectModalProps) {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobileDevice(isMobile);
    }
  }, []);

  useEffect(() => {
    if (isOpen && estimate) {
      // Save this booking to trip history API automatically
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup,
          dropoff,
          distanceKm: estimate.distanceKm,
          durationMinutes: estimate.estimatedDurationMinutes,
          bookedProvider: {
            id: estimate.providerId,
            name: estimate.providerName,
            vehicleName: estimate.vehicleName,
            fare: estimate.estimatedFare,
            category: estimate.category,
          },
        }),
      }).catch((err) => console.warn('Could not auto-save history:', err));

      // Saved booking to history
    }
  }, [isOpen, estimate, pickup, dropoff]);

  if (!isOpen || !estimate) return null;

  const handleOpenApp = () => {
    if (isMobileDevice) {
      // On mobile: attempt deep link
      window.location.href = estimate.deepLink;
      // If user hasn't left within 1.5s, app is likely not installed
      setTimeout(() => {
        if (estimate.bookingUrl) {
          window.open(estimate.bookingUrl, '_blank');
        }
      }, 1500);
    } else {
      // On desktop: try custom protocol or open web booking directly
      window.open(estimate.bookingUrl || estimate.deepLink, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5 text-center relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Provider Brand Badge */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shadow-inner mt-2">
          <ProviderBadge providerId={estimate.providerId} size="lg" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
            <CheckCircle2 size={14} />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h3 className="text-xl font-black text-neutral-900 dark:text-neutral-100">
            Book with {estimate.providerName}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <strong>{estimate.vehicleName}</strong> • Estimated Fare:{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {estimate.formattedFare}
            </span>
          </p>
        </div>

        {/* Device Context Notice */}
        <div
          className={`p-3 rounded-2xl text-left text-xs border flex items-start gap-2.5 ${
            !isMobileDevice
              ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200'
              : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          {!isMobileDevice ? (
            <Monitor size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          ) : (
            <Smartphone size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}

          <div>
            {!isMobileDevice ? (
              <>
                <div className="font-bold">You are browsing on Desktop / PC</div>
                <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                  Native ride apps (Uber, Rapido, Ola) are smartphone apps. Click{' '}
                  <strong>&quot;Open Web Booking&quot;</strong> below to book on your browser, or scan with your phone!
                </div>
              </>
            ) : (
              <>
                <div className="font-bold">Mobile Device Detected</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Tapping below will open the official {estimate.providerName} app with your route prefilled. If you don&apos;t have the app, use the web option.
                </div>
              </>
            )}
          </div>
        </div>

        {/* Route Snapshot */}
        <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3 text-left border border-neutral-100 dark:border-neutral-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="font-medium">From:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[220px]">
              {pickup?.name || pickup?.address}
            </span>
          </div>
          <div className="flex items-center justify-between text-neutral-500">
            <span className="font-medium">To:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[220px]">
              {dropoff?.name || dropoff?.address}
            </span>
          </div>
        </div>

        {/* Transparent Handoff Disclaimer */}
        <div className="flex items-start gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/40 p-2.5 rounded-xl text-left">
          <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong>Official Provider Handoff:</strong> RideCompare does not process payments or book rides internally. You complete your ride directly on {estimate.providerName}&apos;s official service.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Primary Action Button */}
          {!isMobileDevice ? (
            <a
              href={estimate.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Open {estimate.providerName} Web Booking</span>
              <ExternalLink size={16} />
            </a>
          ) : (
            <button
              onClick={handleOpenApp}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-colors"
            >
              <span>Open in {estimate.providerName} App</span>
              <ArrowRight size={16} />
            </button>
          )}

          {/* Secondary Action: Alternate Link */}
          {!isMobileDevice ? (
            <a
              href={estimate.deepLink}
              className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Smartphone size={13} />
              <span>Launch App Protocol Scheme ({estimate.providerId}://)</span>
            </a>
          ) : (
            estimate.bookingUrl && (
              <a
                href={estimate.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>App not installed? Open Web Booking</span>
                <ExternalLink size={13} />
              </a>
            )
          )}

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            Back to Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
