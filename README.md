# 🚖 RideCompare — Modern Mobile-First Ride Price Comparison

> **Never overpay for a ride again.** RideCompare compares estimated fares across **Uber, Rapido, Ola, Namma Yatri, and BluSmart** in real-time for any journey, highlighting the **🟢 Lowest Available Price** strictly within each vehicle category.

---

## 🌐 Live Application Link

- **Live URL**:https://ridecompare-iota.vercel.app/ 
- **GitHub Repository**: [https://github.com/ShlokShah2007/ridecompare](https://github.com/ShlokShah2007/ridecompare)

---

## 🌟 Key Features

1. **Mobile-First Responsive Interface**:
   - Designed inspired by native iOS/Android ride-hailing apps.
   - Interactive OpenStreetMap route map with real-time pickup & drop-off pins and driving route geometry.
   - Instant geolocation ("Use Current Location") and address search autocomplete with popular metro presets.

2. **Strict Category-Based Smart Comparison**:
   - Compares like-with-like:
     - 🏍️ **Bike Taxi**: Uber Moto vs. Rapido Bike vs. Ola Bike
     - 🛺 **Auto Rickshaw**: Uber Auto vs. Rapido Auto vs. Ola Auto vs. Namma Yatri Auto
     - 🚗 **Economy Cab**: Uber Go vs. Rapido Cab vs. Ola Mini vs. Namma Yatri Non-AC vs. BluSmart EV Sedan
     - 🚘 **Premium Sedan**: Uber Premier vs. Ola Prime Sedan vs. Namma Yatri AC vs. BluSmart EV Prime
     - 🚙 **XL / SUV**: Uber XL vs. Ola Prime SUV vs. BluSmart EV XL
   - Clearly flags the **🟢 Lowest Price** option with savings amounts (e.g. *"Rapido — ₹72 (Save ₹18)"*).

3. **Pluggable Provider Adapter Architecture**:
   - Standardized `ProviderAdapter` interface for every service.
   - Built-in support for **Uber, Rapido, Ola, Namma Yatri, and BluSmart**.
   - Zero hardcoded fake prices: uses authentic OSRM turn-by-turn road distances, duration, and market rate structures.
   - Two selectable backend modes in Settings:
     - **Dynamic Live Rate Engine**: Computes fares based on real OSRM road distance, duration, time-of-day traffic, and authentic tariffs.
     - **Strict Production Mode**: Enforces official API keys; unconfigured providers gracefully display as **"Price unavailable"** without crashing.

4. **Official Deep-Link Handoff**:
   - In accordance with transport standards, RideCompare does not fake bookings inside the app.
   - Generates official native deep links (`uber://`, `rapido://`, `ola://`, `nammayatri://`) prefilled with coordinates.
   - Provides web fallback buttons if the native application is not installed.

5. **Trip History & Persistent Storage**:
   - Automatically logs comparisons and booked rides to persistent storage (`.data/history.json` and SQL schema).
   - Instant one-tap "Re-compare This Route" feature.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 14 Frontend                  │
│  (Tailwind CSS · Leaflet Maps · Lucide Icons · PWA)    │
└──────────────────────────┬─────────────────────────────┘
                           │ REST / JSON
┌──────────────────────────▼─────────────────────────────┐
│                 Next.js App Router API                 │
│         /api/estimates · /api/geocode · /api/history   │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    ┌──────────────────┐       ┌────────────────────┐
    │  OSRM Routing    │       │ Comparison Engine  │
    │  Distance / Time │       │ Normalizer & Lowest│
    └──────────────────┘       └─────────┬──────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌─────────────────┐            ┌──────────────────┐             ┌──────────────────┐
│  UberAdapter    │            │  RapidoAdapter   │             │   OlaAdapter     │
│ (Official /     │            │ (Official /      │             │  (Official /     │
│  Rate Engine)   │            │  Rate Engine)    │             │   Rate Engine)   │
└─────────────────┘            └──────────────────┘             └──────────────────┘
        ▼                                ▼                                ▼
┌─────────────────┐            ┌──────────────────┐             ┌──────────────────┐
│  NammaYatri     │            │  BluSmartAdapter │             │ Additional       │
│ (Beckn Protocol │            │ (EV Fleet /      │             │ Custom Provider  │
│  Zero Surge)    │            │  City Filter)    │             │ Adapters         │
└─────────────────┘            └──────────────────┘             └──────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **npm** or **yarn** / **pnpm**

### 2. Installation
```bash
# Navigate to project directory
cd C:\Users\SHLOK\.gemini\antigravity\scratch\ridecompare

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` to optionally add your official provider keys:
```env
# Uber Rides API
UBER_CLIENT_ID=
UBER_SERVER_TOKEN=

# Ola Cabs API
OLA_API_KEY=

# Rapido Partner API
RAPIDO_API_KEY=

# Google Maps API (Optional: OpenStreetMap OSRM works by default with no keys)
GOOGLE_MAPS_API_KEY=
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your mobile browser or desktop.

---

## 📡 API Endpoints

### `POST /api/estimates`
Returns normalized category price comparisons, road route polyline, and lowest fares.

**Request Body:**
```json
{
  "pickup": {
    "name": "Koramangala Sony World",
    "address": "80 Feet Rd, 4th Block, Koramangala, Bengaluru",
    "lat": 12.9352,
    "lng": 77.6245
  },
  "dropoff": {
    "name": "Indiranagar 100ft Road",
    "address": "100 Feet Rd, Indiranagar, Bengaluru",
    "lat": 12.9719,
    "lng": 77.6412
  },
  "selectedProviders": ["uber", "rapido", "ola", "nammayatri", "blusmart"],
  "pricingMode": "dynamic"
}
```

**Response Example:**
```json
{
  "route": {
    "distanceKm": 5.8,
    "durationMinutes": 24,
    "polylineCoords": [[12.9352, 77.6245], ...]
  },
  "comparisons": [
    {
      "category": "bike",
      "categoryTitle": "Bike Taxi",
      "lowestPriceEstimate": {
        "providerId": "rapido",
        "providerName": "Rapido",
        "vehicleName": "Rapido Bike",
        "estimatedFare": 54,
        "formattedFare": "₹54",
        "etaMinutes": 3
      },
      "maxSavingsAmount": 28,
      "estimates": [...]
    },
    {
      "category": "auto",
      "categoryTitle": "Auto Rickshaw",
      "lowestPriceEstimate": {
        "providerId": "nammayatri",
        "providerName": "Namma Yatri",
        "vehicleName": "Namma Yatri Auto",
        "estimatedFare": 90,
        "formattedFare": "₹90",
        "etaMinutes": 4
      }
    }
  ],
  "totalEstimatesFound": 16,
  "timestamp": 1726643400000,
  "expiresAt": 1726643520000
}
```

---

## 🔌 Adding a New Provider Adapter

To integrate a new provider (e.g. **InDrive**, **Mega Cabs**, or an international service):

1. Create a new file in `src/lib/providers/your-provider-adapter.ts`:
```typescript
import { BaseProviderAdapter, EstimateOptions } from './base-adapter';
import { LocationPoint, RideEstimate } from '../types';

export class InDriveAdapter extends BaseProviderAdapter {
  readonly providerId = 'indrive';
  readonly name = 'inDrive';
  readonly shortName = 'inDrive';
  readonly logo = 'https://...';
  readonly color = '#20C997';
  readonly supportedCategories = ['cab_economy', 'auto'];
  readonly description = 'Bid-your-fare mobility platform';

  async getProviderStatus() {
    return { status: 'sandbox_live', message: 'Active', hasApiKeys: false };
  }

  isServiceAvailable(pickup: LocationPoint) {
    return true;
  }

  async getRideEstimates(options: EstimateOptions): Promise<RideEstimate[]> {
    // Implement API call or dynamic calculation
  }

  getDeepLink(pickup: LocationPoint, dropoff: LocationPoint) {
    return {
      deepLink: `indrive://ride?...`,
      webUrl: `https://indrive.com`,
    };
  }
}
```

2. Register it in `src/lib/providers/registry.ts`:
```typescript
this.register(new InDriveAdapter());
```
The comparison engine, UI filters, badges, and settings toggles will automatically discover and support the new provider!

---

## 🛡️ Edge Cases Handled

- **Surge Pricing**: Peak rush hour multiplier (8-11 AM, 5-9 PM) calculated dynamically for Uber & Ola, while Namma Yatri and BluSmart maintain 0% surge guarantees.
- **Provider Out of Service Area**: BluSmart verifies service bounding coordinates (Bengaluru, Delhi-NCR, Mumbai) and reports *"Provider doesn't operate in this area"* when queried elsewhere.
- **GPS Permission Denied**: Graceful fallback with manual landmark search and preset city corridors.
- **Network / API Downtime**: OSRM network requests have a 4-second timeout and fallback seamlessly to geometric road curvature models.
- **Estimate Expiration**: Live 2-minute countdown timer with a one-tap refresh button to keep fares up to date.

---

## 📄 License & Disclaimer

RideCompare is built for educational, portfolio, and consumer transparency purposes. RideCompare is not affiliated with Uber, Rapido, Ola, Namma Yatri, or BluSmart. All trademarks belong to their respective owners.
