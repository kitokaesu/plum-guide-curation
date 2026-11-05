"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  formatDate,
  monthGrid,
  monthLabel,
  startOfUTCDay,
  WEEKDAYS,
} from "@/lib/dates";
import { eur } from "@/lib/format";

type HostDay = {
  date: string;
  isAvailable: boolean;
  customPrice: number | null;
  booked: boolean;
};

type AvailabilityManagerProps = {
  propertyId: string;
  days: HostDay[];
  baseRate: number;
};

export function AvailabilityManager({
  propertyId,
  days,
  baseRate,
}: AvailabilityManagerProps) {
  const [calendar, setCalendar] = useState<Record<string, HostDay>>(() =>
    Object.fromEntries(days.map((day) => [day.date, day]))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [draftAvailable, setDraftAvailable] = useState(true);
  const [draftPrice, setDraftPrice] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = startOfUTCDay(new Date());
  const [cursor, setCursor] = useState({
    year: start.getUTCFullYear(),
    month: start.getUTCMonth(),
  });
  const lastDate = days[days.length - 1]?.date ?? start.toISOString().slice(0, 10);
  const current = selected ? calendar[selected] : null;

  const months = useMemo(() => {
    const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
    const second = addMonths(first, 1);
    return [
      { year: first.getUTCFullYear(), month: first.getUTCMonth() },
      { year: second.getUTCFullYear(), month: second.getUTCMonth() },
    ];
  }, [cursor]);

  const canGoBack =
    cursor.year > start.getUTCFullYear() ||
    (cursor.year === start.getUTCFullYear() && cursor.month > start.getUTCMonth());
  const canGoForward =
    new Date(Date.UTC(cursor.year, cursor.month + 2, 1)).getTime() <=
    new Date(`${lastDate}T00:00:00Z`).getTime();

  function openDay(date: string) {
    const day = calendar[date];
    if (!day) return;
    setSelected(date);
    setDraftAvailable(day.isAvailable);
    setDraftPrice(day.customPrice != null ? String(day.customPrice) : "");
    setMessage(null);
    setError(null);
  }

  async function saveDay(clearPrice = false) {
    if (!current) return;
    if (!current.booked && !draftAvailable) {
      // closing is allowed even with a price; nothing extra to validate
    }
    if (!draftAvailable && current.booked) {
      setError("This night is held by a confirmed reservation and cannot be opened until it is cancelled.");
      return;
    }

    const priceValue = clearPrice || draftPrice.trim() === "" ? null : Number(draftPrice);
    if (priceValue !== null && (!Number.isFinite(priceValue) || priceValue <= 0)) {
      setError("Enter a nightly price of at least €1, or leave it blank to use the base rate.");
      return;
    }
    if (priceValue !== null && priceValue > 100000) {
      setError("That nightly price looks too high. Please check the amount.");
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/properties/${propertyId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: current.date,
          isAvailable: current.booked ? false : draftAvailable,
          customPrice: priceValue,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        day?: HostDay;
      };
      if (!response.ok || !data.day) {
        throw new Error(data.error ?? "Could not update that date.");
      }
      setCalendar((prev) => ({ ...prev, [data.day!.date]: data.day! }));
      setSelected(data.day.date);
      setDraftAvailable(data.day.isAvailable);
      setDraftPrice(data.day.customPrice != null ? String(data.day.customPrice) : "");
      setMessage(`Saved ${formatDate(data.day.date)}.`);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not update that date."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setCursor((prev) => {
                const next = addMonths(new Date(Date.UTC(prev.year, prev.month, 1)), -1);
                return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
              })
            }
            disabled={!canGoBack}
            className="btn btn-outline btn-sm"
            aria-label="Previous month"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() =>
              setCursor((prev) => {
                const next = addMonths(new Date(Date.UTC(prev.year, prev.month, 1)), 1);
                return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
              })
            }
            disabled={!canGoForward}
            className="btn btn-outline btn-sm"
            aria-label="Next month"
          >
            Next →
          </button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {months.map((month) => (
            <div key={`${month.year}-${month.month}`}>
              <p className="mb-3 text-center font-display text-lg">
                {monthLabel(month.year, month.month)}
              </p>
              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((weekday) => (
                  <span
                    key={weekday}
                    className="pb-1 text-center text-[9px] font-semibold uppercase tracking-wide text-muted"
                  >
                    {weekday.slice(0, 1)}
                  </span>
                ))}
                {monthGrid(month.year, month.month).map((date, index) => {
                  if (!date) return <span key={`empty-${index}`} aria-hidden="true" />;
                  const day = calendar[date];
                  const isPast = date < start.toISOString().slice(0, 10);
                  const isSelected = date === selected;
                  const classes = isPast
                    ? "cursor-not-allowed text-muted/25"
                    : day?.booked
                      ? "bg-ink text-cream"
                      : day?.isAvailable
                        ? "bg-white text-ink hover:border-gold"
                        : "bg-[#F5E6E2] text-wine hover:border-wine/40";

                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={isPast || !day}
                      onClick={() => openDay(date)}
                      aria-pressed={isSelected}
                      aria-label={`${formatDate(date, "long")}${
                        day?.booked
                          ? ", reserved"
                          : day?.isAvailable
                            ? ", open"
                            : ", closed"
                      }`}
                      className={`relative flex aspect-square items-center justify-center rounded-lg border text-xs transition ${classes} ${
                        isSelected ? "ring-2 ring-gold ring-offset-1" : "border-hairline/60"
                      }`}
                    >
                      {Number(date.slice(8, 10))}
                      {day?.customPrice != null ? (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-1 h-1 w-1 rounded-full bg-gold"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-hairline pt-4 text-[10px] uppercase tracking-[0.1em] text-muted">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded border border-hairline bg-white" /> Open
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded bg-[#F5E6E2]" /> Closed
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded bg-ink" /> Reserved
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gold" /> Custom price
          </span>
        </div>
      </div>

      <div className="card h-fit p-5 sm:p-6">
        <p className="eyebrow mb-2">Availability</p>
        {current ? (
          <>
            <h3 className="text-xl">{formatDate(current.date, "long")}</h3>
            <p className="mt-1 text-sm text-muted">
              Base rate {eur(baseRate)} per night.
            </p>

            {current.booked ? (
              <div className="mt-5 rounded-xl border border-hairline bg-cream px-4 py-3 text-sm leading-relaxed text-muted">
                This night is held by a confirmed guest reservation. It will return
                to your calendar automatically if the guest cancels.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <fieldset>
                  <legend className="label">Night status</legend>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-hairline px-3 py-2.5 text-sm has-[:checked]:border-gold has-[:checked]:bg-goldSoft/30">
                      <input
                        type="radio"
                        name={`status-${current.date}`}
                        checked={draftAvailable}
                        onChange={() => setDraftAvailable(true)}
                        className="accent-gold"
                      />
                      Open for bookings
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-hairline px-3 py-2.5 text-sm has-[:checked]:border-wine/40 has-[:checked]:bg-[#F9EEEC]">
                      <input
                        type="radio"
                        name={`status-${current.date}`}
                        checked={!draftAvailable}
                        onChange={() => setDraftAvailable(false)}
                        className="accent-wine"
                      />
                      Closed to guests
                    </label>
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="custom-price" className="label">
                    Custom nightly price
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                      €
                    </span>
                    <input
                      id="custom-price"
                      type="number"
                      min={1}
                      step={10}
                      inputMode="numeric"
                      value={draftPrice}
                      onChange={(event) => setDraftPrice(event.target.value)}
                      placeholder={String(Math.round(baseRate))}
                      className="field pl-8"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Leave blank to use the base rate of {eur(baseRate)}.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => saveDay(false)}
                    disabled={pending}
                    className="btn btn-primary btn-sm"
                  >
                    {pending ? "Saving…" : "Save date"}
                  </button>
                  {current.customPrice != null ? (
                    <button
                      type="button"
                      onClick={() => saveDay(true)}
                      disabled={pending}
                      className="btn btn-ghost btn-sm"
                    >
                      Reset price
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {error ? (
              <p role="alert" className="mt-4 rounded-xl bg-[#F7E9E6] px-3 py-2 text-xs text-wine">
                {error}
              </p>
            ) : null}
            {message ? (
              <p role="status" className="mt-4 rounded-xl bg-[#E9F0EA] px-3 py-2 text-xs text-moss">
                {message}
              </p>
            ) : null}
          </>
        ) : (
          <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
            <p>Select any date to open or close it for guests.</p>
            <p>
              You can also set a custom nightly price for peak dates — it overrides
              your base rate for that night only.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
