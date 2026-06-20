-- Sanitise demo phones across every preview-visible table.
-- Scope is strictly limited to rows that already use a demo email domain,
-- so real client records are never touched.

UPDATE public.inquiries
   SET phone = '0400 000 000'
 WHERE phone IS NOT NULL
   AND phone <> '0400 000 000'
   AND (email ILIKE '%@example.com' OR email ILIKE '%@example.org');

UPDATE public.bookings
   SET client_phone = '0400 000 000'
 WHERE client_phone IS NOT NULL
   AND client_phone <> '0400 000 000'
   AND (client_email ILIKE '%@example.com' OR client_email ILIKE '%@example.org');

UPDATE public.lesson_bookings
   SET client_phone = '0400 000 000'
 WHERE client_phone IS NOT NULL
   AND client_phone <> '0400 000 000'
   AND (client_email ILIKE '%@example.com' OR client_email ILIKE '%@example.org');

UPDATE public.site_assessments
   SET client_phone = '0400 000 000'
 WHERE client_phone IS NOT NULL
   AND client_phone <> '0400 000 000'
   AND (client_email ILIKE '%@example.com' OR client_email ILIKE '%@example.org');

UPDATE public.equus_ridge_interest
   SET phone = '0400 000 000'
 WHERE phone IS NOT NULL
   AND phone <> '0400 000 000'
   AND (email ILIKE '%@example.com' OR email ILIKE '%@example.org');

UPDATE public.event_rsvps
   SET phone = '0400 000 000'
 WHERE phone IS NOT NULL
   AND phone <> '0400 000 000'
   AND (email ILIKE '%@example.com' OR email ILIKE '%@example.org');