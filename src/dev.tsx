import { createRoot } from 'react-dom/client';
import { App } from './App';
import { MESSAGES } from './i18n';
import { renderHead } from './lib/head';
import { CJK_LOCALES, DEFAULT_LOCALE, HREFLANG, parsePath, type Route } from './lib/routes';
import type { PageData } from './lib/page';

/**
 * Dev-only bootstrap. `vite dev` serves the raw `index.html`, which has no
 * prerendered markup and no page-data global, so this stands in for the
 * prerenderer: it works out the route from the URL, renders client-side, and
 * fills in the head so metadata can be eyeballed while iterating.
 *
 * Imported through a dynamic `import()` behind `import.meta.env.DEV`, so the
 * eleven locale bundles it pulls in never reach a production build.
 */
export function startDev(root: HTMLElement): void {
  const route: Route = parsePath(location.pathname) ?? { locale: DEFAULT_LOCALE, page: 'home' };

  const page: PageData = {
    route,
    messages: MESSAGES[route.locale],
    year: new Date().getFullYear(),
  };

  // Both of the things the prerenderer puts on <html>, so CJK typography can
  // be judged while iterating rather than only after a build.
  document.documentElement.lang = HREFLANG[route.locale];
  document.documentElement.classList.toggle('cjk', CJK_LOCALES.has(route.locale));
  // The head markup is a plain string in production; in dev it is injected so
  // titles and hreflang tags are inspectable in devtools without a build.
  // insertAdjacentHTML does not execute inserted scripts, which is why the
  // first-visit language redirect stays inert here — convenient, since it
  // would otherwise bounce you out of whichever locale you are working on.
  document.head.insertAdjacentHTML('beforeend', renderHead(route, page.messages));

  createRoot(root).render(<App page={page} />);
}
