"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateTime } from "@/lib/dates";

type SlotOption = {
  id: string;
  slotDatetime: string;
  specialist: string;
};

export function InspectionRequestPanel({
  propertyId,
  propertyStatus,
  slots,
  scheduled,
}: {
  propertyId: string;
  propertyStatus: string;
  slots: SlotOption[];
  scheduled: { slotDatetime: string; specialist: string } | null;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canBook = propertyStatus === "DRAFT" || propertyStatus === "REJECTED";

  async function book(slotId: string) {
    setPendingId(slotId);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/inspection-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotId }),
        }
      );
      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not schedule the inspection.");
      }
      setMessage(data.message ?? "Plum Test scheduled.");
      router.refresh();
    } catch (bookError) {
      setError(
        bookError instanceof Error
          ? bookError.message
          : "Could not schedule the inspection."
      );
    } finally {
      setPendingId(null);
    }
  }

  if (scheduled) {
    return (
      <div className="card p-5 sm:p-6">
        <p className="eyebrow">Plum Test</p>
        <h2 className="mt-2 text-xl">Inspection booked</h2>
        <div className="mt-4 rounded-xl border border-amber/25 bg-[#F8EFDC] p-4">
          <p className="text-sm font-medium">
            {formatDateTime(scheduled.slotDatetime)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Specialist: {scheduled.specialist}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Your specialist will visit the home and score it against 150 checks.
            Homes scoring 85 or above are approved automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 sm:p-6">
      <p className="eyebrow">Plum Test</p>
      <h2 className="mt-2 text-xl">
        {canBook ? "Schedule your inspection" : "Inspection in progress"}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Choose an available specialist slot. The inspection takes around 90
        minutes and your result is recorded the same day.
      </p>

      {!canBook ? (
        <div className="mt-4 rounded-xl border border-hairline bg-cream px-4 py-3 text-sm text-muted">
          {propertyStatus === "INSPECTION_PENDING"
            ? "A Plum Test is already scheduled for this home."
            : "This home has passed the Plum Test. Contact the curation team if you would like a re-inspection."}
        </div>
      ) : slots.length === 0 ? (
        <div className="mt-4 rounded-xl border border-hairline bg-cream px-4 py-3 text-sm text-muted">
          No specialist slots are open right now. New availability is published
          regularly — please check back shortly.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {formatDateTime(slot.slotDatetime)}
                </p>
                <p className="text-xs text-muted">{slot.specialist}</p>
              </div>
              <button
                type="button"
                onClick={() => book(slot.id)}
                disabled={pendingId !== null}
                className="btn btn-outline btn-sm"
              >
                {pendingId === slot.id ? "Booking…" : "Schedule Plum Test"}
              </button>
            </li>
          ))}
        </ul>
      )}

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
    </div>
  );
}
