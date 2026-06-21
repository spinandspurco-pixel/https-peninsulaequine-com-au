import type { User } from "@supabase/supabase-js";

export interface HqIdentity {
  name: string;
  firstName: string;
  /** Long-form role description ("Operations & Creative") */
  role: string;
  /** Short bronze chip label ("Admin", "Client Preview") */
  tag: string;
  /** Indexed rank shown next to the masthead role marker */
  rank: string;
  /** Display identity surfaced under the badge (usually the email) */
  handle?: string;
}

type DirectoryEntry = Omit<HqIdentity, "firstName" | "handle">;

const DIRECTORY: Record<string, DirectoryEntry> = {
  // ── People ───────────────────────────────────────────
  ciro: {
    name: "Ciro Casa",
    role: "Director",
    tag: "Admin",
    rank: "01 · Director",
  },
  jordynn: {
    name: "Jordynn Oakley",
    role: "Operations & Creative",
    tag: "Admin",
    rank: "02 · Operations & Creative",
  },
  dales: {
    name: "Josh Dales",
    role: "Client Preview",
    tag: "Client Preview",
    rank: "P · Client Preview",
  },
  sander: {
    name: "Sander",
    role: "Field Operations",
    tag: "Field Ops",
    rank: "03 · Field Operations",
  },
  glenn: {
    name: "Glenn Browitt",
    role: "Horsemanship",
    tag: "Trainer",
    rank: "04 · Horsemanship",
  },

  // ── Platform display identities ──────────────────────
  // These are display-only inboxes used inside HQ. Real password resets
  // and outbound communication always route through peninsulaequine.systems.
  admin: {
    name: "Peninsula Equine",
    role: "Administrator",
    tag: "Admin",
    rank: "00 · Administrator",
  },
  preview: {
    name: "Josh Dales",
    role: "Client Preview",
    tag: "Client Preview",
    rank: "P · Client Preview",
  },
};

function titleCase(value: string): string {
  return value
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

export function resolveIdentity(
  user: User | null | undefined,
  flags: { isAdmin?: boolean; isPreview?: boolean; isEmployee?: boolean }
): HqIdentity {
  const email = user?.email ?? "";
  const local = email.split("@")[0]?.toLowerCase() ?? "";
  const key = Object.keys(DIRECTORY).find((k) => local.includes(k));

  if (key) {
    const d = DIRECTORY[key];
    // Preview flag always wins over directory tag — a directory member
    // viewing in preview mode should read as Client Preview.
    if (flags.isPreview && d.tag !== "Client Preview") {
      return {
        ...d,
        firstName: d.name.split(" ")[0],
        handle: email || undefined,
        tag: "Client Preview",
        rank: "P · Client Preview",
        role: "Client Preview",
      };
    }
    return {
      ...d,
      firstName: d.name.split(" ")[0],
      handle: email || undefined,
    };
  }

  // No directory match — derive a courteous identity, never a generic label.
  const derivedName = local ? titleCase(local) : "Peninsula Equine";
  const firstName = derivedName.split(" ")[0];

  if (flags.isPreview) {
    return {
      name: derivedName,
      firstName,
      role: "Client Preview",
      tag: "Client Preview",
      rank: "P · Client Preview",
      handle: email || undefined,
    };
  }
  if (flags.isAdmin) {
    return {
      name: derivedName,
      firstName,
      role: "Administrator",
      tag: "Admin",
      rank: "00 · Administrator",
      handle: email || undefined,
    };
  }
  if (flags.isEmployee) {
    return {
      name: derivedName,
      firstName,
      role: "Operations",
      tag: "Operations",
      rank: "Operations",
      handle: email || undefined,
    };
  }
  return {
    name: derivedName,
    firstName,
    role: "Peninsula Equine",
    tag: "Peninsula Equine",
    rank: "Peninsula Equine",
    handle: email || undefined,
  };
}
