import { daysUntil } from "./dates";
import { roundMoney } from "./format";
import { makeT, type Locale } from "./i18n";

export const CLEANING_FEE = 180;
export const SERVICE_RATE = 0.08;
export const MAX_NIGHTS = 30;

export type Quote = {
  nights: number;
  nightlySubtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  averageNightly: number;
};

export type RefundDecision = {
  percent: number;
  amount: number;
  days: number;
  headline: string;
  detail: string;
};

/** Cancellation tiers in the visitor's language. */
export function refundPolicy(locale: Locale) {
  const t = makeT(locale);
  return [
    { window: t("policy.over14"), refund: t("policy.refund100") },
    { window: t("policy.between"), refund: t("policy.refund50") },
    { window: t("policy.under7"), refund: t("policy.refundNone") },
  ];
}

export const REFUND_POLICY = [
  {
    window: "More than 14 days before check-in",
    refund: "100% refund",
  },
  {
    window: "7–14 days before check-in",
    refund: "50% refund",
  },
  {
    window: "Fewer than 7 days before check-in",
    refund: "No refund",
  },
] as const;

export function priceForNight(
  baseRate: number,
  customPrice: number | null | undefined
): number {
  return customPrice && customPrice > 0 ? customPrice : baseRate;
}

export function buildQuote(
  nights: string[],
  priceFor: (nightISO: string) => number
): Quote {
  const nightlySubtotal = roundMoney(
    nights.reduce((total, night) => total + priceFor(night), 0)
  );
  const serviceFee = roundMoney(nightlySubtotal * SERVICE_RATE);
  const total = roundMoney(nightlySubtotal + CLEANING_FEE + serviceFee);

  return {
    nights: nights.length,
    nightlySubtotal,
    cleaningFee: CLEANING_FEE,
    serviceFee,
    total,
    averageNightly: nights.length ? roundMoney(nightlySubtotal / nights.length) : 0,
  };
}

/**
 * Cancellation policy, evaluated against the check-in date.
 * 100% when more than 14 days out, 50% at 7–14 days, otherwise 0%.
 */
export function refundFor(
  checkIn: Date,
  totalPaid: number,
  from: Date = new Date()
): RefundDecision {
  const days = daysUntil(checkIn, from);

  if (days > 14) {
    return {
      percent: 100,
      amount: roundMoney(totalPaid),
      days,
      headline: "Full refund",
      detail: `${days} days before check-in — inside the free cancellation window.`,
    };
  }

  if (days >= 7) {
    return {
      percent: 50,
      amount: roundMoney(totalPaid * 0.5),
      days,
      headline: "50% refund",
      detail: `${days} days before check-in — half of the total is refundable.`,
    };
  }

  return {
    percent: 0,
    amount: 0,
    days,
    headline: "No refund due",
    detail:
      days >= 0
        ? `${days} days before check-in — inside the 7-day policy window.`
        : "The check-in date has already passed.",
  };
}
