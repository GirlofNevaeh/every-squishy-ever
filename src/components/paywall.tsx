import { useEffect, useState, type FormEvent } from "react";
import { LanguageSwitch } from "@/components/language-switch";
import { buttonClass } from "@/components/ui/button";
import { unlockWithKey } from "@/lib/access/gate";
import { useI18n } from "@/lib/i18n/context";

const PEEKS = ["/squishies/nice-cube.jpg", "/squishies/cheese-wedge.jpg", "/squishies/butter-stick.jpg"];

const BUY_URL = "https://everyschoolever.com";

export function Paywall() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [bad, setBad] = useState(false);

  useEffect(() => {
    document.title = "Every Squishy Ever";
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entered = String(new FormData(event.currentTarget).get("access-key") ?? "");
    setBad(false);
    setBusy(true);
    try {
      const result = await unlockWithKey({ data: { key: entered } });
      if (!result.ok) {
        setBad(true);
        return;
      }
      window.location.assign("/");
    } catch {
      setBad(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main" className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
      <div className="flex justify-end">
        <LanguageSwitch />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3" aria-hidden="true">
        {PEEKS.map((src) => (
          <div key={src} className="aspect-square overflow-hidden rounded-2xl shadow-card">
            <img src={src} alt="" className="size-full object-cover" />
          </div>
        ))}
      </div>
      <p className="mt-6 font-display leading-none text-ink [font-size:clamp(0.95rem,3.6vw,1.35rem)]">
        {t("hero.before")}
        <span className="text-swatch-melon">{t("hero.kids").slice(0, 1)}</span>
        {t("hero.kids").slice(1)}
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">{t("brand")}</h1>
      <p className="mt-3 text-lg text-ink">{t("gate.intro")}</p>
      <p className="mt-3 font-bold text-ink">{t("gate.locked")}</p>
      <p className="mt-2 text-ink">{t("gate.buy")}</p>
      <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className={`${buttonClass("butter")} mt-4 w-full`}>
        {t("gate.buyCta")}
      </a>
      <form onSubmit={onSubmit} className="mt-6 rounded-3xl bg-surface p-4 shadow-card">
        <label htmlFor="access-key" className="font-display text-lg">
          {t("gate.keyLabel")}
        </label>
        <input
          id="access-key"
          name="access-key"
          onChange={() => setBad(false)}
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={t("gate.placeholder")}
          className="mt-2 min-h-12 w-full rounded-full bg-cream px-4 text-base text-ink shadow-card placeholder:text-muted"
        />
        {bad ? (
          <p className="mt-3 text-sm font-bold text-swatch-berry" role="alert">
            {t("gate.bad")}
          </p>
        ) : null}
        <button type="submit" className={`${buttonClass("ink")} mt-4 w-full`} disabled={busy}>
          {busy ? t("gate.working") : t("gate.unlock")}
        </button>
      </form>
    </main>
  );
}
