import { existsSync, readFileSync } from 'node:fs';
import type { ServerResponse } from 'node:http';
import path from 'node:path';
import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `vite preview` and `vite dev` want opposite fallback behaviour here.
 *
 * Dev serves the unsubstituted shell and lets `src/dev.tsx` work the route out
 * from the URL, so it needs the SPA fallback to reach `/de/nivara/` at all.
 * Preview serves the built `dist/`, where every page is a real file — and the
 * production Worker is configured with `not_found_handling: "404-page"`. If
 * preview kept the SPA fallback, a mistyped URL would come back as the English
 * home page with a 200: precisely the soft-404 that config exists to avoid,
 * and a difference that would only surface in production.
 *
 * The Vite CLI resolves config in its own process, so the subcommand is
 * readable from argv; `command` is `'serve'` for both and cannot tell them
 * apart.
 */
const isPreview = process.argv.includes('preview');

/**
 * Reimplements, for preview only, the two Worker asset settings this site
 * depends on: `html_handling: "auto-trailing-slash"` and
 * `not_found_handling: "404-page"`.
 *
 * Neither of Vite's own modes matches. `spa` answers every unknown path with
 * the home page and a 200; `mpa` never resolves a directory to its
 * `index.html`, so every real page 404s. It is also why this middleware is
 * installed *before* Vite's static layer rather than after: that layer
 * rewrites `/de/` to `/de/index.html` on the way through, so a post hook sees
 * an already-resolved path and can no longer tell a directory from a file.
 */
function workerAssetBehaviour(): PluginOption {
  return {
    name: 'gamestao-worker-asset-behaviour',
    configurePreviewServer(server) {
      // From the resolved config, not process.cwd(): the preview server can be
      // launched from anywhere, and a wrong dist path here would send every
      // real page down the 404 branch.
      const dist = path.resolve(server.config.root, server.config.build.outDir);

      function send(res: ServerResponse, file: string, status: number) {
        res.statusCode = status;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(readFileSync(file));
      }

      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();

        // A query string is not part of the asset path: a page reached with
        // ?utm_source=... is still that page.
        const pathname = decodeURIComponent((req.url ?? '/').split('?')[0]);

        // Anything with an extension is a file — bundles, images, sitemap.xml,
        // robots.txt. Vite's static layer serves those; this only routes pages.
        if (path.extname(pathname) !== '') return next();

        const target = path.join(dist, pathname);
        // Refuse to look outside dist/ whatever the path contains.
        if (!target.startsWith(dist)) return next();

        const index = path.join(target, 'index.html');
        if (existsSync(index)) {
          // Redirect the slashless form, so each page keeps exactly one URL —
          // what the Worker's auto-trailing-slash handling does.
          if (!pathname.endsWith('/')) {
            res.statusCode = 301;
            res.setHeader('Location', `${pathname}/`);
            res.end();
            return;
          }
          send(res, index, 200);
          return;
        }

        const notFound = path.join(dist, '404.html');
        // Only navigations get the HTML body; a missing image stays a bare 404.
        if (req.headers.accept?.includes('text/html') && existsSync(notFound)) {
          send(res, notFound, 404);
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  appType: isPreview ? 'mpa' : 'spa',
  plugins: [react(), workerAssetBehaviour()],
  build: {
    // Asset filenames carry a content hash, so `public/_headers` can mark
    // /assets/* immutable while index.html stays no-cache.
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
