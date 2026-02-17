

# Audit HubSpot Sync: Return Generic Errors Only

## Problem

The `sync-to-hubspot` edge function currently leaks internal implementation details in its HTTP responses:

1. **Error responses include raw HubSpot API error bodies** -- lines 116, 129 throw errors containing `HubSpot update failed [status]: full_error_body`, which get returned verbatim to the caller in the catch block (line 143).
2. **Success responses expose HubSpot contact IDs** -- `hubspot_id` is returned in the JSON body (lines 121, 136). This is internal CRM data with no use to the client.
3. **"not_configured" reason is exposed** -- line 50 tells the caller the HubSpot key is missing, which is an internal infrastructure detail.

## Changes (single file)

**`supabase/functions/sync-to-hubspot/index.ts`**

1. **Keep all `console.error` / `console.log` calls** so full details remain in server logs for debugging.
2. **Sanitize error responses** -- the catch block will return a static generic message: `{ success: false, error: "Sync failed" }`. No status codes, no HubSpot error bodies.
3. **Sanitize success responses** -- remove `hubspot_id` from returned JSON. Return only `{ success: true, action: "created" | "updated" }`.
4. **Sanitize "not configured" response** -- return `{ success: false, error: "Integration not available" }` instead of `reason: "not_configured"`.
5. **Sanitize inner error throws** -- lines 116 and 129 currently throw with the raw HubSpot body. Change these to log the full error first, then throw a generic message so the catch block stays clean.

No other files need changes -- this function is only called by the `notify_hubspot_on_inquiry` database trigger (server-side), but the endpoint is still reachable via HTTP, so sanitizing responses is the right call.

