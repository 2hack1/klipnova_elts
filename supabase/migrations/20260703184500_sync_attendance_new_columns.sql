-- Add new attendance fields if they do not exist
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS attendance_id UUID,
  ADD COLUMN IF NOT EXISTS attendance_date DATE,
  ADD COLUMN IF NOT EXISTS punch_in_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS punch_in_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS punch_in_longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS punch_in_address TEXT,
  ADD COLUMN IF NOT EXISTS punch_out_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS punch_out_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS punch_out_longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS punch_out_address TEXT,
  ADD COLUMN IF NOT EXISTS total_working_hours NUMERIC,
  ADD COLUMN IF NOT EXISTS attendance_status TEXT,
  ADD COLUMN IF NOT EXISTS remark TEXT;

-- Create trigger function to sync original fields to new fields
CREATE OR REPLACE FUNCTION public.sync_attendance_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.attendance_id := NEW.id;
  NEW.attendance_date := NEW.work_date;
  NEW.punch_in_time := NEW.punch_in_at;
  NEW.punch_in_latitude := NEW.punch_in_lat;
  NEW.punch_in_longitude := NEW.punch_in_lng;
  NEW.punch_out_time := NEW.punch_out_at;
  NEW.punch_out_latitude := NEW.punch_out_lat;
  NEW.punch_out_longitude := NEW.punch_out_lng;
  NEW.attendance_status := NEW.status::text;
  NEW.remark := NEW.notes;

  -- Calculate total working hours if punch-in and punch-out are set
  IF NEW.punch_in_at IS NOT NULL AND NEW.punch_out_at IS NOT NULL THEN
    NEW.total_working_hours := EXTRACT(EPOCH FROM (NEW.punch_out_at - NEW.punch_in_at)) / 3600.0;
  ELSE
    NEW.total_working_hours := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to attendance table
DROP TRIGGER IF EXISTS trg_sync_attendance_fields ON public.attendance;
CREATE TRIGGER trg_sync_attendance_fields
BEFORE INSERT OR UPDATE ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.sync_attendance_fields();

-- Sync existing records
UPDATE public.attendance SET updated_at = now();
