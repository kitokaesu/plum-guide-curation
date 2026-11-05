"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PROPERTY_IMAGE_CHOICES } from "@/lib/content";

export function NewListingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [nightlyRate, setNightlyRate] = useState("450");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("2");
  const [maxGuests, setMaxGuests] = useState("4");
  const [imageUrl, setImageUrl] = useState(PROPERTY_IMAGE_CHOICES[0].url);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          location,
          description,
          nightlyRate: Number(nightlyRate),
          bedrooms: Number(bedrooms),
          bathrooms: Number(bathrooms),
          maxGuests: Number(maxGuests),
          imageUrl,
        }),
      });
      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        throw new Error(data.error ?? "Could not create the listing.");
      }
      router.push(`/dashboard/host/properties/${data.id}`);
      router.refresh();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not create the listing."
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="card p-5 sm:p-6">
        <p className="eyebrow">Step 1 · The basics</p>
        <h2 className="mt-2 text-xl">Tell us about the home.</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="new-title" className="label">
              Listing title
            </label>
            <input
              id="new-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="field"
              placeholder="The Gilded Barn"
              required
              minLength={3}
            />
          </div>
          <div>
            <label htmlFor="new-location" className="label">
              Location
            </label>
            <input
              id="new-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="field"
              placeholder="Cotswolds, England"
              required
            />
          </div>
          <div>
            <label htmlFor="new-rate" className="label">
              Nightly rate in euros (EUR)
            </label>
            <input
              id="new-rate"
              type="number"
              min={50}
              max={100000}
              step={10}
              value={nightlyRate}
              onChange={(event) => setNightlyRate(event.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="new-bedrooms" className="label">
              Bedrooms
            </label>
            <input
              id="new-bedrooms"
              type="number"
              min={1}
              max={30}
              value={bedrooms}
              onChange={(event) => setBedrooms(event.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="new-bathrooms" className="label">
              Bathrooms
            </label>
            <input
              id="new-bathrooms"
              type="number"
              min={1}
              max={30}
              value={bathrooms}
              onChange={(event) => setBathrooms(event.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="new-guests" className="label">
              Maximum guests
            </label>
            <input
              id="new-guests"
              type="number"
              min={1}
              max={60}
              value={maxGuests}
              onChange={(event) => setMaxGuests(event.target.value)}
              className="field"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="new-description" className="label">
            Description
          </label>
          <textarea
            id="new-description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="field resize-none"
            placeholder="What makes this home worth travelling for?"
          />
          <p className="mt-2 text-xs text-muted">
            Optional. Our curation team will edit this before publication.
          </p>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <p className="eyebrow">Step 2 · Photography</p>
        <h2 className="mt-2 text-xl">Choose a cover image.</h2>
        <p className="mt-1 text-sm text-muted">
          In production you would upload your own photography. For this
          demonstration, pick one of our editorial images.
        </p>

        <fieldset className="mt-5">
          <legend className="sr-only">Cover image</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PROPERTY_IMAGE_CHOICES.map((choice) => {
              const selected = imageUrl === choice.url;
              return (
                <label
                  key={choice.url}
                  className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                    selected ? "border-gold" : "border-transparent"
                  }`}
                >
                  <input
                    type="radio"
                    name="cover"
                    value={choice.url}
                    checked={selected}
                    onChange={() => setImageUrl(choice.url)}
                    className="sr-only"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={choice.url}
                    alt={choice.label}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-2 py-1.5 text-[10px] uppercase tracking-[0.12em] text-cream">
                    {choice.label}
                  </span>
                  {selected ? (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs text-white">
                      ✓
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      <section className="rounded-2xl border border-hairline bg-goldSoft/30 p-5 sm:p-6">
        <p className="eyebrow">Step 3 · The Plum Test</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Your home is saved as a draft. On the next screen you can choose an
          available specialist slot and schedule the inspection. Approved homes
          go live immediately.
        </p>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-wine/25 bg-[#F7E9E6] px-4 py-3 text-sm text-wine"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Creating listing…" : "Save draft & choose inspection"}
        </button>
        <p className="text-xs text-muted">
          Nothing is published until it passes the Plum Test.
        </p>
      </div>
    </form>
  );
}
