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
  dales: { name: "Josh Dales", role: "Client Preview", rank: "P · Client Preview" },
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

  // No directory match — derive a courteous identity, never "Operator".
  const derivedName = local ? titleCase(local) : "Peninsula Equine";
  const firstName = derivedName.split(" ")[0];

  if (flags.isPreview) {
    return {
      name: derivedName,
      firstName,
      role: "Client Preview",
      rank: "P · Client Preview",
    };
  }
  if (flags.isAdmin) {
    return {
      name: derivedName,
      firstName,
      role: "Administrator",
      rank: "00 · Administrator",
    };
  }
  if (flags.isEmployee) {
    return {
      name: derivedName,
      firstName,
      role: "Operations",
      rank: "Operations",
    };
  }
  return {
    name: derivedName,
    firstName,
    role: "Peninsula Equine",
    rank: "Peninsula Equine",
  };
}

