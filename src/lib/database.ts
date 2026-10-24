import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Enquiry } from "./enquiry-schema";
export type RequestRecord = {
  reference: string;
  idempotency: string;
  fingerprint: string;
  data: string;
  attachment: string | null;
  status: string;
  notes: string;
  audit: string;
  created_at: string;
};
export type Attachment = { name: string; type: string; data: string };
type Row = Record<string, unknown>;
type Query = (sql: string, params?: unknown[]) => Promise<Row[]>;
type DB = {
  query: Query;
  transaction: <T>(fn: (query: Query) => Promise<T>) => Promise<T>;
};
let database: Promise<DB> | undefined;
export async function getDb() {
  database ??= connect().catch((e) => {
    database = undefined;
    throw e;
  });
  return database;
}
async function connect(): Promise<DB> {
  let db: DB;
  if (process.env.DATABASE_URL) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(process.env.DATABASE_URL, {
      max: 5,
      connect_timeout: 10,
      idle_timeout: 20,
    });
    const makeQuery =
      (client: typeof sql): Query =>
      async (q, p = []) =>
        Array.from(await client.unsafe(q, p as never[])) as Row[];
    db = {
      query: makeQuery(sql),
      transaction: async (fn) =>
        (await sql.begin(
          async (tx) => await fn(makeQuery(tx as unknown as typeof sql)),
        )) as never,
    };
  } else {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_LOCAL_DB !== "true"
    )
      throw new Error("DATABASE_URL is required in production.");
    const { DatabaseSync } = await import("node:sqlite");
    const path = process.env.RGI_DATA_DIR || join(process.cwd(), "data");
    mkdirSync(path, { recursive: true });
    const sqlite = new DatabaseSync(join(path, "requests.sqlite"));
    sqlite.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
    const query: Query = async (q, p = []) => {
      const statement = sqlite.prepare(q.replace(/\$\d+/g, "?"));
      return statement.all(...(p as (string | number | null)[])) as Row[];
    };
    let chain = Promise.resolve();
    db = {
      query,
      transaction: async (fn) => {
        let unlock!: () => void;
        const before = chain;
        chain = new Promise<void>((resolve) => {
          unlock = resolve;
        });
        await before;
        sqlite.exec("BEGIN IMMEDIATE");
        try {
          const value = await fn(query);
          sqlite.exec("COMMIT");
          return value;
        } catch (e) {
          sqlite.exec("ROLLBACK");
          throw e;
        } finally {
          unlock();
        }
      },
    };
  }
  await db.query(
    "CREATE TABLE IF NOT EXISTS requests (reference TEXT PRIMARY KEY, idempotency TEXT NOT NULL UNIQUE, fingerprint TEXT NOT NULL UNIQUE, data TEXT NOT NULL, attachment TEXT, status TEXT NOT NULL, notes TEXT NOT NULL, audit TEXT NOT NULL, created_at TEXT NOT NULL)",
  );
  await db.query(
    "CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, reference TEXT NOT NULL, recipient TEXT NOT NULL, state TEXT NOT NULL, claimed_at TEXT, sent_at TEXT)",
  );
  await db.query(
    "CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL)",
  );
  return db;
}
export async function saveRequest(
  reference: string,
  idempotency: string,
  fingerprint: string,
  data: Enquiry,
  attachment: Attachment | null,
) {
  const db = await getDb();
  return db.transaction(async (query) => {
    const createdAt = new Date().toISOString();
    const audit = JSON.stringify([
      { at: createdAt, action: "Request submitted", actor: "Applicant" },
    ]);
    const rows = await query(
      "INSERT INTO requests (reference,idempotency,fingerprint,data,attachment,status,notes,audit,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING RETURNING reference",
      [
        reference,
        idempotency,
        fingerprint,
        JSON.stringify(data),
        attachment ? JSON.stringify(attachment) : null,
        "New",
        "",
        audit,
        createdAt,
      ],
    );
    if (!rows.length) {
      const existing = await query(
        "SELECT reference, fingerprint FROM requests WHERE idempotency=$1 OR fingerprint=$2",
        [idempotency, fingerprint],
      );
      if (existing[0]?.fingerprint !== fingerprint)
        throw new Error("IDEMPOTENCY_CONFLICT");
      return { reference: String(existing[0].reference), duplicate: true };
    }
    await query(
      "INSERT INTO outbox (id,reference,recipient,state) VALUES ($1,$2,$3,$4)",
      [`${reference}-applicant`, reference, "applicant", "queued"],
    );
    await query(
      "INSERT INTO outbox (id,reference,recipient,state) VALUES ($1,$2,$3,$4)",
      [`${reference}-admin`, reference, "admin", "queued"],
    );
    return { reference, duplicate: false };
  });
}
export async function allowEmail(key: string) {
  const db = await getDb();
  const rows = await db.query(
    "INSERT INTO rate_limits (key,count) VALUES ($1,1) ON CONFLICT (key) DO UPDATE SET count=rate_limits.count+1 RETURNING count",
    [key],
  );
  return Number(rows[0]?.count) <= 5;
}
