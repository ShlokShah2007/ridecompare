'use client';

import React, { useState, useEffect } from 'react';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNav, NavTab } from '@/components/layout/BottomNav';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { ComparisonScreen } from '@/components/screens/ComparisonScreen';
import { TripHistoryScreen } from '@/components/screens/TripHistoryScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { HelpScreen } from '@/components/screens/HelpScreen';
import { SplashScreen } from '@/components/screens/SplashScreen';
import { LocationSearchModal } from '@/components/modals/LocationSearchModal';
import { RideDetailsModal } from '@/components/modals/RideDetailsModal';
import { BookingRedirectModal } from '@/components/modals/BookingRedirectModal';
import {
  LocationPoint,
  Provider,
  ProviderId,
  RouteData,
  EstimateResponse,
  RideEstimate,
  TripHistoryItem,
} from '@/lib/types';
import { POPULAR_LOCATIONS } from '@/lib/services/geocoding-service';

export default function Home() {
  const [showSplash, setShowSplash] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Locations state (defaults to vibrant Bangalore Tech Corridor)
  const [pickup, setPickup] = useState<LocationPoint | null>(POPULAR_LOCATIONS[0]);
  const [dropoff, setDropoff] = useState<LocationPoint | null>(POPULAR_LOCATIONS[1]);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [departureTime, setDepartureTime] = useState<string>('');

  // Providers & Settings
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<ProviderId[]>([
    'uber',
    'rapido',
    'ola',
    'nammayatri',
    'blusmart',
  ]);
  const [pricingMode, setPricingMode] = useState<'dynamic' | 'strict'>('dynamic');

  // Comparison State
  const [comparisonData, setComparisonData] = useState<EstimateResponse | null>(null);
  const [isLoadingEstimates, setIsLoadingEstimates] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocatingCurrent, setIsLocatingCurrent] = useState(false);

  // History State
  const [history, setHistory] = useState<TripHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Modals
  const [searchModalType, setSearchModalType] = useState<'pickup' | 'dropoff' | null>(null);
  const [selectedEstimateForDetails, setSelectedEstimateForDetails] = useState<RideEstimate | null>(
    null
  );
  const [selectedEstimateForBooking, setSelectedEstimateForBooking] = useState<RideEstimate | null>(
    null
  );

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch initial providers & history
  useEffect(() => {
    async function initData() {
      try {
        const provRes = await fetch('/api/providers');
        if (provRes.ok) {
          const data = await provRes.json();
          if (data.providers) {
            setProviders(data.providers);
          }
        }
      } catch (err) {
        console.error('Failed to load providers:', err);
      }

      try {
        setIsLoadingHistory(true);
        const histRes = await fetch('/api/history');
        if (histRes.ok) {
          const data = await histRes.json();
          if (data.history) {
            setHistory(data.history);
          }
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    }

    initData();
  }, []);

  // Update initial route geometry preview for default points
  useEffect(() => {
    if (pickup && dropoff) {
      // Calculate preview route distance
      fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup,
          dropoff,
          selectedProviders: ['uber'],
          pricingMode: 'dynamic',
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.route) {
            setRoute(data.route);
          }
        })
        .catch(() => {});
    }
  }, [pickup, dropoff]);

  // Handle Compare Prices
  const handleComparePrices = async (isRefresh: boolean = false) => {
    if (!pickup || !dropoff) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoadingEstimates(true);
    }

    try {
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup,
          dropoff,
          selectedProviders,
          pricingMode,
          departureTime: departureTime || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to compare rides');
      }

      const data: EstimateResponse = await response.json();
      setComparisonData(data);
      if (data.route) {
        setRoute(data.route);
      }
      setActiveTab('compare');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Comparison request failed. Please verify your connection.';
      alert(msg);
    } finally {
      setIsLoadingEstimates(false);
      setIsRefreshing(false);
    }
  };

  // Geolocation for Current Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingCurrent(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data.location) {
              setPickup(data.location);
            }
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
          setPickup({
            name: 'Current GPS Location',
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            lat: latitude,
            lng: longitude,
          });
        } finally {
          setIsLocatingCurrent(false);
        }
      },
      (error) => {
        setIsLocatingCurrent(false);
        alert(`Location permission denied or unavailable (${error.message}). Using preset location.`);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Swap Locations
  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  // Provider Toggle
  const handleToggleProvider = (id: ProviderId) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Select Preset Route
  const handleSelectPresetRoute = (p: LocationPoint, d: LocationPoint) => {
    setPickup(p);
    setDropoff(d);
  };

  // Book Ride Handoff
  const handleBookRide = (estimate: RideEstimate) => {
    setSelectedEstimateForDetails(null);
    setSelectedEstimateForBooking(estimate);
  };

  // Re-compare Trip from History
  const handleSelectTripToRecompare = (p: LocationPoint, d: LocationPoint) => {
    setPickup(p);
    setDropoff(d);
    setActiveTab('home');
  };

  // Clear Trip History
  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your saved trip history?')) return;
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  // Render Current Screen
  const renderScreen = () => {
    if (showSplash) {
      return <SplashScreen onGetStarted={() => setShowSplash(false)} />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            pickup={pickup}
            dropoff={dropoff}
            route={route}
            onOpenPickupSearch={() => setSearchModalType('pickup')}
            onOpenDropoffSearch={() => setSearchModalType('dropoff')}
            onSwapLocations={handleSwapLocations}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocatingCurrent={isLocatingCurrent}
            providers={providers}
            selectedProviders={selectedProviders}
            onToggleProvider={handleToggleProvider}
            departureTime={departureTime}
            onChangeDepartureTime={setDepartureTime}
            onComparePrices={() => handleComparePrices(false)}
            isLoading={isLoadingEstimates}
            onSelectPresetRoute={handleSelectPresetRoute}
          />
        );

      case 'compare':
        return (
          <ComparisonScreen
            comparisonData={comparisonData}
            onSelectEstimate={(est) => setSelectedEstimateForDetails(est)}
            onDirectBookEstimate={(est) => setSelectedEstimateForBooking(est)}
            onRefreshPrices={() => handleComparePrices(true)}
            isRefreshing={isRefreshing}
            onEditSearch={() => setActiveTab('home')}
          />
        );

      case 'history':
        return (
          <TripHistoryScreen
            history={history}
            onSelectTripToRecompare={handleSelectTripToRecompare}
            onClearHistory={handleClearHistory}
            isLoading={isLoadingHistory}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            providers={providers}
            selectedProviders={selectedProviders}
            onToggleProvider={handleToggleProvider}
            pricingMode={pricingMode}
            onChangePricingMode={setPricingMode}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
        );

      case 'help':
        return <HelpScreen />;

      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'dark bg-neutral-950 text-neutral-100' : 'bg-slate-100 text-neutral-900'
      } flex flex-col items-center justify-start p-0 sm:p-4 md:p-6`}
    >
      {/* Mobile Wrapper Container (simulates phone container or full width responsive) */}
      <div
        className={`w-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-md sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-neutral-800 dark:sm:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-950 min-h-screen sm:min-h-[850px] relative flex flex-col'
            : 'max-w-3xl bg-white dark:bg-neutral-950 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800 min-h-screen relative flex flex-col'
        }`}
      >
        {/* Top Header */}
        {!showSplash && (
          <TopHeader
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            isMobileFrame={isMobileFrame}
            onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 overflow-y-auto">{renderScreen()}</main>

        {/* Bottom Navigation */}
        {!showSplash && (
          <BottomNav
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            hasActiveComparison={Boolean(comparisonData)}
          />
        )}

        {/* Location Search Modal */}
        <LocationSearchModal
          isOpen={Boolean(searchModalType)}
          onClose={() => setSearchModalType(null)}
          title={searchModalType === 'pickup' ? 'Choose Pickup Location' : 'Choose Drop-off Destination'}
          onSelectLocation={(loc) => {
            if (searchModalType === 'pickup') {
              setPickup(loc);
            } else {
              setDropoff(loc);
            }
          }}
          onUseCurrentLocation={searchModalType === 'pickup' ? handleUseCurrentLocation : undefined}
          isLocatingCurrent={isLocatingCurrent}
        />

        {/* Ride Details Modal */}
        <RideDetailsModal
          isOpen={Boolean(selectedEstimateForDetails)}
          onClose={() => setSelectedEstimateForDetails(null)}
          estimate={selectedEstimateForDetails}
          pickup={pickup}
          dropoff={dropoff}
          onBookRide={handleBookRide}
        />

        {/* Booking Redirect Modal */}
        <BookingRedirectModal
          isOpen={Boolean(selectedEstimateForBooking)}
          onClose={() => setSelectedEstimateForBooking(null)}
          estimate={selectedEstimateForBooking}
          pickup={pickup}
          dropoff={dropoff}
        />
      </div>
    </div>
  );
}
