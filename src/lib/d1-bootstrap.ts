import "server-only";

import { SEED_STATEMENTS } from "./d1-seed-sql";
import type { D1Database } from "./d1";

/**
 * D1 is created empty for a new environment, and the platform does not expose
 * arbitrary SQL to the deployer, so the schema and demo dataset are applied by
 * the Worker itself on first use. Every statement is idempotent, which makes a
 * race between two cold isolates harmless.
 */

const SEED_VERSION = "plum-guide-v1";
const BATCH_SIZE = 80;

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'GUEST',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "host_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "nightly_rate" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "plum_score" REAL,
    "image_url" TEXT NOT NULL,
    "tagline" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "bedrooms" INTEGER NOT NULL DEFAULT 1,
    "bathrooms" INTEGER NOT NULL DEFAULT 1,
    "max_guests" INTEGER NOT NULL DEFAULT 2,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "properties_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "inspection_slots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "specialist_id" TEXT NOT NULL,
    "property_id" TEXT,
    "slot_datetime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "report_notes" TEXT,
    "score" REAL,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inspection_slots_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inspection_slots_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "availability_calendars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "property_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "custom_price" DECIMAL,
    CONSTRAINT "availability_calendars_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "check_in" DATETIME NOT NULL,
    "check_out" DATETIME NOT NULL,
    "nights" INTEGER NOT NULL,
    "nightly_subtotal" DECIMAL NOT NULL,
    "cleaning_fee" DECIMAL NOT NULL,
    "service_fee" DECIMAL NOT NULL,
    "total_price" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bookings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "cancellations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_id" TEXT NOT NULL,
    "cancelled_by" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "refund_amount" DECIMAL NOT NULL,
    "refund_percent" INTEGER NOT NULL,
    "admin_override" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cancellations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cancellations_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "booking_nights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "booking_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "booking_nights_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "booking_nights_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS "plum_meta" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");`,
  `CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");`,
  `CREATE INDEX IF NOT EXISTS "properties_status_idx" ON "properties"("status");`,
  `CREATE INDEX IF NOT EXISTS "properties_host_id_idx" ON "properties"("host_id");`,
  `CREATE INDEX IF NOT EXISTS "inspection_slots_slot_datetime_idx" ON "inspection_slots"("slot_datetime");`,
  `CREATE INDEX IF NOT EXISTS "inspection_slots_status_idx" ON "inspection_slots"("status");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "availability_calendars_property_id_date_key" ON "availability_calendars"("property_id", "date");`,
  `CREATE INDEX IF NOT EXISTS "availability_calendars_property_id_date_idx" ON "availability_calendars"("property_id", "date");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "bookings_reference_key" ON "bookings"("reference");`,
  `CREATE INDEX IF NOT EXISTS "bookings_property_id_check_in_check_out_idx" ON "bookings"("property_id", "check_in", "check_out");`,
  `CREATE INDEX IF NOT EXISTS "bookings_guest_id_idx" ON "bookings"("guest_id");`,
  `CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings"("status");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "cancellations_booking_id_key" ON "cancellations"("booking_id");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "booking_nights_property_id_date_key" ON "booking_nights"("property_id", "date");`,
  `CREATE INDEX IF NOT EXISTS "booking_nights_booking_id_idx" ON "booking_nights"("booking_id");`,
];

// A night the host has closed can never enter the ledger. Combined with the
// unique (property_id, date) index this makes the booking insert atomic: the
// whole D1 batch rolls back on either conflict.
const TRIGGER_STATEMENT = `CREATE TRIGGER IF NOT EXISTS "booking_nights_closed_guard"
BEFORE INSERT ON "booking_nights"
FOR EACH ROW
WHEN EXISTS (
  SELECT 1 FROM "availability_calendars"
  WHERE "property_id" = NEW."property_id"
    AND "date" = NEW."date"
    AND "is_available" = 0
)
BEGIN
  SELECT RAISE(ABORT, 'NIGHT_CLOSED');
END;`;

let ready: Promise<void> | null = null;

export function ensureDatabase(db: D1Database): Promise<void> {
  if (!ready) {
    ready = bootstrap(db).catch((error) => {
      // Let the next request retry rather than caching a failed bootstrap.
      ready = null;
      throw error;
    });
  }
  return ready;
}

async function bootstrap(db: D1Database) {
  if (await isSeeded(db)) return;

  for (const chunk of chunked(SCHEMA_STATEMENTS, BATCH_SIZE)) {
    await db.batch(chunk.map((statement) => db.prepare(statement)));
  }

  const counted = await db
    .prepare(`SELECT COUNT(*) AS total FROM "users"`)
    .first<{ total: number }>();
  if (Number(counted?.total ?? 0) === 0) {
    for (const chunk of chunked(SEED_STATEMENTS, BATCH_SIZE)) {
      await db.batch(chunk.map((statement) => db.prepare(statement)));
    }
  }

  await db.prepare(TRIGGER_STATEMENT).run();
  await db
    .prepare(
      `INSERT INTO "plum_meta" ("key", "value", "updated_at") VALUES ('seed', ?, ?)
       ON CONFLICT("key") DO UPDATE SET "value" = excluded."value", "updated_at" = excluded."updated_at"`
    )
    .bind(SEED_VERSION, Date.now())
    .run();
}

async function isSeeded(db: D1Database) {
  try {
    const marker = await db
      .prepare(`SELECT "value" FROM "plum_meta" WHERE "key" = 'seed'`)
      .first<{ value: string }>();
    return marker?.value === SEED_VERSION;
  } catch {
    return false;
  }
}

function chunked<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
