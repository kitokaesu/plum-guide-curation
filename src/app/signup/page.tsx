import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";
import { getSession } from "@/lib/auth";
import { getI18n } from "@/lib/locale";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; role?: string }>;
}) {
  const [{ locale, t }, session, { next, role }] = await Promise.all([
    getI18n(),
    getSession(),
    searchParams,
  ]);
  if (session) redirect("/dashboard");

  return (
    <div className="grid lg:min-h-[calc(100vh-72px)] lg:grid-cols-2">
      <div className="flex items-center px-5 py-12 sm:px-10 lg:justify-end lg:pr-20">
        <div className="w-full max-w-md">
          <p className="eyebrow">{t("signup.eyebrow")}</p>
          <h1 className="mt-3 text-4xl">{t("signup.title")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {t("signup.intro")}
          </p>
          <div className="mt-8">
            <SignupForm
              nextPath={next ?? "/dashboard"}
              initialRole={role === "HOST" ? "HOST" : "GUEST"}
              locale={locale}
            />
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-ink lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-cream">
          <span className="badge badge-gold">
            {locale === "pt" ? "150 critérios" : "150 checks"}
          </span>
          <p className="mt-5 max-w-md font-display text-3xl leading-snug">
            {locale === "pt"
              ? "Cada casa visitada. Cada detalhe avaliado. Cada estadia apoiada por um especialista que já esteve na sala."
              : "Every home visited. Every detail scored. Every stay backed by a specialist who has stood in the room."}
          </p>
        </div>
      </div>
    </div>
  );
}
