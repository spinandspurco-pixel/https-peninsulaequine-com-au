-- Deactivate stale .org staff accounts. These emails are no longer valid;
-- the only valid portal accounts are info@peninsulaequine.systems (admin)
-- and josh.dales@peninsulaequine.systems (preview).
UPDATE auth.users
   SET banned_until = 'infinity'
 WHERE email IN (
   'sander@peninsulaequine.org',
   'ciro@peninsulaequine.org',
   'glenn@peninsulaequine.org'
 );

-- Belt-and-braces: ensure no roles remain attached to those accounts.
DELETE FROM public.user_roles
 WHERE user_id IN (
   SELECT id FROM auth.users
    WHERE email IN (
      'sander@peninsulaequine.org',
      'ciro@peninsulaequine.org',
      'glenn@peninsulaequine.org'
    )
 );

-- Revoke any active refresh tokens so existing sessions can't refresh.
DELETE FROM auth.refresh_tokens
 WHERE user_id IN (
   SELECT id::text FROM auth.users
    WHERE email IN (
      'sander@peninsulaequine.org',
      'ciro@peninsulaequine.org',
      'glenn@peninsulaequine.org'
    )
 );

-- Drop active sessions for the same accounts.
DELETE FROM auth.sessions
 WHERE user_id IN (
   SELECT id FROM auth.users
    WHERE email IN (
      'sander@peninsulaequine.org',
      'ciro@peninsulaequine.org',
      'glenn@peninsulaequine.org'
    )
 );