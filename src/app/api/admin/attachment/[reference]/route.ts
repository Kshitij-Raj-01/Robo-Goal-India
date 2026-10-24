import { authorized } from "@/lib/security";
import { getDb, type Attachment } from "@/lib/database";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  if (!authorized(request))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { reference } = await params;
  const db = await getDb();
  const rows = await db.query(
    "SELECT attachment FROM requests WHERE reference=$1",
    [reference],
  );
  if (!rows[0]?.attachment)
    return Response.json({ error: "Attachment not found" }, { status: 404 });
  const file = JSON.parse(String(rows[0].attachment)) as Attachment;
  return new Response(Buffer.from(file.data, "base64"), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.name}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
