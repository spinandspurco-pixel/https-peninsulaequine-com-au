

# Lessons Booking Flow with Stripe Checkout

## Overview

Build a complete lesson booking wizard that connects real-time slot availability to Stripe Checkout for 50% deposit payments. This requires enabling Stripe (which will prompt you for your API key), creating a checkout edge function, a new database table for lesson bookings, and updating the BookLesson page with a proper multi-step wizard.

## Step 1 -- Enable Stripe

Before any code is written, we need to connect Stripe to the project. You will be prompted to enter your **Stripe restricted API key** (starts with `rk_live_` or `rk_test_`). You can get this from your Stripe Dashboard under Developers > API Keys.

This is a one-time setup that stores the key securely as a backend secret.

## Step 2 -- Database: `lesson_bookings` Table

Create a new table to track confirmed bookings tied to Stripe sessions:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Auto-generated |
| slot_id | uuid (FK -> lesson_slots) | Which slot was booked |
| client_name | text | |
| client_email | text | |
| client_phone | text (nullable) | |
| horse_name | text (nullable) | |
| experience_level | text | beginner/intermediate/advanced |
| lesson_goals | text (nullable) | |
| stripe_session_id | text | Stripe Checkout session ID |
| payment_status | text | pending / paid / failed / refunded |
| deposit_amount_cents | integer | 50% of lesson price in cents |
| full_price_cents | integer | Full lesson price in cents |
| status | text | pending / confirmed / cancelled |
| created_at | timestamptz | Default now() |

RLS: Public insert (for the edge function via service role), public select filtered by email for confirmation lookups.

Also add a trigger to increment `lesson_slots.current_bookings` when a booking is confirmed.

## Step 3 -- Edge Function: `create-lesson-checkout`

A new backend function that:

1. Receives: `slot_id`, `lesson_type`, `client_name`, `client_email`, `client_phone`, `horse_name`, `experience_level`, `lesson_goals`
2. Validates the slot still has availability (queries `lesson_slots`)
3. Calculates 50% deposit based on lesson type:
   - Foundation: $95 x 50% = $47.50 -> 4750 cents
   - Development: $120 x 50% = $60.00 -> 6000 cents
   - Performance: $150 x 50% = $75.00 -> 7500 cents
4. Creates a Stripe Checkout Session with the deposit amount
5. Inserts a `lesson_bookings` row with status "pending"
6. Returns the Stripe Checkout URL

## Step 4 -- Edge Function: `stripe-lesson-webhook`

Handles Stripe `checkout.session.completed` events:

1. Verifies the webhook signature
2. Updates `lesson_bookings.payment_status` to "paid" and `status` to "confirmed"
3. Increments `lesson_slots.current_bookings`
4. Triggers the existing `send-booking-confirmation` function to email the client

## Step 5 -- Rewrite BookLesson Page as Multi-Step Wizard

Replace the current 2-step inquiry form with a 4-step guided flow:

```text
+------------------+    +------------------+    +------------------+    +------------------+
| 1. Select Lesson | -> | 2. Pick Slot     | -> | 3. Your Details  | -> | 4. Pay Deposit   |
| (type + goals)   |    | (calendar + time)|    | (name, email...) |    | (Stripe redirect)|
+------------------+    +------------------+    +------------------+    +------------------+
```

**Step 1 - Lesson Selection**: Keep the existing program level cards (Foundation/Development/Performance) with radio selection, horse name, and goals fields.

**Step 2 - Slot Selection**: Integrate the existing `LessonAvailabilityCalendar` component inline. User picks a date, then selects a specific time slot. Only slots matching the selected lesson type (or "lesson" type) are shown.

**Step 3 - Your Details**: Name, email, phone, additional notes. Shows a summary card of selected lesson + slot + deposit amount.

**Step 4 - Review and Pay**: Summary of everything, deposit breakdown (50% of full price), then a "Pay Deposit" button that calls the edge function and redirects to Stripe Checkout.

## Step 6 -- Success/Cancel Pages

- **Success**: After Stripe payment, redirect to `/book-lesson?success=true&session_id=xxx`. Show a confirmation with next steps (same pattern as current success state but enriched with payment confirmation).
- **Cancel**: Redirect to `/book-lesson?cancelled=true`. Show a message allowing them to retry.

## Technical Details

- **Price mapping** is hardcoded in both the frontend and edge function (Foundation=$95, Development=$120, Performance=$150) to prevent tampering
- **Slot availability** is checked server-side in the edge function before creating the checkout session to prevent race conditions
- The existing `LessonAvailabilityCalendar` component will be refactored slightly to accept an `onSelectSlot` callback prop so it can be embedded in the wizard
- All existing functionality (prep checklist, FAQs, deposit policy sections) remains unchanged below the booking form
- The `InlineBookingForm` on the Lessons page will be updated to link to the new wizard flow

