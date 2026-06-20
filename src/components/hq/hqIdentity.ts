import type { User } from "@supabase/supabase-js";

export interface HqIdentity {
  name: string;
  firstName: string;
  role: string;
  rank: string; // short rank shown in bronze marker
}

const DIRECTORY: Record<string, Omit<HqIdentity, "firstName">> = {
  ciro: { name: "Ciro Casa", role: "Director", rank: "01 · Director" },
  jordynn: {
    name: "Jordynn Oakley",
    role: "Operations & Creative",
    rank: "02 · Operations & Creative",
  },
  josh: { name: "Josh Smith", role: "Client Preview", rank: "P · Client Preview" },
  sander: { name: "Sander", role: "Field Operations", rank: "03 · Field Operations" },
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
    return { ...d, firstName: d.name.split(" ")[0] };
  }

  const fallbackName = local ? titleCase(local) : "Operator";
  const role = flags.isPreview
    ? "Client Preview"
    : flags.isAdmin
    ? "Administrator"
    : flags.isEmployee
    ? "Operations"
    : "Operator";
  const rank = flags.isPreview ? "P · Client Preview" : flags.isAdmin ? "00 · Administrator" : role;
  return {
    name: fallbackName,
    firstName: fallbackName.split(" ")[0],
    role,
    rank,
  };
}
