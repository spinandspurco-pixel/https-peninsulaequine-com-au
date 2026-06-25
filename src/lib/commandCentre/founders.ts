/**
 * Founder allowlist for the HQ Command Centre.
 *
 * The Command Centre presents a role-aware view. "Founder" is not stored as
 * a role yet — by design we keep it as a small, version-controlled email
 * allowlist for C.1c. If the list grows or needs runtime mutation we'll
 * promote it to `staff_profiles.is_founder` in a later phase.
 *
 * IMPORTANT: This list is for *view personalisation only*. It never grants
 * extra permissions — every backend gate continues to use `user_roles` and
 * the `has_role()` security-definer function.
 */
export const FOUNDER_EMAIL_ALLOWLIST: ReadonlyArray<string> = [
  "ciro@peninsulaequine.com.au",
];

export function isFounderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return FOUNDER_EMAIL_ALLOWLIST.includes(email.trim().toLowerCase());
}
