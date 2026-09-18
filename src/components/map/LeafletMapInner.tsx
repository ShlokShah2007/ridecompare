'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocationPoint, RouteData } from '@/lib/types';

interface LeafletMapInnerProps {
  pickup: LocationPoint | null;
  dropoff: LocationPoint | null;
  route: RouteData | null;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function LeafletMapInner({
  pickup,
  dropoff,
  route,
  className = 'h-64 w-full',
  onMapClick,
}: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center to Bengaluru (India's Silicon Valley)
    const defaultCenter: [number, number] = [12.9716, 77.5946];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
    });

    // Add CartoDB Positron clean tiles for modern Uber/Apple Maps look
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }
    ).addTo(map);

    // Reposition zoom controls to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onMapClick]);

  // Update Markers & Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Custom HTML Pin for Pickup (Green)
    const pickupIcon = L.divIcon({
      className: 'custom-pin-pickup',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 pulse-marker"></div>
          <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold">
            P
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    // Custom HTML Pin for Dropoff (Red)
    const dropoffIcon = L.divIcon({
      className: 'custom-pin-dropoff',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold">
            D
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    // Pickup Marker
    if (pickup && pickup.lat && pickup.lng) {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickup.lat, pickup.lng]);
      } else {
        pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], {
          icon: pickupIcon,
        }).addTo(map);
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    // Dropoff Marker
    if (dropoff && dropoff.lat && dropoff.lng) {
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng([dropoff.lat, dropoff.lng]);
      } else {
        dropoffMarkerRef.current = L.marker([dropoff.lat, dropoff.lng], {
          icon: dropoffIcon,
        }).addTo(map);
      }
    } else if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.remove();
      dropoffMarkerRef.current = null;
    }

    // Route Polyline
    if (route && route.polylineCoords && route.polylineCoords.length > 0) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(route.polylineCoords);
      } else {
        polylineRef.current = L.polyline(route.polylineCoords, {
          color: '#3b82f6',
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round',
        }).addTo(map);
      }
    } else if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Fit Bounds if we have both points
    if (pickup && dropoff) {
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng],
      ]);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
      });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 14, { animate: true });
    }
  }, [pickup, dropoff, route]);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
