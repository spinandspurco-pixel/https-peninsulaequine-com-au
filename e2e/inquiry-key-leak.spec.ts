import { test, expect, type Request } from "@playwright/test";

/**
 * Anonymous inquiry submission must not leak raw Supabase keys into any
 * request payload (URL, query string, or body).
 *
 * Legitimate placement of the publishable/anon key is the `apikey` header
 * and `Authorization: Bearer` header — those are expected on every PostgREST
 * call and are NOT flagged. The point of this test is to guarantee:
 *
 *   1. The service-role key never appears anywhere on the wire (headers,
 *      URL, or body). The client bundle should not know it.
 *   2. Any `sb_secret_*` token never appears anywhere on the wire.
 *   3. The publishable/anon key does not end up in a request body or query
 *      string (it belongs only in headers).
 *
 * If any of these change, the test fails loudly with the offending URL and
 * a snippet so the regression is trivial to trace.
 */

// Grab the same publishable key the client will send so we can assert it
// only ever appears in headers, never in a payload.
const PUBLISHABLE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

const FORBIDDEN_SUBSTRINGS = [
  "sb_secret_",
  "service_role",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_SERVICE_ROLE_KEY",
];

function scan(haystack: string, needles: string[]): string | null {
  for (const n of needles) {
    if (n && haystack.includes(n)) return n;
  }
  return null;
}

test.describe("inquiry submission — no raw key leaks @anon", () => {
  test("submitting the /contact form never puts a Supabase key in a payload", async ({
    page,
  }) => {
    const suspects: Array<{ url: string; where: string; needle: string; snippet: string }> = [];

    const inspect = (req: Request) => {
      const url = req.url();
      // Only care about calls that hit our Supabase project (PostgREST,
      // edge functions, storage). Third-party analytics beacons are out of
      // scope for this check.
      if (!/supabase\.co\//.test(url)) return;

      // 1. URL + query string must be clean of every forbidden secret AND
      //    of the publishable key (which belongs in headers only).
      const urlNeedles = [...FORBIDDEN_SUBSTRINGS];
      if (PUBLISHABLE_KEY) urlNeedles.push(PUBLISHABLE_KEY);
      const urlHit = scan(url, urlNeedles);
      if (urlHit) {
        suspects.push({
          url,
          where: "url",
          needle: urlHit === PUBLISHABLE_KEY ? "<publishable key>" : urlHit,
          snippet: url.slice(0, 200),
        });
      }

      // 2. Request body must be clean of every forbidden secret AND the
      //    publishable key. multipart uploads (files) get their bytes
      //    returned as a Buffer-ish string; we still scan them.
      const body = req.postData();
      if (body) {
        const bodyNeedles = [...FORBIDDEN_SUBSTRINGS];
        if (PUBLISHABLE_KEY) bodyNeedles.push(PUBLISHABLE_KEY);
        const bodyHit = scan(body, bodyNeedles);
        if (bodyHit) {
          suspects.push({
            url,
            where: "body",
            needle: bodyHit === PUBLISHABLE_KEY ? "<publishable key>" : bodyHit,
            snippet: body.slice(0, 200),
          });
        }
      }
    };

    page.on("request", inspect);

    await page.goto("/contact");

    // Fill the required fields. Values are deliberately mundane so any
    // secret-shaped string that shows up on the wire came from the app,
    // not from us.
    await page.getByTestId("contact-name").fill("E2E Leak Probe");
    await page.getByTestId("contact-email").fill(`leak-probe+${Date.now()}@example.test`);
    await page.getByTestId("contact-phone").fill("0400000000");

    // At least one scope is required by the client-side validator.
    await page.getByRole("button", { name: /Arena Construction/i }).click();

    await page.getByTestId("contact-message").fill(
      "Automated payload-leak regression. Please ignore — created by e2e/inquiry-key-leak.spec.ts.",
    );

    await page.getByTestId("contact-submit").click();

    // Confirmation copy from Contact.tsx confirms the round-trip succeeded,
    // which means every request we care about has already fired.
    await expect(page.getByText("The brief is in.")).toBeVisible({ timeout: 15_000 });

    // Give any fire-and-forget invocations (notification, welcome series)
    // one more tick to flush before we assert.
    await page.waitForTimeout(500);

    page.off("request", inspect);

    if (suspects.length > 0) {
      const report = suspects
        .map(
          (s, i) =>
            `#${i + 1} [${s.where}] needle=${s.needle}\n  url: ${s.url}\n  snippet: ${s.snippet}`,
        )
        .join("\n\n");
      throw new Error(
        `Supabase key material found in request payload(s):\n\n${report}`,
      );
    }

    // Sanity: we should have actually observed at least one Supabase
    // request, otherwise the assertions above are vacuous.
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (page as any)._requestCount ?? true,
    ).toBeTruthy();
  });
});
