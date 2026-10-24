import { z } from "zod";
export const enquiryTypes = [
  "Host a Campus Round",
  "Host a City or Regional Round",
  "Competition Sponsorship",
  "Brand Partnership",
  "Technology Partnership",
  "Education Partnership",
  "Venue Partnership",
  "Media Partnership",
  "Community Partnership",
  "Vendor or Equipment Partnership",
  "Institutional Collaboration",
  "General Enquiry",
] as const;
export const requestStatuses = [
  "New",
  "Under Review",
  "Contacted",
  "Meeting Scheduled",
  "Approved",
  "Declined",
  "Closed",
] as const;
export const isHosting = (type: string) => type.startsWith("Host ");
export const isSponsorship = (type: string) =>
  [
    "Competition Sponsorship",
    "Brand Partnership",
    "Technology Partnership",
    "Education Partnership",
    "Venue Partnership",
    "Media Partnership",
    "Community Partnership",
    "Vendor or Equipment Partnership",
  ].includes(type);
const optional = z.string().trim().max(2500).optional().default("");
const url = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => !v || /^https?:\/\/[^\s]+$/i.test(v),
    "Enter a complete http:// or https:// URL.",
  )
  .optional()
  .default("");
export const enquirySchema = z
  .object({
    type: z.enum(enquiryTypes),
    contact: z.string().trim().min(2, "Enter your name.").max(100),
    organization: z.string().trim().min(2, "Enter your organization.").max(180),
    organizationType: z.enum([
      "School",
      "College",
      "University",
      "Company",
      "Brand",
      "Community",
      "Other",
    ]),
    email: z
      .email("Enter a valid official email.")
      .max(254)
      .transform((v) => v.toLowerCase()),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{8,20}$/, "Enter a valid phone number.")
      .refine((v) => {
        const digits = v.replace(/\D/g, "").length;
        return digits >= 8 && digits <= 15;
      }, "Enter a phone number with 8 to 15 digits."),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    website: url,
    message: z
      .string()
      .trim()
      .min(15, "Please include at least 15 characters.")
      .max(5000),
    consent: z.literal("yes", {
      error: "Consent to be contacted is required.",
    }),
    terms: z.literal("yes", { error: "Accept the terms and privacy policy." }),
    address: optional,
    preferredDate: optional,
    students: optional,
    venue: optional,
    capacity: optional,
    facilities: optional,
    previousEvents: optional,
    category: optional,
    budget: optional,
    regions: optional,
    support: optional,
    duration: optional,
    companyWebsite: url,
    subject: optional,
    detailedEnquiry: optional,
  })
  .superRefine((v, ctx) => {
    const required = isHosting(v.type)
      ? [
          "address",
          "preferredDate",
          "students",
          "venue",
          "capacity",
          "facilities",
        ]
      : isSponsorship(v.type)
        ? [
            "category",
            "budget",
            "regions",
            "support",
            "duration",
            "companyWebsite",
          ]
        : v.type === "General Enquiry"
          ? ["subject", "detailedEnquiry"]
          : [];
    for (const field of required) {
      if (!v[field as keyof typeof v])
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "This field is required for your enquiry type.",
        });
    }
    if (isHosting(v.type)) {
      for (const field of ["students", "capacity"] as const) {
        if (
          !/^\d+$/.test(v[field]) ||
          Number(v[field]) < 1 ||
          Number(v[field]) > 100000
        )
          ctx.addIssue({
            code: "custom",
            path: [field],
            message: "Enter a number from 1 to 100,000.",
          });
      }
      if (v.preferredDate && !Number.isFinite(Date.parse(v.preferredDate)))
        ctx.addIssue({
          code: "custom",
          path: ["preferredDate"],
          message: "Enter a valid date and time.",
        });
    }
  });
export type Enquiry = z.infer<typeof enquirySchema>;
export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] || "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export function validateAttachment(
  name: string,
  type: string,
  bytes: Uint8Array,
): string | null {
  if (bytes.length > MAX_FILE_SIZE)
    return "Attachments must be 5 MB or smaller.";
  const lower = name.toLowerCase();
  const sig = Array.from(bytes.slice(0, 8));
  const pdf =
    lower.endsWith(".pdf") &&
    type === "application/pdf" &&
    String.fromCharCode(...sig.slice(0, 5)) === "%PDF-";
  const png =
    lower.endsWith(".png") &&
    type === "image/png" &&
    sig.join(",") === "137,80,78,71,13,10,26,10";
  const jpg =
    /\.jpe?g$/.test(lower) &&
    type === "image/jpeg" &&
    sig[0] === 255 &&
    sig[1] === 216 &&
    sig[2] === 255;
  return pdf || png || jpg ? null : "Upload a valid PDF, PNG or JPEG file.";
}
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
