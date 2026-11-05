"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  makeT,
  roleLabel,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";

const NAV_ITEMS: Record<string, { href: string; labelKey: MessageKey }[]> = {
  GUEST: [
    { href: "/dashboard/guest", labelKey: "dash.navTrips" },
    { href: "/properties", labelKey: "dash.navExplore" },
  ],
  HOST: [
    { href: "/dashboard/host", labelKey: "dash.navOverview" },
    { href: "/dashboard/host/listings/new", labelKey: "dash.navAdd" },
    { href: "/properties", labelKey: "dash.navExplore" },
  ],
  SPECIALIST: [
    { href: "/dashboard/specialist", labelKey: "dash.navInspections" },
    { href: "/properties", labelKey: "dash.navCollection" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", labelKey: "dash.navOperations" },
    { href: "/properties", labelKey: "dash.navCollection" },
  ],
};

export function DashboardNav({
  role,
  name,
  email,
  locale,
}: {
  role: string;
  name: string;
  email: string;
  locale: Locale;
}) {
  const pathname = usePathname();
  const t = makeT(locale);
  const items = NAV_ITEMS[role] ?? NAV_ITEMS.GUEST;

  return (
    <nav aria-label="Dashboard" className="lg:sticky lg:top-24 lg:h-fit">
      <p className="eyebrow mb-3 hidden lg:block">{t("dash.menu")}</p>
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {items.map((item) => {
          const active =
            item.href === "/properties"
              ? pathname.startsWith("/properties")
              : pathname === item.href ||
                (item.href === "/dashboard/host" &&
                  (pathname.startsWith("/dashboard/host/properties") ||
                    pathname.startsWith("/dashboard/host/listings")));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-full px-4 py-2.5 text-sm transition lg:rounded-xl ${
                  active
                    ? "bg-ink text-cream"
                    : "text-muted hover:bg-hairline/50 hover:text-ink"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 hidden rounded-2xl border border-hairline bg-paper p-4 lg:block">
        <p className="text-sm font-medium">{name}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{email}</p>
        <p className="mt-3 border-t border-hairline pt-3 text-[10px] uppercase tracking-[0.16em] text-gold">
          {roleLabel(locale, role)}
        </p>
      </div>
    </nav>
  );
}
