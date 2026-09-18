'use client';

import React from 'react';
import {
  ShieldCheck,
  Server,
  Zap,
  Moon,
  Sun,
} from 'lucide-react';
import { Provider, ProviderId } from '@/lib/types';
import { ProviderBadge } from '../ui/ProviderBadge';

interface SettingsScreenProps {
  providers: Provider[];
  selectedProviders: ProviderId[];
  onToggleProvider: (id: ProviderId) => void;
  pricingMode: 'strict' | 'dynamic';
  onChangePricingMode: (mode: 'strict' | 'dynamic') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function SettingsScreen({
  providers,
  selectedProviders,
  onToggleProvider,
  pricingMode,
  onChangePricingMode,
  darkMode,
  onToggleDarkMode,
}: SettingsScreenProps) {
  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-150">
      {/* Settings Title */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
          Settings & Preferences
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Configure enabled ride providers, pricing engine modes, and themes
        </p>
      </div>

      {/* Provider Selection Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div>
          <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
            Compare Providers
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Enable or disable specific ride services from price comparison
          </p>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {providers.map((provider) => {
            const isEnabled = selectedProviders.includes(provider.id);

            return (
              <div
                key={provider.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <ProviderBadge providerId={provider.id} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                        {provider.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          provider.apiStatus === 'connected'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                        }`}
                      >
                        {provider.apiStatus === 'connected' ? 'API Key Active' : 'Live Tariff Engine'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      {provider.description}
                    </p>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleProvider(provider.id)}
                  className={`w-12 h-7 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    isEnabled ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Engine Mode */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Backend Architecture Mode
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Controls behavior when third-party provider API keys are unset
            </p>
          </div>
          <Server size={18} className="text-emerald-500" />
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Dynamic live mode */}
          <button
            type="button"
            onClick={() => onChangePricingMode('dynamic')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              pricingMode === 'dynamic'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Zap size={14} className="text-emerald-500" />
                Live Dynamic Rate Engine (Recommended)
              </span>
              {pricingMode === 'dynamic' && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              Uses live OSRM road distance, duration, time-of-day traffic, and authentic Indian market fare structures.
            </p>
          </button>

          {/* Strict production mode */}
          <button
            type="button"
            onClick={() => onChangePricingMode('strict')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              pricingMode === 'strict'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-500" />
                Strict Production Mode
              </span>
              {pricingMode === 'strict' && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              Strictly queries official API endpoints. Marks providers without official credentials as &ldquo;Price unavailable&rdquo;.
            </p>
          </button>
        </div>
      </div>

      {/* Appearance & Theme */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 shadow-sm border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Appearance</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Toggle between dark and light themes
            </p>
          </div>
          <button
            onClick={onToggleDarkMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            <span>{darkMode ? 'Dark Theme' : 'Light Theme'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
