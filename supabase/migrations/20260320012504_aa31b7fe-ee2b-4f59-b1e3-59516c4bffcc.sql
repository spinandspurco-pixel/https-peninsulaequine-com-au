
-- Update admin user emails from .com.au to .org domain
-- Preserves user IDs, passwords, roles, and all other fields

UPDATE auth.users SET email = 'info@peninsulaequine.org', email_confirmed_at = now(), updated_at = now()
WHERE id = 'ba749873-d447-4fef-96ef-a85a2c6f55b6' AND email = 'info@peninsulaequine.com.au';

UPDATE auth.users SET email = 'sander@peninsulaequine.org', email_confirmed_at = now(), updated_at = now()
WHERE id = '54af5231-c8e1-4fdd-8676-6e551ad0afcd' AND email = 'sander@peninsulaequine.com.au';

UPDATE auth.users SET email = 'ciro@peninsulaequine.org', email_confirmed_at = now(), updated_at = now()
WHERE id = '89bb2619-5360-4e76-bc4d-4148dd72e619' AND email = 'ciro@peninsulaequine.com.au';

UPDATE auth.users SET email = 'glenn@peninsulaequine.org', email_confirmed_at = now(), updated_at = now()
WHERE id = '112863db-85b4-4803-8c2d-96bda979faa5' AND email = 'glenn@peninsulaequine.com.au';

-- Also update the raw_user_meta_data and identities email references
UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'), '{email}', to_jsonb(email))
WHERE id IN ('ba749873-d447-4fef-96ef-a85a2c6f55b6', '54af5231-c8e1-4fdd-8676-6e551ad0afcd', '89bb2619-5360-4e76-bc4d-4148dd72e619', '112863db-85b4-4803-8c2d-96bda979faa5');

UPDATE auth.identities SET identity_data = jsonb_set(COALESCE(identity_data, '{}'), '{email}', to_jsonb(u.email))
FROM auth.users u WHERE auth.identities.user_id = u.id
AND u.id IN ('ba749873-d447-4fef-96ef-a85a2c6f55b6', '54af5231-c8e1-4fdd-8676-6e551ad0afcd', '89bb2619-5360-4e76-bc4d-4148dd72e619', '112863db-85b4-4803-8c2d-96bda979faa5');
