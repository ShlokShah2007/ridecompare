'use client';

import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Info,
} from 'lucide-react';

export function HelpScreen() {
  const faqs = [
    {
      q: 'How does RideCompare calculate price estimates?',
      a: 'RideCompare queries official provider APIs or runs an authentic Indian transport tariff engine. Each estimate uses real-time driving road distances and durations calculated using OpenStreetMap OSRM routing, taking into account base fares, per-kilometer charges, time charges, surge multipliers, and taxes.',
    },
    {
      q: 'Why are categories compared separately?',
      a: 'A 2-wheeler bike cannot replace an auto or a 4-seater cab. RideCompare enforces strict like-for-like comparison: Bike vs Bike, Auto vs Auto, Economy Cab vs Economy Cab, Premium vs Premium, and XL vs XL, picking the lowest price in each category.',
    },
    {
      q: 'Does RideCompare charge booking fees or mark up fares?',
      a: 'Never. RideCompare is 100% free and unbiased. When you tap "Book Ride", you are seamlessly handed off to the provider\'s official mobile app or booking website.',
    },
    {
      q: 'How does surge pricing work?',
      a: 'During peak traffic hours (morning rush 8:30-10:30 AM and evening rush 5:30-8:30 PM), Uber and Ola dynamically adjust prices. Platforms like Namma Yatri and BluSmart operate with guaranteed 0% surge.',
    },
    {
      q: 'Can I add my own provider API keys?',
      a: 'Yes! Developers and operators can configure UBER_SERVER_TOKEN, OLA_API_KEY, and RAPIDO_API_KEY in the server .env.local file to query official production endpoints directly.',
    },
  ];

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
          Help & Transparency Guide
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Everything you need to know about RideCompare, pricing logic, and architecture
        </p>
      </div>

      {/* Core Principles Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
            Strict Category Matching
          </h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Bikes compared with Bikes, Autos with Autos, Cabs with Cabs. Fair, accurate comparisons every time.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
            Official App Handoff
          </h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            No middleman booking. We generate authentic deep links to official apps like Uber, Rapido, and Ola.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Zap size={18} />
          </div>
          <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
            Real Road Distance
          </h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Calculated via actual turn-by-turn road routes from OpenStreetMap OSRM, not straight lines.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3">
        <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <HelpCircle size={16} className="text-emerald-500" />
          Frequently Asked Questions
        </h4>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {faqs.map((item, idx) => (
            <div key={idx} className="py-3 space-y-1">
              <div className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                {item.q}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal & Trademark Disclaimer */}
      <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-neutral-700 dark:text-neutral-300">
          <Info size={14} className="text-neutral-400" />
          <span>Legal & Trademark Disclaimer</span>
        </div>
        <p>
          RideCompare is an independent mobility comparison platform and is not officially affiliated with, endorsed by, or sponsored by Uber Technologies Inc., ANI Technologies Pvt. Ltd. (Ola), Roppen Transportation Services Pvt. Ltd. (Rapido), Moving Tech Innovations (Namma Yatri), or Gensol Mobility (BluSmart).
        </p>
        <p>
          All brand names, trademarks, and logos displayed are the property of their respective owners and are used strictly for identification and comparative reference purposes.
        </p>
      </div>
    </div>
  );
}
