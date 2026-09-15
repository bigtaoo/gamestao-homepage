/**
 * The studio's own legal pages — the ones about *this website*, not about the
 * games. Each game ships its own privacy policy and terms, written against
 * what a game actually does (accounts, purchases, matchmaking, chat), and
 * those live with the game. This site has none of that, and a notice that
 * borrows a game's text would describe collection that never happens here.
 *
 * Why this is not in `Messages` like every other string on the site: the whole
 * of a locale's `Messages` is inlined into the hydration payload of *every*
 * page, so two legal documents in there would be carried by the home page, the
 * press kit and all three game pages, in every language, to be read by nobody.
 * Instead `entry-server.tsx` puts just the one document the route needs into
 * `PageData`, and the content module never enters the client bundle at all.
 */

export type LegalSection = {
  heading: string;
  /** Paragraphs. Rendered as `<p>`s, so no markup inside them. */
  body: string[];
};

export type LegalDoc = {
  title: string;
  /** Sentence under the title saying what the document covers and what it does not. */
  lead: string;
  /** Label only — the date itself is `LEGAL_UPDATED`, shared by every locale. */
  updatedLabel: string;
  sections: LegalSection[];
};

/** Both documents for one locale. */
export type LegalDocs = {
  privacy: LegalDoc;
  terms: LegalDoc;
};

/**
 * One date for both documents in all eleven languages, because they are
 * revised together and a per-locale date would drift the moment one
 * translation lagged. Bump it when the wording changes in a way a reader would
 * care about — not for a typo.
 */
export const LEGAL_UPDATED = '2026-09-15';
