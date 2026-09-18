'use client';

import React from 'react';
import { Home, SlidersHorizontal, History, Settings, HelpCircle } from 'lucide-react';

export type NavTab = 'home' | 'compare' | 'history' | 'settings' | 'help';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  hasActiveComparison: boolean;
}

export function BottomNav({ activeTab, onChangeTab, hasActiveComparison }: BottomNavProps) {
  const tabs = [
    { id: 'home' as NavTab, label: 'Search', icon: Home },
    {
      id: 'compare' as NavTab,
      label: 'Compare',
      icon: SlidersHorizontal,
      badge: hasActiveComparison,
    },
    { id: 'history' as NavTab, label: 'History', icon: History },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
    { id: 'help' as NavTab, label: 'About', icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-neutral-900 animate-pulse" />
                )}
              </div>
              <span className="text-[11px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
