import { useEffect, useState, type FormEvent } from "react";
import { buttonClass } from "@/components/ui/button";
import { unlockWithKey } from "@/lib/access/gate";
import { useI18n } from "@/lib/i18n/context";

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
      window.location.reload();
    } catch {
      setBad(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main" className="mx-auto flex w-full max-w-lg flex-col px-4 py-10">
      <h1 className="font-display text-4xl text-ink">{t("gate.lockedTitle")}</h1>
      <p className="mt-3 text-lg text-ink">{t("gate.locked")}</p>
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
