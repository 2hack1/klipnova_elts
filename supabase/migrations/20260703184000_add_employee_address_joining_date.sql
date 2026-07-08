-- Add address and joining_date columns to employees table
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE;
