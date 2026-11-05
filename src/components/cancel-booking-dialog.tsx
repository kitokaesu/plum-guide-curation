"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, parseISODate } from "@/lib/dates";
import { eur } from "@/lib/format";
import { makeT, type Locale } from "@/lib/i18n";
import { refundFor, refundPolicy } from "@/lib/pricing";

type CancelBookingDialogProps = {
  bookingId: string;
  propertyTitle: string;
  checkInISO: string;
  checkOutISO: string;
  totalPrice: number;
  locale?: Locale;
  compact?: boolean;
};

export function CancelBookingDialog({
  bookingId,
  propertyTitle,
  checkInISO,
  checkOutISO,
  totalPrice,
  locale = "en",
  compact = false,
}: CancelBookingDialogProps) {
  const router = useRouter();
  const t = useMemo(() => makeT(locale), [locale]);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const checkIn = parseISODate(checkInISO);
  const refund = checkIn ? refundFor(checkIn, totalPrice) : null;
  const policy = refundPolicy(locale);

  const refundDetail = (() => {
    if (!refund) return "";
    if (refund.percent === 100) return t("cancel.daysFull", { days: refund.days });
    if (refund.percent === 50) return t("cancel.daysHalf", { days: refund.days });
    return refund.days >= 0
      ? t("cancel.daysNone", { days: refund.days })
      : t("cancel.passed");
  })();

  const refundHeadline =
    refund?.percent === 100
      ? t("cancel.full")
      : refund?.percent === 50
        ? t("cancel.half")
        : t("cancel.none");

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function close() {
    if (pending) return;
    setOpen(false);
    setError(null);
  }

  async function confirmCancellation() {
    if (reason.trim().length < 10) {
      setError(t("cancel.errorShort"));
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? t("cancel.errorGeneric"));
      }
      setOpen(false);
      setPending(false);
      router.refresh();
    } catch (cancelError) {
      setError(
        cancelError instanceof Error ? cancelError.message : t("cancel.errorGeneric")
      );
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={compact ? "btn btn-outline btn-sm" : "btn btn-outline"}
      >
        {t("cancel.button")}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            aria-describedby="cancel-dialog-description"
            className="relative w-full max-w-lg animate-fadeUp rounded-2xl border border-hairline bg-paper p-6 shadow-2xl sm:p-8"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label={t("cancel.keep")}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-hairline/50 hover:text-ink"
            >
              ×
            </button>

            <p className="eyebrow mb-2">{t("cancel.eyebrow")}</p>
            <h2 id="cancel-dialog-title" className="text-2xl">
              {t("cancel.title")}
            </h2>
            <p
              id="cancel-dialog-description"
              className="mt-2 text-sm leading-relaxed text-muted"
            >
              {t("cancel.description", {
                title: propertyTitle,
                from: formatDate(checkInISO),
                to: formatDate(checkOutISO),
              })}
            </p>

            <div className="mt-5 rounded-xl border border-hairline bg-cream p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-muted">{t("cancel.estimated")}</span>
                <span className="font-display text-2xl">
                  {eur(refund?.amount ?? 0, 0, locale)}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium">
                {refund
                  ? `${refundHeadline} · ${t("cancel.percentOf", {
                      percent: refund.percent,
                      amount: eur(totalPrice, 0, locale),
                    })}`
                  : ""}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {refundDetail}
              </p>
              <ul className="mt-4 space-y-1.5 border-t border-hairline pt-3 text-xs text-muted">
                {policy.map((tier) => (
                  <li key={tier.window} className="flex justify-between gap-3">
                    <span>{tier.window}</span>
                    <span className="font-medium text-ink">{tier.refund}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <label htmlFor="cancel-reason" className="label">
                {t("cancel.reasonLabel")}
              </label>
              <textarea
                id="cancel-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={3}
                className="field resize-none"
                placeholder={t("cancel.reasonPlaceholder")}
                required
                minLength={10}
                aria-describedby="cancel-reason-hint"
              />
              <p id="cancel-reason-hint" className="mt-2 text-xs text-muted">
                {t("cancel.reasonHint")}
              </p>
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-wine/25 bg-[#F7E9E6] px-3 py-2 text-xs text-wine"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={close}
                disabled={pending}
                className="btn btn-outline"
              >
                {t("cancel.keep")}
              </button>
              <button
                type="button"
                onClick={confirmCancellation}
                disabled={pending}
                className="btn btn-danger"
              >
                {pending ? t("cancel.confirming") : t("cancel.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
