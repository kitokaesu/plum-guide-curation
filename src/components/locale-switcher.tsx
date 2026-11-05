"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LOCALES,
  LOCALE_SHORT_LABELS,
  LOCALE_LABELS,
  translate,
  type Locale,
} from "@/lib/i18n";

/**
 * EN | PT toggle. Writes the preference cookie and re-renders the current
 * page server-side, so the whole UI changes language without a reload.
 *
 * The cookie is the source of truth: the highlight follows the `locale` the
 * server actually rendered, so a write that does not land reverts the pill
 * instead of leaving it looking switched while the page stays in the old
 * language.
 */
export function LocaleSwitcher({
  locale,
  tone = "dark",
}: {
  locale: Locale;
  tone?: "dark" | "light";
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<Locale>(locale);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const inFlight = useRef(false);

  // After a successful refresh the server renders the new locale; after a
  // failed one it still renders the old locale, and the pill rolls back.
  useEffect(() => {
    setCurrent(locale);
  }, [locale]);

  async function change(next: Locale) {
    if (next === locale || inFlight.current) return;
    const previous = locale;
    inFlight.current = true;
    setFailed(false);
    setSaving(true);
    setCurrent(next);
    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      if (!response.ok) throw new Error(`Locale write failed: ${response.status}`);
      router.refresh();
    } catch {
      setCurrent(previous);
      setFailed(true);
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div
        role="group"
        aria-label={translate(current, "common.language")}
        className={`inline-flex items-center gap-0.5 rounded-full p-0.5 ${
          tone === "light"
            ? "border border-hairline bg-paper"
            : "border border-cream/25 bg-cream/10"
        }`}
      >
        {LOCALES.map((code) => {
          const active = code === current;
          return (
            <button
              key={code}
              type="button"
              onClick={() => change(code)}
              aria-pressed={active}
              aria-label={LOCALE_LABELS[code]}
              title={LOCALE_LABELS[code]}
              disabled={saving}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition disabled:opacity-60 ${
                active
                  ? tone === "light"
                    ? "bg-ink text-cream"
                    : "bg-cream text-ink"
                  : tone === "light"
                    ? "text-muted hover:text-ink"
                    : "text-cream/70 hover:text-cream"
              }`}
            >
              {LOCALE_SHORT_LABELS[code]}
            </button>
          );
        })}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {failed ? translate(current, "common.languageError") : ""}
      </p>
    </div>
  );
}
