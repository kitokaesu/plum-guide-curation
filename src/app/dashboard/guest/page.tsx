import Link from "next/link";
import { CancelBookingDialog } from "@/components/cancel-booking-dialog";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import {
  daysUntil,
  formatDate,
  formatDateRange,
  isoDate,
  startOfUTCDay,
} from "@/lib/dates";
import { eur, toNumber } from "@/lib/format";
import { nightsLabel } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { refundPolicy } from "@/lib/pricing";
import { getI18n } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function GuestDashboardPage() {
  const [session, { locale, t }] = await Promise.all([
    requireRole("GUEST"),
    getI18n(),
  ]);

  const bookings = await prisma.booking.findMany({
    where: { guestId: session.id },
    include: {
      property: { include: { host: { select: { fullName: true } } } },
      cancellation: true,
    },
    orderBy: { checkIn: "desc" },
  });

  const today = startOfUTCDay(new Date());
  const upcoming = bookings
    .filter((booking) => booking.status === "CONFIRMED" && booking.checkOut >= today)
    .sort((a, b) => a.checkIn.getTime() - b.checkIn.getTime());
  const past = bookings.filter(
    (booking) => !upcoming.some((item) => item.id === booking.id)
  );

  const nightsBooked = bookings
    .filter((booking) => booking.status !== "CANCELLED")
    .reduce((total, booking) => total + booking.nights, 0);
  const lifetimeSpend = bookings
    .filter((booking) => booking.status !== "CANCELLED")
    .reduce((total, booking) => total + toNumber(booking.totalPrice), 0);
  const nextTrip = upcoming[0];
  const nextTripDays = nextTrip ? daysUntil(nextTrip.checkIn) : null;
  const policy = refundPolicy(locale);

  return (
    <div className="space-y-10">
      <section aria-label={t("guest.upcomingStays")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t("guest.upcomingStays")}
            value={upcoming.length}
            detail={
              nextTrip && nextTripDays !== null && nextTripDays >= 0
                ? t("guest.next", {
                    location: nextTrip.property.location,
                    days: nextTripDays,
                  })
                : nextTrip
                  ? nextTrip.property.location
                  : t("guest.nothingBooked")
            }
            accent
          />
          <StatCard
            label={t("guest.nightsBooked")}
            value={nightsBooked}
            detail={t("guest.nightsDetail")}
          />
          <StatCard
            label={t("guest.lifetimeSpend")}
            value={eur(lifetimeSpend, 0, locale)}
            detail={t("guest.spendDetail")}
          />
        </div>
      </section>

      <section aria-labelledby="upcoming-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{t("guest.nextUp")}</p>
            <h2 id="upcoming-heading" className="mt-1 text-2xl">
              {t("guest.upcoming")}
            </h2>
          </div>
          <Link
            href="/properties"
            className="text-sm underline decoration-hairline underline-offset-4 hover:decoration-gold"
          >
            {t("guest.browseMore")}
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="card mt-4 p-8 text-center">
            <p className="font-display text-xl">{t("guest.emptyTitle")}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              {t("guest.emptyBody")}
            </p>
            <Link href="/properties" className="btn btn-primary mt-5">
              {t("guest.explore")}
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {upcoming.map((booking) => {
              const days = daysUntil(booking.checkIn);
              return (
                <article key={booking.id} className="card overflow-hidden sm:flex">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={booking.property.imageUrl}
                    alt={`${booking.property.title}, ${booking.property.location}`}
                    className="h-44 w-full object-cover sm:h-auto sm:w-52"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <StatusBadge status={booking.status} />
                        <h3 className="mt-2 font-display text-xl">
                          {booking.property.title}
                        </h3>
                        <p className="text-sm text-muted">
                          {booking.property.location} ·{" "}
                          {t("guest.hostedBy", {
                            name: booking.property.host.fullName,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                          {t("guest.reference")}
                        </p>
                        <p className="mt-1 font-mono text-xs">
                          {booking.reference}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-hairline py-3 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">
                          {t("guest.checkIn")}
                        </dt>
                        <dd className="mt-1">{formatDate(booking.checkIn)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">
                          {t("guest.checkOut")}
                        </dt>
                        <dd className="mt-1">{formatDate(booking.checkOut)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">
                          {t("guest.nights")}
                        </dt>
                        <dd className="mt-1">{booking.nights}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">
                          {t("guest.total")}
                        </dt>
                        <dd className="mt-1">
                          {eur(booking.totalPrice, 2, locale)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/bookings/${booking.id}/confirmation`}
                        className="btn btn-outline btn-sm"
                      >
                        {t("guest.details")}
                      </Link>
                      <Link
                        href={`/bookings/${booking.id}/invoice`}
                        className="btn btn-ghost btn-sm"
                      >
                        {t("guest.invoice")}
                      </Link>
                      <CancelBookingDialog
                        bookingId={booking.id}
                        propertyTitle={booking.property.title}
                        checkInISO={isoDate(booking.checkIn)}
                        checkOutISO={isoDate(booking.checkOut)}
                        totalPrice={toNumber(booking.totalPrice)}
                        locale={locale}
                        compact
                      />
                      {days >= 0 ? (
                        <span className="ml-auto text-xs text-muted">
                          {days === 0
                            ? t("guest.checkInToday")
                            : t("guest.checkInIn", { days })}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="history-heading">
        <div>
          <p className="eyebrow">{t("guest.history")}</p>
          <h2 id="history-heading" className="mt-1 text-2xl">
            {t("guest.historyTitle")}
          </h2>
        </div>

        {past.length === 0 ? (
          <div className="card mt-4 p-6 text-sm text-muted">
            {t("guest.historyEmpty")}
          </div>
        ) : (
          <div className="card mt-4 overflow-x-auto">
            <table className="table-base min-w-[720px]">
              <thead>
                <tr>
                  <th>{t("property.theHome")}</th>
                  <th>{t("guest.nights")}</th>
                  <th>{t("guest.total")}</th>
                  <th>{t("guest.checkIn")}</th>
                  <th className="text-right">{t("guest.documents")}</th>
                </tr>
              </thead>
              <tbody>
                {past.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <p className="font-medium">{booking.property.title}</p>
                      <p className="text-xs text-muted">
                        {booking.property.location}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-muted">
                        {booking.reference}
                      </p>
                    </td>
                    <td className="text-sm">
                      {formatDateRange(booking.checkIn, booking.checkOut)}
                      <p className="text-xs text-muted">
                        {booking.nights} {nightsLabel(locale, booking.nights)}
                      </p>
                    </td>
                    <td className="text-sm">
                      {eur(booking.totalPrice, 2, locale)}
                      {booking.cancellation ? (
                        <p className="text-xs text-moss">
                          {t("conf.refund", {
                            percent: booking.cancellation.refundPercent,
                          })}{" "}
                          {eur(booking.cancellation.refundAmount, 2, locale)}
                        </p>
                      ) : null}
                    </td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/bookings/${booking.id}/invoice`}
                        className="text-xs underline decoration-hairline underline-offset-4 hover:decoration-gold"
                      >
                        {t("guest.invoice")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card bg-goldSoft/30 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">{t("home.policyEyebrow")}</p>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">
              {t("home.policyBody")}
            </p>
          </div>
          <ul className="grid gap-1 text-xs text-muted sm:grid-cols-1">
            {policy.map((tier) => (
              <li key={tier.window} className="flex justify-between gap-6">
                <span>{tier.window}</span>
                <span className="font-medium text-ink">{tier.refund}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
