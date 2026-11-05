import { DashboardNav } from "@/components/dashboard-nav";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { roleLabel } from "@/lib/i18n";
import { getI18n } from "@/lib/locale";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, { locale, t }] = await Promise.all([
    requireUser("/dashboard"),
    getI18n(),
  ]);
  const firstName = session.name.split(" ")[0];

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="eyebrow">
            {t("dash.portal", { role: roleLabel(locale, session.role) })}
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl">
            {t("dash.greeting", { name: firstName })}
          </h1>
        </div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
          {formatDate(new Date(), "long")}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <DashboardNav
          role={session.role}
          name={session.name}
          email={session.email}
          locale={locale}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
