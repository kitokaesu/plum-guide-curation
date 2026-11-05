"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { addDays, isoDate, todayISO } from "@/lib/dates";

const TIMES = Array.from({ length: 21 }, (_, index) => {
  const minutes = 8 * 60 + index * 30;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
});

export function SlotPublisher() {
  const router = useRouter();
  const [date, setDate] = useState(() => isoDate(addDays(new Date(), 1)));
  const [time, setTime] = useState("10:00");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/specialist/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not publish that slot.");
      }
      setMessage("Slot published. Hosts can now book this inspection.");
      router.refresh();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Could not publish that slot."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <p className="eyebrow">Availability</p>
      <h2 className="mt-2 text-xl">Publish an inspection slot</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Slots are 90 minutes. Hosts book them for the Plum Test; you can withdraw
        any slot that has not been claimed.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="slot-date" className="label">
            Date
          </label>
          <input
            id="slot-date"
            type="date"
            min={todayISO()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="field"
            required
          />
        </div>
        <div>
          <label htmlFor="slot-time" className="label">
            Start time (UK)
          </label>
          <select
            id="slot-time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="field"
          >
            {TIMES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-xs text-wine">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="mt-3 text-xs text-moss">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-sm mt-4"
      >
        {pending ? "Publishing…" : "Publish slot"}
      </button>
    </form>
  );
}
