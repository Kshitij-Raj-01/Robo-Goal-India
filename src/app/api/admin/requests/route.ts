import { z } from "zod";
import { authorized, sameOrigin, boundedJson } from "@/lib/security";
import { getDb, type RequestRecord } from "@/lib/database";
import { csvCell, requestStatuses } from "@/lib/enquiry-schema";
import { deliverNotifications } from "@/lib/mail";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if (!authorized(request))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = await getDb();
    const rows = (await db.query(
      "SELECT * FROM requests ORDER BY created_at DESC LIMIT 1000",
    )) as unknown as RequestRecord[];
    const url = new URL(request.url);
    const list = rows.map((r) => ({
      ...r,
      data: JSON.parse(r.data),
      audit: JSON.parse(r.audit),
      hasAttachment: !!r.attachment,
      attachment: undefined,
      idempotency: undefined,
      fingerprint: undefined,
    }));
    if (url.searchParams.get("export") === "csv") {
      const fields = [
        "reference",
        "created_at",
        "status",
        "type",
        "contact",
        "organization",
        "email",
        "phone",
        "city",
        "state",
        "message",
        "organizationType",
        "website",
        "address",
        "preferredDate",
        "students",
        "venue",
        "capacity",
        "facilities",
        "previousEvents",
        "category",
        "budget",
        "regions",
        "support",
        "duration",
        "companyWebsite",
        "subject",
        "detailedEnquiry",
        "consent",
        "terms",
        "notes",
      ];
      const csv = [
        fields.map(csvCell).join(","),
        ...list.map((r) =>
          fields
            .map((k) => csvCell(k in r ? r[k as keyof typeof r] : r.data[k]))
            .join(","),
        ),
      ].join("\r\n");
      return new Response("\uFEFF" + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="rgi-enquiries.csv"',
          "Cache-Control": "no-store",
        },
      });
    }
    return Response.json(
      {
        requests: list,
        mailConfigured: !!(
          process.env.SMTP_HOST &&
          process.env.MAIL_FROM &&
          process.env.ADMIN_EMAIL
        ),
        outbox: await db.query(
          "SELECT reference,recipient,state FROM outbox ORDER BY reference",
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Database unavailable." }, { status: 503 });
  }
}
export async function PATCH(request: Request) {
  if (!authorized(request) || !sameOrigin(request))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (Number(request.headers.get("content-length") || 0) > 30000)
    return Response.json({ error: "Payload too large." }, { status: 413 });
  try {
    const schema = z.object({
      reference: z.string().max(40),
      status: z.enum(requestStatuses),
      notes: z.string().max(10000),
    });
    const body = schema.safeParse(await boundedJson(request));
    if (!body.success)
      return Response.json({ error: "Invalid update." }, { status: 422 });
    const db = await getDb();
    const result = await db.transaction(async (query) => {
      const rows = await query(
        "SELECT * FROM requests WHERE reference=$1" +
          (process.env.DATABASE_URL ? " FOR UPDATE" : ""),
        [body.data.reference],
      );
      if (!rows.length) return false;
      const old = rows[0] as unknown as RequestRecord;
      const audit = JSON.parse(old.audit);
      audit.push({
        at: new Date().toISOString(),
        action: `Status ${old.status} → ${body.data.status}${old.notes !== body.data.notes ? "; internal notes updated" : ""}`,
        actor: "Administrator",
        previousStatus: old.status,
        status: body.data.status,
        ...(old.notes !== body.data.notes
          ? { previousNotes: old.notes, notes: body.data.notes }
          : {}),
      });
      await query(
        "UPDATE requests SET status=$1,notes=$2,audit=$3 WHERE reference=$4",
        [
          body.data.status,
          body.data.notes,
          JSON.stringify(audit),
          body.data.reference,
        ],
      );
      return true;
    });
    return Response.json(
      result ? { ok: true } : { error: "Request not found." },
      { status: result ? 200 : 404 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE")
      return Response.json({ error: "Payload too large." }, { status: 413 });
    if (error instanceof Error && error.message === "INVALID_JSON")
      return Response.json({ error: "Invalid JSON." }, { status: 400 });
    return Response.json(
      { error: "Update could not be saved." },
      { status: 503 },
    );
  }
}
export async function POST(request: Request) {
  if (!authorized(request) || !sameOrigin(request))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json(await deliverNotifications());
  } catch {
    return Response.json(
      { error: "Notification delivery could not be started." },
      { status: 503 },
    );
  }
}
