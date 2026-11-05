"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  eachNightISO,
  formatDate,
  monthGrid,
  monthLabel,
  monthStart,
  startOfUTCDay,
  todayISO,
  WEEKDAYS,
} from "@/lib/dates";
import { eur } from "@/lib/format";
import {
  makeT,
  nightsLabel,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";
import { buildQuote, MAX_NIGHTS } from "@/lib/pricing";

type CalendarPayload = {
  blocked: string[];
  prices: Record<string, number>;
  startISO: string;
  endISO: string;
};

type BookingWidgetProps = {
  propertyId: string;
  propertyTitle: string;
  baseRate: number;
  calendar: CalendarPayload;
  isAuthenticated: boolean;
  loginHref: string;
  locale: Locale;
};

export function BookingWidget({
  propertyId,
  propertyTitle,
  baseRate,
  calendar,
  isAuthenticated,
  loginHref,
  locale,
}: BookingWidgetProps) {
  const router = useRouter();
  const t = useMemo(() => makeT(locale), [locale]);
  const today = todayISO();
  const blocked = useMemo(() => new Set(calendar.blocked), [calendar.blocked]);
  const [cursor, setCursor] = useState(() => {
    const d = startOfUTCDay(new Date());
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
  });
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const currentMonth = startOfUTCDay(new Date());
  const lastAllowed = startOfUTCDay(new Date(calendar.endISO));

  const months = useMemo(() => {
    const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
    const second = addMonths(first, 1);
    return [
      { year: first.getUTCFullYear(), month: first.getUTCMonth() },
      { year: second.getUTCFullYear(), month: second.getUTCMonth() },
    ];
  }, [cursor]);

  const canGoBack =
    new Date(Date.UTC(cursor.year, cursor.month, 1)).getTime() >
    new Date(
      Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1)
    ).getTime();
  const canGoForward =
    new Date(Date.UTC(cursor.year, cursor.month + 2, 1)).getTime() <=
    lastAllowed.getTime();

  const nights = useMemo(
    () => (checkIn && checkOut ? eachNightISO(checkIn, checkOut) : []),
    [checkIn, checkOut]
  );

  const quote = useMemo(
    () => buildQuote(nights, (night) => calendar.prices[night] ?? baseRate),
    [nights, calendar.prices, baseRate]
  );

  const isComplete = Boolean(checkIn && checkOut && quote.nights > 0);

  function moveMonth(direction: 1 | -1) {
    setCursor((prev) => {
      const next = addMonths(new Date(Date.UTC(prev.year, prev.month, 1)), direction);
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  }

  function selectDay(day: string) {
    setError(null);
    if (day < today || blocked.has(day) || day > calendar.endISO) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day);
      setCheckOut(null);
      return;
    }

    if (day <= checkIn) {
      setCheckIn(day);
      setCheckOut(null);
      return;
    }

    const proposed = eachNightISO(checkIn, day);
    if (proposed.length > MAX_NIGHTS) {
      setError(t("widget.errorMaxNights", { max: MAX_NIGHTS }));
      return;
    }
    if (proposed.some((night) => blocked.has(night))) {
      setError(t("widget.errorBlocked"));
      return;
    }
    setCheckOut(day);
  }

  function resetDates() {
    setCheckIn(null);
    setCheckOut(null);
    setError(null);
  }

  async function submit() {
    if (!checkIn || !checkOut) {
      setError(t("widget.errorChooseDates"));
      return;
    }
    if (!isAuthenticated) {
      router.push(loginHref);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, checkIn, checkOut }),
      });
      const data = (await response.json()) as {
        id?: string;
        error?: string;
      };
      if (!response.ok || !data.id) {
        throw new Error(data.error ?? t("widget.errorGeneric"));
      }
      router.push(`/bookings/${data.id}/confirmation`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : t("widget.errorGeneric")
      );
      setPending(false);
    }
  }

  function dayClasses(day: string) {
    const isBlocked = blocked.has(day);
    const isPast = day < today;
    const isSelected = day === checkIn || day === checkOut;
    const inRange =
      Boolean(checkIn && checkOut) &&
      day > (checkIn as string) &&
      day < (checkOut as string);

    if (isPast) {
      return "cursor-not-allowed text-muted/30";
    }
    if (isBlocked) {
      return "cursor-not-allowed text-muted/35 line-through decoration-hairline";
    }
    if (isSelected) {
      return "bg-ink font-medium text-cream shadow-sm";
    }
    if (inRange) {
      return "bg-goldSoft text-ink";
    }
    return "text-ink hover:bg-goldSoft/70";
  }

  return (
    <div className="card overflow-hidden shadow-lift">
      <div className="border-b border-hairline px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-muted">{t("common.from")}</p>
          <p className="font-display text-2xl">
            {eur(baseRate, 0, locale)}
            <span className="ml-1 font-sans text-xs text-muted">
              / {t("common.nightOne")}
            </span>
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-xl border border-hairline">
          <div className="border-r border-hairline p-3">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {t("widget.checkIn")}
            </span>
            <span className="mt-1 block text-sm">
              {checkIn ? formatDate(checkIn) : t("widget.addDate")}
            </span>
          </div>
          <div className="p-3">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {t("widget.checkOut")}
            </span>
            <span className="mt-1 block text-sm">
              {checkOut ? formatDate(checkOut) : t("widget.addDate")}
            </span>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            disabled={!canGoBack}
            aria-label={t("widget.prevMonth")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-sm transition hover:border-ink disabled:opacity-30"
          >
            ←
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {t("widget.selectNights")}
          </p>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            disabled={!canGoForward}
            aria-label={t("widget.nextMonth")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-sm transition hover:border-ink disabled:opacity-30"
          >
            →
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {months.map((month) => (
            <div key={`${month.year}-${month.month}`}>
              <p className="mb-2 text-center text-sm font-medium">
                {monthLabel(month.year, month.month, locale)}
              </p>
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {WEEKDAYS.map((weekday) => (
                  <span
                    key={weekday}
                    aria-hidden="true"
                    className="pb-1 text-[9px] font-semibold uppercase tracking-wide text-muted"
                  >
                    {weekday.slice(0, 1)}
                  </span>
                ))}
                {monthGrid(month.year, month.month).map((day, index) =>
                  day ? (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDay(day)}
                      disabled={day < today || blocked.has(day)}
                      aria-label={`${formatDate(day, "long")}${
                        blocked.has(day) ? `, ${t("widget.unavailable")}` : ""
                      }`}
                      aria-pressed={day === checkIn || day === checkOut}
                      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition ${dayClasses(
                        day
                      )}`}
                    >
                      {Number(day.slice(8, 10))}
                    </button>
                  ) : (
                    <span key={`empty-${index}`} aria-hidden="true" />
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.1em] text-muted">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ink" />
            {t("widget.legendSelected")}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-goldSoft ring-1 ring-gold/40"
            />
            {t("widget.legendStay")}
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-hairline" />
            {t("widget.legendUnavailable")}
          </span>
        </div>

        <div aria-live="polite" className="mt-4">
          {isComplete ? (
            <dl className="space-y-2 border-t border-hairline pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">
                  {t("widget.priceLine", {
                    price: eur(quote.averageNightly, 0, locale),
                    count: quote.nights,
                  })}{" "}
                  {nightsLabel(locale, quote.nights)}
                </dt>
                <dd>{eur(quote.nightlySubtotal, 0, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t("widget.cleaning")}</dt>
                <dd>{eur(quote.cleaningFee, 0, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">{t("widget.service")}</dt>
                <dd>{eur(quote.serviceFee, 0, locale)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-hairline pt-3 text-base font-medium">
                <dt>{t("common.total")}</dt>
                <dd>{eur(quote.total, 0, locale)}</dd>
              </div>
            </dl>
          ) : (
            <p className="border-t border-hairline pt-4 text-sm text-muted">
              {checkIn ? t("widget.selectCheckOut") : t("widget.selectCheckIn")}
            </p>
          )}
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-wine/25 bg-[#F7E9E6] px-3 py-2 text-xs leading-relaxed text-wine"
          >
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={pending || !isComplete}
          className="btn btn-primary mt-4 w-full"
        >
          {pending ? t("widget.confirming") : t("widget.confirm")}
        </button>

        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted">
          <button
            type="button"
            onClick={resetDates}
            className="underline decoration-hairline underline-offset-4 hover:decoration-gold"
          >
            {t("widget.clearDates")}
          </button>
          <span>
            {isAuthenticated ? t("widget.instant") : t("widget.signInCheckout")}
          </span>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-muted/80">
          {t("widget.demoNote", { title: propertyTitle })}
        </p>
      </div>
    </div>
  );
}

export type { MessageKey };
