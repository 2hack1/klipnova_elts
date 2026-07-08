
UPDATE auth.users SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE email = 'kapilagrawal230@gmail.com';

-- Reset password to the one the user expects
UPDATE auth.users SET
  encrypted_password = extensions.crypt('kapil9753072725', extensions.gen_salt('bf')),
  updated_at = now()
WHERE email = 'kapilagrawal230@gmail.com';
