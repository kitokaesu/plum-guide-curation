import Link from "next/link";
import type { Metadata } from "next";
import { NewListingForm } from "@/components/new-listing-form";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Add a home" };

export default async function NewListingPage() {
  await requireRole("HOST");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/host"
          className="text-sm underline decoration-hairline underline-offset-4 hover:decoration-gold"
        >
          ← Back to your portfolio
        </Link>
        <p className="eyebrow mt-5">New submission</p>
        <h2 className="mt-2 text-3xl">Submit a home for the Plum Test.</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Tell us the essentials now — you can refine descriptions and pricing
          later. A specialist will score the home against 150 checks before it
          joins the collection.
        </p>
      </div>

      <NewListingForm />
    </div>
  );
}
