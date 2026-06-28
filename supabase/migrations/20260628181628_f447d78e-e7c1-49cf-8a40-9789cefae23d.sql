
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','employee');
CREATE TYPE public.attendance_status AS ENUM ('present','absent','on_leave','half_day');
CREATE TYPE public.travel_status AS ENUM ('active','completed','cancelled');
CREATE TYPE public.employee_status AS ENUM ('active','inactive','suspended');

-- ============ UTIL ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role)
$$;

CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ AUTO-PROVISION on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'phone');
  -- Default role: employee
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ EMPLOYEES ============
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_code TEXT NOT NULL UNIQUE,
  department TEXT,
  designation TEXT,
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.employee_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_employees_user ON public.employees(user_id);
CREATE INDEX idx_employees_status ON public.employees(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees read self" ON public.employees FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage employees" ON public.employees FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ASSIGNED LOCATIONS (master list) ============
CREATE TABLE public.assigned_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  radius_meter INTEGER NOT NULL DEFAULT 100,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assigned_locations TO authenticated;
GRANT ALL ON public.assigned_locations TO service_role;
ALTER TABLE public.assigned_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read locations" ON public.assigned_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage locations" ON public.assigned_locations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_locations_updated BEFORE UPDATE ON public.assigned_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ EMPLOYEE ASSIGNMENTS (M-N) ============
CREATE TABLE public.employee_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.assigned_locations(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, location_id, assigned_date)
);
CREATE INDEX idx_assign_emp ON public.employee_assignments(employee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_assignments TO authenticated;
GRANT ALL ON public.employee_assignments TO service_role;
ALTER TABLE public.employee_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees read own assignments" ON public.employee_assignments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage assignments" ON public.employee_assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ ATTENDANCE ============
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  punch_in_at TIMESTAMPTZ,
  punch_in_lat NUMERIC(10,7),
  punch_in_lng NUMERIC(10,7),
  punch_out_at TIMESTAMPTZ,
  punch_out_lat NUMERIC(10,7),
  punch_out_lng NUMERIC(10,7),
  status public.attendance_status NOT NULL DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, work_date)
);
CREATE INDEX idx_att_emp_date ON public.attendance(employee_id, work_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own attendance" ON public.attendance FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));
CREATE POLICY "Insert own attendance" ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));
CREATE POLICY "Update own attendance" ON public.attendance FOR UPDATE TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete attendance" ON public.attendance FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_att_updated BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TRAVEL SESSIONS ============
CREATE TABLE public.travel_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES public.attendance(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  start_lat NUMERIC(10,7),
  start_lng NUMERIC(10,7),
  end_lat NUMERIC(10,7),
  end_lng NUMERIC(10,7),
  total_km NUMERIC(10,3) DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  status public.travel_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ts_emp ON public.travel_sessions(employee_id, started_at DESC);
CREATE INDEX idx_ts_status ON public.travel_sessions(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.travel_sessions TO authenticated;
GRANT ALL ON public.travel_sessions TO service_role;
ALTER TABLE public.travel_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own travel" ON public.travel_sessions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));
CREATE POLICY "Manage own travel" ON public.travel_sessions FOR ALL TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ts_updated BEFORE UPDATE ON public.travel_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ LOCATION LOGS (GPS pings) ============
CREATE TABLE public.location_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_session_id UUID NOT NULL REFERENCES public.travel_sessions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  accuracy NUMERIC(8,2),
  speed NUMERIC(8,2),
  heading NUMERIC(6,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_loc_session ON public.location_logs(travel_session_id, recorded_at);
CREATE INDEX idx_loc_emp_time ON public.location_logs(employee_id, recorded_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.location_logs TO authenticated;
GRANT ALL ON public.location_logs TO service_role;
ALTER TABLE public.location_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own logs" ON public.location_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));
CREATE POLICY "Insert own logs" ON public.location_logs FOR INSERT TO authenticated
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

-- ============ VISIT HISTORY ============
CREATE TABLE public.visit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.assigned_locations(id) ON DELETE CASCADE,
  travel_session_id UUID REFERENCES public.travel_sessions(id) ON DELETE SET NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visit_latitude NUMERIC(10,7),
  visit_longitude NUMERIC(10,7),
  distance_meter NUMERIC(10,2),
  notes TEXT
);
CREATE INDEX idx_visit_emp ON public.visit_history(employee_id, visited_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visit_history TO authenticated;
GRANT ALL ON public.visit_history TO service_role;
ALTER TABLE public.visit_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own visits" ON public.visit_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));
CREATE POLICY "Manage own visits" ON public.visit_history FOR ALL TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- ============ DAILY TRAVEL SUMMARY ============
CREATE TABLE public.daily_travel_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_km NUMERIC(10,3) DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  last_sync_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, summary_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_travel_summary TO authenticated;
GRANT ALL ON public.daily_travel_summary TO service_role;
ALTER TABLE public.daily_travel_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own summary" ON public.daily_travel_summary FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));
CREATE POLICY "Manage own summary" ON public.daily_travel_summary FOR ALL TO authenticated
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_summary_updated BEFORE UPDATE ON public.daily_travel_summary FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin manage notifications" ON public.notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
