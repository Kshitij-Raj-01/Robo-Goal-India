"use client";
import { useState } from "react";
import { requestStatuses } from "@/lib/enquiry-schema";
import type { Enquiry } from "@/lib/enquiry-schema";
type Entry = {
  reference: string;
  created_at: string;
  status: string;
  notes: string;
  data: Enquiry;
  hasAttachment: boolean;
  audit: { at: string; action: string; actor: string }[];
};
export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [mail, setMail] = useState(false);
  const [notice, setNotice] = useState("");
  const [outbox, setOutbox] = useState<
    { reference: string; recipient: string; state: string }[]
  >([]);
  const headers = () => ({ Authorization: `Bearer ${token}` });
  async function load() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/requests", {
        headers: headers(),
        cache: "no-store",
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setEntries(data.requests);
      setOutbox(data.outbox);
      setMail(data.mailConfigured);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load requests.");
    } finally {
      setBusy(false);
    }
  }
  async function download(url: string, name: string) {
    setError("");
    try {
      const r = await fetch(url, { headers: headers() });
      if (!r.ok) throw new Error("Download failed.");
      const object = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = object;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(object), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed.");
    }
  }
  async function save() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: selected.reference,
          status: selected.status,
          notes: selected.notes,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setSelected(null);
      await load();
      setNotice("Request updated. The change is recorded in the audit trail.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }
  async function retry() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/requests", {
        method: "POST",
        headers: headers(),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setNotice(
        result.configured
          ? `${result.sent} notification(s) delivered.`
          : "SMTP is not configured. Notifications remain queued.",
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Retry failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-dashboard">
      {!loaded ? (
        <form
          className="admin-login"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <h3>ADMINISTRATOR ACCESS</h3>
          <p>
            Enter the server-configured access token. It is held in memory for
            this session only.
          </p>
          <label htmlFor="admin-token">Admin access token</label>
          <input
            id="admin-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            minLength={32}
            autoComplete="off"
          />
          <button className="button" disabled={busy}>
            {busy ? "Verifying…" : "Open Dashboard"}
          </button>
        </form>
      ) : (
        <>
          <div className="admin-toolbar">
            <button className="button secondary" onClick={load} disabled={busy}>
              Refresh
            </button>
            <button
              className="button secondary"
              onClick={() =>
                download("/api/admin/requests?export=csv", "rgi-enquiries.csv")
              }
            >
              Export CSV / Excel
            </button>
            <button
              className="button secondary"
              onClick={retry}
              disabled={busy}
            >
              Retry Queued Emails
            </button>
            <button
              className="text-link"
              onClick={() => {
                setToken("");
                setLoaded(false);
                setEntries([]);
                setSelected(null);
                setOutbox([]);
              }}
            >
              Sign out
            </button>
          </div>
          <p className="caption">
            Email delivery:{" "}
            {mail ? "Configured" : "Not configured — emails are queued"} ·
            Showing up to 1,000 most recent requests. CSV is compatible with
            Excel.
          </p>
          <div className="filter-bar">
            <label>
              Search
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Reference, organization or email"
              />
            </label>
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {["All", ...requestStatuses].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    "Reference",
                    "Organization",
                    "Type",
                    "Received",
                    "Status",
                    "Action",
                  ].map((s) => (
                    <th key={s} scope="col">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries
                  .filter(
                    (e) =>
                      (status === "All" || e.status === status) &&
                      `${e.reference} ${e.data.organization} ${e.data.email}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                  )
                  .map((e) => (
                    <tr key={e.reference}>
                      <td>{e.reference}</td>
                      <td>
                        {e.data.organization}
                        <small>{e.data.email}</small>
                      </td>
                      <td>{e.data.type}</td>
                      <td>
                        {new Date(e.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td>{e.status}</td>
                      <td>
                        <button
                          className="text-link"
                          onClick={() => setSelected(e)}
                        >
                          Review ↗
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!entries.length && (
              <p style={{ padding: 25 }}>No requests have been received.</p>
            )}
          </div>
          {selected && (
            <section className="admin-detail">
              <div className="section-head">
                <h3>{selected.reference}</h3>
                <button className="text-link" onClick={() => setSelected(null)}>
                  Close review
                </button>
              </div>
              <dl className="detail-list">
                {Object.entries(selected.data)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
              </dl>
              {selected.hasAttachment && (
                <button
                  className="button secondary"
                  onClick={() =>
                    download(
                      `/api/admin/attachment/${selected.reference}`,
                      `${selected.reference}-attachment`,
                    )
                  }
                >
                  Download Attachment
                </button>
              )}
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="request-status">Status</label>
                  <select
                    id="request-status"
                    value={selected.status}
                    onChange={(e) =>
                      setSelected({ ...selected, status: e.target.value })
                    }
                  >
                    {requestStatuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field full">
                  <label htmlFor="request-notes">Internal notes</label>
                  <textarea
                    id="request-notes"
                    rows={5}
                    maxLength={10000}
                    value={selected.notes}
                    onChange={(e) =>
                      setSelected({ ...selected, notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <button className="button" onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save Review"}
              </button>
              <h3 style={{ marginTop: 35 }}>Audit trail</h3>
              <ul className="audit-list">
                {selected.audit.map((a, i) => (
                  <li key={i}>
                    <time>{new Date(a.at).toLocaleString("en-IN")}</time>
                    <span>
                      {a.actor} · {a.action}
                    </span>
                  </li>
                ))}
              </ul>
              <h3>Email notifications</h3>
              {outbox
                .filter((o) => o.reference === selected.reference)
                .map((o) => (
                  <p key={o.recipient}>
                    {o.recipient}: {o.state}
                  </p>
                ))}
            </section>
          )}
        </>
      )}
      {notice && (
        <p role="status" className="admin-notice">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
