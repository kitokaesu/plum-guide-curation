export function StatCard({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string | number;
  detail?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-ink bg-ink text-cream"
          : "border-hairline bg-paper text-ink"
      }`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
          accent ? "text-cream/60" : "text-muted"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 font-display text-3xl leading-none">{value}</p>
      {detail ? (
        <p
          className={`mt-2 text-xs leading-relaxed ${
            accent ? "text-cream/60" : "text-muted"
          }`}
        >
          {detail}
        </p>
      ) : null}
    </div>
  );
}
