import Link from "next/link";
import { getI18n } from "@/lib/locale";

export default async function NotFound() {
  const { t } = await getI18n();

  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-balance text-4xl sm:text-5xl">{t("nf.title")}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        {t("nf.body")}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/properties" className="btn btn-primary">
          {t("nf.cta")}
        </Link>
        <Link href="/" className="btn btn-outline">
          {t("common.backHome")}
        </Link>
      </div>
    </div>
  );
}
