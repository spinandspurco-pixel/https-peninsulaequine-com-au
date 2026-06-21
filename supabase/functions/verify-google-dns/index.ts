// Verify Google Workspace TXT record exists in the authoritative DNS zone.
// Query: GET /verify-google-dns?domain=peninsulaequine.systems&token=<google-site-verification value>
// Defaults to peninsulaequine.systems and the known PE Workspace token.

const DEFAULT_DOMAIN = "peninsulaequine.systems";
const DEFAULT_TOKEN =
  "google-site-verification=iMvRcyyPNi6aHBd0py3awRWPqS6-Yh2hXIl9y4vkKDU";

const RESOLVERS = [
  { name: "google", url: "https://dns.google/resolve" },
  { name: "cloudflare", url: "https://cloudflare-dns.com/dns-query" },
];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

async function doh(resolver: { name: string; url: string }, name: string, type: string) {
  const u = `${resolver.url}?name=${encodeURIComponent(name)}&type=${type}`;
  const r = await fetch(u, { headers: { accept: "application/dns-json" } });
  if (!r.ok) throw new Error(`${resolver.name} ${type} ${r.status}`);
  return await r.json();
}

async function queryAll(name: string, type: string) {
  const results = await Promise.all(
    RESOLVERS.map(async (r) => {
      try {
        const j = await doh(r, name, type);
        const answers = (j.Answer ?? [])
          .filter((a: any) => a.type === (type === "TXT" ? 16 : type === "NS" ? 2 : 6))
          .map((a: any) => String(a.data).replace(/^"|"$/g, ""));
        return { resolver: r.name, status: j.Status, answers };
      } catch (e) {
        return { resolver: r.name, error: (e as Error).message, answers: [] as string[] };
      }
    }),
  );
  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = new URL(req.url);
  const domain = (url.searchParams.get("domain") ?? DEFAULT_DOMAIN).toLowerCase().trim();
  const token = (url.searchParams.get("token") ?? DEFAULT_TOKEN).trim();
  const expected = token.startsWith("google-site-verification=")
    ? token
    : `google-site-verification=${token}`;

  const [nsResults, txtResults] = await Promise.all([
    queryAll(domain, "NS"),
    queryAll(domain, "TXT"),
  ]);

  const nsSet = new Set(nsResults.flatMap((r) => r.answers).map((s) => s.replace(/\.$/, "")));
  const txtSet = new Set(txtResults.flatMap((r) => r.answers));
  const found = [...txtSet].some((t) => t.includes(expected));

  const allTxt = [...txtSet];
  const googleTxts = allTxt.filter((t) => t.startsWith("google-site-verification="));

  const provider =
    [...nsSet].some((n) => n.endsWith("name.com"))
      ? "Name.com"
      : [...nsSet].some((n) => n.includes("cloudflare"))
      ? "Cloudflare"
      : [...nsSet].some((n) => n.includes("awsdns"))
      ? "AWS Route 53"
      : [...nsSet].some((n) => n.includes("ionos") || n.includes("ui-dns"))
      ? "IONOS"
      : "Unknown";

  const ready = found;
  const body = {
    ready,
    domain,
    expected,
    found,
    authoritativeNameservers: [...nsSet].sort(),
    dnsProvider: provider,
    txtRecords: allTxt,
    googleVerificationRecords: googleTxts,
    perResolver: { ns: nsResults, txt: txtResults },
    recommendation: ready
      ? "TXT record is live in the authoritative zone. You can retry Google Workspace verification now."
      : googleTxts.length === 0
      ? `No google-site-verification TXT exists on ${domain}. Add it at ${provider} (host: @, value: ${expected}, TTL: 300), wait ~5 minutes, then re-run this check.`
      : `A google-site-verification TXT exists but does not match the expected token. Confirm you copied the correct value from the Google Workspace setup screen.`,
    checkedAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: ready ? 200 : 409,
    headers: cors,
  });
});
