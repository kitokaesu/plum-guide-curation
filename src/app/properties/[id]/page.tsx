import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookingWidget } from "@/components/booking-widget";
import { StatusBadge } from "@/components/status-badge";
import { getSession } from "@/lib/auth";
import { getBookingCalendar } from "@/lib/availability";
import { plumTestCriteria } from "@/lib/content";
import { formatDate, formatDateTime } from "@/lib/dates";
import { eur, toNumber } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { refundPolicy } from "@/lib/pricing";
import { getI18n } from "@/lib/locale";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    select: { title: true, location: true },
  });
  return property
    ? {
        title: `${property.title}, ${property.location}`,
        description: `${property.title} in ${property.location} — inspected and approved by Plum Guide.`,
      }
    : { title: "Home not found" };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { locale, t }, session] = await Promise.all([
    params,
    getI18n(),
    getSession(),
  ]);

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      host: { select: { fullName: true, createdAt: true } },
      inspectionSlots: {
        where: { status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 1,
        include: { specialist: { select: { fullName: true } } },
      },
    },
  });

  if (!property) notFound();

  const scheduledInspection = await prisma.inspectionSlot.findFirst({
    where: { propertyId: property.id, status: "BOOKED" },
    include: { specialist: { select: { fullName: true } } },
  });

  const isApproved = property.status === "APPROVED";
  const calendar = isApproved ? await getBookingCalendar(property.id) : null;
  const lastInspection = property.inspectionSlots[0];
  const isOwner = session?.id === property.hostId;
  const criteria = plumTestCriteria(locale);
  const policy = refundPolicy(locale);

  return (
    <div className="container-page py-8 sm:py-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link
          href="/properties"
          className="underline decoration-hairline underline-offset-4 hover:decoration-gold"
        >
          {t("property.breadcrumb")}
        </Link>
        <span className="mx-2">/</span>
        <span>{property.location}</span>
      </nav>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={property.status} />
            {property.plumScore !== null ? (
              <span className="text-xs uppercase tracking-[0.14em] text-muted">
                {t("property.score", { score: property.plumScore })}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-balance text-4xl sm:text-5xl">{property.title}</h1>
          <p className="mt-2 text-sm text-muted">
            {property.location} · {t("property.hostedBy", { name: property.host.fullName })}
          </p>
        </div>
        {isApproved ? (
          <p className="text-right">
            <span className="font-display text-3xl">
              {eur(property.nightlyRate, 0, locale)}
            </span>
            <span className="block text-xs text-muted">{t("common.perNight")}</span>
          </p>
        ) : null}
      </div>

      <div className="relative mt-7 overflow-hidden rounded-2xl bg-hairline">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.imageUrl}
          alt={`${property.title}, ${property.location}`}
          className="aspect-[16/10] w-full object-cover sm:aspect-[21/9]"
        />
        {property.plumScore !== null ? (
          <div className="absolute bottom-4 left-4 rounded-full bg-ink/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-cream backdrop-blur">
            {t("status.APPROVED")} · {t("property.score", { score: property.plumScore })}
          </div>
        ) : null}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        <div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-hairline pb-5 text-sm text-muted">
            <span>{t("property.bedrooms", { count: property.bedrooms })}</span>
            <span>{t("property.bathrooms", { count: property.bathrooms })}</span>
            <span>{t("property.sleeps", { count: property.maxGuests })}</span>
            <span>{t("property.wholeHome")}</span>
          </div>

          <section className="mt-8">
            <p className="eyebrow">{t("property.theHome")}</p>
            <h2 className="mt-2 text-2xl">{property.tagline}</h2>
            <div className="prose-plum mt-4 max-w-2xl text-[15px]">
              <p>{property.description}</p>
            </div>
          </section>

          <section className="mt-10 card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{t("property.test")}</p>
                <h2 className="mt-2 text-2xl">
                  {lastInspection ? t("property.inspected") : t("property.awaiting")}
                </h2>
              </div>
              {property.plumScore !== null ? (
                <div className="text-right">
                  <p className="font-display text-4xl">{property.plumScore}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    {t("property.outOf")}
                  </p>
                </div>
              ) : null}
            </div>

            {property.plumScore !== null ? (
              <div
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={property.plumScore}
                aria-label={t("home.heroScoreLabel")}
                className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-hairline"
              >
                <div
                  className={`h-full rounded-full ${
                    property.plumScore >= 85 ? "bg-moss" : "bg-gold"
                  }`}
                  style={{ width: `${Math.min(100, property.plumScore)}%` }}
                />
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {criteria.map((criterion) => (
                <div key={criterion.title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E6EFE7] text-[10px] text-moss"
                  >
                    ✓
                  </span>
                  <div>
                    <p className="text-sm font-medium">{criterion.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">
                      {criterion.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {property.status === "APPROVED" &&
            property.plumScore !== null &&
            property.plumScore < 85 ? (
              <p className="mt-5 rounded-xl border border-hairline bg-cream px-4 py-3 text-xs leading-relaxed text-muted">
                {t("property.approvedNote")}
              </p>
            ) : null}

            {lastInspection ? (
              <blockquote className="mt-6 border-l-2 border-gold pl-4">
                <p className="font-display text-lg leading-snug">
                  “{lastInspection.reportNotes}”
                </p>
                <footer className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                  {lastInspection.specialist.fullName} · {t("role.SPECIALIST")}
                  {lastInspection.completedAt
                    ? ` · ${formatDate(lastInspection.completedAt)}`
                    : ""}
                </footer>
              </blockquote>
            ) : scheduledInspection ? (
              <div className="mt-6 rounded-xl border border-hairline bg-cream px-4 py-3 text-sm text-muted">
                {t("property.scheduled", {
                  name: scheduledInspection.specialist.fullName,
                  date: formatDateTime(scheduledInspection.slotDatetime),
                })}
              </div>
            ) : null}
          </section>

          <section className="mt-10">
            <p className="eyebrow">{t("property.included")}</p>
            <h2 className="mt-2 text-2xl">{t("property.includedTitle")}</h2>
            <ul className="mt-5 grid gap-3 text-sm text-muted sm:grid-cols-2">
              {[
                t("property.included1"),
                t("property.included2"),
                t("property.included3"),
                t("property.included4"),
                t("property.included5"),
                t("property.included6"),
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1 w-1 rounded-full bg-gold"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 flex flex-col gap-4 rounded-2xl border border-hairline bg-paper p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">{t("property.yourHost")}</p>
              <p className="mt-2 font-display text-xl">{property.host.fullName}</p>
              <p className="mt-1 text-sm text-muted">
                {t("property.hostingSince", {
                  year: property.host.createdAt.getUTCFullYear(),
                })}
              </p>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-muted">
              {t("property.hostNote")}
            </p>
          </section>

          <section className="mt-10">
            <p className="eyebrow">{t("property.cancellations")}</p>
            <h2 className="mt-2 text-2xl">{t("property.cancelTitle")}</h2>
            <ul className="mt-4 divide-y divide-hairline text-sm">
              {policy.map((tier) => (
                <li
                  key={tier.window}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="text-muted">{tier.window}</span>
                  <span className="font-medium">{tier.refund}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {t("property.cancelNote")}
            </p>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          {isApproved && calendar ? (
            <>
              <BookingWidget
                propertyId={property.id}
                propertyTitle={property.title}
                baseRate={toNumber(property.nightlyRate)}
                calendar={calendar}
                isAuthenticated={Boolean(session)}
                loginHref={`/login?next=${encodeURIComponent(`/properties/${property.id}`)}`}
                locale={locale}
              />
              <p className="mt-4 text-center text-xs text-muted">
                {t("property.liveNote")}
              </p>
            </>
          ) : (
            <div className="card p-6">
              <StatusBadge status={property.status} />
              <h2 className="mt-4 text-2xl">
                {property.status === "INSPECTION_PENDING"
                  ? t("property.inInspection")
                  : property.status === "REJECTED"
                    ? t("property.rejected")
                    : t("property.preparing")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {property.status === "INSPECTION_PENDING"
                  ? t("property.inInspectionBody")
                  : property.status === "REJECTED"
                    ? t("property.rejectedBody")
                    : t("property.preparingBody")}
              </p>

              {scheduledInspection ? (
                <div className="mt-4 rounded-xl border border-hairline bg-cream px-4 py-3 text-sm">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                    {t("property.inspectionBooked")}
                  </p>
                  <p className="mt-1">
                    {formatDateTime(scheduledInspection.slotDatetime)}
                  </p>
                  <p className="text-xs text-muted">
                    {t("property.withSpecialist", {
                      name: scheduledInspection.specialist.fullName,
                    })}
                  </p>
                </div>
              ) : null}

              {property.plumScore !== null ? (
                <p className="mt-4 text-sm text-muted">
                  {t("property.lastScore")}{" "}
                  <span className="font-medium text-ink">{property.plumScore}</span>{" "}
                  {t("property.passMark")}
                </p>
              ) : null}

              {isOwner ? (
                <Link
                  href={`/dashboard/host/properties/${property.id}`}
                  className="btn btn-primary mt-5 w-full"
                >
                  {t("property.manageListing")}
                </Link>
              ) : (
                <Link href="/properties" className="btn btn-outline mt-5 w-full">
                  {t("property.exploreApproved")}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
