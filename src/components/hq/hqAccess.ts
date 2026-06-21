import type { AppRole } from "@/hooks/useAuth";

/**
 * Frontend-only navigation visibility map for the HQ area.
 * Backend access (RLS) is NOT defined here — these rules only decide which
 * destinations a given role sees in the HQ navigation menu.
 */
export type HqNavItem = {
  key: string;
  label: string;
  to: string;
  /** Roles permitted to see this nav entry. */
  roles: AppRole[];
  /** Optional short description for tile views. */
  note?: string;
};

export const HQ_NAV_ITEMS: HqNavItem[] = [
  {
    key: "overview",
    label: "Overview",
    to: "/hq",
    roles: ["admin", "employee", "trainer", "moderator", "preview"],
    note: "Command centre · pipeline, applications, projects",
  },
  {
    key: "services",
    label: "Services",
    to: "/hq/services",
    roles: ["admin", "moderator", "preview"],
    note: "Capabilities, pricing, FAQ",
  },
  {
    key: "testimonials",
    label: "Testimonials",
    to: "/hq/testimonials",
    roles: ["admin", "moderator", "preview"],
    note: "Client voices and approvals",
  },
  {
    key: "events",
    label: "Events",
    to: "/hq/events",
    roles: ["admin", "moderator", "trainer", "preview"],
    note: "Clinics, RSVPs, capacity",
  },
  {
    key: "selected-works",
    label: "Selected Works",
    to: "/hq/selected-works",
    roles: ["admin", "moderator", "preview"],
    note: "Case-study chapters, scope, summary",
  },
  {
    key: "field-notes",
    label: "Field Notes",
    to: "/hq/field-notes",
    roles: ["admin", "moderator", "employee", "trainer", "preview"],
    note: "Editorial dispatches from the build",
  },
  {
    key: "documents",
    label: "Documents",
    to: "/hq/documents",
    roles: ["admin", "employee", "preview"],
    note: "Client packs, field notes",
  },
  {
    key: "dns-verify",
    label: "DNS Verify",
    to: "/hq/dns-verify",
    roles: ["admin"],
    note: "Google Workspace TXT verification",
  },
];

export function visibleHqItems(roles: AppRole[]): HqNavItem[] {
  if (!roles || roles.length === 0) return [];
  return HQ_NAV_ITEMS.filter((item) => item.roles.some((r) => roles.includes(r)));
}

export function canSeeHqItem(roles: AppRole[], key: string): boolean {
  const item = HQ_NAV_ITEMS.find((i) => i.key === key);
  if (!item) return false;
  return item.roles.some((r) => roles.includes(r));
}
