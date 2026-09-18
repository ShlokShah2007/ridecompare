'use client';

import React from 'react';
import { Compass, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { ProviderBadge } from '../ui/ProviderBadge';

interface SplashScreenProps {
  onGetStarted: () => void;
}

export function SplashScreen({ onGetStarted }: SplashScreenProps) {
  return (
    <div className="min-h-[85vh] flex flex-col justify-between p-6 max-w-lg mx-auto text-center animate-in fade-in duration-300">
      {/* Top Brand Hero */}
      <div className="space-y-6 pt-10">
        {/* Animated Brand Icon */}
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 p-0.5 shadow-2xl shadow-emerald-500/30 flex items-center justify-center text-white">
          <div className="w-full h-full bg-emerald-600 rounded-[22px] flex items-center justify-center">
            <Compass size={48} className="animate-spin-slow" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-black flex items-center justify-center font-extrabold text-xs shadow-lg">
            ₹
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <Sparkles size={13} />
            <span>Smart Ride Price Comparison</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
            Stop switching apps. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500">
              Find the cheapest ride.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Compare estimated fares across <strong>Uber, Rapido, Ola, Namma Yatri, and BluSmart</strong> in one tap.
          </p>
        </div>

        {/* Supported Providers Strip */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <ProviderBadge providerId="uber" size="md" />
          <ProviderBadge providerId="rapido" size="md" />
          <ProviderBadge providerId="ola" size="md" />
          <ProviderBadge providerId="nammayatri" size="md" />
          <ProviderBadge providerId="blusmart" size="md" />
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="space-y-2.5 py-6">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-left shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">
              🟢 Lowest Price Finder
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Bikes, autos, and cabs sorted with the guaranteed cheapest fare highlighted.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-left shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">
              Direct Official Booking
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Zero platform commissions or markups. Seamless deep link handoff into provider apps.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pb-4">
        <button
          onClick={onGetStarted}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-black text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
