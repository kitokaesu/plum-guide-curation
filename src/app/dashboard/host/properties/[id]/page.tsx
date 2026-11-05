import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AvailabilityManager } from "@/components/availability-manager";
import { InspectionRequestPanel } from "@/components/inspection-request-panel";
import { ListingSettings } from "@/components/listing-settings";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import { getHostCalendar } from "@/lib/availability";
import {
  formatDate,
  formatDateRange,
  formatDateTime,
} from "@/lib/dates";
import { eur, toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Manage listing" };

export default async function HostPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole("HOST");

  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property || property.hostId !== session.id) notFound();

  const [calendarDays, availableSlots, scheduled, completedInspections, bookings] =
    await Promise.all([
      getHostCalendar(property.id, 365),
      prisma.inspectionSlot.findMany({
        where: {
          status: "AVAILABLE",
          propertyId: null,
          slotDatetime: { gt: new Date() },
        },
        include: { specialist: { select: { fullName: true } } },
        orderBy: { slotDatetime: "asc" },
        take: 6,
      }),
      prisma.inspectionSlot.findFirst({
        where: { propertyId: property.id, status: "BOOKED" },
        include: { specialist: { select: { fullName: true } } },
      }),
      prisma.inspectionSlot.findMany({
        where: { propertyId: property.id, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 3,
        include: { specialist: { select: { fullName: true } } },
      }),
      prisma.booking.findMany({
        where: { propertyId: property.id },
        include: { guest: { select: { fullName: true, email: true } } },
        orderBy: { checkIn: "desc" },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/host"
          className="text-sm underline decoration-hairline underline-offset-4 hover:decoration-gold"
        >
          ← Back to your portfolio
        </Link>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={property.imageUrl}
              alt={`${property.title} in ${property.location}`}
              className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-36"
            />
            <div>
              <StatusBadge status={property.status} />
              <h2 className="mt-2 text-3xl">{property.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {property.location} · {property.bedrooms} bed ·{" "}
                {property.bathrooms} bath · sleeps {property.maxGuests}
              </p>
              <p className="mt-1 text-sm text-muted">
                {eur(property.nightlyRate)} base rate
                {property.plumScore !== null
                  ? ` · Plum score ${property.plumScore}/100`
                  : ""}
              </p>
            </div>
          </div>
          {property.status === "APPROVED" ? (
            <Link
              href={`/properties/${property.id}`}
              className="btn btn-outline btn-sm shrink-0"
            >
              View public listing
            </Link>
          ) : null}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Confirmed bookings
          </p>
          <p className="mt-1 font-display text-2xl">
            {bookings.filter((booking) => booking.status === "CONFIRMED").length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Calendar open next 30 days
          </p>
          <p className="mt-1 font-display text-2xl">
            {
              calendarDays
                .slice(0, 30)
                .filter((day) => day.isAvailable && !day.booked).length
            }
            <span className="ml-1 font-sans text-xs text-muted">/ 30</span>
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Revenue to date
          </p>
          <p className="mt-1 font-display text-2xl">
            {eur(
              bookings
                .filter((booking) => booking.status !== "CANCELLED")
                .reduce(
                  (total, booking) => total + toNumber(booking.totalPrice),
                  0
                )
            )}
          </p>
        </div>
      </section>

      <ListingSettings
        propertyId={property.id}
        initialTitle={property.title}
        initialRate={toNumber(property.nightlyRate)}
      />

      <section aria-labelledby="availability-heading">
        <div className="mb-4">
          <p className="eyebrow">Calendar</p>
          <h2 id="availability-heading" className="mt-1 text-2xl">
            Availability & pricing
          </h2>
          <p className="mt-1 text-sm text-muted">
            Open nights, close them, or set a custom nightly price. Reservations
            lock nights automatically.
          </p>
        </div>
        <AvailabilityManager
          propertyId={property.id}
          days={calendarDays}
          baseRate={toNumber(property.nightlyRate)}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <InspectionRequestPanel
          propertyId={property.id}
          propertyStatus={property.status}
          slots={availableSlots.map((slot) => ({
            id: slot.id,
            slotDatetime: slot.slotDatetime.toISOString(),
            specialist: slot.specialist.fullName,
          }))}
          scheduled={
            scheduled
              ? {
                  slotDatetime: scheduled.slotDatetime.toISOString(),
                  specialist: scheduled.specialist.fullName,
                }
              : null
          }
        />

        <div className="card p-5 sm:p-6">
          <p className="eyebrow">Inspection history</p>
          <h2 className="mt-2 text-xl">Plum Test reports</h2>
          {completedInspections.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              No completed inspections yet. After the visit, your specialist
              records the score and notes here.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-hairline">
              {completedInspections.map((inspection) => (
                <li key={inspection.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">
                      {inspection.completedAt
                        ? formatDate(inspection.completedAt)
                        : formatDateTime(inspection.slotDatetime)}
                    </p>
                    <span
                      className={`text-sm font-medium ${
                        (inspection.score ?? 0) >= 85 ? "text-moss" : "text-wine"
                      }`}
                    >
                      {inspection.score ?? "—"}/100
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {inspection.reportNotes}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                    {inspection.specialist.fullName}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="property-bookings-heading">
        <div>
          <p className="eyebrow">Reservations</p>
          <h2 id="property-bookings-heading" className="mt-1 text-2xl">
            Bookings for this home
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="card mt-4 p-6 text-sm text-muted">
            No bookings yet. Open dates and set competitive pricing to attract
            guests.
          </div>
        ) : (
          <div className="card mt-4 overflow-x-auto">
            <table className="table-base min-w-[640px]">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <p className="font-medium">{booking.guest.fullName}</p>
                      <p className="text-xs text-muted">{booking.guest.email}</p>
                    </td>
                    <td className="text-sm">
                      {formatDateRange(booking.checkIn, booking.checkOut)}
                      <p className="text-xs text-muted">
                        {booking.nights}{" "}
                        {booking.nights === 1 ? "night" : "nights"}
                      </p>
                    </td>
                    <td className="text-sm">{eur(booking.totalPrice, 2)}</td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
