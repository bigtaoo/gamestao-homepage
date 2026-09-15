import { createContext, useContext, type ReactNode } from 'react';
import type { LegalDoc } from '../data/legal/types';
import type { Messages } from '../i18n/types';
import type { Route } from './routes';

/**
 * Everything a page needs to render itself. The prerenderer inlines this into
 * the HTML it emits, and the client reads it back to hydrate the identical
 * tree — so there is one source of page state rather than a server copy and a
 * client copy that can drift.
 */
export type PageData = {
  route: Route;
  messages: Messages;
  /** Baked at build time so a cached page cannot show last year in the footer. */
  year: number;
  /**
   * Set only on `404.html`. That page is not one of the 44 routes — it has no
   * URL of its own — but it still needs the header, the footer and a working
   * language switcher, so it borrows the English home route for context and
   * flips this to swap the body.
   */
  notFound?: true;
  /**
   * Set only on `/privacy/` and `/terms/`, and carrying only that page's own
   * document in that page's own language. Legal text is long and nobody reads
   * it twice, so it travels with the two pages that show it rather than in
   * `messages`, which every page inlines in full — see `data/legal/types.ts`.
   */
  legal?: LegalDoc;
};

/** The global the prerenderer writes and `main.tsx` reads. */
export const PAGE_DATA_GLOBAL = '__GAMESTAO__';

const PageContext = createContext<PageData | null>(null);

export function PageProvider({ value, children }: { value: PageData; children: ReactNode }) {
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePage(): PageData {
  const page = useContext(PageContext);
  if (!page) throw new Error('usePage() called outside a <PageProvider>');
  return page;
}

/** Shorthand for the active locale's copy — used by nearly every component. */
export function useT(): Messages {
  return usePage().messages;
}

export function useRoute(): Route {
  return usePage().route;
}
