-- Drop existing locations_select policy
DROP POLICY IF EXISTS "locations_select" ON public.assigned_locations;

-- Create updated locations_select policy allowing employees to view their assigned locations
CREATE POLICY "locations_select" ON public.assigned_locations FOR SELECT TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR created_by = auth.uid()
  OR owner_user_id = auth.uid()
  OR (public.has_role(auth.uid(),'admin') AND public.employee_owner_admin(owner_user_id) = auth.uid())
  OR (public.has_role(auth.uid(),'employee') AND public.employee_owner_admin(auth.uid()) = created_by)
  OR EXISTS (
    SELECT 1 FROM public.employee_assignments ea
    JOIN public.employees e ON ea.employee_id = e.id
    WHERE ea.location_id = public.assigned_locations.id AND e.user_id = auth.uid()
  )
);
