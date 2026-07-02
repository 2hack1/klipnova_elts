
TRUNCATE TABLE
  public.location_logs, public.visit_history, public.daily_travel_summary,
  public.travel_sessions, public.attendance, public.notifications,
  public.employee_assignments, public.assigned_locations, public.employees,
  public.user_roles, public.profiles
RESTART IDENTITY CASCADE;

DELETE FROM auth.users;

DO $$
DECLARE
  new_id uuid := gen_random_uuid();
  rand_pw text := encode(gen_random_bytes(18), 'base64');
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated',
    'kapilagrawal230@gmail.com', crypt(rand_pw, gen_salt('bf')),
    now(), now(), now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name','Kapil Agrawal'), false
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), new_id,
    jsonb_build_object('sub', new_id::text, 'email', 'kapilagrawal230@gmail.com', 'email_verified', true),
    'email', new_id::text, now(), now(), now());

  -- handle_new_user trigger already inserted profile + 'employee' role. Promote to super_admin.
  DELETE FROM public.user_roles WHERE user_id = new_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (new_id, 'super_admin');
END $$;
