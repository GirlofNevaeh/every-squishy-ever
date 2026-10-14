import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { Paywall } from "@/components/paywall";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { readAccess } from "@/lib/access/gate";
import { LanguageProvider } from "@/lib/i18n/context";
import { parseLang } from "@/lib/i18n/languages";
import { readLangCookie } from "@/lib/i18n/read-lang";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const [raw, unlocked] = await Promise.all([readLangCookie(), readAccess()]);
    return { lang: parseLang(raw), unlocked };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Every Squishy Ever" },
      {
        name: "description",
        content: "A kid-friendly catalog of squishy toys, with pictures, how they feel, and where to look them up.",
      },
      { name: "theme-color", content: "#FBF6EC" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;700;800&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootShell,
});

function RootShell() {
  const { lang, unlocked } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const open = unlocked || pathname === "/";
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <LanguageProvider initial={lang}>
          <PreviewHostBridge />
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1">{open ? <Outlet /> : <Paywall />}</div>
              <SiteFooter />
            </div>
          </AuthProvider>
          <Scripts />
        </LanguageProvider>
      </body>
    </html>
  );
}
