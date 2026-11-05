import Link from "next/link";
import { getI18n } from "@/lib/locale";

export async function SiteFooter() {
  const { t } = await getI18n();

  return (
    <footer className="mt-24 border-t border-hairline bg-[#F4EFE4]">
      <div className="container-page grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl tracking-tight">Plum Guide</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            {t("footer.blurb")}
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-gold">
            {t("footer.tagline")}
          </p>
        </div>

        <nav aria-label="Explore" className="text-sm">
          <p className="eyebrow mb-4">{t("footer.explore")}</p>
          <ul className="space-y-2.5 text-muted">
            <li>
              <Link href="/properties" className="hover:text-ink">
                {t("footer.vetted")}
              </Link>
            </li>
            <li>
              <Link href="/#plum-test" className="hover:text-ink">
                {t("nav.test")}
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="hover:text-ink">
                {t("footer.how")}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Account" className="text-sm">
          <p className="eyebrow mb-4">{t("footer.account")}</p>
          <ul className="space-y-2.5 text-muted">
            <li>
              <Link href="/login" className="hover:text-ink">
                {t("common.signIn")}
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-ink">
                {t("footer.create")}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-ink">
                {t("footer.dashboards")}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="eyebrow mb-4">{t("footer.concierge")}</p>
          <ul className="space-y-2.5 text-muted">
            <li>
              <a href="mailto:concierge@plumguide.com" className="hover:text-ink">
                concierge@plumguide.com
              </a>
            </li>
            <li>{t("footer.hours")}</li>
            <li className="pt-4 text-xs leading-relaxed text-muted/80">
              {t("footer.note")}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-hairline/70">
        <div className="container-page flex flex-col gap-2 py-5 text-[11px] uppercase tracking-[0.16em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
          <p>{t("footer.priceNote")}</p>
        </div>
      </div>
    </footer>
  );
}
