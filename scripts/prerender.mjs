/**
 * Turns the one shell Vite builds into the static documents the site ships:
 * 11 locales x (home + 3 game pages) = 44 pages, plus a 404.
 *
 * This step exists because client-side i18n would leave 43 of those 44 pages
 * invisible to a search engine — which is the whole point of a marketing site.
 *
 * Runs after both Vite builds:
 *   vite build --outDir dist                              (client bundle + shell)
 *   vite build --ssr src/entry-server.tsx --outDir .ssr   (renderer)
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const {
  render,
  renderNotFound,
  allRoutes,
  routePath,
  translateRoute,
  HREFLANG,
  LOCALES,
  ORIGIN,
  // pathToFileURL, not the bare path: ESM dynamic import rejects a Windows
  // path like D:\..., and this build runs on Windows as well as CI Linux.
} = await import(pathToFileURL(path.join(ROOT, '.ssr', 'entry-server.js')).href);

const MARKERS = {
  head: '<!--app-head-->',
  body: '<!--app-body-->',
  pageData: '<!--app-page-data-->',
};

const shell = await readFile(path.join(DIST, 'index.html'), 'utf8');

// A missing marker would silently produce 44 blank pages, so fail the build.
for (const [name, marker] of Object.entries(MARKERS)) {
  if (!shell.includes(marker)) {
    throw new Error(`index.html is missing the ${name} marker (${marker})`);
  }
}

/**
 * Substitutes one rendered page into the shell.
 *
 * Every replacement is passed as a *function* rather than a string. A string
 * replacement re-interprets the dollar patterns inside the replacement text,
 * which would silently corrupt any rendered copy containing one — and across
 * eleven languages that is only a matter of time.
 */
function fill(page) {
  return shell
    .replace(/<html[^>]*>/, () => `<html ${page.htmlAttrs}>`)
    .replace(MARKERS.head, () => page.head)
    .replace(MARKERS.body, () => page.body)
    .replace(MARKERS.pageData, () => page.pageDataScript);
}

async function emit(relativePath, page) {
  const outPath = path.join(DIST, relativePath);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, fill(page), 'utf8');
}

const routes = allRoutes();

for (const route of routes) {
  await emit(path.join(routePath(route), 'index.html'), render(route));
}

// Not one of the routes: it has no URL of its own and is absent from the
// sitemap. The Worker serves it for unknown paths with a real 404 status.
await emit('404.html', renderNotFound());

/**
 * A multilingual sitemap: every URL lists every translation of itself. Google
 * wants the alternates declared both on the page and here before it will treat
 * the eleven versions as one page in eleven languages rather than as duplicate
 * content competing with each other.
 */
function sitemap() {
  const entries = routes
    .map((route) => {
      const alternates = LOCALES.map(
        (locale) =>
          `    <xhtml:link rel="alternate" hreflang="${HREFLANG[locale]}" href="${
            ORIGIN + routePath(translateRoute(route, locale))
          }" />`,
      ).join('\n');

      return `  <url>
    <loc>${ORIGIN + routePath(route)}</loc>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${
      ORIGIN + routePath(translateRoute(route, 'en'))
    }" />
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;
}

await writeFile(path.join(DIST, 'sitemap.xml'), sitemap(), 'utf8');

console.log(
  `prerendered ${routes.length} pages (${LOCALES.length} locales) + 404.html + sitemap.xml`,
);
