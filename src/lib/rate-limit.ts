import { createHmac } from "node:crypto";
import { allowRate } from "./database";

/** A private, header-overwriting proxy is required before trusting client identity. */
export async function allowRequest(request: Request) {
  const trusted = process.env.TRUST_PROXY === "true";
  const address = trusted
    ? request.headers.get("x-rgi-client-ip") || "missing"
    : "untrusted";
  const secret = process.env.RATE_LIMIT_SECRET || process.env.ADMIN_TOKEN;
  if (
    process.env.NODE_ENV === "production" &&
    !secret &&
    process.env.ALLOW_LOCAL_DB !== "true"
  )
    throw new Error("RATE_LIMIT_SECRET is required in production.");
  const digest = createHmac("sha256", secret || "local-development-only")
    .update(address.slice(0, 128))
    .digest("hex");
  return allowRate(`form-ip:${digest}`, trusted ? 20 : 120, 600);
}
