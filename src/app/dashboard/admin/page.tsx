import Link from "next/link";
import { ModerationActions } from "@/components/moderation-actions";
import { RefundOverrideForm } from "@/components/refund-override-form";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import {
  formatDate,
  formatDateRange,
  formatDateTime,
} from "@/lib/dates";
import { eur, toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [
    statusGroups,
    revenueAggregate,
    bookingCount,
    confirmedCount,
    bookedSlots,
    cancellationCount,
    refundAggregate,
    userGroups,
    reviewQueue,
    recentBookings,
    cancellations,
  ] = await Promise.all([
    prisma.property.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
    }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.inspectionSlot.count({ where: { status: "BOOKED" } }),
    prisma.cancellation.count(),
    prisma.cancellation.aggregate({ _sum: { refundAmount: true } }),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.property.findMany({
      where: { status: { in: ["INSPECTION_PENDING", "REJECTED"] } },
      include: {
        host: { select: { fullName: true, email: true } },
        inspectionSlots: {
          orderBy: { slotDatetime: "desc" },
          take: 1,
          include: { specialist: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.findMany({
      include: {
        property: { select: { title: true, location: true } },
        guest: { select: { fullName: true, email: true } },
        cancellation: { select: { refundAmount: true, refundPercent: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.cancellation.findMany({
      include: {
        booking: {
          select: {
            reference: true,
            totalPrice: true,
            checkIn: true,
            property: { select: { title: true } },
          },
        },
        cancelledByUser: { select: { fullName: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const countByStatus = (status: string) =>
    statusGroups.find((group) => group.status === status)?._count._all ?? 0;
  const countByRole = (role: string) =>
    userGroups.find((group) => group.role === role)?._count._all ?? 0;

  const gmv = toNumber(revenueAggregate._sum.totalPrice);
  const refunds = toNumber(refundAggregate._sum.refundAmount);
  const approved = countByStatus("APPROVED");
  const pending = countByStatus("INSPECTION_PENDING");
  const cancellationRate = bookingCount
    ? Math.round((cancellationCount / bookingCount) * 100)
    : 0;

  return (
    <div className="space-y-10">
      <section aria-label="Platform metrics">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Gross booking value"
            value={eur(gmv)}
            detail={`${bookingCount} reservations, ${confirmedCount} confirmed`}
            accent
          />
          <StatCard
            label="On the shelf"
            value={approved}
            detail={`${countByStatus("DRAFT")} drafts · ${countByStatus("REJECTED")} rejected`}
          />
          <StatCard
            label="Inspection pipeline"
            value={pending}
            detail={`${bookedSlots} specialist visits booked`}
          />
          <StatCard
            label="Cancellation rate"
            value={`${cancellationRate}%`}
            detail={`${cancellationCount} cancellations recorded`}
          />
          <StatCard
            label="Refunds issued"
            value={eur(refunds)}
            detail="Across all cancellation policies"
          />
          <StatCard
            label="Members"
            value={
              countByRole("GUEST") +
              countByRole("HOST") +
              countByRole("SPECIALIST") +
              countByRole("ADMIN")
            }
            detail={`${countByRole("HOST")} hosts · ${countByRole("GUEST")} guests · ${countByRole("SPECIALIST")} specialists`}
          />
        </div>
      </section>

      <section aria-labelledby="review-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Curation</p>
            <h2 id="review-heading" className="mt-1 text-2xl">
              Inspection review queue
            </h2>
            <p className="mt-1 text-sm text-muted">
              Score of 85+ approves automatically. Override outcomes where the
              specialist has referred a home.
            </p>
          </div>
          <span className="text-xs text-muted">
            {reviewQueue.length}{" "}
            {reviewQueue.length === 1 ? "home" : "homes"} awaiting review
          </span>
        </div>

        {reviewQueue.length === 0 ? (
          <div className="card mt-4 p-6 text-sm text-muted">
            No homes in the queue. New submissions and referred inspections will
            appear here.
          </div>
        ) : (
          <div className="card mt-4 overflow-x-auto">
            <table className="table-base min-w-[820px]">
              <thead>
                <tr>
                  <th>Home</th>
                  <th>Host</th>
                  <th>Latest inspection</th>
                  <th>Score</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {reviewQueue.map((property) => {
                  const inspection = property.inspectionSlots[0];
                  return (
                    <tr key={property.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={property.imageUrl}
                            alt=""
                            className="h-11 w-14 rounded-md object-cover"
                          />
                          <div>
                            <p className="font-medium">{property.title}</p>
                            <p className="text-xs text-muted">
                              {property.location}
                            </p>
                            <div className="mt-1">
                              <StatusBadge status={property.status} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">
                        <p>{property.host.fullName}</p>
                        <p className="text-xs text-muted">
                          {property.host.email}
                        </p>
                      </td>
                      <td className="text-sm">
                        {inspection ? (
                          <>
                            <p>
                              {formatDateTime(inspection.slotDatetime)}
                            </p>
                            <p className="text-xs text-muted">
                              {inspection.specialist.fullName} ·{" "}
                              {inspection.status.toLowerCase()}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted">Not scheduled</p>
                        )}
                      </td>
                      <td>
                        {property.plumScore !== null ? (
                          <span
                            className={`font-display text-lg ${
                              property.plumScore >= 85 ? "text-moss" : "text-wine"
                            }`}
                          >
                            {property.plumScore}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td>
                        {property.plumScore !== null ? (
                          <ModerationActions
                            propertyId={property.id}
                            propertyTitle={property.title}
                            currentStatus={property.status}
                          />
                        ) : (
                          <span className="text-xs text-muted">
                            Awaiting inspection
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="bookings-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Demand</p>
            <h2 id="bookings-heading" className="mt-1 text-2xl">
              Recent bookings
            </h2>
          </div>
          <Link
            href="/properties"
            className="text-sm underline decoration-hairline underline-offset-4 hover:decoration-gold"
          >
            View the collection →
          </Link>
        </div>

        <div className="card mt-4 overflow-x-auto">
          <table className="table-base min-w-[880px]">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Home</th>
                <th>Guest</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="font-mono text-[11px]">{booking.reference}</td>
                  <td className="text-sm">
                    <p>{booking.property.title}</p>
                    <p className="text-xs text-muted">
                      {booking.property.location}
                    </p>
                  </td>
                  <td className="text-sm">
                    <p>{booking.guest.fullName}</p>
                    <p className="text-xs text-muted">{booking.guest.email}</p>
                  </td>
                  <td className="text-sm">
                    {formatDateRange(booking.checkIn, booking.checkOut)}
                    <p className="text-xs text-muted">
                      {booking.nights}{" "}
                      {booking.nights === 1 ? "night" : "nights"}
                    </p>
                  </td>
                  <td className="text-sm">
                    {eur(booking.totalPrice, 2)}
                    {booking.cancellation ? (
                      <p className="text-xs text-wine">
                        Refund {eur(booking.cancellation.refundAmount, 2)}
                      </p>
                    ) : null}
                  </td>
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="cancellations-heading">
        <div>
          <p className="eyebrow">Disputes</p>
          <h2 id="cancellations-heading" className="mt-1 text-2xl">
            Cancellations & refund overrides
          </h2>
          <p className="mt-1 text-sm text-muted">
            Adjust a refund for a dispute or goodwill gesture. The override is
            recorded against the cancellation.
          </p>
        </div>

        {cancellations.length === 0 ? (
          <div className="card mt-4 p-6 text-sm text-muted">
            No cancellations have been recorded.
          </div>
        ) : (
          <div className="card mt-4 overflow-x-auto">
            <table className="table-base min-w-[940px]">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Cancelled by</th>
                  <th>Reason</th>
                  <th>Refund</th>
                  <th>Override</th>
                </tr>
              </thead>
              <tbody>
                {cancellations.map((cancellation) => (
                  <tr key={cancellation.id}>
                    <td>
                      <p className="text-sm">{cancellation.booking.property.title}</p>
                      <p className="font-mono text-[10px] text-muted">
                        {cancellation.booking.reference}
                      </p>
                      <p className="text-xs text-muted">
                        Check-in {formatDate(cancellation.booking.checkIn)}
                      </p>
                    </td>
                    <td className="text-sm">
                      <p>{cancellation.cancelledByUser.fullName}</p>
                      <p className="text-xs capitalize text-muted">
                        {cancellation.cancelledByUser.role.toLowerCase()}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(cancellation.createdAt)}
                      </p>
                    </td>
                    <td className="max-w-[240px] text-xs leading-relaxed text-muted">
                      “{cancellation.reason}”
                    </td>
                    <td className="text-sm">
                      <p>{eur(cancellation.refundAmount, 2)}</p>
                      <p className="text-xs text-muted">
                        {cancellation.refundPercent}% policy
                      </p>
                      {cancellation.adminOverride ? (
                        <span className="badge badge-amber mt-1">
                          Admin override
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <RefundOverrideForm
                        cancellationId={cancellation.id}
                        reference={cancellation.booking.reference}
                        initialRefund={toNumber(cancellation.refundAmount)}
                        maxRefund={toNumber(cancellation.booking.totalPrice)}
                      />
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
