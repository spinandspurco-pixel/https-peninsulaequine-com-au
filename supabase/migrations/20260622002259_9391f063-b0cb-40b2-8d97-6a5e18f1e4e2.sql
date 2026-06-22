-- auth.identities.email is a generated column derived from identity_data->>'email'.
-- Update identity_data only; the email column updates automatically.

UPDATE auth.users
SET email = 'info@peninsulaequine.systems',
    email_change = '',
    email_change_token_new = '',
    email_change_token_current = '',
    email_change_confirm_status = 0,
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now(),
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('email', 'info@peninsulaequine.systems', 'email_verified', true)
WHERE id = 'ba749873-d447-4fef-96ef-a85a2c6f55b6'
  AND email = 'info@peninsulaequine.org';

UPDATE auth.identities
SET identity_data = COALESCE(identity_data, '{}'::jsonb)
      || jsonb_build_object('email', 'info@peninsulaequine.systems', 'email_verified', true),
    updated_at = now()
WHERE user_id = 'ba749873-d447-4fef-96ef-a85a2c6f55b6'
  AND provider = 'email';