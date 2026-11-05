import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import { plumTestCriteria } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { refundPolicy } from "@/lib/pricing";
import { getI18n } from "@/lib/locale";

export default async function HomePage() {
  const [{ locale, t }, featured, approvedCount, specialistCount, bookingCount] =
    await Promise.all([
      getI18n(),
      prisma.property.findMany({
        where: { status: "APPROVED" },
        orderBy: [{ plumScore: "desc" }, { createdAt: "asc" }],
        take: 3,
      }),
      prisma.property.count({ where: { status: "APPROVED" } }),
      prisma.user.count({ where: { role: "SPECIALIST" } }),
      prisma.booking.count(),
    ]);

  const criteria = plumTestCriteria(locale);
  const policy = refundPolicy(locale);

  return (
    <div>
      <section className="border-b border-hairline">
        <div className="container-page grid gap-12 py-12 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:py-16">
          <div className="max-w-xl">
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-gold" />
              {t("home.eyebrow")}
            </p>
            <h1 className="mt-5 text-balance font-display text-[46px] leading-[1.03] sm:text-6xl">
              {t("home.titleTop")}
              <br />
              <em className="text-gold">{t("home.titleAccent")}</em>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
              {t("home.intro")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/properties" className="btn btn-primary">
                {t("home.ctaExplore")}
              </Link>
              <Link href="#hosts" className="btn btn-outline">
                {t("home.ctaHost")}
              </Link>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-hairline pt-6">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  {t("home.statHomes")}
                </dt>
                <dd className="mt-1 font-display text-3xl">{approvedCount}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  {t("home.statSpecialists")}
                </dt>
                <dd className="mt-1 font-display text-3xl">{specialistCount}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  {t("home.statPoints")}
                </dt>
                <dd className="mt-1 font-display text-3xl">150</dd>
              </div>
            </dl>
          </div>

          <div className="relative pb-6">
            <div className="overflow-hidden rounded-[28px] bg-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80"
                alt={`Villa Fico, ${t("home.heroLocation")}`}
                className="aspect-[4/5] w-full object-cover lg:aspect-[5/5.4]"
              />
            </div>
            <div className="absolute inset-x-4 bottom-0 rounded-2xl border border-hairline bg-paper/95 p-4 shadow-lift backdrop-blur sm:left-auto sm:w-80">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Villa Fico</p>
                  <p className="mt-1 text-sm">{t("home.heroLocation")}</p>
                </div>
                <span className="badge badge-green">{t("status.APPROVED")}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-xs">
                <span className="text-muted">{t("home.heroScoreLabel")}</span>
                <span className="font-medium">98 / 100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline bg-goldSoft/40">
        <div className="container-page grid gap-6 py-6 text-[11px] uppercase tracking-[0.16em] text-muted sm:grid-cols-3">
          <p>{t("home.strip1")}</p>
          <p>{t("home.strip2")}</p>
          <p>{t("home.strip3")}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t("home.collectionEyebrow")}</p>
              <h2 className="mt-3 text-balance text-4xl sm:text-5xl">
                {t("home.collectionTitle")}
              </h2>
            </div>
            <Link
              href="/properties"
              className="text-sm underline decoration-hairline underline-offset-4 hover:decoration-gold"
            >
              {t("home.viewAll", { count: approvedCount })}
            </Link>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      <section id="plum-test" className="scroll-mt-24 border-y border-hairline bg-paper">
        <div className="container-page grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="order-2 lg:order-1">
            <p className="eyebrow">{t("home.testEyebrow")}</p>
            <h2 className="mt-3 text-balance text-4xl sm:text-5xl">
              {t("home.testTitle")}
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
              {t("home.testBody")}
            </p>

            <ol className="mt-8 grid gap-6 sm:grid-cols-2">
              {criteria.map((criterion, index) => (
                <li key={criterion.title}>
                  <p className="font-display text-2xl text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-lg">{criterion.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {criterion.description}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <span className="badge badge-green">{t("status.APPROVED")}</span>
              <span className="badge badge-amber">{t("status.INSPECTION_PENDING")}</span>
              <span className="badge badge-red">{t("status.REJECTED")}</span>
              <span className="badge badge-neutral">{t("status.DRAFT")}</span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-[28px] bg-hairline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80"
                alt={t("home.noteLabel")}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-ink/90 p-4 text-cream backdrop-blur">
                <p className="text-[10px] uppercase tracking-[0.2em] text-goldSoft">
                  {t("home.noteLabel")}
                </p>
                <p className="mt-2 font-display text-lg leading-snug">
                  {t("home.noteQuote")}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-cream/60">
                  {t("home.noteAuthor")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section scroll-mt-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">{t("home.howEyebrow")}</p>
            <h2 className="mt-3 text-balance text-4xl sm:text-5xl">
              {t("home.howTitle")}
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-muted">
              {t("home.howBody")}
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: t("home.step1Title"), body: t("home.step1Body") },
              { title: t("home.step2Title"), body: t("home.step2Body") },
              { title: t("home.step3Title"), body: t("home.step3Body") },
            ].map((step, index) => (
              <div key={step.title} className="card p-6">
                <p className="font-display text-3xl text-gold">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="card mt-8 grid gap-6 p-6 sm:grid-cols-[1fr_1.4fr] sm:items-center sm:p-8">
            <div>
              <p className="eyebrow">{t("home.policyEyebrow")}</p>
              <h3 className="mt-2 text-2xl">{t("home.policyTitle")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t("home.policyBody")}
              </p>
            </div>
            <ul className="divide-y divide-hairline text-sm">
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
          </div>
        </div>
      </section>

      <section id="hosts" className="scroll-mt-24">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-14 text-cream sm:px-12 lg:px-16">
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 hidden w-1/2 opacity-40 lg:block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80"
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-ink/20 via-ink/70 to-ink" />
            </div>
            <div className="relative max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-goldSoft">
                {t("home.hostsKicker")}
              </p>
              <h2 className="mt-3 text-balance text-4xl text-cream sm:text-5xl">
                {t("home.hostsTitle")}
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-cream/70">
                {t("home.hostsBody")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup?role=HOST&next=%2Fdashboard%2Fhost%2Flistings%2Fnew"
                  className="btn btn-gold"
                >
                  {t("home.hostsCta")}
                </Link>
                <Link href="/login" className="btn btn-cream">
                  {t("home.hostsSignIn")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-hairline">
        <div className="container-page flex flex-col items-start justify-between gap-6 py-14 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">{t("home.bottomEyebrow")}</p>
            <p className="mt-2 font-display text-3xl">
              {bookingCount} {t("home.bottomCount")}
            </p>
          </div>
          <Link href="/properties" className="btn btn-primary">
            {t("home.bottomCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
