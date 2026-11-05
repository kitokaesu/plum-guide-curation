import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PrintButton } from "@/components/print-button";
import { requireUser } from "@/lib/auth";
import { formatDate, isoDate } from "@/lib/dates";
import { eur, toNumber } from "@/lib/format";
import type { MessageKey } from "@/lib/i18n";
import { nightsLabel } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/lib/locale";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("inv.title") };
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { locale, t }] = await Promise.all([params, getI18n()]);
  const session = await requireUser(`/bookings/${id}/invoice`);

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: {
        include: { host: { select: { fullName: true, email: true } } },
      },
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

  const refund = booking.cancellation
    ? toNumber(booking.cancellation.refundAmount)
    : 0;
  const total = toNumber(booking.totalPrice);
  const nightlyWord = nightsLabel(locale, booking.nights);

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/bookings/${booking.id}/confirmation`}
          className="text-sm underline decoration-hairline underline-offset-4 hover:decoration-gold"
        >
          ← {t("inv.back")}
        </Link>
        <PrintButton />
      </div>

      <article className="invoice-sheet card p-8 sm:p-12">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-hairline pb-8">
          <div>
            <p className="font-display text-2xl tracking-tight">Plum Guide</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold">
              {t("inv.tagline")}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Plum Guide Ltd
              <br />
              14 Marylebone Lane, London W1U 2NF
              <br />
              concierge@plumguide.com
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
              {t("inv.title")}
            </p>
            <p className="mt-1 font-mono text-sm tracking-[0.12em]">
              {booking.reference}
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted">
              {t("inv.issued")}
            </p>
            <p className="mt-1 text-sm">{formatDate(booking.createdAt)}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted">
              {t("inv.status")}
            </p>
            <p className="mt-1 text-sm">
              {t(`status.${booking.status}` as MessageKey)}
            </p>
          </div>
        </header>

        <div className="grid gap-8 py-8 sm:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
              {t("inv.billedTo")}
            </p>
            <p className="mt-2 text-sm font-medium">{booking.guest.fullName}</p>
            <p className="text-sm text-muted">{booking.guest.email}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
              {t("inv.stay")}
            </p>
            <p className="mt-2 text-sm font-medium">{booking.property.title}</p>
            <p className="text-sm text-muted">{booking.property.location}</p>
            <p className="mt-1 text-sm text-muted">
              {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} ·{" "}
              {booking.nights} {nightlyWord}
            </p>
          </div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-hairline text-[10px] uppercase tracking-[0.16em] text-muted">
              <th className="py-3 text-left font-semibold">
                {t("inv.description")}
              </th>
              <th className="py-3 text-right font-semibold">{t("inv.amount")}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-hairline/70">
              <td className="py-3">
                {t("inv.accommodation", {
                  nights: booking.nights,
                  nightsWord: nightlyWord,
                  rate: eur(toNumber(booking.nightlySubtotal) / booking.nights, 2, locale),
                })}
              </td>
              <td className="py-3 text-right">
                {eur(booking.nightlySubtotal, 2, locale)}
              </td>
            </tr>
            <tr className="border-b border-hairline/70">
              <td className="py-3">{t("inv.cleaning")}</td>
              <td className="py-3 text-right">
                {eur(booking.cleaningFee, 2, locale)}
              </td>
            </tr>
            <tr className="border-b border-hairline/70">
              <td className="py-3">{t("inv.service")}</td>
              <td className="py-3 text-right">
                {eur(booking.serviceFee, 2, locale)}
              </td>
            </tr>
            <tr>
              <td className="py-4 text-right font-medium">{t("inv.total")}</td>
              <td className="py-4 text-right font-display text-xl">
                {eur(total, 2, locale)}
              </td>
            </tr>
            {booking.cancellation ? (
              <>
                <tr className="border-t border-hairline">
                  <td className="py-3 text-moss">
                    {t("inv.refundLine", {
                      percent: booking.cancellation.refundPercent,
                    })}
                  </td>
                  <td className="py-3 text-right text-moss">
                    −{eur(refund, 2, locale)}
                  </td>
                </tr>
                <tr>
                  <td className="pb-2 text-right font-medium">
                    {t("inv.netCharged")}
                  </td>
                  <td className="pb-2 text-right font-display text-xl">
                    {eur(total - refund, 2, locale)}
                  </td>
                </tr>
              </>
            ) : null}
          </tbody>
        </table>

        <div className="mt-8 border-t border-hairline pt-6 text-xs leading-relaxed text-muted">
          <p>
            {t("inv.footnoteOne", {
              reference: booking.reference,
              checkIn: formatDate(booking.checkIn),
              checkOut: formatDate(booking.checkOut),
            })}
          </p>
          <p className="mt-2">
            {t("inv.footnoteTwo", { host: booking.property.host.fullName })}
          </p>
          <p className="mt-2">{t("inv.footnoteThree")}</p>
          <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-gold">
            {t("inv.generated", { date: formatDate(isoDate(new Date())) })}
          </p>
        </div>
      </article>
    </div>
  );
}
