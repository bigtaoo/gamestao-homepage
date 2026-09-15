import type { GameId } from '../lib/routes';
import type { PlatformId } from '../data/games';

/** Copy for one game. Everything here is translated; names and links are not. */
export type GameCopy = {
  /** One line, under ~70 characters — it has to fit a card without wrapping thrice. */
  tagline: string;
  /** Genre label shown above the name, e.g. "Turn-based strategy". */
  genre: string;
  /** Two or three sentences for the home page card. */
  summary: string;
  /** A fuller paragraph for the top of the game's own page. */
  intro: string;
  features: string[];
  howTo: string[];
};

/**
 * The full copy contract. Every locale file is checked against this, so a key
 * added here but forgotten in `ru.json` fails `npm run typecheck` instead of
 * rendering `undefined` on a live page in a language nobody on the team reads.
 */
export type Messages = {
  meta: {
    /** Localised studio descriptor used in <title>; the name itself is a brand. */
    tagline: string;
    homeTitle: string;
    homeDescription: string;
    /** Template for a game page title. `{game}` is substituted. */
    gameTitle: string;
    gameDescription: string;
  };
  nav: {
    games: string;
    about: string;
    contact: string;
    press: string;
    home: string;
    language: string;
    menu: string;
  };
  hero: {
    kicker: string;
    title: string;
    lead: string;
    ctaGames: string;
    ctaAbout: string;
  };
  stats: {
    games: string;
    languages: string;
    installs: string;
  };
  games: {
    title: string;
    lead: string;
    details: string;
    entries: Record<GameId, GameCopy>;
  };
  platforms: Record<PlatformId, string>;
  platformSoon: string;
  gamePage: {
    availableOn: string;
    features: string;
    howTo: string;
    screenshots: string;
    playNow: string;
    otherGames: string;
    backToGames: string;
  };
  about: {
    title: string;
    lead: string;
    body: string[];
  };
  contact: {
    title: string;
    lead: string;
    /** Heading over the player-support address. */
    playersTitle: string;
    /** Heading over the publishing, investment and press address. */
    businessTitle: string;
    businessLead: string;
    /** Link through to the press page, from the business block. */
    pressCta: string;
  };
  press: {
    title: string;
    lead: string;
    /** Page description for `<title>`/`<meta>`; `{studio}` is not used. */
    metaDescription: string;
    factsTitle: string;
    facts: {
      studio: string;
      games: string;
      languages: string;
      playableOn: string;
      tech: string;
      site: string;
      contact: string;
    };
    brandTitle: string;
    brandLead: string;
    gamesTitle: string;
    assetsTitle: string;
    screensTitle: string;
    /** Accessible label on a download link; `{file}` is substituted. */
    downloadAlt: string;
    /** Said of a game whose art is not published yet; `{game}` is substituted. */
    none: string;
    usageTitle: string;
    usage: string;
  };
  notFound: {
    title: string;
    lead: string;
    cta: string;
  };
  footer: {
    privacy: string;
    terms: string;
    support: string;
    press: string;
    rights: string;
  };
  a11y: {
    skipToContent: string;
    /** `{game}` and `{n}` are substituted. */
    screenshotAlt: string;
  };
};
