-- Create employee_targets table
CREATE TABLE IF NOT EXISTS public.employee_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  target_month DATE NOT NULL,
  target_money NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  target_companies INTEGER NOT NULL DEFAULT 0,
  achieved_money NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  achieved_companies INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, target_month)
);

-- Enable RLS
ALTER TABLE public.employee_targets ENABLE ROW LEVEL SECURITY;

-- Select policies
CREATE POLICY "Employees read own targets" ON public.employee_targets
  FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

CREATE POLICY "Admins read all targets" ON public.employee_targets
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Write policies (Insert, Update, Delete)
CREATE POLICY "Admins manage targets" ON public.employee_targets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_targets TO authenticated;
GRANT ALL ON public.employee_targets TO service_role;

-- Before update trigger for updated_at column
DROP TRIGGER IF EXISTS trg_employee_targets_updated ON public.employee_targets;
CREATE TRIGGER trg_employee_targets_updated 
  BEFORE UPDATE ON public.employee_targets 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
