import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/color")({
  head: () => ({
    meta: [
      { title: "Coloring sheets · Every Squishy Ever" },
      { name: "description", content: "Color squishy pictures on screen or print a sheet." },
    ],
  }),
  component: ColorPage,
});

const CRAYONS = [
  { name: "Butter", value: "#f6c945" },
  { name: "Blush", value: "#f4b6c6" },
  { name: "Berry", value: "#e15b73" },
  { name: "Mint", value: "#8fd4b0" },
  { name: "Leaf", value: "#3f9a62" },
  { name: "Sky", value: "#7ec8e3" },
  { name: "Lilac", value: "#c9b6f2" },
  { name: "Peach", value: "#ffc4a3" },
  { name: "Orange", value: "#f28b74" },
  { name: "Cocoa", value: "#8c5a3c" },
  { name: "Cream", value: "#fff6e4" },
  { name: "Ink", value: "#3c3228" },
];

type Sheet = { id: string; name: string; parts: { id: string; d: string }[] };

const SHEETS: Sheet[] = [
  {
    id: "cube",
    name: "Nice cube",
    parts: [
      { id: "body", d: "M48 48h104v104H48z" },
      { id: "shine", d: "M62 62h40v28H62z" },
    ],
  },
  {
    id: "cheese",
    name: "Cheese wedge",
    parts: [
      { id: "wedge", d: "M36 156 L100 36 L164 156 Z" },
      { id: "h1", d: "M86 96 a10 10 0 1 0 0.1 0" },
      { id: "h2", d: "M118 120 a8 8 0 1 0 0.1 0" },
      { id: "h3", d: "M100 142 a6 6 0 1 0 0.1 0" },
    ],
  },
  {
    id: "butter",
    name: "Butter stick",
    parts: [{ id: "stick", d: "M28 78h144v52H28z" }],
  },
  {
    id: "bear",
    name: "Gummy bear",
    parts: [
      { id: "ear1", d: "M62 70 a16 16 0 1 0 0.1 0" },
      { id: "ear2", d: "M138 70 a16 16 0 1 0 0.1 0" },
      { id: "body", d: "M60 90 h80 a40 48 0 0 1 0 70 h-80 a40 48 0 0 1 0-70z" },
      { id: "belly", d: "M80 120 h40 a18 16 0 0 1 0 28 h-40 a18 16 0 0 1 0-28z" },
    ],
  },
  {
    id: "dumpling",
    name: "Dumpling",
    parts: [{ id: "body", d: "M30 120 C50 60 150 60 170 120 C140 160 60 160 30 120 Z" }],
  },
  {
    id: "avocado",
    name: "Avocado",
    parts: [
      { id: "body", d: "M100 36c40 10 52 70 40 110-14 28-66 28-80 0C48 106 60 46 100 36z" },
      { id: "pit", d: "M100 118 a22 22 0 1 0 0.1 0" },
      { id: "leaf", d: "M108 48c16-8 28-6 24-18-16 2-24 8-24 18z" },
    ],
  },
  {
    id: "donut",
    name: "Donut",
    parts: [
      { id: "ring", d: "M100 48 a56 56 0 1 0 0.1 0 M100 84 a20 20 0 1 1 -0.1 0" },
    ],
  },
  {
    id: "frog",
    name: "Frog",
    parts: [
      { id: "body", d: "M40 130 a60 36 0 1 0 120 0 a60 36 0 1 0 -120 0" },
      { id: "eye1", d: "M62 90 a18 18 0 1 0 0.1 0" },
      { id: "eye2", d: "M138 90 a18 18 0 1 0 0.1 0" },
    ],
  },
  {
    id: "cat",
    name: "Mochi cat",
    parts: [
      { id: "face", d: "M100 70 a48 48 0 1 0 0.1 0" },
      { id: "ear1", d: "M58 90 L48 48 L86 78 Z" },
      { id: "ear2", d: "M142 90 L152 48 L114 78 Z" },
    ],
  },
  {
    id: "cone",
    name: "Ice cream",
    parts: [
      { id: "scoop2", d: "M100 70 a26 26 0 1 0 0.1 0" },
      { id: "scoop1", d: "M100 98 a32 32 0 1 0 0.1 0" },
      { id: "cone", d: "M74 118 h52 l-26 52 z" },
    ],
  },
  {
    id: "strawberry",
    name: "Strawberry",
    parts: [
      { id: "berry", d: "M100 58c28 12 42 48 34 86-8 24-26 32-34 32s-26-8-34-32c-8-38 6-74 34-86z" },
      { id: "leaf", d: "M70 70c10-20 20-24 30-22 10-2 20 2 30 22-16 4-24 2-30-6-6 8-14 10-30 6z" },
    ],
  },
  {
    id: "whale",
    name: "Whale",
    parts: [
      { id: "body", d: "M36 120c20-40 70-52 110-28 18 10 28 8 36 18-16 20-40 28-62 22-10 18-36 22-52 8-24 4-36-6-32-20z" },
      { id: "tail", d: "M150 96c22-10 28 8 16 18-12 0-16-6-16-18z" },
    ],
  },
];

function ColorPage() {
  const [sheetId, setSheetId] = useState(SHEETS[0]?.id ?? "cube");
  const [crayon, setCrayon] = useState(CRAYONS[0]?.value ?? "#f6c945");
  const [fills, setFills] = useState<Record<string, string>>({});
  const sheet = SHEETS.find((item) => item.id === sheetId) ?? SHEETS[0];

  function paint(partId: string) {
    if (!sheet) return;
    setFills((current) => ({ ...current, [`${sheet.id}:${partId}`]: crayon }));
  }

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-8 pb-28">
      <p className="text-sm font-extrabold tracking-wide text-muted uppercase">Color</p>
      <h1 className="mt-2 font-display text-5xl">Coloring sheets</h1>
      <p className="mt-3 text-lg">Pick a crayon, tap the picture, then print it if you want a paper sheet.</p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {SHEETS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`min-h-11 shrink-0 rounded-full px-3 font-bold ${item.id === sheet?.id ? "bg-ink text-cream" : "bg-surface text-ink shadow-card"}`}
            onClick={() => setSheetId(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="color-sheet mt-4 rounded-3xl bg-surface p-4 shadow-card">
        <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-md bg-white" role="img" aria-label={`${sheet?.name} coloring sheet`}>
          {sheet?.parts.map((part) => (
            <path
              key={part.id}
              d={part.d}
              fill={fills[`${sheet.id}:${part.id}`] ?? "#fffdf8"}
              stroke="#3c3228"
              strokeWidth="3"
              className="cursor-pointer"
              fillRule="evenodd"
              onClick={() => paint(part.id)}
            />
          ))}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="list" aria-label="Crayons">
        {CRAYONS.map((item) => (
          <button
            key={item.name}
            type="button"
            aria-label={item.name}
            aria-pressed={crayon === item.value}
            className={`size-11 rounded-full shadow-card ${crayon === item.value ? "ring-2 ring-ink ring-offset-2" : ""}`}
            style={{ background: item.value }}
            onClick={() => setCrayon(item.value)}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <Button
          variant="surface"
          onClick={() => {
            if (!sheet) return;
            setFills((current) => {
              const next = { ...current };
              for (const part of sheet.parts) delete next[`${sheet.id}:${part.id}`];
              return next;
            });
          }}
        >
          Reset sheet
        </Button>
        <Button variant="ink" onClick={() => window.print()}>
          Print sheet
        </Button>
      </div>
    </main>
  );
}
