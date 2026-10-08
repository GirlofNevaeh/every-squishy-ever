import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Button, buttonClass } from "@/components/ui/button";
import { SUGGEST_EMAIL } from "@/data/config";
import { CATEGORIES, slugify, type Category } from "@/lib/catalog";

export const Route = createFileRoute("/suggest")({
  head: () => ({
    meta: [
      { title: "Suggest a squishy · Every Squishy Ever" },
      {
        name: "description",
        content: "Suggest a squishy for the catalog. The form builds an email and a JSON object — no account needed.",
      },
    ],
  }),
  component: Suggest,
});

type Fields = {
  name: string;
  brand: string;
  category: string;
  description: string;
  amazonQuery: string;
};

const EMPTY: Fields = {
  name: "",
  brand: "",
  category: "",
  description: "",
  amazonQuery: "",
};

function Suggest() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  const draft = useMemo(() => buildDraft(fields), [fields]);
  const json = JSON.stringify(draft, null, 2);
  const mailto = buildMailto(fields, json);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    setReady(false);
    setCopied(false);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = validate(fields);
    setErrors(next);
    setReady(Object.keys(next).length === 0);
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-extrabold tracking-wide text-muted uppercase">Add to the shelf</p>
      <h1 className="mt-2 font-display text-5xl">Suggest a squishy</h1>
      <p className="mt-3 text-lg text-muted">
        Nothing is sent to a server. Check the fields, then email the draft or copy the JSON into{" "}
        <code className="font-bold text-ink">src/data/squishies.json</code>.
      </p>

      <form className="mt-8 space-y-4" onSubmit={submit} noValidate>
        <Field label="Name" error={errors.name} id="suggest-name">
          <input
            id="suggest-name"
            value={fields.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass}
            required
          />
        </Field>
        <Field label="Brand" error={errors.brand} id="suggest-brand">
          <input
            id="suggest-brand"
            value={fields.brand}
            onChange={(event) => update("brand", event.target.value)}
            className={inputClass}
            placeholder="Schylling, Sunny Days Entertainment, or Generic"
            required
          />
        </Field>
        <Field label="Category" error={errors.category} id="suggest-category">
          <select
            id="suggest-category"
            value={fields.category}
            onChange={(event) => update("category", event.target.value)}
            className={inputClass}
            required
          >
            <option value="">Choose a category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description" error={errors.description} id="suggest-description">
          <textarea
            id="suggest-description"
            value={fields.description}
            onChange={(event) => update("description", event.target.value)}
            className={`${inputClass} min-h-32 py-3`}
            placeholder="Two to four sentences on squeeze, rebound, and sound. No medical claims."
            required
          />
        </Field>
        <Field label="Amazon search query" error={errors.amazonQuery} id="suggest-query">
          <input
            id="suggest-query"
            value={fields.amazonQuery}
            onChange={(event) => update("amazonQuery", event.target.value)}
            className={inputClass}
            placeholder="Brand plus product name"
            required
          />
        </Field>
        <Button type="submit" variant="ink">
          Build suggestion
        </Button>
      </form>

      {ready ? (
        <section className="mt-8 rounded-3xl bg-surface p-4 shadow-card" aria-live="polite">
          <h2 className="font-display text-3xl">Ready to file</h2>
          <p className="mt-2 text-muted">
            Texture, size, colors, and imageKey use placeholders. Change them before pasting if you know a better
            fit. An unknown imageKey becomes a labeled color shape.
          </p>
          <a href={mailto} className={buttonClass("butter", "mt-4")}>
            Email this suggestion
          </a>
          <div className="mt-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-xl">JSON to paste</h3>
            <Button variant="surface" onClick={() => void copyJson()}>
              {copied ? "Copied" : "Copy JSON"}
            </Button>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-2xl bg-cream-deep p-4 text-sm leading-relaxed">
            <code>{json}</code>
          </pre>
        </section>
      ) : null}
    </main>
  );
}

const inputClass =
  "min-h-11 w-full rounded-2xl bg-surface px-3 text-ink shadow-card placeholder:text-muted";

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-bold">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-sm font-bold text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function validate(fields: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (fields.name.trim().length < 2) errors.name = "Add the toy’s name.";
  if (fields.brand.trim().length < 2) errors.brand = "Add a brand, or Generic.";
  if (!CATEGORIES.includes(fields.category as Category)) errors.category = "Pick a category.";
  if (fields.description.trim().length < 40) {
    errors.description = "Write at least a couple of sentences about the squeeze.";
  }
  if (fields.amazonQuery.trim().length < 3) errors.amazonQuery = "Add a search phrase for Amazon.";
  return errors;
}

function buildDraft(fields: Fields) {
  return {
    id: slugify(fields.name),
    name: fields.name.trim(),
    brand: fields.brand.trim(),
    line: "",
    category: fields.category,
    texture: "slow-rise foam",
    size: "standard" as const,
    colors: [] as string[],
    yearIntroduced: null,
    description: fields.description.trim(),
    tags: [] as string[],
    amazonQuery: fields.amazonQuery.trim(),
    priceNote: "varies; check Amazon",
    imageKey: slugify(fields.name),
    image: `/squishies/${slugify(fields.name)}.jpg`,
    youtubeQuery: `${fields.name.trim()} squishy`,
    bestsellerRank: null,
  };
}

function buildMailto(fields: Fields, json: string) {
  const body = [
    `Name: ${fields.name.trim()}`,
    `Brand: ${fields.brand.trim()}`,
    `Category: ${fields.category}`,
    `Description: ${fields.description.trim()}`,
    `Amazon query: ${fields.amazonQuery.trim()}`,
    "",
    "JSON:",
    json,
  ].join("\n");
  const params = new URLSearchParams({
    subject: `Squishy suggestion: ${fields.name.trim() || "new toy"}`,
    body,
  });
  return `mailto:${SUGGEST_EMAIL}?${params.toString()}`;
}
