import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, randomUUID } from "node:crypto";

test(
  "production HTTP routes: public pages, enquiry lifecycle, admin access, private upload and export",
  { timeout: 90000 },
  async () => {
    const origin = "http://127.0.0.1:3100";
    const token = randomBytes(32).toString("hex");
    const child = spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "start",
        "--port",
        "3100",
        "--hostname",
        "127.0.0.1",
      ],
      {
        cwd: process.cwd(),
        windowsHide: true,
        env: {
          ...process.env,
          NODE_ENV: "production",
          ALLOW_LOCAL_DB: "true",
          DATABASE_URL: "",
          SMTP_HOST: "",
          SMTP_USER: "",
          SMTP_PASSWORD: "",
          MAIL_FROM: "",
          ADMIN_EMAIL: "",
          TURNSTILE_SECRET_KEY: "",
          NEXT_PUBLIC_SITE_URL: origin,
          ADMIN_TOKEN: token,
          RGI_DATA_DIR: mkdtempSync(join(tmpdir(), "rgi-http-")),
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let logs = "";
    child.stdout.on("data", (v) => {
      logs += v;
    });
    child.stderr.on("data", (v) => {
      logs += v;
    });
    try {
      let ready = false;
      for (let i = 0; i < 80; i++) {
        try {
          const r = await fetch(origin);
          if (r.status === 200) {
            ready = true;
            break;
          }
        } catch {}
        await new Promise((r) => setTimeout(r, 250));
      }
      assert.ok(ready, logs);
      for (const route of [
        "/",
        "/about",
        "/tour",
        "/events",
        "/fixtures",
        "/gallery",
        "/partners",
        "/sponsors",
        "/teams",
        "/robots",
        "/leaderboard",
        "/contact",
        "/collaborate?type=Competition+Sponsorship",
        "/documents/privacy",
        "/admin",
        "/sitemap.xml",
        "/robots.txt",
      ]) {
        const r = await fetch(origin + route);
        assert.equal(r.status, 200, route);
      }
      assert.equal((await fetch(origin + "/events/not-published")).status, 404);
      assert.equal((await fetch(origin + "/api/admin/requests")).status, 401);
      const id = randomUUID();
      function form() {
        const f = new FormData();
        const data = {
          type: "General Enquiry",
          contact: "Synthetic QA Applicant",
          organization: "QA Test Only",
          organizationType: "School",
          email: "qa@example.com",
          phone: "+91 9999999999",
          city: "Test City",
          state: "Test State",
          message: "Synthetic request for automated integration testing.",
          subject: "HTTP integration test",
          detailedEnquiry:
            "This is test data and is never sent to a mail service.",
          consent: "yes",
          terms: "yes",
          startedAt: String(Date.now() - 10000),
          idempotency: id,
          companyFax: "",
        };
        Object.entries(data).forEach(([k, v]) => f.set(k, v));
        f.set(
          "attachment",
          new Blob(["%PDF-1.7\nSynthetic QA document"], {
            type: "application/pdf",
          }),
          "test.pdf",
        );
        return f;
      }
      const crossSite = await fetch(origin + "/api/enquiries", {
        method: "POST",
        headers: { Origin: "https://untrusted.example" },
        body: form(),
      });
      assert.equal(crossSite.status, 403);
      const invalid = form();
      invalid.delete("consent");
      const rejected = await fetch(origin + "/api/enquiries", {
        method: "POST",
        headers: { Origin: origin },
        body: invalid,
      });
      assert.equal(rejected.status, 422);
      const first = await fetch(origin + "/api/enquiries", {
        method: "POST",
        headers: { Origin: origin },
        body: form(),
      });
      const receipt = await first.json();
      assert.equal(first.status, 201, JSON.stringify(receipt));
      assert.match(receipt.reference, /^RGI-\d{4}-[A-F0-9]{8}$/);
      assert.equal(receipt.email, "qa@example.com");
      const second = await fetch(origin + "/api/enquiries", {
        method: "POST",
        headers: { Origin: origin },
        body: form(),
      });
      assert.equal(second.status, 200);
      const duplicate = await second.json();
      assert.equal(duplicate.reference, receipt.reference);
      assert.equal(duplicate.duplicate, true);
      const auth = { Authorization: `Bearer ${token}`, Origin: origin };
      const loaded = await fetch(origin + "/api/admin/requests", {
        headers: auth,
      });
      const dashboard = await loaded.json();
      assert.equal(dashboard.requests.length, 1);
      assert.equal(dashboard.requests[0].hasAttachment, true);
      assert.equal(dashboard.outbox.length, 2);
      assert.equal(dashboard.mailConfigured, false);
      const update = await fetch(origin + "/api/admin/requests", {
        method: "PATCH",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: receipt.reference,
          status: "Under Review",
          notes: "Synthetic review completed.",
        }),
      });
      assert.equal(update.status, 200);
      const reviewed = await (
        await fetch(origin + "/api/admin/requests", { headers: auth })
      ).json();
      assert.equal(reviewed.requests[0].status, "Under Review");
      assert.equal(reviewed.requests[0].audit.length, 2);
      const csv = await fetch(origin + "/api/admin/requests?export=csv", {
        headers: auth,
      });
      assert.match(csv.headers.get("content-type") || "", /text\/csv/);
      assert.match(await csv.text(), /QA Test Only/);
      const privateFile = await fetch(
        origin + `/api/admin/attachment/${receipt.reference}`,
      );
      assert.equal(privateFile.status, 401);
      const file = await fetch(
        origin + `/api/admin/attachment/${receipt.reference}`,
        { headers: auth },
      );
      assert.equal(file.status, 200);
      assert.equal(
        file.headers.get("content-type"),
        "application/octet-stream",
      );
      assert.match(await file.text(), /%PDF-1.7/);
      const notification = await fetch(origin + "/api/admin/requests", {
        method: "POST",
        headers: auth,
      });
      assert.equal((await notification.json()).configured, false);
    } finally {
      child.kill();
      await new Promise<void>((resolve) => {
        if (child.exitCode !== null) resolve();
        else {
          child.once("exit", () => resolve());
          setTimeout(resolve, 3000).unref();
        }
      });
    }
  },
);
