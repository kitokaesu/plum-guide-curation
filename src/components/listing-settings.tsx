"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function ListingSettings({
  propertyId,
  initialTitle,
  initialRate,
}: {
  propertyId: string;
  initialTitle: string;
  initialRate: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [rate, setRate] = useState(String(initialRate));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, nightlyRate: Number(rate) }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save changes.");
      setMessage("Listing updated.");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save changes."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={save} className="card p-5 sm:p-6">
      <p className="eyebrow">Listing details</p>
      <h2 className="mt-2 text-xl">Name and base rate</h2>
      <p className="mt-1 text-sm text-muted">
        The base rate applies to every night without a custom price.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1.5fr_1fr]">
        <div>
          <label htmlFor="listing-title" className="label">
            Listing title
          </label>
          <input
            id="listing-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="field"
            required
            minLength={3}
          />
        </div>
        <div>
          <label htmlFor="listing-rate" className="label">
            Base nightly rate in euros (EUR)
          </label>
          <input
            id="listing-rate"
            type="number"
            min={50}
            max={100000}
            step={10}
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            className="field"
            required
          />
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
        {pending ? "Saving…" : "Save listing details"}
      </button>
    </form>
  );
}
