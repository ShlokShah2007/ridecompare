'use client';

import React from 'react';
import { Compass, Moon, Sun, Smartphone, Monitor } from 'lucide-react';

interface TopHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export function TopHeader({
  darkMode,
  onToggleDarkMode,
  isMobileFrame,
  onToggleMobileFrame,
}: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 transition-colors">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-neutral-900 dark:text-white">
                RideCompare
              </span>
              <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          {/* Desktop/Mobile frame switch */}
          <button
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? 'Expand to Full Width' : 'Switch to Mobile Frame'}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors hidden sm:flex items-center justify-center"
          >
            {isMobileFrame ? <Monitor size={18} /> : <Smartphone size={18} />}
          </button>

          {/* Theme switch */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
