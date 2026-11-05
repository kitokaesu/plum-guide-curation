"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { makeT, type Locale } from "@/lib/i18n";

export function SignupForm({
  nextPath,
  initialRole = "GUEST",
  locale,
}: {
  nextPath: string;
  initialRole?: "GUEST" | "HOST";
  locale: Locale;
}) {
  const router = useRouter();
  const t = useMemo(() => makeT(locale), [locale]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"GUEST" | "HOST">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const target =
    nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setError(t("signup.errorPassword"));
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? t("signup.errorGeneric"));
      }
      router.push(target);
      router.refresh();
    } catch (signupError) {
      setError(
        signupError instanceof Error
          ? signupError.message
          : t("signup.errorGeneric")
      );
      setPending(false);
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="signup-name" className="label">
            {t("signup.name")}
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="field"
            placeholder="Amelia Hart"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="label">
            {t("signup.email")}
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="label">
            {t("signup.password")}
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field"
            placeholder={t("signup.passwordHint")}
            aria-describedby="signup-password-hint"
          />
          <p id="signup-password-hint" className="mt-2 text-xs text-muted">
            {t("signup.passwordHint")}
          </p>
        </div>

        <fieldset>
          <legend className="label">{t("signup.joiningAs")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="cursor-pointer rounded-xl border border-hairline bg-paper p-3 transition has-[:checked]:border-gold has-[:checked]:bg-goldSoft/25">
              <input
                type="radio"
                name="role"
                value="GUEST"
                checked={role === "GUEST"}
                onChange={() => setRole("GUEST")}
                className="sr-only"
              />
              <span className="block text-sm font-medium">{t("signup.guest")}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                {t("signup.guestBody")}
              </span>
            </label>
            <label className="cursor-pointer rounded-xl border border-hairline bg-paper p-3 transition has-[:checked]:border-gold has-[:checked]:bg-goldSoft/25">
              <input
                type="radio"
                name="role"
                value="HOST"
                checked={role === "HOST"}
                onChange={() => setRole("HOST")}
                className="sr-only"
              />
              <span className="block text-sm font-medium">{t("signup.host")}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                {t("signup.hostBody")}
              </span>
            </label>
          </div>
        </fieldset>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-wine/25 bg-[#F7E9E6] px-3 py-2 text-sm text-wine"
          >
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? t("signup.pending") : t("signup.button")}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        {t("signup.haveAccount")}{" "}
        <Link
          href={`/login?next=${encodeURIComponent(target)}`}
          className="underline decoration-hairline underline-offset-4 hover:decoration-gold"
        >
          {t("common.signIn")}
        </Link>
        .
      </p>
      <p className="mt-6 text-xs leading-relaxed text-muted">
        {t("signup.staffNote")}
      </p>
    </div>
  );
}
