import fs from 'fs';
import path from 'path';
import { TripHistoryItem } from '../types';

const DATA_DIR = path.join(process.cwd(), '.data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Default initial history with realistic popular routes in India
const INITIAL_HISTORY: TripHistoryItem[] = [
  {
    id: 'trip_blr_1',
    timestamp: Date.now() - 3600 * 1000 * 4, // 4 hours ago
    pickup: {
      name: 'Koramangala Sony World',
      address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru',
      lat: 12.9352,
      lng: 77.6245,
      city: 'Bengaluru',
    },
    dropoff: {
      name: 'Indiranagar 100ft Road',
      address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
      lat: 12.9719,
      lng: 77.6412,
      city: 'Bengaluru',
    },
    distanceKm: 5.8,
    durationMinutes: 24,
    bookedProvider: {
      id: 'rapido',
      name: 'Rapido',
      vehicleName: 'Rapido Bike',
      fare: 54,
      category: 'bike',
    },
    lowestPriceFound: 54,
    highestPriceFound: 175,
    savedAmount: 32,
  },
  {
    id: 'trip_del_2',
    timestamp: Date.now() - 3600 * 1000 * 28, // yesterday
    pickup: {
      name: 'Connaught Place Central',
      address: 'Connaught Place, New Delhi, Delhi',
      lat: 28.6315,
      lng: 77.2167,
      city: 'New Delhi',
    },
    dropoff: {
      name: 'Cyber City Gurugram',
      address: 'DLF Cyber City, DLF Phase 2, Gurugram',
      lat: 28.4986,
      lng: 77.0878,
      city: 'Gurugram',
    },
    distanceKm: 27.4,
    durationMinutes: 52,
    bookedProvider: {
      id: 'uber',
      name: 'Uber',
      vehicleName: 'Uber Go',
      fare: 485,
      category: 'cab_economy',
    },
    lowestPriceFound: 485,
    highestPriceFound: 620,
    savedAmount: 135,
  },
];

function ensureStorage(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(INITIAL_HISTORY, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Unable to write to .data directory, will use memory store:', err);
  }
}

let inMemoryHistory: TripHistoryItem[] = [...INITIAL_HISTORY];

export function getTripHistory(): TripHistoryItem[] {
  try {
    ensureStorage();
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Failed reading history file, falling back to memory:', err);
  }
  return inMemoryHistory;
}

export function saveTripHistoryItem(item: Omit<TripHistoryItem, 'id' | 'timestamp'>): TripHistoryItem {
  const newItem: TripHistoryItem = {
    ...item,
    id: `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  try {
    ensureStorage();
    const existing = getTripHistory();
    const updated = [newItem, ...existing.filter((t) => t.id !== newItem.id)].slice(0, 50); // keep last 50
    if (fs.existsSync(DATA_DIR)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    }
    inMemoryHistory = updated;
  } catch (err) {
    console.warn('Failed saving trip to file, updating memory only:', err);
    inMemoryHistory = [newItem, ...inMemoryHistory].slice(0, 50);
  }

  return newItem;
}

export function clearTripHistory(): void {
  try {
    ensureStorage();
    if (fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Failed clearing history file:', err);
  }
  inMemoryHistory = [];
}
