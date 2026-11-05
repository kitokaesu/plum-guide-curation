"use client";

export function PrintButton({ label = "Download / print invoice" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary no-print">
      {label}
    </button>
  );
}
