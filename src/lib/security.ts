import { timingSafeEqual } from "node:crypto";
export function authorized(request: Request) {
  const expected = process.env.ADMIN_TOKEN;
  const actual =
    request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
  if (!expected || expected.length < 32) return false;
  const a = Buffer.from(actual),
    b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url)
    .origin;
  return (
    origin === allowed ||
    (process.env.NODE_ENV !== "production" &&
      origin === new URL(request.url).origin)
  );
}
export async function boundedFormData(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("EMPTY_BODY");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 6 * 1024 * 1024) {
      await reader.cancel();
      throw new Error("BODY_TOO_LARGE");
    }
    chunks.push(value);
  }
  return new Response(Buffer.concat(chunks), {
    headers: { "content-type": request.headers.get("content-type") || "" },
  }).formData();
}
export async function boundedJson(request: Request, limit = 30000) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("INVALID_JSON");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > limit) {
      await reader.cancel();
      throw new Error("BODY_TOO_LARGE");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new Error("INVALID_JSON");
  }
}
