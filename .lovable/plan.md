
# Harden Newsletter Flows: Email Validation + Rate Limiting

## Current Vulnerabilities

1. **No server-side email validation** -- `send-newsletter-confirm` accepts any string as `email` and forwards it directly to Resend. A bot could pass malformed addresses or injection payloads.
2. **No rate limiting** -- The subscribe flow (FooterNewsletter) calls two endpoints (DB upsert + edge function) with zero throttling. An attacker can spam thousands of confirmation emails, burning Resend quota and potentially getting the sending domain blacklisted.
3. **Confirm URL is built client-side** -- The `confirmUrl` is constructed in the browser and sent to the edge function, meaning an attacker could inject an arbitrary URL into the confirmation email (phishing vector).
4. **`confirm-newsletter` has no rate limiting** -- Token confirmation endpoint can be brute-forced.
5. **FooterNewsletter upsert resets `confirmed` to false** -- Re-subscribing an already-confirmed email overwrites `confirmed` to `false`, which is a denial-of-service vector against existing subscribers.

## Plan

### 1. New edge function: `subscribe-newsletter` (consolidate + harden)

Replace the current two-step client flow (direct DB upsert + call `send-newsletter-confirm`) with a single hardened edge function that does everything server-side:

- **Input validation** with zod: email format, max length, trimming
- **IP-based rate limiting**: max 3 subscribe attempts per IP per 10-minute window, tracked via an in-memory Map (resets on cold start, which is acceptable for edge abuse prevention)
- **Email-based rate limiting**: check `last_email_sent_at` on the subscriber row -- refuse to resend if less than 2 minutes ago
- **Safe upsert logic**: only upsert if the email is not already confirmed (prevents resetting confirmed subscribers)
- **Build confirmUrl server-side** from `SUPABASE_URL` env var (eliminates client-side URL injection)
- **Send confirmation email** inline (absorbs `send-newsletter-confirm` logic)

### 2. Harden `confirm-newsletter`

- **Validate token format**: ensure the token param is a valid UUID before querying
- **Add IP rate limiting**: max 10 confirmation attempts per IP per 10-minute window
- **Null the token on confirmation** (already done, good)

### 3. Update `FooterNewsletter.tsx`

- Remove the direct DB upsert and the call to `send-newsletter-confirm`
- Replace with a single call to `supabase.functions.invoke("subscribe-newsletter", { body: { email } })`
- Handle rate-limit responses (429) with a user-friendly message
- Add client-side cooldown (disable button for 30s after submit)

### 4. Retire `send-newsletter-confirm` edge function

- It will be absorbed into `subscribe-newsletter`, so the old function can be deleted

---

## Technical Details

### `subscribe-newsletter` edge function

```
supabase/functions/subscribe-newsletter/index.ts
```

Key logic:
- Zod schema: `z.object({ email: z.string().trim().email().max(255) })`
- IP rate limit map: `Map<string, { count: number; resetAt: number }>` -- 3 requests per 600s
- DB check: query `newsletter_subscribers` by email
  - If confirmed: return `{ ok: true, message: "Already subscribed" }` (no email sent)
  - If exists + `last_email_sent_at` within 2 min: return 429
  - If exists + unconfirmed: regenerate `confirm_token`, update `last_email_sent_at`
  - If new: insert row
- Build `confirmUrl` from `Deno.env.get("SUPABASE_URL")` server-side
- Send email via Resend (same template as current `send-newsletter-confirm`)
- Update `last_email_sent_at` on the subscriber row

### `confirm-newsletter` changes

- Add UUID format check: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- Add IP rate limiter (same pattern, 10 per 10 min)

### `FooterNewsletter.tsx` changes

- Replace lines 28-51 (the DB upsert + edge call) with:
  ```typescript
  const { data, error } = await supabase.functions.invoke("subscribe-newsletter", {
    body: { email: parsed.data.email },
  });
  ```
- Handle 429 status in error path with "Please wait a moment before trying again"
- Add 30-second client-side cooldown after successful submit

### Migration: add index for rate-limit lookups

```sql
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email
  ON public.newsletter_subscribers (email);
```

The `last_email_sent_at` column already exists on the table, so no schema change is needed.

### Files Summary

| File | Action |
|------|--------|
| `supabase/functions/subscribe-newsletter/index.ts` | Create -- consolidated, hardened subscribe endpoint |
| `supabase/functions/confirm-newsletter/index.ts` | Edit -- add token format validation + IP rate limiting |
| `supabase/functions/send-newsletter-confirm/index.ts` | Delete -- absorbed into `subscribe-newsletter` |
| `src/components/FooterNewsletter.tsx` | Edit -- use new edge function, add cooldown |
| New migration SQL | Create -- add email index |
