"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  async function change(next: Locale) {
    if (next === current || saving) return;
    setCurrent(next);
    setSaving(true);
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      startTransition(() => {
        router.refresh();
      });
    } finally {
      setSaving(false);
    }
  }

  return (
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
            disabled={pending || saving}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
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
  );
}
