-- 1. Enforce phone number uniqueness in profiles (allowing multiple nulls/empty strings)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique 
  ON public.profiles(phone) 
  WHERE phone IS NOT NULL AND phone != '';

-- 2. Trigger function to automatically create notifications on location assignment
CREATE OR REPLACE FUNCTION public.notify_on_location_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_location_name TEXT;
BEGIN
  -- Get the employee's user_id
  SELECT user_id INTO v_user_id FROM public.employees WHERE id = NEW.employee_id;
  
  -- Get the location name
  SELECT name INTO v_location_name FROM public.assigned_locations WHERE id = NEW.location_id;

  -- Create a notification
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (
      v_user_id,
      'New Location Assigned',
      'You have been assigned to: ' || COALESCE(v_location_name, 'a new location') || '.',
      'location_assignment',
      '/_authenticated/locations'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_notify_location_assignment ON public.employee_assignments;
CREATE TRIGGER trg_notify_location_assignment
AFTER INSERT ON public.employee_assignments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_location_assignment();
