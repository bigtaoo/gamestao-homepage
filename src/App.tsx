import { Footer } from './components/Footer';
import { Nav } from './components/Nav';
import { PageProvider, type PageData } from './lib/page';
import { GamePage } from './pages/GamePage';
import { Home } from './pages/Home';
import { Legal } from './pages/Legal';
import { NotFound } from './pages/NotFound';
import { Press } from './pages/Press';

/**
 * There is no router. Each of the 77 URLs is its own prerendered document, so
 * the page to show is already decided by the time this renders — it comes in
 * as data, from the prerenderer on the server and from the inlined global on
 * the client. Adding a router would introduce a second, client-only opinion
 * about what a URL means.
 */
export function App({ page }: { page: PageData }) {
  return (
    <PageProvider value={page}>
      <Nav />
      {page.notFound ? (
        <NotFound />
      ) : page.route.page === 'home' ? (
        <Home />
      ) : page.route.page === 'press' ? (
        <Press />
      ) : page.route.page === 'privacy' || page.route.page === 'terms' ? (
        <Legal />
      ) : (
        <GamePage gameId={page.route.gameId} />
      )}
      <Footer />
    </PageProvider>
  );
}
