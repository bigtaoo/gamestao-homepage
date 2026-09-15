import { LEGAL_UPDATED } from '../data/legal';
import { usePage } from '../lib/page';

/**
 * Both legal pages, from one component: they differ only in their content, and
 * the content arrives as data on `PageData`.
 *
 * Deliberately plainer than the rest of the site — no hero bloom, no call to
 * action, one column at reading width. Someone opening this page is checking a
 * fact, not being sold to, and a privacy notice dressed as a landing page is a
 * privacy notice that looks like it is hiding something.
 */
export function Legal() {
  const { legal } = usePage();

  // Only ever null if a route were added without wiring its document; the
  // prerender would then emit an empty page rather than crash the build, which
  // is the wrong failure. Better to say so where someone will see it.
  if (!legal) throw new Error('A legal route rendered without its document — see entry-server.tsx');

  return (
    <main id="main" className="legal">
      <article className="legal__doc">
        <header className="legal__head">
          <h1 className="legal__title">{legal.title}</h1>
          <p className="legal__updated">
            {legal.updatedLabel}{' '}
            <time dateTime={LEGAL_UPDATED}>{LEGAL_UPDATED}</time>
          </p>
          <p className="legal__lead">{legal.lead}</p>
        </header>

        {legal.sections.map((section) => (
          <section className="legal__section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
