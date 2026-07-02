/**
 * End-to-end coverage for the public /contact inquiry form when the user
 * attaches a file. Verifies the full happy-path:
 *
 *   1. `/functions/v1/validate-inquiry-upload` returns 200 with a
 *      `path` + `id` — proves the object landed in the private
 *      `inquiry-attachments` bucket and an `inquiry_attachments` row
 *      exists (only the service-role edge function can insert those).
 *   2. `/functions/v1/submit-inquiry` returns 200 with `ok: true`, an
 *      inquiry `id`, and `received.attachment_count === 1` — proves
 *      the inquiry row persisted and the attachment metadata was
 *      linked through submit-inquiry's server-side flow.
 *   3. The UI swaps the form for the "The brief is in." confirmation.
 *
 * Runs in the `anon-desktop` Playwright project (no auth needed). No
 * service-role key required; every assertion is derived from the
 * public edge-function responses that the browser sees.
 */
import { test, expect, type Request, type Response } from "@playwright/test";

// 1×1 transparent PNG, small enough to keep this test fast.
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const PNG_BUFFER = Buffer.from(PNG_BASE64, "base64");

type UploadResponse = {
  path?: string;
  id?: string;
  size?: number;
  mime?: string;
  name?: string;
};

type SubmitResponse = {
  ok?: boolean;
  id?: string;
  received?: { attachment_count?: number };
};

test.describe("Contact inquiry submission with attachment @anon", () => {
  test("submits form + attachment, shows confirmation, persists metadata", async ({
    page,
  }) => {
    const uploadResponsePromise = page.waitForResponse(
      (r) =>
        r.url().includes("/functions/v1/validate-inquiry-upload") &&
        r.request().method() === "POST",
      { timeout: 20_000 },
    );
    const submitResponsePromise = page.waitForResponse(
      (r) =>
        r.url().includes("/functions/v1/submit-inquiry") &&
        r.request().method() === "POST",
      { timeout: 20_000 },
    );

    // Capture the outgoing submit-inquiry request body so we can assert
    // that the client actually forwarded the attachment identifiers
    // returned by the upload step (not just server-echoed count).
    let submitRequest: Request | null = null;
    page.on("request", (req) => {
      if (req.url().includes("/functions/v1/submit-inquiry") && req.method() === "POST") {
        submitRequest = req;
      }
    });

    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    const uniqueEmail = `e2e+${Date.now()}@peninsulaequine.systems`;

    await page.getByTestId("contact-name").fill("E2E Attachment Test");
    await page.getByTestId("contact-email").fill(uniqueEmail);
    await page
      .getByTestId("contact-message")
      .fill("Automated end-to-end attachment test — safe to delete.");

    // At least one scope is required by the zod schema.
    await page.getByRole("button", { name: "Arena Construction" }).click();

    // Attach the PNG directly through the hidden <input type="file">.
    await page
      .getByTestId("contact-files")
      .setInputFiles({
        name: `e2e-${Date.now()}.png`,
        mimeType: "image/png",
        buffer: PNG_BUFFER,
      });

    // Spam guard requires ≥1.5 s dwell before submit; wait a hair longer
    // to keep the test robust on slow CI runners.
    await page.waitForTimeout(1_800);

    await page.getByTestId("contact-submit").click();

    // 1. Upload edge function response.
    const uploadResponse: Response = await uploadResponsePromise;
    expect(uploadResponse.status(), "validate-inquiry-upload HTTP status").toBe(200);
    const uploadBody = (await uploadResponse.json()) as UploadResponse;
    expect(uploadBody.path, "upload path present").toBeTruthy();
    expect(uploadBody.id, "attachment row id present").toBeTruthy();
    expect(uploadBody.mime, "upload mime echoed").toBe("image/png");
    expect(uploadBody.size, "upload size echoed").toBe(PNG_BUFFER.length);

    // 2. Submit-inquiry response.
    const submitResponse: Response = await submitResponsePromise;
    expect(submitResponse.status(), "submit-inquiry HTTP status").toBe(200);
    const submitBody = (await submitResponse.json()) as SubmitResponse;
    expect(submitBody.ok, "submit-inquiry ok flag").toBe(true);
    expect(submitBody.id, "inquiry id persisted").toBeTruthy();
    expect(
      submitBody.received?.attachment_count,
      "submit-inquiry echoed attachment count",
    ).toBe(1);

    // Sanity-check that the client forwarded the uploaded identifiers.
    expect(submitRequest, "submit-inquiry request captured").not.toBeNull();
    const sentPayload = JSON.parse(submitRequest!.postData() ?? "{}") as {
      attachment_urls?: string[];
      attachment_ids?: string[];
    };
    expect(sentPayload.attachment_urls ?? [], "attachment_urls in payload").toContain(
      uploadBody.path,
    );
    expect(sentPayload.attachment_ids ?? [], "attachment_ids in payload").toContain(
      uploadBody.id,
    );

    // 3. UI confirmation swap.
    await expect(page.getByRole("heading", { name: "The brief is in." })).toBeVisible({
      timeout: 10_000,
    });
    // Form should be gone once submitted.
    await expect(page.getByTestId("contact-submit")).toHaveCount(0);
  });
});
