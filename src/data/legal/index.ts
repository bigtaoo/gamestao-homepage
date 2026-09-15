import type { Locale } from '../../lib/routes';
import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import { ja } from './ja';
import { ko } from './ko';
import { nl } from './nl';
import { pt } from './pt';
import { ru } from './ru';
import type { LegalDoc, LegalDocs } from './types';
import { zh } from './zh';

export type { LegalDoc, LegalDocs, LegalSection } from './types';
export { LEGAL_UPDATED } from './types';

/**
 * Typed as a full `Record<Locale, …>`, so adding a locale to `LOCALES` without
 * writing its legal text fails `npm run typecheck` rather than shipping a page
 * that renders nothing where a privacy notice should be.
 *
 * Imported by `entry-server.tsx` and by the dev bootstrap only — never from a
 * component. A component import would pull all eleven languages of both
 * documents into the production client bundle, to be downloaded by every
 * visitor of every page. The route's own document arrives in `PageData`
 * instead.
 */
export const LEGAL: Record<Locale, LegalDocs> = { en, zh, de, fr, it, nl, es, pt, ja, ko, ru };

/** The two documents this site serves, in the order the footer lists them. */
export const LEGAL_PAGES = ['privacy', 'terms'] as const;

export type LegalPage = (typeof LEGAL_PAGES)[number];

export function legalDoc(locale: Locale, page: LegalPage): LegalDoc {
  return LEGAL[locale][page];
}
