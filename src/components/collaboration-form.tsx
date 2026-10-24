"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowUpRight,
  CheckCircle2,
  Upload,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import {
  enquirySchema,
  enquiryTypes,
  isHosting,
  isSponsorship,
  fieldErrors,
  MAX_FILE_SIZE,
} from "@/lib/enquiry-schema";
type Receipt = {
  reference: string;
  type: string;
  organization: string;
  email: string;
  duplicate?: boolean;
};
export function CollaborationForm({
  initialType,
  initialSubject,
}: {
  initialType: string;
  initialSubject: string;
}) {
  const [type, setType] = useState(
    enquiryTypes.includes(initialType as (typeof enquiryTypes)[number])
      ? initialType
      : "Host a Campus Round",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [challengeReady, setChallengeReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const challengeRef = useRef<HTMLDivElement>(null);
  const idempotency = useRef("");
  const started = useRef(0);
  const widget = useRef<string | null>(null);
  const locked = useRef(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    idempotency.current = crypto.randomUUID();
    started.current = Date.now();
  }, []);
  useEffect(() => {
    if (receipt) receiptRef.current?.focus();
  }, [receipt]);
  useEffect(() => {
    if (!challengeReady || !siteKey || !challengeRef.current) return;
    const turnstile = (
      window as unknown as {
        turnstile: {
          render: (el: HTMLElement, options: Record<string, unknown>) => string;
          remove: (id: string) => void;
        };
      }
    ).turnstile;
    if (!turnstile) return;
    widget.current = turnstile.render(challengeRef.current, {
      sitekey: siteKey,
      theme: "dark",
    });
    return () => {
      if (widget.current) turnstile.remove(widget.current);
    };
  }, [challengeReady, siteKey]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked.current) return;
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("type", type);
    const parsed = enquirySchema.safeParse(Object.fromEntries(data));
    if (!parsed.success) {
      const fields = fieldErrors(parsed.error);
      setErrors(fields);
      setError("Please review the highlighted fields.");
      const name = Object.keys(fields)[0];
      (form.elements.namedItem(name) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    const file = data.get("attachment");
    if (file instanceof File && file.size > MAX_FILE_SIZE) {
      setErrors({ attachment: "Attachments must be 5 MB or smaller." });
      setError("Please choose a smaller attachment.");
      return;
    }
    if (
      file instanceof File &&
      file.size &&
      (!["application/pdf", "image/png", "image/jpeg"].includes(file.type) ||
        !/\.(pdf|png|jpe?g)$/i.test(file.name))
    ) {
      setErrors({ attachment: "Choose a PDF, PNG or JPEG file." });
      setError("This attachment type is not supported.");
      return;
    }
    locked.current = true;
    setBusy(true);
    data.set("idempotency", idempotency.current);
    data.set("startedAt", String(started.current));
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.fields || {});
        throw new Error(result.error || "Your request could not be submitted.");
      }
      setReceipt(result);
      window.dispatchEvent(
        new CustomEvent("rgi:interaction", {
          detail: { event: "enquiry_submitted", type },
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Connection interrupted. Your form details are still here. Please try again.",
      );
      const turnstile = (
        window as unknown as { turnstile?: { reset: (id: string) => void } }
      ).turnstile;
      if (widget.current) turnstile?.reset(widget.current);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  function field(
    name: string,
    label: string,
    options: {
      type?: string;
      optional?: boolean;
      placeholder?: string;
      full?: boolean;
      textarea?: boolean;
      choices?: string[];
      defaultValue?: string;
    } = {},
  ) {
    const error = errors[name];
    return (
      <div className={`form-field ${options.full ? "full" : ""}`} key={name}>
        <label htmlFor={name}>
          {label}
          {!options.optional && <span aria-hidden="true"> *</span>}
          {options.optional && <small> (optional)</small>}
        </label>
        {options.choices ? (
          <select
            name={name}
            id={name}
            required={!options.optional}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            defaultValue=""
          >
            <option value="" disabled>
              Select an option
            </option>
            {options.choices.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        ) : options.textarea ? (
          <textarea
            name={name}
            id={name}
            rows={4}
            required={!options.optional}
            maxLength={name === "message" ? 5000 : 2500}
            placeholder={options.placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            defaultValue={options.defaultValue}
          />
        ) : (
          <input
            name={name}
            id={name}
            type={options.type || "text"}
            required={!options.optional}
            maxLength={options.type === "email" ? 254 : 500}
            min={options.type === "number" ? 1 : undefined}
            max={options.type === "number" ? 100000 : undefined}
            placeholder={options.placeholder}
            defaultValue={options.defaultValue}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            autoComplete={
              (
                {
                  contact: "name",
                  organization: "organization",
                  email: "email",
                  phone: "tel",
                  city: "address-level2",
                  state: "address-level1",
                  address: "street-address",
                } as Record<string, string>
              )[name]
            }
          />
        )}{" "}
        {error && (
          <span className="field-error" id={`${name}-error`}>
            {error}
          </span>
        )}
      </div>
    );
  }
  if (receipt)
    return (
      <div className="form-success" ref={receiptRef} tabIndex={-1}>
        <CheckCircle2 size={48} />
        <span className="eyebrow">YOU’RE PART OF THE CONVERSATION</span>
        <h2>
          LET’S BUILD
          <br />
          <em>WHAT COMES NEXT.</em>
        </h2>
        <p>
          Thank you for connecting with Robo Goal India. Your request has been
          received successfully. Our team will review it and contact you using
          the details provided.
        </p>
        <dl>
          {Object.entries({
            "Reference number": receipt.reference,
            "Enquiry type": receipt.type,
            Organization: receipt.organization,
            Email: receipt.email,
          }).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {receipt.duplicate && (
          <p className="caption">
            This request was already received. The same reference number has
            been retained.
          </p>
        )}
        <Link href="/" className="button">
          Back to the Arena <ArrowUpRight size={16} />
        </Link>
      </div>
    );
  return (
    <form
      className="collaboration-form"
      ref={formRef}
      onSubmit={submit}
      noValidate
    >
      <div className="form-top">
        <span className="micro">YOUR NEXT MOVE STARTS HERE</span>
        <h2>LET’S MAKE IT HAPPEN.</h2>
        <p>
          Tell us a little about your organization and your idea. Fields marked
          * are required.
        </p>
      </div>
      <div className="form-field full">
        <label htmlFor="type">Type of collaboration or enquiry *</label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setErrors({});
            setAttachmentName("");
          }}
        >
          {enquiryTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <fieldset>
        <legend>
          <span>01</span> YOUR DETAILS
        </legend>
        <div className="form-grid">
          {field("contact", "Contact person")}
          {field("organization", "Organization or institution")}
          {field("organizationType", "Organization type", {
            choices: [
              "School",
              "College",
              "University",
              "Company",
              "Brand",
              "Community",
              "Other",
            ],
          })}
          {field("email", "Official email", {
            type: "email",
            placeholder: "you@organization.com",
          })}
          {field("phone", "Phone number", { type: "tel", placeholder: "+91" })}
          {field("city", "City")}
          {field("state", "State / Union territory")}
          {field("website", "Website or social link", {
            type: "url",
            optional: true,
            placeholder: "https://",
          })}
        </div>
      </fieldset>
      {isHosting(type) && (
        <fieldset>
          <legend>
            <span>02</span> YOUR CAMPUS. YOUR ARENA.
          </legend>
          <div className="form-grid">
            {field("address", "Complete campus address", {
              full: true,
              textarea: true,
            })}
            {field("preferredDate", "Preferred date and time (IST)", {
              type: "datetime-local",
            })}
            {field("students", "Expected students", { type: "number" })}
            {field("venue", "Venue type", {
              choices: [
                "Indoor hall",
                "Auditorium",
                "Sports arena",
                "Outdoor covered space",
                "Other",
              ],
            })}
            {field("capacity", "Venue capacity", { type: "number" })}
            {field("facilities", "Electrical and internet facilities", {
              full: true,
              textarea: true,
              placeholder:
                "Power outlets, backup power, Wi-Fi and other facilities",
            })}
            {field("previousEvents", "Previous events", {
              full: true,
              textarea: true,
              optional: true,
            })}
          </div>
        </fieldset>
      )}
      {isSponsorship(type) && (
        <fieldset>
          <legend>
            <span>02</span> YOUR PARTNERSHIP VISION
          </legend>
          <div className="form-grid">
            {field("category", "Sponsorship category", {
              choices: [
                "Title Partner",
                "Presented By",
                "Powered By",
                "Technology Partner",
                "Education Partner",
                "Venue Partner",
                "Community Partner",
                "Media Partner",
                "Equipment Partner",
                "Campus Partner",
                "Discuss with the team",
              ],
            })}
            {field("budget", "Budget range", {
              choices: [
                "Under ₹50,000",
                "₹50,000 – ₹2 lakh",
                "₹2 lakh – ₹5 lakh",
                "₹5 lakh – ₹10 lakh",
                "Above ₹10 lakh",
                "In-kind support",
                "To be discussed",
              ],
            })}
            {field("regions", "Target cities or regions")}
            {field("support", "Type of support", {
              choices: [
                "Financial sponsorship",
                "Equipment or technology",
                "Venue or logistics",
                "Media and promotion",
                "Combination",
                "Other",
              ],
            })}
            {field("duration", "Expected partnership duration", {
              choices: [
                "One event",
                "One season",
                "Multiple seasons",
                "To be discussed",
              ],
            })}
            {field("companyWebsite", "Company website", {
              type: "url",
              placeholder: "https://",
            })}
          </div>
        </fieldset>
      )}
      {type === "General Enquiry" && (
        <fieldset>
          <legend>
            <span>02</span> YOUR ENQUIRY
          </legend>
          <div className="form-grid">
            {field("subject", "Subject", {
              full: true,
              defaultValue: initialSubject,
            })}
            {field("detailedEnquiry", "Detailed enquiry", {
              full: true,
              textarea: true,
            })}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend>
          <span>03</span> THE BIGGER PICTURE
        </legend>
        <div className="form-grid">
          {field("message", "Message", {
            full: true,
            textarea: true,
            placeholder:
              "Tell us what you have in mind and how you would like to collaborate.",
          })}
          <div className="form-field full">
            <label htmlFor="attachment">
              {isHosting(type)
                ? "Institutional proposal"
                : isSponsorship(type)
                  ? "Company profile"
                  : "Attachment"}{" "}
              <small>(optional)</small>
            </label>
            <div className="upload-box">
              <Upload size={22} />
              <div>
                <strong>{attachmentName || "Add a supporting document"}</strong>
                <small>PDF, JPEG or PNG · Maximum 5 MB</small>
              </div>
              <input
                key={type}
                type="file"
                id="attachment"
                name="attachment"
                accept=".pdf,.jpg,.jpeg,.png"
                aria-describedby="attachment-help"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setAttachmentName(file?.name || "");
                  if (file && file.size > MAX_FILE_SIZE)
                    setErrors({
                      ...errors,
                      attachment: "File exceeds the 5 MB limit.",
                    });
                  else setErrors({ ...errors, attachment: "" });
                }}
              />
            </div>
            <span id="attachment-help" className="caption">
              Attachments are visible only to authorized administrators.
            </span>
            {errors.attachment && (
              <span className="field-error">{errors.attachment}</span>
            )}
          </div>
        </div>
      </fieldset>
      <div className="honeypot" aria-hidden="true">
        <label>
          Company fax
          <input name="companyFax" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="consents">
        <label>
          <input
            type="checkbox"
            name="consent"
            value="yes"
            required
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <span>
            I consent to being contacted by Robo Goal India regarding this
            enquiry. *
          </span>
        </label>
        {errors.consent && (
          <span id="consent-error" className="field-error">
            {errors.consent}
          </span>
        )}
        <label>
          <input
            type="checkbox"
            name="terms"
            value="yes"
            required
            aria-describedby={errors.terms ? "terms-error" : undefined}
          />
          <span>
            I accept the{" "}
            <Link href="/documents/terms" target="_blank">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/documents/privacy" target="_blank">
              Privacy Policy
            </Link>
            . *
          </span>
        </label>
        {errors.terms && (
          <span id="terms-error" className="field-error">
            {errors.terms}
          </span>
        )}
      </div>
      {siteKey && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            onReady={() => setChallengeReady(true)}
          />
          <div ref={challengeRef} />
        </>
      )}
      {error && (
        <div role="alert" className="form-error">
          {error}
        </div>
      )}
      <div className="form-submit">
        <button className="button" type="submit" disabled={busy}>
          {busy ? (
            <>
              <LoaderCircle size={16} className="spinner" />
              Submitting your request…
            </>
          ) : (
            <>
              Send Collaboration Request <ArrowUpRight size={17} />
            </>
          )}
        </button>
        <span>
          <ShieldCheck size={14} /> Your idea is in good hands.
        </span>
      </div>
    </form>
  );
}
