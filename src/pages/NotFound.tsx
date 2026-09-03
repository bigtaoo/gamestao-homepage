import { useT } from '../lib/page';
import { DEFAULT_LOCALE, routePath } from '../lib/routes';

/**
 * The single `404.html` the Worker serves for any unknown path.
 *
 * It is deliberately not one of the 44 prerendered routes: it has no URL of
 * its own, and giving it one would invite a page that returns 200 for a
 * not-found. The Worker's `not_found_handling: "404-page"` serves this file
 * with a real 404 status instead, which is the difference between a crawler
 * dropping a bad link and it indexing a soft 404.
 *
 * Only English, since the path that produced it carries no reliable locale —
 * but the language switcher in the header still works from here.
 */
export function NotFound() {
  const t = useT();

  return (
    <main id="main" className="notfound">
      <p className="notfound__code" aria-hidden="true">
        404
      </p>
      <h1 className="section__title">{t.notFound.title}</h1>
      <p className="section__lead">{t.notFound.lead}</p>
      <a className="btn btn--primary" href={routePath({ locale: DEFAULT_LOCALE, page: 'home' })}>
        {t.notFound.cta}
      </a>
    </main>
  );
}
