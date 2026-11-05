import Link from "next/link";
import { getSession } from "@/lib/auth";
import { roleLabel } from "@/lib/i18n";
import { getI18n } from "@/lib/locale";
import { LocaleSwitcher } from "./locale-switcher";
import { SignOutButton } from "./sign-out-button";

export async function SiteHeader() {
  const [session, { locale, t }] = await Promise.all([getSession(), getI18n()]);

  return (
    <>
      <aside
        aria-label={t("banner.kicker")}
        className="border-b border-ink/40 bg-ink text-cream"
      >
        <div className="container-page flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-2.5 text-[11px] leading-relaxed">
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-semibold uppercase tracking-[0.2em] text-goldSoft">
              {t("banner.kicker")}
            </span>
            <span className="text-cream/75">{t("banner.text")}</span>
          </p>
          <Link
            href="/properties"
            className="uppercase tracking-[0.16em] text-cream/80 underline decoration-cream/30 underline-offset-4 transition-colors hover:text-cream hover:decoration-goldSoft"
          >
            {t("banner.cta")}
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-hairline/80 bg-cream/95 backdrop-blur">
        <div className="container-page flex h-[72px] items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-baseline gap-2.5">
            <span className="font-display text-[26px] leading-none tracking-tight">
              Plum Guide
            </span>
            <span className="hidden text-[9px] font-semibold uppercase tracking-editorial text-gold sm:block">
              {t("nav.brandTag")}
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 text-sm md:flex">
            <Link href="/properties" className="transition-colors hover:text-gold">
              {t("nav.homes")}
            </Link>
            <Link href="/#plum-test" className="transition-colors hover:text-gold">
              {t("nav.test")}
            </Link>
            <Link href="/#hosts" className="transition-colors hover:text-gold">
              {t("nav.hosts")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden text-right text-xs leading-tight text-muted transition-colors hover:text-ink sm:block"
                >
                  <span className="block font-medium text-ink">{session.name}</span>
                  <span>{roleLabel(locale, session.role)}</span>
                </Link>
                <Link href="/dashboard" className="btn btn-outline btn-sm">
                  {t("common.dashboard")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm underline decoration-hairline underline-offset-4 transition-colors hover:decoration-gold sm:block"
                >
                  {t("common.signIn")}
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm">
                  {t("common.join")}
                </Link>
              </>
            )}
            <LocaleSwitcher locale={locale} />
            {session ? <SignOutButton label={t("common.signOut")} /> : null}
          </div>
        </div>
      </header>
    </>
  );
}
