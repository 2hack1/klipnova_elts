
-- Reset data
TRUNCATE TABLE
  public.notifications,
  public.daily_travel_summary,
  public.visit_history,
  public.location_logs,
  public.travel_sessions,
  public.attendance,
  public.employee_assignments,
  public.assigned_locations,
  public.employees,
  public.user_roles,
  public.profiles
RESTART IDENTITY CASCADE;
DELETE FROM auth.users;

-- Ownership / activation columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS created_by_admin uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_employees_created_by_admin ON public.employees(created_by_admin);

ALTER TABLE public.assigned_locations
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_locations_owner ON public.assigned_locations(owner_user_id);

-- Helpers (use text cast to sidestep enum commit rule)
CREATE OR REPLACE FUNCTION public.is_super_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role::text='super_admin')
$$;

CREATE OR REPLACE FUNCTION public.employee_owner_admin(_employee_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT created_by_admin FROM public.employees WHERE user_id = _employee_user_id
$$;

CREATE OR REPLACE FUNCTION public.email_exists(_email text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users WHERE lower(email)=lower(_email))
$$;
GRANT EXECUTE ON FUNCTION public.email_exists(text) TO anon, authenticated;

-- profiles policies
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.is_super_admin(auth.uid())
  OR (public.has_role(auth.uid(),'admin') AND public.employee_owner_admin(id) = auth.uid())
);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_super_admin(auth.uid()))
WITH CHECK (id = auth.uid() OR public.is_super_admin(auth.uid()));

-- user_roles policies
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "roles_select_self_or_super" ON public.user_roles;
DROP POLICY IF EXISTS "roles_super_manage" ON public.user_roles;

CREATE POLICY "roles_select" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_super_manage" ON public.user_roles FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- employees policies
DROP POLICY IF EXISTS "Admins manage employees" ON public.employees;
DROP POLICY IF EXISTS "Employees read self" ON public.employees;
DROP POLICY IF EXISTS "employees_select" ON public.employees;
DROP POLICY IF EXISTS "employees_insert" ON public.employees;
DROP POLICY IF EXISTS "employees_update" ON public.employees;
DROP POLICY IF EXISTS "employees_delete" ON public.employees;

CREATE POLICY "employees_select" ON public.employees FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_super_admin(auth.uid())
  OR (public.has_role(auth.uid(),'admin') AND created_by_admin = auth.uid())
);
CREATE POLICY "employees_insert" ON public.employees FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (public.has_role(auth.uid(),'admin') AND created_by_admin = auth.uid())
);
CREATE POLICY "employees_update" ON public.employees FOR UPDATE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (public.has_role(auth.uid(),'admin') AND created_by_admin = auth.uid())
)
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (public.has_role(auth.uid(),'admin') AND created_by_admin = auth.uid())
);
CREATE POLICY "employees_delete" ON public.employees FOR DELETE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (public.has_role(auth.uid(),'admin') AND created_by_admin = auth.uid())
);

-- assigned_locations policies
DROP POLICY IF EXISTS "Admins manage locations" ON public.assigned_locations;
DROP POLICY IF EXISTS "Authenticated read locations" ON public.assigned_locations;
DROP POLICY IF EXISTS "locations_select" ON public.assigned_locations;
DROP POLICY IF EXISTS "locations_insert" ON public.assigned_locations;
DROP POLICY IF EXISTS "locations_update" ON public.assigned_locations;
DROP POLICY IF EXISTS "locations_delete" ON public.assigned_locations;

CREATE POLICY "locations_select" ON public.assigned_locations FOR SELECT TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR created_by = auth.uid()
  OR owner_user_id = auth.uid()
  OR (public.has_role(auth.uid(),'admin') AND public.employee_owner_admin(owner_user_id) = auth.uid())
  OR (public.has_role(auth.uid(),'employee') AND public.employee_owner_admin(auth.uid()) = created_by)
);
CREATE POLICY "locations_insert" ON public.assigned_locations FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR public.has_role(auth.uid(),'admin')
  OR (public.has_role(auth.uid(),'employee') AND owner_user_id = auth.uid())
);
CREATE POLICY "locations_update" ON public.assigned_locations FOR UPDATE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR created_by = auth.uid()
  OR owner_user_id = auth.uid()
)
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR created_by = auth.uid()
  OR owner_user_id = auth.uid()
);
CREATE POLICY "locations_delete" ON public.assigned_locations FOR DELETE TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR created_by = auth.uid()
  OR owner_user_id = auth.uid()
);

-- handle_new_user: no auto-admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed default super admin
DO $seed$
DECLARE
  new_uid uuid := gen_random_uuid();
  rnd_pw text := encode(gen_random_bytes(24), 'base64');
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_uid, 'authenticated', 'authenticated',
    'kapilagrawal230@gmail.com',
    crypt(rnd_pw, gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Super Admin"}'::jsonb,
    false
  );

  DELETE FROM public.user_roles WHERE user_id = new_uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (new_uid, 'super_admin'::public.app_role);
  UPDATE public.profiles SET full_name='Super Admin' WHERE id=new_uid;
END
$seed$;
