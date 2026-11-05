"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PLUM_PASS_SCORE } from "@/lib/constants";

export function InspectionAuditForm({
  slotId,
  propertyTitle,
}: {
  slotId: string;
  propertyTitle: string;
}) {
  const router = useRouter();
  const [score, setScore] = useState("90");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/specialist/inspections/${slotId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: Number(score), notes }),
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        propertyStatus?: string;
        score?: number;
      };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not record the inspection.");
      }
      setMessage(data.message ?? "Inspection recorded.");
      setNotes("");
      window.setTimeout(() => router.refresh(), 1500);
    } catch (auditError) {
      setError(
        auditError instanceof Error
          ? auditError.message
          : "Could not record the inspection."
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-xs leading-relaxed text-muted">
        Record your result for {propertyTitle}. A score of {PLUM_PASS_SCORE} or
        above approves the home automatically.
      </p>

      <div>
        <label htmlFor={`score-${slotId}`} className="label">
          Plum Test score (0–100)
        </label>
        <input
          id={`score-${slotId}`}
          type="number"
          min={0}
          max={100}
          step={1}
          value={score}
          onChange={(event) => setScore(event.target.value)}
          className="field max-w-[160px]"
          required
        />
      </div>

      <div>
        <label htmlFor={`notes-${slotId}`} className="label">
          Inspection notes
        </label>
        <textarea
          id={`notes-${slotId}`}
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="field resize-none"
          placeholder="What did you find? Note anything the host should address, and what stood out."
          required
          minLength={10}
        />
      </div>

      {error ? (
        <p role="alert" className="text-xs text-wine">
          {error}
        </p>
      ) : null}
      {message ? (
        <p role="status" className="rounded-xl bg-[#E9F0EA] px-3 py-2 text-xs text-moss">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-sm"
      >
        {pending ? "Recording…" : "Record Plum Test result"}
      </button>
    </form>
  );
}
