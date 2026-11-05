import { getLocale } from "@/lib/locale";
import { statusLabel } from "@/lib/i18n";

type Tone = "green" | "amber" | "red" | "neutral" | "gold" | "ink";

const STATUS_TONES: Record<string, Tone> = {
  DRAFT: "neutral",
  INSPECTION_PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
  CONFIRMED: "green",
  CANCELLED: "red",
  COMPLETED: "neutral",
  AVAILABLE: "green",
  BOOKED: "amber",
};

export async function StatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const locale = await getLocale();
  const tone = STATUS_TONES[status] ?? "neutral";

  return (
    <span className={`badge badge-${tone} ${className}`}>
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "green"
            ? "bg-moss"
            : tone === "amber"
              ? "bg-amber"
              : tone === "red"
                ? "bg-wine"
                : "bg-muted"
        }`}
      />
      {statusLabel(locale, status)}
    </span>
  );
}
