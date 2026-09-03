import type { Locale } from '../lib/routes';
import type { Messages } from './types';

import en from './locales/en.json';
import zh from './locales/zh.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';

/**
 * Every locale bundle, checked against the `Messages` contract. A key added to
 * `types.ts` but missed in one of the eleven files fails `npm run typecheck`
 * here — which is the only realistic way to catch it, since nobody proofreads
 * all eleven languages before a deploy.
 *
 * Only the prerenderer imports this. The browser is handed the single locale
 * its page was built with, inlined into the HTML, so visiting the German page
 * never downloads Korean copy.
 */
export const MESSAGES: Record<Locale, Messages> = {
  en,
  zh,
  de,
  fr,
  it,
  nl,
  es,
  pt,
  ja,
  ko,
  ru,
};

/**
 * Fills `{name}` placeholders. Deliberately not a format library: the only
 * substitutions the site needs are a game name, a screenshot index and a year.
 */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
