import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AddToHome } from "@/components/add-to-home";
import { lockShelf } from "@/lib/access/gate";
import { EMPTY_SEARCH } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n/context";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted">
        <div className="flex flex-wrap items-center gap-3">
          <AddToHome />
          <p>{t("footer.saveHint")}</p>
        </div>
        <nav className="flex flex-wrap gap-4 font-bold" aria-label={t("nav.footer")}>
          <Link to="/" search={EMPTY_SEARCH} className="inline-flex min-h-11 items-center">
            {t("nav.squishies")}
          </Link>
          <Link to="/top" className="inline-flex min-h-11 items-center">
            {t("nav.hall")}
          </Link>
          <Link to="/play" className="inline-flex min-h-11 items-center">
            {t("nav.quiz")}
          </Link>
          <Link to="/projects" className="inline-flex min-h-11 items-center">
            {t("nav.projects")}
          </Link>
          <Link to="/about" className="inline-flex min-h-11 items-center">
            {t("nav.about")}
          </Link>
          <Link to="/suggest" className="inline-flex min-h-11 items-center">
            {t("nav.suggest")}
          </Link>
          <LockButton />
        </nav>
      </div>
    </footer>
  );
}

function LockButton() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  async function lock() {
    setBusy(true);
    try {
      await lockShelf();
    } finally {
      window.location.assign("/");
    }
  }

  return (
    <button type="button" className="inline-flex min-h-11 items-center" onClick={lock} disabled={busy}>
      {t("gate.lock")}
    </button>
  );
}