"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { makeT, roleLabel, type Locale } from "@/lib/i18n";

const DEMO_ACCOUNTS = [
  { role: "GUEST", email: "guest@plumguide.com", password: "Guest123!" },
  { role: "HOST", email: "host@plumguide.com", password: "Host123!" },
  {
    role: "SPECIALIST",
    email: "specialist@plumguide.com",
    password: "Specialist123!",
  },
  { role: "ADMIN", email: "admin@plumguide.com", password: "Admin123!" },
];

export function LoginForm({
  nextPath,
  locale,
}: {
  nextPath: string;
  locale: Locale;
}) {
  const router = useRouter();
  const t = useMemo(() => makeT(locale), [locale]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const target =
    nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? t("login.error"));
      }
      router.push(target);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : t("login.error"));
      setPending(false);
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className="label">
            {t("login.email")}
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="label">
            {t("login.password")}
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field"
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-wine/25 bg-[#F7E9E6] px-3 py-2 text-sm text-wine"
          >
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? t("login.pending") : t("login.button")}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        {t("login.newHere")}{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(target)}`}
          className="underline decoration-hairline underline-offset-4 hover:decoration-gold"
        >
          {t("login.create")}
        </Link>
        .
      </p>

      <div className="mt-8 border-t border-hairline pt-5">
        <p className="eyebrow mb-3">{t("login.demoTitle")}</p>
        <p className="mb-3 text-xs text-muted">{t("login.demoHint")}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
                setError(null);
              }}
              className="rounded-xl border border-hairline bg-paper px-3 py-2.5 text-left text-xs transition hover:border-gold hover:bg-goldSoft/20"
            >
              <span className="block font-semibold text-ink">
                {roleLabel(locale, account.role)}
              </span>
              <span className="mt-0.5 block truncate text-muted">{account.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
