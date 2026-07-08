-- Update password to kapil@1234 for kapilagrawal230@gmail.com
UPDATE auth.users SET
  encrypted_password = extensions.crypt('kapil@1234', extensions.gen_salt('bf')),
  updated_at = now()
WHERE email = 'kapilagrawal230@gmail.com';
