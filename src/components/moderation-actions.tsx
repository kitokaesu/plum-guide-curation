"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ModerationActions({
  propertyId,
  propertyTitle,
  currentStatus,
}: {
  propertyId: string;
  propertyTitle: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"APPROVE" | "REJECT" | null>(null);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function moderate(action: "APPROVE" | "REJECT") {
    setPending(action);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/admin/properties/${propertyId}/moderate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not update this listing.");
      }
      setMessage(data.message ?? "Listing updated.");
      setConfirmingReject(false);
      router.refresh();
    } catch (moderateError) {
      setError(
        moderateError instanceof Error
          ? moderateError.message
          : "Could not update this listing."
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      {confirmingReject ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">
            Reject {propertyTitle}?
          </span>
          <button
            type="button"
            onClick={() => moderate("REJECT")}
            disabled={pending !== null}
            className="btn btn-danger btn-sm"
          >
            {pending === "REJECT" ? "Rejecting…" : "Yes, reject"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingReject(false)}
            disabled={pending !== null}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => moderate("APPROVE")}
            disabled={pending !== null || currentStatus === "APPROVED"}
            className="btn btn-primary btn-sm"
          >
            {pending === "APPROVE" ? "Approving…" : "Approve"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingReject(true)}
            disabled={pending !== null || currentStatus === "REJECTED"}
            className="btn btn-outline btn-sm"
          >
            Reject
          </button>
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-2 text-[11px] text-wine">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="mt-2 text-[11px] text-moss">
          {message}
        </p>
      ) : null}
    </div>
  );
}
