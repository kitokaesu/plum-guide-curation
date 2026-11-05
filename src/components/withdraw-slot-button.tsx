"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function WithdrawSlotButton({ slotId }: { slotId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function withdraw() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/specialist/slots/${slotId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not withdraw that slot.");
      }
      router.refresh();
    } catch (withdrawError) {
      setError(
        withdrawError instanceof Error
          ? withdrawError.message
          : "Could not withdraw that slot."
      );
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={withdraw}
        disabled={pending}
        className="text-xs underline decoration-hairline underline-offset-4 transition hover:decoration-wine hover:text-wine disabled:opacity-50"
      >
        {pending ? "Withdrawing…" : "Withdraw"}
      </button>
      {error ? (
        <p role="alert" className="mt-1 max-w-[180px] text-[10px] text-wine">
          {error}
        </p>
      ) : null}
    </div>
  );
}
