"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function RefundOverrideForm({
  cancellationId,
  reference,
  initialRefund,
  maxRefund,
}: {
  cancellationId: string;
  reference: string;
  initialRefund: number;
  maxRefund: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(initialRefund));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/admin/cancellations/${cancellationId}/override`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refundAmount: Number(amount) }),
        }
      );
      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not update the refund.");
      }
      setMessage(data.message ?? "Refund updated.");
      router.refresh();
    } catch (overrideError) {
      setError(
        overrideError instanceof Error
          ? overrideError.message
          : "Could not update the refund."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <div>
        <label htmlFor={`refund-${cancellationId}`} className="sr-only">
          Refund amount for {reference}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
            €
          </span>
          <input
            id={`refund-${cancellationId}`}
            type="number"
            min={0}
            max={maxRefund}
            step={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-28 rounded-lg border border-hairline bg-white py-2 pl-6 pr-2 text-xs focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn btn-outline btn-sm"
      >
        {pending ? "Saving…" : "Override refund"}
      </button>
      {error ? (
        <p role="alert" className="w-full text-[10px] text-wine">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="w-full text-[10px] text-moss">
          {message}
        </p>
      ) : null}
    </form>
  );
}
