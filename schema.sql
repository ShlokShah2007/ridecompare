-- ==============================================================================
-- RideCompare Database Schema
-- Compatible with PostgreSQL, SQLite, and MySQL
-- ==============================================================================

-- 1. Users table (for basic authentication / profile persistence)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Preferences (Selected providers, pricing engine mode, dark mode)
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    enabled_providers TEXT[] DEFAULT ARRAY['uber', 'rapido', 'ola', 'nammayatri', 'blusmart'],
    pricing_mode VARCHAR(20) DEFAULT 'dynamic' CHECK (pricing_mode IN ('dynamic', 'strict')),
    preferred_currency VARCHAR(10) DEFAULT 'INR',
    preferred_category VARCHAR(30) DEFAULT 'all',
    dark_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Providers registry & status cache
CREATE TABLE IF NOT EXISTS providers (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    logo_url TEXT,
    badge_color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    api_status VARCHAR(30) DEFAULT 'sandbox_live',
    status_message TEXT,
    supported_categories TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Trip Comparisons & Search Audit Log
CREATE TABLE IF NOT EXISTS trip_searches (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    pickup_address TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_lat DOUBLE PRECISION NOT NULL,
    dropoff_lng DOUBLE PRECISION NOT NULL,
    road_distance_km DECIMAL(6, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    cheapest_overall_fare DECIMAL(8, 2),
    cheapest_overall_provider VARCHAR(32),
    cheapest_overall_category VARCHAR(30),
    searched_providers TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Individual Category Estimates Snapshot
CREATE TABLE IF NOT EXISTS ride_estimates_snapshot (
    id VARCHAR(64) PRIMARY KEY,
    search_id VARCHAR(64) NOT NULL REFERENCES trip_searches(id) ON DELETE CASCADE,
    provider_id VARCHAR(32) NOT NULL,
    ride_type VARCHAR(64) NOT NULL,
    vehicle_name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    estimated_fare DECIMAL(8, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    base_fare DECIMAL(8, 2) NOT NULL,
    distance_fare DECIMAL(8, 2) NOT NULL,
    time_fare DECIMAL(8, 2) NOT NULL,
    surge_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    surge_fare DECIMAL(8, 2) DEFAULT 0.0,
    taxes_and_fees DECIMAL(8, 2) NOT NULL,
    eta_minutes INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    is_lowest_in_category BOOLEAN DEFAULT FALSE,
    deep_link TEXT,
    booking_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Booked Trips / Redirect Audit (Stores user actions when clicking 'Book Ride')
CREATE TABLE IF NOT EXISTS booked_trips (
    id VARCHAR(64) PRIMARY KEY,
    search_id VARCHAR(64) REFERENCES trip_searches(id) ON DELETE SET NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    provider_id VARCHAR(32) NOT NULL,
    vehicle_name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    fare_amount DECIMAL(8, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    savings_amount DECIMAL(8, 2) DEFAULT 0.0,
    pickup_lat DOUBLE PRECISION NOT NULL,
    pickup_lng DOUBLE PRECISION NOT NULL,
    pickup_address TEXT NOT NULL,
    dropoff_lat DOUBLE PRECISION NOT NULL,
    dropoff_lng DOUBLE PRECISION NOT NULL,
    dropoff_address TEXT NOT NULL,
    redirect_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_trip_searches_user ON trip_searches(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimates_search ON ride_estimates_snapshot(search_id);
CREATE INDEX IF NOT EXISTS idx_booked_trips_user ON booked_trips(user_id, redirect_timestamp DESC);
