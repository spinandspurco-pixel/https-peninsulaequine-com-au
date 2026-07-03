# HQ Login Authentication Guide

## Overview

The HQ staff login page now supports **three authentication methods**:

1. **Password Authentication** (Sign In tab)
2. **Magic Link / OTP** (Link tab) - New fallback method
3. **Password Reset** (Reset tab)
4. **Google OAuth** (always available)

## Authentication Methods

### Method 1: Password Authentication
- Traditional username/password login
- If disabled on Supabase project, use Magic Link instead
- **Tab:** "Password"

### Method 2: Magic Link (OTP)
- Passwordless authentication via secure email link
- **Recommended** if password auth is disabled on Supabase
- Two-step process:
  1. Enter email → system sends verification code
  2. Enter 6-digit code from email → automatic login
- **Tab:** "Link"
- Works even if password authentication is disabled on the Supabase project

### Method 3: Password Reset
- For users who forgot their password
- Sends password reset link via email
- **Tab:** "Reset"

### Method 4: Google OAuth
- Always available as fallback
- Single-click Google account sign-in
- Uses Supabase OAuth integration

## If Password Authentication is Disabled

**Error Message:** "Legacy API error" or similar

**Solution:** Use the **"Link"** tab (Magic Link/OTP authentication)

1. Click the **"Link"** tab
2. Enter your email address
3. Click "Send Login Link"
4. Check your email for the 6-digit verification code
5. Enter the code in the form
6. You'll be logged in automatically

## User Flow Diagram

```
┌─────────────────────────────────────┐
│      HQ Login Page                  │
├─────────────────────────────────────┤
│ [Password]  [Link]  [Sign Up] [Reset]│
│                                     │
│  Password Disabled?                 │
│  ↓                                  │
│  Try [Link] Tab Instead             │
│  ↓                                  │
│  Enter Email                        │
│  ↓                                  │
│  Receive Code in Email              │
│  ↓                                  │
│  Enter 6-digit Code                 │
│  ↓                                  │
│  ✓ Logged In → HQ Dashboard         │
└─────────────────────────────────────┘
```

## Implementation Details

### Backend Requirements

Supabase project must have at **one** of these enabled:

- ✅ Email/Password authentication (`signInWithPassword`)
- ✅ Email OTP authentication (`signInWithOtp`)
- ✅ Google OAuth (`signInWithOAuth` provider: "google")

### Code Location

- **File:** `src/pages/hq/login.tsx`
- **Handlers:**
  - `handleSignIn` - Password login
  - `handleSendOTP` - Send magic link
  - `handleVerifyOTP` - Verify 6-digit code
  - `handleForgotPassword` - Reset password
  - `handleGoogleSignIn` - Google OAuth

### Email Configuration

Ensure Supabase is configured with:
- Valid SMTP credentials for email delivery
- Email templates for:
  - OTP verification codes
  - Password reset links
  - Confirmation emails (for sign-up)

## Troubleshooting

### Problem: "Legacy API disabled" or similar error

**Cause:** Supabase project has disabled password authentication

**Solution:** Use the "Link" tab for magic link authentication

### Problem: Not receiving verification code

**Cause:** Email not configured or in spam folder

**Solution:**
1. Check spam/junk folder
2. Verify Supabase SMTP is configured
3. Try again in 5 minutes
4. Contact admin if issue persists

### Problem: Code expired

**Cause:** OTP codes typically expire after 15 minutes

**Solution:** Request a new code by entering your email again

### Problem: Wrong code message

**Cause:** Entered incorrect 6-digit code

**Solution:** Check the email again and re-enter the code carefully

## Security Notes

- OTP codes are one-time use and expire after ~15 minutes
- Magic links contain secure tokens and redirect to `/hq/auth/callback`
- All authentication requests are logged for audit purposes
- Passwords are never stored in plain text (bcrypt hashing)
- HTTPS required for all authentication flows

## Staff Access Control

After successful authentication:
- User roles are fetched from the database via Supabase RLS policies
- Only users with staff roles (admin, employee, trainer, moderator) can access HQ
- Preview role can access read-only HQ surfaces
- Row-level security enforced at database level

## Related Documentation

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **OTP Guide:** https://supabase.com/docs/guides/auth/otp
- **Google OAuth:** https://supabase.com/docs/guides/auth/social-login/auth-google

---

**Last Updated:** July 3, 2026  
**Commit:** a5bbed97 (Add OTP/magic link authentication to HQ login as fallback)
