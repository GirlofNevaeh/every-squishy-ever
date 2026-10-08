import { createFileRoute, Link } from "@tanstack/react-router";
import { EMPTY_SEARCH } from "@/lib/catalog";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Every Squishy Ever" },
      {
        name: "description",
        content: "What a squishy is on this shelf, and why the list keeps growing.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-extrabold tracking-wide text-muted uppercase">About the shelf</p>
      <h1 className="mt-2 font-display text-5xl">What counts as a squishy</h1>
      <div className="mt-6 space-y-4 text-lg leading-relaxed">
        <p>
          A squishy here is a toy you squeeze in your hand. Some rise slowly, some feel like dough, jelly, or a fuzzy
          ball. NeeDoh cubes from Schylling sit with cheese wedges, butter sticks, dumplings, mochi, and fruit.
        </p>
        <p>
          Soft pillows and Squishmallows stay off this shelf. They are cuddly, but they are a different kind of toy.
        </p>
        <p>
          This is a big starter shelf, not every squishy ever made. New colors and sizes show up all the time. If your
          favorite is missing, the suggest page writes a note you can send.
        </p>
        <p>
          The pictures were made for this catalog. They are not copied from a shop. Amazon and YouTube buttons open a
          search, so you might see other toys too. The price note is a hint, never today’s price. The top 20 is a hall
          of fame of famous squishies, not an official best-seller list.
        </p>
        <p>
          Try the quiz if you want a game for up to four teams, or the coloring sheets if you want to color a cube, a
          cheese wedge, or a bear.
        </p>
      </div>
      <p className="mt-8 flex flex-wrap gap-4 font-bold">
        <Link to="/" search={EMPTY_SEARCH} className="underline">
          Back to the squishies
        </Link>
        <Link to="/play" className="underline">
          Take the quiz
        </Link>
        <Link to="/color" className="underline">
          Color a sheet
        </Link>
      </p>
    </main>
  );
}
