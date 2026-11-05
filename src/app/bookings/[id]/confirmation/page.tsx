import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CancelBookingDialog } from "@/components/cancel-booking-dialog";
import { requireUser } from "@/lib/auth";
import { formatDate, isoDate } from "@/lib/dates";
import { eur, toNumber } from "@/lib/format";
import { nightsLabel } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/lib/locale";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("conf.confirmedEyebrow") };
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { locale, t }] = await Promise.all([params, getI18n()]);
  const session = await requireUser(`/bookings/${id}/confirmation`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: { include: { host: { select: { fullName: true } } } },
      guest: { select: { fullName: true, email: true } },
      cancellation: true,
    },
  });

  if (!booking) notFound();
  if (
    session.role !== "ADMIN" &&
    booking.guestId !== session.id &&
    booking.property.hostId !== session.id
  ) {
    notFound();
  }

  const total = toNumber(booking.totalPrice);
  const isCancelled = booking.status === "CANCELLED";

  return (
    <div className="container-page max-w-4xl py-12">
      <div className="text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E6EFE7] text-lg text-moss"
        >
          ✓
        </span>
        <p className="eyebrow mt-5">
          {isCancelled ? t("conf.cancelledEyebrow") : t("conf.confirmedEyebrow")}
        </p>
        <h1 className="mt-3 text-balance text-4xl sm:text-5xl">
          {isCancelled ? t("conf.cancelledTitle") : t("conf.confirmedTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
          {isCancelled
            ? t("conf.cancelledBody")
            : t("conf.confirmedBody", { email: booking.guest.email })}
        </p>
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-ink px-6 py-6 text-cream sm:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cream/60">
              {t("conf.reference")}
            </p>
            <p className="mt-1 font-mono text-xl tracking-[0.18em]">
              {booking.reference}
            </p>
          </div>
          <span
            className={`badge ${
              isCancelled ? "badge-red" : "badge-green"
            } bg-cream/95`}
          >
            {t(isCancelled ? "status.CANCELLED" : "status.CONFIRMED")}
          </span>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={booking.property.imageUrl}
              alt={`${booking.property.title}, ${booking.property.location}`}
              className="h-40 w-full rounded-xl object-cover sm:h-28 sm:w-44"
            />
            <div>
              <h2 className="font-display text-2xl">{booking.property.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {booking.property.location}
              </p>
              <p className="mt-1 text-xs text-muted">
                {t("guest.hostedBy", { name: booking.property.host.fullName })}
              </p>
              <Link
                href={`/properties/${booking.propertyId}`}
                className="mt-3 inline-block text-xs underline decoration-hairline underline-offset-4 hover:decoration-gold"
              >
                {t("conf.viewHome")}
              </Link>
            </div>
          </div>

          <dl className="mt-8 grid gap-6 border-y border-hairline py-6 sm:grid-cols-3">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {t("conf.checkIn")}
              </dt>
              <dd className="mt-1 font-display text-xl">
                {formatDate(booking.checkIn)}
              </dd>
              <p className="mt-1 text-xs text-muted">{t("conf.from15")}</p>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {t("conf.checkOut")}
              </dt>
              <dd className="mt-1 font-display text-xl">
                {formatDate(booking.checkOut)}
              </dd>
              <p className="mt-1 text-xs text-muted">{t("conf.by11")}</p>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {t("conf.stay")}
              </dt>
              <dd className="mt-1 font-display text-xl">
                {booking.nights} {nightsLabel(locale, booking.nights)}
              </dd>
              <p className="mt-1 text-xs text-muted">
                {t("conf.maxGuests", { count: booking.property.maxGuests })}
              </p>
            </div>
          </dl>

          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-3">{t("conf.price")}</p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t("conf.nightlySubtotal")}</dt>
                  <dd>{eur(booking.nightlySubtotal, 2, locale)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t("conf.cleaning")}</dt>
                  <dd>{eur(booking.cleaningFee, 2, locale)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t("conf.service")}</dt>
                  <dd>{eur(booking.serviceFee, 2, locale)}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-hairline pt-2.5 text-base font-medium">
                  <dt>
                    {isCancelled ? t("conf.originalTotal") : t("conf.totalPaid")}
                  </dt>
                  <dd>{eur(total, 2, locale)}</dd>
                </div>
                {booking.cancellation ? (
                  <>
                    <div className="flex justify-between gap-3 text-moss">
                      <dt>
                        {t("conf.refund", {
                          percent: booking.cancellation.refundPercent,
                        })}
                      </dt>
                      <dd>
                        {eur(booking.cancellation.refundAmount, 2, locale)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-hairline pt-2.5 font-medium">
                      <dt>{t("conf.netCharged")}</dt>
                      <dd>
                        {eur(
                          total - toNumber(booking.cancellation.refundAmount),
                          2,
                          locale
                        )}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>
            </div>

            <div>
              <p className="eyebrow mb-3">{t("conf.guest")}</p>
              <p className="text-sm">{booking.guest.fullName}</p>
              <p className="text-sm text-muted">{booking.guest.email}</p>
              <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-muted">
                {t("conf.reservedOn")}
              </p>
              <p className="mt-1 text-sm">{formatDate(booking.createdAt)}</p>
            </div>
          </div>

          {booking.cancellation ? (
            <div className="mt-6 rounded-xl border border-wine/20 bg-[#F9EEEC] px-4 py-3 text-sm">
              <p className="font-medium text-wine">
                {t("conf.refund", {
                  percent: booking.cancellation.refundPercent,
                })}{" "}
                · {eur(booking.cancellation.refundAmount, 2, locale)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-wine/80">
                {t("conf.recorded", {
                  date: formatDate(booking.cancellation.createdAt),
                  reason: booking.cancellation.reason,
                })}
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/bookings/${booking.id}/invoice`}
                className="btn btn-primary btn-sm"
              >
                {t("conf.viewInvoice")}
              </Link>
              <Link href="/dashboard/guest" className="btn btn-outline btn-sm">
                {t("conf.myTrips")}
              </Link>
            </div>
            {booking.status === "CONFIRMED" ? (
              <CancelBookingDialog
                bookingId={booking.id}
                propertyTitle={booking.property.title}
                checkInISO={isoDate(booking.checkIn)}
                checkOutISO={isoDate(booking.checkOut)}
                totalPrice={total}
                locale={locale}
                compact
              />
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted">
        {t("conf.demoNote")}
      </p>
    </div>
  );
}
