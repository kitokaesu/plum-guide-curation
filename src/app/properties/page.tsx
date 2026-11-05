import Link from "next/link";
import type { Metadata } from "next";
import { PropertyCard } from "@/components/property-card";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/lib/locale";
import type { Prisma } from "@prisma/client";
import type { MessageKey } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Vetted homes",
  description:
    "Browse Plum Guide homes that have passed the 150-point Plum Test, with live availability and transparent pricing.",
};

type SearchParams = Promise<{ q?: string; sort?: string }>;

const SORTS = {
  curated: {
    labelKey: "properties.sortCurated",
    orderBy: [{ plumScore: "desc" }, { title: "asc" }],
  },
  "price-asc": {
    labelKey: "properties.sortPriceAsc",
    orderBy: [{ nightlyRate: "asc" }],
  },
  "price-desc": {
    labelKey: "properties.sortPriceDesc",
    orderBy: [{ nightlyRate: "desc" }],
  },
} satisfies Record<
  string,
  { labelKey: MessageKey; orderBy: Prisma.PropertyOrderByWithRelationInput[] }
>;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [{ t }, params] = await Promise.all([getI18n(), searchParams]);
  const q = (params.q ?? "").trim();
  const sortKey = (
    params.sort && params.sort in SORTS ? params.sort : "curated"
  ) as keyof typeof SORTS;

  const properties = await prisma.property.findMany({
    where: {
      status: "APPROVED",
      ...(q
        ? {
            OR: [{ title: { contains: q } }, { location: { contains: q } }],
          }
        : {}),
    },
    orderBy: SORTS[sortKey].orderBy,
  });

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="max-w-2xl">
        <p className="eyebrow">{t("properties.eyebrow")}</p>
        <h1 className="mt-3 text-balance text-4xl sm:text-5xl">
          {t("properties.title")}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          {t("properties.subtitle", {
            count: properties.length,
            homes: t(
              properties.length === 1
                ? "properties.homeOne"
                : "properties.homeMany"
            ),
          })}
        </p>
      </div>

      <form
        method="get"
        className="mt-8 flex flex-col gap-3 border-y border-hairline py-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="search-q" className="label">
            {t("properties.whereTo")}
          </label>
          <input
            id="search-q"
            name="q"
            defaultValue={q}
            className="field"
            placeholder={t("properties.searchPlaceholder")}
          />
        </div>
        <div className="sm:w-56">
          <label htmlFor="search-sort" className="label">
            {t("properties.sortBy")}
          </label>
          <select
            id="search-sort"
            name="sort"
            defaultValue={sortKey}
            className="field"
          >
            {Object.entries(SORTS).map(([value, sort]) => (
              <option key={value} value={value}>
                {t(sort.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          {t("properties.search")}
        </button>
        {q ? (
          <Link href="/properties" className="btn btn-ghost">
            {t("properties.clear")}
          </Link>
        ) : null}
      </form>

      {properties.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <p className="eyebrow">{t("properties.noMatchEyebrow")}</p>
          <h2 className="mt-3 text-2xl">{t("properties.noMatchTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            {t("properties.noMatchBody")}
          </p>
          <Link href="/properties" className="btn btn-primary mt-6">
            {t("properties.viewAll")}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
