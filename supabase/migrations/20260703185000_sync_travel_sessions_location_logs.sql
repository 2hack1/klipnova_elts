-- 1. Add missing columns to travel_sessions
ALTER TABLE public.travel_sessions
  ADD COLUMN IF NOT EXISTS travel_session_id UUID,
  ADD COLUMN IF NOT EXISTS travel_date DATE,
  ADD COLUMN IF NOT EXISTS travel_start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS travel_start_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS travel_start_longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS travel_start_address TEXT,
  ADD COLUMN IF NOT EXISTS travel_stop_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS travel_stop_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS travel_stop_longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS travel_stop_address TEXT,
  ADD COLUMN IF NOT EXISTS travel_status TEXT,
  ADD COLUMN IF NOT EXISTS session_total_km NUMERIC,
  ADD COLUMN IF NOT EXISTS session_total_duration INTEGER;

-- Create sync trigger function for travel_sessions
CREATE OR REPLACE FUNCTION public.sync_travel_sessions_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.travel_session_id := NEW.id;
  NEW.travel_date := NEW.started_at::date;
  NEW.travel_start_time := NEW.started_at;
  NEW.travel_start_latitude := NEW.start_lat;
  NEW.travel_start_longitude := NEW.start_lng;
  NEW.travel_stop_time := NEW.ended_at;
  NEW.travel_stop_latitude := NEW.end_lat;
  NEW.travel_stop_longitude := NEW.end_lng;
  NEW.travel_status := NEW.status::text;
  NEW.session_total_km := NEW.total_km;
  NEW.session_total_duration := NEW.duration_seconds;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to travel_sessions
DROP TRIGGER IF EXISTS trg_sync_travel_sessions ON public.travel_sessions;
CREATE TRIGGER trg_sync_travel_sessions
BEFORE INSERT OR UPDATE ON public.travel_sessions
FOR EACH ROW EXECUTE FUNCTION public.sync_travel_sessions_fields();

-- Update existing travel_sessions to sync fields
UPDATE public.travel_sessions SET updated_at = now();

-- 2. Add missing columns to location_logs
ALTER TABLE public.location_logs
  ADD COLUMN IF NOT EXISTS location_id UUID,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Create sync trigger function for location_logs
CREATE OR REPLACE FUNCTION public.sync_location_logs_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location_id := NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to location_logs
DROP TRIGGER IF EXISTS trg_sync_location_logs ON public.location_logs;
CREATE TRIGGER trg_sync_location_logs
BEFORE INSERT OR UPDATE ON public.location_logs
FOR EACH ROW EXECUTE FUNCTION public.sync_location_logs_fields();

-- Update existing location_logs to sync fields (trigger runs BEFORE, so simply setting id is enough)
UPDATE public.location_logs SET latitude = latitude;
