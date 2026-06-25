import type { AppRole } from "@/hooks/useAuth";

/**
 * Frontend-only navigation visibility map for the HQ area.
 * Backend access (RLS) is NOT defined here — these rules only decide which
 * destinations a given role sees in the HQ navigation menu.
 */
export type HqSection = "applications" | "content" | "projects" | "clients";

/**
 * Each primary HQ section advertises a default landing route. Clicking the
 * top-level label in <HqNav /> navigates here. Routes are real and registered
 * in App.tsx — never link to a path that does not resolve.
 */
export const HQ_SECTIONS: {
  key: HqSection;
  label: string;
  defaultPath: string;
}[] = [
  { key: "applications", label: "Applications", defaultPath: "/hq" },
  { key: "content", label: "Content", defaultPath: "/hq/media" },
  { key: "projects", label: "Projects", defaultPath: "/hq/projects" },
  { key: "clients", label: "Clients", defaultPath: "/hq/clients" },
];

/** Section root paths (the section landing pages themselves). */
const SECTION_ROOTS: Record<string, HqSection> = {
  "/hq/projects": "projects",
  "/hq/clients": "clients",
};

export type HqNavItem = {
  key: string;
  label: string;
  to: string;
  /** Roles permitted to see this nav entry. */
  roles: AppRole[];
  /** Top-level sections this item appears under (contextual sub-row). */
  sections: HqSection[];
  /** Optional short description for tile views. */
  note?: string;
};

export const HQ_NAV_ITEMS: HqNavItem[] = [
  // ── Applications ──────────────────────────────────────────────────────────
  {
    key: "inquiries",
    label: "Enquiries",
    to: "/hq/inquiries",
    roles: ["admin", "employee", "preview"],
    sections: ["applications"],
    note: "Inbox · status, notes, timeline",
  },

  // ── Content ───────────────────────────────────────────────────────────────
  {
    key: "cms",
    label: "CMS",
    to: "/hq/cms",
    roles: ["admin"],
    sections: ["content"],
    note: "Unified editor · services, events, testimonials, gallery",
  },
  {
    key: "services",
    label: "Services",
    to: "/hq/services",
    roles: ["admin", "moderator", "preview"],
    sections: ["content"],
    note: "Capabilities, pricing, FAQ",
  },
  {
    key: "testimonials",
    label: "Testimonials",
    to: "/hq/testimonials",
    roles: ["admin", "moderator", "preview"],
    sections: ["content"],
    note: "Client voices and approvals",
  },
  {
    key: "events",
    label: "Events",
    to: "/hq/events",
    roles: ["admin", "moderator", "trainer", "preview"],
    sections: ["content"],
    note: "Clinics, RSVPs, capacity",
  },
  {
    key: "selected-works",
    label: "Selected Works",
    to: "/hq/selected-works",
    roles: ["admin", "moderator", "preview"],
    sections: ["content", "projects"],
    note: "Case-study chapters, scope, summary",
  },
  {
    key: "media",
    label: "Media Vault",
    to: "/hq/media",
    roles: ["admin", "moderator", "employee", "trainer", "preview"],
    sections: ["content", "projects"],
    note: "The evidence vault — approved imagery",
  },
  {
    key: "review",
    label: "Needs Review",
    to: "/hq/review",
    roles: ["admin", "moderator", "preview"],
    sections: ["content"],
    note: "Suggested knowledge-graph attachments awaiting judgement",
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  {
    key: "documents",
    label: "Documents",
    to: "/hq/documents",
    roles: ["admin", "employee", "preview"],
    sections: ["projects"],
    note: "Client packs, field notes",
  },
  {
    key: "field-notes",
    label: "Field Notes",
    to: "/hq/field-notes",
    roles: ["admin", "moderator", "employee", "trainer", "preview"],
    sections: ["projects", "content"],
    note: "Editorial dispatches from the build",
  },

  // ── Clients ───────────────────────────────────────────────────────────────
  {
    key: "staff",
    label: "Staff",
    to: "/hq/staff",
    roles: ["admin", "employee", "trainer", "moderator", "preview"],
    sections: ["clients"],
    note: "Directory and access",
  },
  {
    key: "activity",
    label: "Activity",
    to: "/hq/activity",
    roles: ["admin", "moderator", "preview"],
    sections: ["clients"],
    note: "Who did what and when — full audit timeline",
  },
  {
    key: "dns-verify",
    label: "DNS Verify",
    to: "/hq/dns-verify",
    roles: ["admin"],
    sections: ["clients"],
    note: "Google Workspace TXT verification",
  },
  {
    key: "graph-smoke",
    label: "Graph Smoke Test",
    to: "/hq/graph-smoke",
    roles: ["admin"],
    sections: ["clients"],
    note: "Run the C.1b Knowledge Graph smoke test against this environment",
  },
];

/** Items the user can reach in any section's sub-row. */
export function visibleHqItems(roles: AppRole[]): HqNavItem[] {
  if (!roles || roles.length === 0) return [];
  return HQ_NAV_ITEMS.filter((item) => item.roles.some((r) => roles.includes(r)));
}

/** Items inside a given primary section, filtered by role. */
export function visibleHqItemsForSection(
  roles: AppRole[],
  section: HqSection,
): HqNavItem[] {
  return visibleHqItems(roles).filter((item) => item.sections.includes(section));
}

/**
 * Pick the active top-level section for the current pathname.
 * Falls back to "applications" (which owns the /hq Overview).
 */
export function activeHqSection(pathname: string, roles: AppRole[]): HqSection {
  if (pathname === "/hq") return "applications";
  const items = visibleHqItems(roles);
  const match = items.find(
    (item) => pathname === item.to || pathname.startsWith(item.to + "/"),
  );
  if (match && match.sections.length > 0) return match.sections[0];
  return "applications";
}

export function canSeeHqItem(roles: AppRole[], key: string): boolean {
  const item = HQ_NAV_ITEMS.find((i) => i.key === key);
  if (!item) return false;
  return item.roles.some((r) => roles.includes(r));
}
