import { getDb, type RequestRecord } from "./database";
import type { Enquiry } from "./enquiry-schema";
export async function deliverNotifications(reference?: string) {
  if (
    !process.env.SMTP_HOST ||
    !process.env.MAIL_FROM ||
    !process.env.ADMIN_EMAIL
  )
    return { configured: false, sent: 0 };
  const { default: nodemailer } = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT === "465",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
    connectionTimeout: 8000,
    socketTimeout: 10000,
  });
  const db = await getDb();
  const jobs = await db.query(
    reference
      ? "SELECT * FROM outbox WHERE reference=$1 AND state<>$2 LIMIT 20"
      : "SELECT * FROM outbox WHERE state<>$1 LIMIT 20",
    reference ? [reference, "sent"] : ["sent"],
  );
  let sent = 0;
  for (const job of jobs) {
    const now = new Date().toISOString();
    const stale = new Date(Date.now() - 120000).toISOString();
    const claimed = await db.query(
      "UPDATE outbox SET state=$1,claimed_at=$2 WHERE id=$3 AND (state=$4 OR (state=$5 AND claimed_at<$6)) RETURNING id",
      ["sending", now, job.id, "queued", "sending", stale],
    );
    if (!claimed.length) continue;
    try {
      const rows = await db.query("SELECT * FROM requests WHERE reference=$1", [
        job.reference,
      ]);
      const request = rows[0] as unknown as RequestRecord;
      const data = JSON.parse(request.data) as Enquiry;
      const applicant = job.recipient === "applicant";
      await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: applicant ? data.email : process.env.ADMIN_EMAIL,
        subject: applicant
          ? `Robo Goal India — request ${request.reference} received`
          : `New Robo Goal India request — ${request.reference}`,
        text: applicant
          ? `Thank you for connecting with Robo Goal India. Your request has been received successfully. Our team will review it and contact you using the details provided.\n\nReference: ${request.reference}\nEnquiry: ${data.type}\nOrganization: ${data.organization}\nEmail: ${data.email}`
          : `A new collaboration request is ready for review.\nReference: ${request.reference}\nEnquiry: ${data.type}\nOrganization: ${data.organization}\nReview securely in the admin dashboard.`,
        messageId: `<${job.id}@robogoalindia.com>`,
      });
      await db.query("UPDATE outbox SET state=$1,sent_at=$2 WHERE id=$3", [
        "sent",
        new Date().toISOString(),
        job.id,
      ]);
      sent++;
    } catch {
      await db.query("UPDATE outbox SET state=$1 WHERE id=$2", [
        "queued",
        job.id,
      ]);
    }
  }
  return { configured: true, sent };
}
