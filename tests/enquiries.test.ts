import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  enquirySchema,
  validateAttachment,
  csvCell,
} from "../src/lib/enquiry-schema";
import { getDb, saveRequest, allowEmail } from "../src/lib/database";
import { authorized, sameOrigin, boundedFormData } from "../src/lib/security";
const valid = {
  type: "General Enquiry",
  contact: "Test Applicant",
  organization: "Test Institution",
  organizationType: "School",
  email: "TEST@example.com",
  phone: "+91 9999999999",
  city: "Test City",
  state: "Test State",
  message: "This is a test enquiry for validation only.",
  consent: "yes",
  terms: "yes",
  subject: "Testing",
  detailedEnquiry: "Testing the enquiry workflow.",
};
test("valid enquiries normalize email and reject missing consent", () => {
  assert.equal(enquirySchema.parse(valid).email, "test@example.com");
  assert.equal(
    enquirySchema.safeParse({ ...valid, consent: "" }).success,
    false,
  );
  assert.equal(
    enquirySchema.safeParse({ ...valid, email: "invalid" }).success,
    false,
  );
  assert.equal(
    enquirySchema.safeParse({ ...valid, phone: "--------" }).success,
    false,
  );
});
test("hosting and sponsorship enforce their conditional fields", () => {
  assert.equal(
    enquirySchema.safeParse({ ...valid, type: "Host a Campus Round" }).success,
    false,
  );
  assert.equal(
    enquirySchema.safeParse({ ...valid, type: "Competition Sponsorship" })
      .success,
    false,
  );
  assert.equal(
    enquirySchema.safeParse({
      ...valid,
      type: "Host a Campus Round",
      address: "Test address",
      preferredDate: "2027-01-01T10:00",
      students: "30",
      venue: "Hall",
      capacity: "50",
      facilities: "Power and internet",
    }).success,
    true,
  );
  assert.equal(
    enquirySchema.safeParse({
      ...valid,
      type: "Host a Campus Round",
      address: "Test",
      preferredDate: "no-date",
      students: "0",
      venue: "Hall",
      capacity: "999999",
      facilities: "Power",
    }).success,
    false,
  );
});
test("uploads validate signatures, size and extensions", () => {
  assert.equal(
    validateAttachment(
      "proposal.pdf",
      "application/pdf",
      Buffer.from("%PDF-1.7 test"),
    ),
    null,
  );
  assert.ok(
    validateAttachment(
      "proposal.pdf",
      "application/pdf",
      Buffer.from("<html>bad</html>"),
    ),
  );
  assert.ok(
    validateAttachment("x.svg", "image/svg+xml", Buffer.from("<svg/>")),
  );
  assert.ok(
    validateAttachment(
      "x.png",
      "image/png",
      new Uint8Array(5 * 1024 * 1024 + 1),
    ),
  );
});
test("CSV exports neutralize spreadsheet formula injection", () => {
  assert.equal(csvCell('=HYPERLINK("bad")'), '"\'=HYPERLINK(""bad"")"');
  assert.equal(csvCell("safe, text"), '"safe, text"');
  assert.equal(csvCell("  +1"), '"\'  +1"');
});
test("authentication fails closed and origin checks reject cross-site writes", () => {
  const previous = process.env.ADMIN_TOKEN;
  process.env.ADMIN_TOKEN = "x".repeat(32);
  assert.equal(
    authorized(
      new Request("http://localhost", {
        headers: { authorization: "Bearer wrong" },
      }),
    ),
    false,
  );
  assert.equal(
    authorized(
      new Request("http://localhost", {
        headers: { authorization: `Bearer ${"x".repeat(32)}` },
      }),
    ),
    true,
  );
  assert.equal(
    sameOrigin(
      new Request("http://localhost", {
        headers: { origin: "https://evil.example" },
      }),
    ),
    false,
  );
  if (previous) process.env.ADMIN_TOKEN = previous;
  else delete process.env.ADMIN_TOKEN;
});
test("request body size limit does not trust the Content-Length header", async () => {
  const request = new Request("http://localhost", {
    method: "POST",
    body: new Uint8Array(6 * 1024 * 1024 + 1),
    headers: { "content-type": "multipart/form-data; boundary=x" },
  });
  await assert.rejects(() => boundedFormData(request), /BODY_TOO_LARGE/);
});
test("durable storage prevents duplicate submissions and queues exactly two notifications", async () => {
  process.env.RGI_DATA_DIR = mkdtempSync(join(tmpdir(), "rgi-test-"));
  const data = enquirySchema.parse(valid);
  const first = await saveRequest(
    "RGI-TEST-A",
    "test-key-a",
    "fingerprint-a",
    data,
    null,
  );
  const duplicate = await saveRequest(
    "RGI-TEST-B",
    "test-key-a",
    "fingerprint-a",
    data,
    null,
  );
  assert.equal(first.duplicate, false);
  assert.equal(duplicate.reference, "RGI-TEST-A");
  assert.equal(duplicate.duplicate, true);
  await assert.rejects(
    () =>
      saveRequest("RGI-TEST-C", "test-key-a", "fingerprint-other", data, null),
    /IDEMPOTENCY_CONFLICT/,
  );
  const db = await getDb();
  assert.equal((await db.query("SELECT * FROM requests")).length, 1);
  assert.equal((await db.query("SELECT * FROM outbox")).length, 2);
  const concurrent = await Promise.all(
    [1, 2, 3].map((i) =>
      saveRequest(`RGI-CONCURRENT-${i}`, `same-key`, "same-hash", data, null),
    ),
  );
  assert.equal(new Set(concurrent.map((r) => r.reference)).size, 1);
  for (let i = 0; i < 5; i++) assert.equal(await allowEmail("rate-test"), true);
  assert.equal(await allowEmail("rate-test"), false);
});
