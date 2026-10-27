import { randomUUID, createHash } from "node:crypto";
import { after } from "next/server";
import {
  enquirySchema,
  fieldErrors,
  validateAttachment,
} from "@/lib/enquiry-schema";
import { allowRate, saveRequest, type Attachment } from "@/lib/database";
import { deliverNotifications } from "@/lib/mail";
import { boundedFormData, sameOrigin } from "@/lib/security";
import { documents } from "@/lib/content";
import { allowRequest } from "@/lib/rate-limit";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { error: "This request origin is not allowed." },
      { status: 403 },
    );
  const production =
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_LOCAL_DB !== "true";
  if (
    production &&
    (process.env.POLICIES_APPROVED !== "true" ||
      documents
        .filter((d) => ["privacy", "terms"].includes(d.slug))
        .some((d) => !d.published))
  )
    return Response.json(
      {
        error:
          "Enquiries will open when the official terms and privacy policy are published.",
      },
      { status: 503 },
    );
  try {
    if (!(await allowRequest(request)))
      return Response.json(
        { error: "Too many submissions. Please try again in 10 minutes." },
        {
          status: 429,
          headers: { "Retry-After": "600", "Cache-Control": "no-store" },
        },
      );
    const form = await boundedFormData(request);
    if (form.get("companyFax"))
      return Response.json(
        { error: "Unable to submit this request." },
        { status: 400 },
      );
    const startedAt = Number(form.get("startedAt"));
    if (
      !Number.isFinite(startedAt) ||
      Date.now() - startedAt < 2000 ||
      Date.now() - startedAt > 86400000
    )
      return Response.json(
        {
          error:
            "Please take a moment to review the form, then submit again. Reload if this form has been open for a day.",
        },
        { status: 400 },
      );
    const raw = Object.fromEntries(form.entries());
    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success)
      return Response.json(
        {
          error: "Please review the highlighted fields.",
          fields: fieldErrors(parsed.error),
        },
        { status: 422 },
      );
    const idempotency = String(form.get("idempotency") || "");
    if (!/^[0-9a-f-]{36}$/i.test(idempotency))
      return Response.json(
        { error: "Reload the form and try again." },
        { status: 400 },
      );
    if (production || process.env.TURNSTILE_SECRET_KEY) {
      if (!process.env.TURNSTILE_SECRET_KEY)
        return Response.json(
          { error: "Submission verification is not configured yet." },
          { status: 503 },
        );
      const verification = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: new URLSearchParams({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: String(form.get("cf-turnstile-response") || ""),
          }),
          signal: AbortSignal.timeout(10000),
        },
      ).then((r) => r.json());
      const expectedHost = new URL(
        process.env.NEXT_PUBLIC_SITE_URL || request.url,
      ).hostname;
      if (!verification.success || verification.hostname !== expectedHost)
        return Response.json(
          {
            error:
              "Security verification failed. Please complete the challenge again.",
          },
          { status: 400 },
        );
    }
    let attachment: Attachment | null = null;
    const file = form.get("attachment");
    if (file instanceof File && file.size) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const error = validateAttachment(file.name, file.type, bytes);
      if (error)
        return Response.json(
          { error, fields: { attachment: error } },
          { status: 422 },
        );
      attachment = {
        name: file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120),
        type: file.type,
        data: Buffer.from(bytes).toString("base64"),
      };
    }
    const rateKey = createHash("sha256")
      .update(parsed.data.email)
      .digest("hex");
    if (!(await allowRate(`form-email:${rateKey}`, 5, 3600)))
      return Response.json(
        { error: "Too many requests. Please try again in an hour." },
        { status: 429, headers: { "Retry-After": "3600" } },
      );
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(parsed.data) + JSON.stringify(attachment))
      .digest("hex");
    const reference = `RGI-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const result = await saveRequest(
      reference,
      idempotency,
      fingerprint,
      parsed.data,
      attachment,
    );
    after(async () => {
      try {
        await deliverNotifications(result.reference);
      } catch {
        console.error("Notification queue could not be processed.");
      }
    });
    return Response.json(
      {
        ...result,
        type: parsed.data.type,
        organization: parsed.data.organization,
        email: parsed.data.email,
      },
      {
        status: result.duplicate ? 200 : 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE")
      return Response.json(
        { error: "The request exceeds the 6 MB limit." },
        { status: 413 },
      );
    if (error instanceof Error && error.message === "IDEMPOTENCY_CONFLICT")
      return Response.json(
        {
          error:
            "This submission key was already used. Reload the form before submitting a different request.",
        },
        { status: 409 },
      );
    console.error(
      "Enquiry submission failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json(
      { error: "Your request could not be saved. Please try again shortly." },
      { status: 503 },
    );
  }
}
