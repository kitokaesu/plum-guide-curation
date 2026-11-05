import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";
import { getI18n } from "@/lib/locale";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ locale, t }, session, { next }] = await Promise.all([
    getI18n(),
    getSession(),
    searchParams,
  ]);
  if (session) redirect("/dashboard");

  return (
    <div className="grid lg:min-h-[calc(100vh-72px)] lg:grid-cols-2">
      <div className="flex items-center px-5 py-12 sm:px-10 lg:justify-end lg:pr-20">
        <div className="w-full max-w-md">
          <p className="eyebrow">{t("login.eyebrow")}</p>
          <h1 className="mt-3 text-4xl">{t("login.title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {t("login.intro")}
          </p>
          <div className="mt-8">
            <LoginForm nextPath={next ?? "/dashboard"} locale={locale} />
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-ink lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-cream">
          <span className="badge badge-gold">{t("status.APPROVED")}</span>
          <p className="mt-5 max-w-md font-display text-3xl leading-snug">
            {locale === "pt"
              ? "«A única lista de casas que consulto antes de reservar — porque alguém já lá esteve.»"
              : "“The only list of homes I check before I book — because someone has already been there.”"}
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-cream/60">
            {locale === "pt"
              ? "Amelia Hart · hóspede desde 2023"
              : "Amelia Hart · Guest since 2023"}
          </p>
        </div>
      </div>
    </div>
  );
}
