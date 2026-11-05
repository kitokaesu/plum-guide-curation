import Link from "next/link";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import {
  formatDate,
  formatDateRange,
  formatDateTime,
  startOfUTCDay,
} from "@/lib/dates";
import { eur, pluralize, toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HostDashboardPage() {
  const session = await requireRole("HOST");

  const [properties, bookings] = await Promise.all([
    prisma.property.findMany({
      where: { hostId: session.id },
      include: {
        inspectionSlots: {
          where: { status: "BOOKED" },
          orderBy: { slotDatetime: "asc" },
          take: 1,
          include: { specialist: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      where: { property: { hostId: session.id } },
      include: {
        property: { select: { id: true, title: true, location: true } },
        guest: { select: { fullName: true, email: true } },
      },
      orderBy: { checkIn: "asc" },
    }),
  ]);

  const today = startOfUTCDay(new Date());
  const confirmed = bookings.filter((booking) => booking.status === "CONFIRMED");
  const revenue = bookings
    .filter((booking) => booking.status !== "CANCELLED")
    .reduce((total, booking) => total + toNumber(booking.totalPrice), 0);
  const upcomingRevenue = confirmed
    .filter((booking) => booking.checkOut >= today)
    .reduce((total, booking) => total + toNumber(booking.totalPrice), 0);
  const upcomingBookings = confirmed.filter((booking) => booking.checkOut >= today);
  const approved = properties.filter(
    (property) => property.status === "APPROVED"
  ).length;

  return (
    <div className="space-y-10">
      <section aria-label="Portfolio summary">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total revenue"
            value={eur(revenue)}
            detail="Confirmed and completed stays"
            accent
          />
          <StatCard
            label="Upcoming revenue"
            value={eur(upcomingRevenue)}
            detail={`${pluralize(upcomingBookings.length, "stay")} ahead`}
          />
          <StatCard
            label="Confirmed bookings"
            value={confirmed.length}
            detail={`${properties.length} ${properties.length === 1 ? "home" : "homes"} in your portfolio`}
          />
          <StatCard
            label="Plum Approved homes"
            value={`${approved}/${properties.length}`}
            detail="Approved homes are bookable instantly"
          />
        </div>
      </section>

      <section aria-labelledby="listings-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Portfolio</p>
            <h2 id="listings-heading" className="mt-1 text-2xl">
              Your homes
            </h2>
          </div>
          <Link href="/dashboard/host/listings/new" className="btn btn-primary btn-sm">
            Add a home
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="card mt-4 p-8 text-center">
            <p className="font-display text-xl">No homes submitted yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Add your first home, then schedule a specialist to carry out its
              Plum Test.
            </p>
            <Link
              href="/dashboard/host/listings/new"
              className="btn btn-primary mt-5"
            >
              Submit your first home
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {properties.map((property) => {
              const inspection = property.inspectionSlots[0];
              return (
                <article
                  key={property.id}
                  className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={property.imageUrl}
                    alt={`${property.title} in ${property.location}`}
                    className="h-36 w-full rounded-xl object-cover sm:h-20 sm:w-28"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-xl">{property.title}</h3>
                      <StatusBadge status={property.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {property.location} · {property.bedrooms} bed ·{" "}
                      {eur(property.nightlyRate)} / night
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {property.plumScore !== null
                        ? `Plum score ${property.plumScore}/100`
                        : inspection
                          ? `Inspection ${formatDateTime(inspection.slotDatetime)} with ${inspection.specialist.fullName}`
                          : "No inspection scheduled"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/dashboard/host/properties/${property.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Manage calendar
                    </Link>
                    {property.status === "APPROVED" ? (
                      <Link
                        href={`/properties/${property.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        View listing
                      </Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="host-bookings-heading">
        <div>
          <p className="eyebrow">Reservations</p>
          <h2 id="host-bookings-heading" className="mt-1 text-2xl">
            Guest bookings
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="card mt-4 p-6 text-sm text-muted">
            No bookings yet. Approved homes appear in the collection and can be
            booked instantly.
          </div>
        ) : (
          <div className="card mt-4 overflow-x-auto">
            <table className="table-base min-w-[760px]">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Home</th>
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
                      <p>{booking.property.title}</p>
                      <p className="text-xs text-muted">
                        {booking.property.location}
                      </p>
                    </td>
                    <td className="text-sm">
                      {formatDateRange(booking.checkIn, booking.checkOut)}
                      <p className="text-xs text-muted">
                        {pluralize(booking.nights, "night")}
                      </p>
                    </td>
                    <td className="text-sm">{eur(booking.totalPrice, 2)}</td>
                    <td>
                      <StatusBadge status={booking.status} />
                      <p className="mt-1 font-mono text-[10px] text-muted">
                        {booking.reference}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="eyebrow">Next stay</p>
          {upcomingBookings[0] ? (
            <>
              <p className="mt-2 font-display text-xl">
                {upcomingBookings[0].property.title}
              </p>
              <p className="mt-1 text-sm text-muted">
                {formatDate(upcomingBookings[0].checkIn)} ·{" "}
                {pluralize(upcomingBookings[0].nights, "night")} ·{" "}
                {upcomingBookings[0].guest.fullName}
              </p>
              <p className="mt-2 text-xs text-muted">
                Arrival from 15:00. The guest has your contact details.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">
              No upcoming stays. Keep your calendar open to attract bookings.
            </p>
          )}
        </div>
        <div className="card p-5">
          <p className="eyebrow">Hosting checklist</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>· Keep at least 60 days of availability open</li>
            <li>· Set peak-season prices on your calendar</li>
            <li>· Respond to guest messages within 24 hours</li>
            <li>· Review your Plum Test report after each inspection</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
