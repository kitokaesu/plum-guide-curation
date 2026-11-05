import Link from "next/link";
import { eur } from "@/lib/format";
import { getI18n } from "@/lib/locale";
import { StatusBadge } from "./status-badge";

type PropertyCardProperty = {
  id: string;
  title: string;
  location: string;
  nightlyRate: number | string | { toNumber(): number };
  status: string;
  plumScore: number | null;
  imageUrl: string;
  bedrooms: number;
  maxGuests: number;
};

export async function PropertyCard({
  property,
}: {
  property: PropertyCardProperty;
}) {
  const { locale, t } = await getI18n();

  return (
    <article className="group">
      <Link
        href={`/properties/${property.id}`}
        className="block focus-visible:outline-none"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-hairline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={property.imageUrl}
            alt={`${property.title}, ${property.location}`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
          />
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <StatusBadge status={property.status} className="bg-paper/95" />
            {property.plumScore !== null ? (
              <span className="rounded-full bg-ink/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream backdrop-blur">
                {t("property.score", { score: property.plumScore })}
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[21px] leading-tight transition-colors group-hover:text-gold">
              {property.title}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {property.location} · {property.bedrooms} ·{" "}
              {t("properties.cardSleeps")} {property.maxGuests}
            </p>
          </div>
          <p className="shrink-0 text-right text-sm">
            <span className="font-medium">
              {eur(property.nightlyRate, 0, locale)}
            </span>
            <span className="block text-xs text-muted">{t("common.perNight")}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
