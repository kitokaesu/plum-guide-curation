/**
 * Exports the seeded local SQLite database (prisma/dev.db) into
 * src/lib/d1-seed-sql.ts so the Cloudflare D1 database can be bootstrapped
 * on first request.
 *
 * Run with: npm run db:export:d1
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

function literal(value) {
  if (value === null || value === undefined) return "NULL";
  if (value instanceof Date) {
    // Match the format Prisma's D1 adapter writes so date equality and the
    // unique (property_id, date) index treat every row identically.
    return `'${value.toISOString().replace("Z", "+00:00")}'`;
  }
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "bigint") return String(value);
  if (typeof value === "object" && typeof value.toNumber === "function") {
    return String(value.toNumber());
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function insert(table, columns, row) {
  return `INSERT OR IGNORE INTO "${table}" (${columns
    .map((column) => `"${column}"`)
    .join(", ")}) VALUES (${columns.map((column) => literal(row[column])).join(", ")});`;
}

async function main() {
  const statements = [];

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  for (const row of users) {
    statements.push(
      insert(
        "users",
        ["id", "full_name", "email", "password_hash", "role", "created_at"],
        {
          id: row.id,
          full_name: row.fullName,
          email: row.email,
          password_hash: row.passwordHash,
          role: row.role,
          created_at: row.createdAt,
        }
      )
    );
  }

  const properties = await prisma.property.findMany({ orderBy: { createdAt: "asc" } });
  for (const row of properties) {
    statements.push(
      insert(
        "properties",
        [
          "id",
          "host_id",
          "title",
          "location",
          "nightly_rate",
          "status",
          "plum_score",
          "image_url",
          "tagline",
          "description",
          "bedrooms",
          "bathrooms",
          "max_guests",
          "created_at",
        ],
        {
          id: row.id,
          host_id: row.hostId,
          title: row.title,
          location: row.location,
          nightly_rate: row.nightlyRate,
          status: row.status,
          plum_score: row.plumScore,
          image_url: row.imageUrl,
          tagline: row.tagline,
          description: row.description,
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          max_guests: row.maxGuests,
          created_at: row.createdAt,
        }
      )
    );
  }

  const slots = await prisma.inspectionSlot.findMany({
    orderBy: { slotDatetime: "asc" },
  });
  for (const row of slots) {
    statements.push(
      insert(
        "inspection_slots",
        [
          "id",
          "specialist_id",
          "property_id",
          "slot_datetime",
          "status",
          "report_notes",
          "score",
          "completed_at",
          "created_at",
        ],
        {
          id: row.id,
          specialist_id: row.specialistId,
          property_id: row.propertyId,
          slot_datetime: row.slotDatetime,
          status: row.status,
          report_notes: row.reportNotes,
          score: row.score,
          completed_at: row.completedAt,
          created_at: row.createdAt,
        }
      )
    );
  }

  const calendar = await prisma.availabilityCalendar.findMany({
    orderBy: [{ propertyId: "asc" }, { date: "asc" }],
  });
  for (const row of calendar) {
    statements.push(
      insert(
        "availability_calendars",
        ["id", "property_id", "date", "is_available", "custom_price"],
        {
          id: row.id,
          property_id: row.propertyId,
          date: row.date,
          is_available: row.isAvailable,
          custom_price: row.customPrice,
        }
      )
    );
  }

  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "asc" } });
  for (const row of bookings) {
    statements.push(
      insert(
        "bookings",
        [
          "id",
          "reference",
          "property_id",
          "guest_id",
          "check_in",
          "check_out",
          "nights",
          "nightly_subtotal",
          "cleaning_fee",
          "service_fee",
          "total_price",
          "status",
          "created_at",
        ],
        {
          id: row.id,
          reference: row.reference,
          property_id: row.propertyId,
          guest_id: row.guestId,
          check_in: row.checkIn,
          check_out: row.checkOut,
          nights: row.nights,
          nightly_subtotal: row.nightlySubtotal,
          cleaning_fee: row.cleaningFee,
          service_fee: row.serviceFee,
          total_price: row.totalPrice,
          status: row.status,
          created_at: row.createdAt,
        }
      )
    );
  }

  const cancellations = await prisma.cancellation.findMany({
    orderBy: { createdAt: "asc" },
  });
  for (const row of cancellations) {
    statements.push(
      insert(
        "cancellations",
        [
          "id",
          "booking_id",
          "cancelled_by",
          "reason",
          "refund_amount",
          "refund_percent",
          "admin_override",
          "created_at",
        ],
        {
          id: row.id,
          booking_id: row.bookingId,
          cancelled_by: row.cancelledBy,
          reason: row.reason,
          refund_amount: row.refundAmount,
          refund_percent: row.refundPercent,
          admin_override: row.adminOverride,
          created_at: row.createdAt,
        }
      )
    );
  }

  const nights = await prisma.bookingNight.findMany({
    orderBy: [{ propertyId: "asc" }, { date: "asc" }],
  });
  for (const row of nights) {
    statements.push(
      insert("booking_nights", ["id", "booking_id", "property_id", "date"], {
        id: row.id,
        booking_id: row.bookingId,
        property_id: row.propertyId,
        date: row.date,
      })
    );
  }

  const output = `// Generated by scripts/export-d1-seed.mjs. Do not edit by hand.
// Source: prisma/seed.mjs -> prisma/dev.db. Regenerate with \`npm run db:export:d1\`.
// Applied once per database by src/lib/d1-bootstrap.ts.

export const SEED_STATEMENTS: string[] = [
${statements.map((statement) => `  ${JSON.stringify(statement)},`).join("\n")}
];
`;

  const target = path.join(process.cwd(), "src/lib/d1-seed-sql.ts");
  fs.writeFileSync(target, output);
  console.log(`Wrote ${statements.length} statements to ${target}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
