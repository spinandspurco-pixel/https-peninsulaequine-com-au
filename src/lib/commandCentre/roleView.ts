import type { AppRole } from "@/hooks/useAuth";
import { isFounderEmail } from "./founders";

/**
 * The Command Centre layout is identical across roles — only the *content*
 * loaded by each band changes. This module resolves the role-aware view
 * spec so the page itself stays declarative.
 */
export type CommandRole = "founder" | "operations" | "admin" | "viewer";

export type CommandWidget =
  | "morning-brief"
  | "priority-enquiries"
  | "priority-projects"
  | "priority-clients"
  | "priority-media"
  | "priority-review"
  | "activity-feed"
  | "watchlist"
  | "ops-signals"
  | "system-health";

export interface CommandView {
  role: CommandRole;
  widgets: CommandWidget[];
}

/**
 * Resolve which "view" of the Command Centre the signed-in user gets.
 *
 * Resolution order matters:
 *   1. Founder    — admin role AND email on the founder allowlist.
 *   2. Admin      — admin role, not on the founder allowlist.
 *   3. Operations — employee, trainer, or moderator role.
 *   4. Viewer     — preview role or anything else: read-only stub.
 */
export function resolveCommandRole(
  roles: AppRole[] | undefined | null,
  email: string | null | undefined,
): CommandRole {
  const list = roles ?? [];
  const isAdmin = list.includes("admin");
  if (isAdmin && isFounderEmail(email)) return "founder";
  if (isAdmin) return "admin";
  if (
    list.includes("employee") ||
    list.includes("trainer") ||
    list.includes("moderator")
  ) {
    return "operations";
  }
  return "viewer";
}

const FOUNDER_WIDGETS: CommandWidget[] = [
  "morning-brief",
  "priority-enquiries",
  "priority-projects",
  "priority-clients",
  "priority-media",
  "priority-review",
  "activity-feed",
  "watchlist",
  "ops-signals",
];

const OPERATIONS_WIDGETS: CommandWidget[] = [
  "morning-brief",
  "priority-enquiries",
  "priority-projects",
  "priority-clients",
  "priority-media",
  "priority-review",
  "activity-feed",
  "watchlist",
  "ops-signals",
];

const ADMIN_WIDGETS: CommandWidget[] = [
  ...OPERATIONS_WIDGETS,
  "system-health",
];

const VIEWER_WIDGETS: CommandWidget[] = [
  "morning-brief",
  "priority-projects",
  "priority-media",
  "activity-feed",
];

export function resolveCommandView(
  roles: AppRole[] | undefined | null,
  email: string | null | undefined,
): CommandView {
  const role = resolveCommandRole(roles, email);
  switch (role) {
    case "founder":
      return { role, widgets: FOUNDER_WIDGETS };
    case "admin":
      return { role, widgets: ADMIN_WIDGETS };
    case "operations":
      return { role, widgets: OPERATIONS_WIDGETS };
    case "viewer":
      return { role, widgets: VIEWER_WIDGETS };
  }
}

export function hasWidget(view: CommandView, widget: CommandWidget): boolean {
  return view.widgets.includes(widget);
}
