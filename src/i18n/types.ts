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
    email: string;
  };
  notFound: {
    title: string;
    lead: string;
    cta: string;
  };
  footer: {
    privacy: string;
    terms: string;
    refunds: string;
    support: string;
    rights: string;
  };
  a11y: {
    skipToContent: string;
    /** `{game}` and `{n}` are substituted. */
    screenshotAlt: string;
  };
};
