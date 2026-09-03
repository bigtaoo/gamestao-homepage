import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { PAGE_DATA_GLOBAL, type PageData } from './lib/page';
import './styles/global.css';

declare global {
  interface Window {
    [PAGE_DATA_GLOBAL]?: PageData;
  }
}

const page = window[PAGE_DATA_GLOBAL];
const root = document.getElementById('root');

if (root) {
  if (page) {
    /**
     * Hydrate, rather than render. The markup is already in the document from
     * the prerender, so this only attaches behaviour — and everything the site
     * does without JS keeps working if this never runs: navigation, the
     * language menu, the screenshot strip.
     */
    hydrateRoot(root, <App page={page} />);
  } else if (import.meta.env.DEV) {
    // `vite dev` serves the unsubstituted shell, so there is nothing to
    // hydrate. Behind a DEV guard and a dynamic import so the locale bundles
    // this pulls in stay out of the production chunk.
    void import('./dev').then(({ startDev }) => startDev(root));
  }
  // In production a missing global means a stale HTML file met a new bundle.
  // Leaving the delivered markup untouched beats blanking the page.
}
