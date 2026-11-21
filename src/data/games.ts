import type { GameId } from '../lib/routes';

export type PlatformId =
  | 'web'
  | 'ios'
  | 'android'
  | 'wechat'
  | 'crazygames'
  | 'playgama'
  | 'itch';

/**
 * A store entry. `live` carries the URL players are sent to; `soon` renders as
 * an inert badge. The URL is required on `live` and forbidden on `soon` so a
 * platform can never be advertised as playable without somewhere to go — the
 * failure this shape exists to prevent is a launched badge that 404s.
 */
export type PlatformLink =
  | { platform: PlatformId; status: 'live'; url: string }
  | { platform: PlatformId; status: 'soon' };

export type Game = {
  id: GameId;
  /** Brand name. Never translated, never taken from a locale file. */
  name: string;
  /**
   * Drives the card's accent colour and the game page's whole palette.
   *
   * Each is traceable to the game's own art — a store icon, a published cover,
   * or a palette its own design docs lock — and never picked to look nice here.
   * The comment on each entry records which.
   *
   * Two hard requirements, both measured: at least 4.5:1 against `--surface`
   * as small text, and at least 4.5:1 for near-black text laid on it as a
   * button face. Every entry below clears 5.3:1 on both.
   *
   * What is NOT a requirement any more is a minimum hue separation. With three
   * games this table asked for 54 degrees between them; twelve games cannot
   * each own a 54-degree slice of a 360-degree wheel, and forcing it would mean
   * inventing colours no player has seen — which is the one thing this field
   * exists to prevent. Real art clusters: three of these games are warm gold,
   * three are blue, two are green. So the cards are told apart by their artwork
   * and their name, with the accent reinforcing rather than carrying the
   * distinction, and the order below keeps same-family hues off each other's
   * heels in the grid.
   */
  accent: string;
  /** How many screenshots exist at public/assets/games/<id>/shot-<n>.webp */
  screenshots: number;
  links: PlatformLink[];
};

/**
 * Release status as of 2026-11-21, cross-checked against each project repo and
 * against the live hostname — a 200 from the host, not a line in a doc.
 *
 * To launch a platform: change `status: 'soon'` to `status: 'live'` and add its
 * `url`. Nothing else in the site needs touching — the badges, the game page's
 * download row and the structured data all read this table.
 *
 * Four games are `soon` on the web and on nothing else: Tidehook, Swarm Orbit,
 * Dummy Brawl and Hexfront Rush. Each one's repository now has a `deploy-web`
 * job and a `wrangler/web.jsonc` pointing at the hostname named in its comment,
 * but no deploy has run yet, so none of those hostnames resolves. They become
 * one-line edits here the moment the first green run provisions them.
 *
 * No Playgama entry carries a URL. Several of these games are uploaded there,
 * but a catalog URL has to come from the console rather than be assembled from
 * a slug, and a guessed one is exactly the 404 this table's type forbids.
 */
export const GAMES: Game[] = [
  {
    id: 'nivara',
    name: 'Nivara',
    // From the icon's pen blue (#057cfe), lifted for contrast headroom.
    accent: '#3d8bff',
    screenshots: 4,
    links: [
      { platform: 'web', status: 'live', url: 'https://nivara.gamestao.com' },
      // Client builds for WeChat exist, but the mini-game is not published yet.
      { platform: 'wechat', status: 'soon' },
    ],
  },
  {
    id: 'sumquest',
    name: 'SumQuest',
    // From the icon's numeral orange. This one is published art players have
    // already seen, so it does not move.
    accent: '#fe9205',
    screenshots: 4,
    links: [
      // sumquest., not c.: both are custom domains on the same Worker and serve
      // the identical build, but this URL is read by people — in a shared link,
      // a hover, a store listing — and only one of the two says what it opens.
      // c.gamestao.com stays the machine-facing host (CI smoke checks, the
      // mobile hot-update payload under /mobile/latest/).
      { platform: 'web', status: 'live', url: 'https://sumquest.gamestao.com' },
      // itch.io IS live, but no repo file records the page URL. Fill it in and
      // flip to 'live' — deliberately left `soon` rather than guessing a slug
      // that would 404.
      { platform: 'itch', status: 'soon' },
      { platform: 'crazygames', status: 'soon' },
      // No storefront in the path on purpose. `apps.apple.com/app/id<id>`
      // redirects each visitor to their own country's store; the URL Apple
      // hands you (`/us/app/sumquest/id…`) pins everyone to the US one, which
      // is the wrong default on a site that ships in eleven languages. The id
      // is the stable half — the slug in Apple's URL is decoration. The App
      // Store lists it as "SumQuest+"; the game is SumQuest everywhere else,
      // and this table names the game.
      { platform: 'ios', status: 'live', url: 'https://apps.apple.com/app/id6775219433' },
      { platform: 'android', status: 'soon' },
      { platform: 'wechat', status: 'soon' },
    ],
  },
  {
    id: 'blightbloom',
    name: 'Blightbloom',
    // The game's own locked crystal/poison hue, from
    // `design/13-worldview-art-direction.md`. Not its fire hue (#FF7043), which
    // sits 20 degrees from SumQuest's real orange and would blur the two cards
    // together; Blightbloom has no published icon to be faithful to, so it is
    // the one free to move.
    accent: '#9ccc65',
    screenshots: 4,
    links: [
      // b., the host this game has always been deployed to. The repository and
      // the game were renamed from DayDayUp; the Worker names, the save keys
      // and the bundle id deliberately were not, because each of those is a
      // migration rather than a rename.
      { platform: 'web', status: 'live', url: 'https://b.gamestao.com' },
      { platform: 'ios', status: 'soon' },
      { platform: 'android', status: 'soon' },
      { platform: 'wechat', status: 'soon' },
    ],
  },
  {
    id: 'potion-siege',
    name: 'Potion Siege',
    // The dominant chromatic colour of the store icon (`art/icon/icon_a_r1.png`)
    // is the potion purple #4f1f62, far too dark to lay text on; this is that
    // same hue raised to 5.4:1. The workshop brass the menus are built from
    // (#d9a441) was the other candidate and sits four degrees from SumQuest's
    // orange, so the icon won.
    accent: '#b86fd4',
    screenshots: 4,
    links: [
      { platform: 'web', status: 'live', url: 'https://p.gamestao.com' },
      // CI builds the CrazyGames zip and keeps it as a run artifact; uploading
      // it on the developer portal is still a manual step.
      { platform: 'crazygames', status: 'soon' },
      { platform: 'ios', status: 'soon' },
    ],
  },
  {
    id: 'holy-kicker',
    name: 'Holy Kicker',
    // The ball: #ffd860 in the client's own palette, and the one thing on
    // screen in every screenshot — the monk changes, the ball does not. The
    // store covers are dominated by their teal sky instead, which is background
    // rather than brand, and would have collided with Tidehook's sea anyway.
    accent: '#ffd860',
    screenshots: 4,
    links: [
      { platform: 'web', status: 'live', url: 'https://h.gamestao.com' },
      { platform: 'crazygames', status: 'soon' },
      { platform: 'playgama', status: 'soon' },
      // The iOS build is the one that adds an ad-free card; not submitted yet.
      { platform: 'ios', status: 'soon' },
      { platform: 'wechat', status: 'soon' },
    ],
  },
  {
    id: 'brushblade',
    name: 'Brushblade',
    // The cinnabar of a seal stamp, #c8281e in the client's own art, lifted to
    // 5.4:1. An ink-wash game is black, white and one red; the red is the only
    // part of that palette a card can be accented with.
    accent: '#ef5a4e',
    screenshots: 4,
    links: [
      { platform: 'web', status: 'live', url: 'https://f.gamestao.com' },
      { platform: 'wechat', status: 'soon' },
      // Deliberately not submitted yet: the CrazyGames listing waits on the
      // content build in the game's own CONTENT.md, so this is 'soon' by
      // decision rather than by backlog.
      { platform: 'crazygames', status: 'soon' },
    ],
  },
  {
    id: 'tidehook',
    name: 'Tidehook',
    // The shallow-water tone of the sea, #26B2B0, locked in the game's
    // `00-art-direction.md` as the first of three depths taken off style frame
    // r2. Its covers are dominated by the deep-ocean navy instead, which is
    // Nivara's hue and the one colour on that frame this card must not use.
    accent: '#26b2b0',
    screenshots: 3,
    links: [
      // tidehook.gamestao.com, once the repository's new deploy-web job runs.
      { platform: 'web', status: 'soon' },
      { platform: 'playgama', status: 'soon' },
    ],
  },
  {
    id: 'swarm-orbit',
    name: 'Swarm Orbit',
    // The ring the train runs on: the mid-green #6c8c2e of the game's own
    // documented land palette, lifted to 7.7:1. Its gold #ffd84a is the coin,
    // and three other cards on this page are already gold.
    accent: '#8fb63c',
    screenshots: 4,
    links: [
      // swarmorbit.gamestao.com, once the repository's new deploy-web job runs.
      { platform: 'web', status: 'soon' },
      { platform: 'playgama', status: 'soon' },
    ],
  },
  {
    id: 'dummy-brawl',
    name: 'Dummy Brawl',
    // The logo's own yellow, #f2c230 over an ink outline, as the title is drawn
    // both in game and on the store covers.
    accent: '#f2c230',
    screenshots: 4,
    links: [
      // dummybrawl.gamestao.com, once the repository's new deploy-web job runs.
      { platform: 'web', status: 'soon' },
      { platform: 'playgama', status: 'soon' },
    ],
  },
  {
    id: 'hexfront-rush',
    name: 'Hexfront Rush',
    // The logo's red-orange #d62e0f, lifted to 6.5:1. The covers themselves are
    // parchment and gold, which is the map rather than the game.
    accent: '#ef7a52',
    screenshots: 2,
    links: [
      // hexfront.gamestao.com, once the repository's new deploy-web job runs.
      // Not hf., which already belongs to this game's replay collector — one
      // hostname cannot be both, and the one players see should say the name.
      { platform: 'web', status: 'soon' },
      { platform: 'playgama', status: 'soon' },
    ],
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    // The board's own `--accent` in dark mode, #6e9cff, read off the deployed
    // stylesheet. The page's theme-color is paper and ink with no chroma at
    // all, which is right for a Sudoku grid and useless as an accent.
    accent: '#6e9cff',
    screenshots: 4,
    links: [
      { platform: 'web', status: 'live', url: 'https://s.gamestao.com' },
      // Installable as a PWA today; the Capacitor shells are planned, not built.
      { platform: 'ios', status: 'soon' },
      { platform: 'android', status: 'soon' },
    ],
  },
  {
    id: 'pata',
    name: 'Pata',
    // The game's own declared `theme-color`, #5cc8f2 — the sky of the room it
    // opens in. Taken from the deployed page rather than from source, because
    // every pixel in this one is drawn in code and there is no art file to read.
    accent: '#5cc8f2',
    screenshots: 4,
    links: [{ platform: 'web', status: 'live', url: 'https://e.gamestao.com' }],
  },
];

/**
 * schema.org `gamePlatform` values. Deliberately not translated and not the
 * UI labels: those are calls to action ("Play in browser"), while this field
 * wants the platform's own name. Several stores are all just the web.
 */
export const SCHEMA_PLATFORM: Record<PlatformId, string> = {
  web: 'Web browser',
  ios: 'iOS',
  android: 'Android',
  wechat: 'WeChat Mini Game',
  crazygames: 'Web browser',
  playgama: 'Web browser',
  itch: 'Web browser',
};

export function getGame(id: GameId): Game {
  const game = GAMES.find((g) => g.id === id);
  if (!game) throw new Error(`Unknown game id: ${id}`);
  return game;
}

export const SUPPORT_EMAIL = 'support@gamestao.com';

/**
 * Publishing, investment and press. Deliberately a second address rather than
 * a second label on the first: the studio inbox and the player inbox have
 * different urgency, and anyone evaluating the studio should never land in the
 * same queue as a refund request.
 */
export const BUSINESS_EMAIL = 'contact@gamestao.com';

/*
 * There is no LEGAL_URLS table here any more.
 *
 * The footer used to link the Nivara client's privacy policy, terms and refund
 * policy as though they were the studio's, which put a document describing
 * accounts, purchases, matchmaking and chat behind a link on a site that has
 * none of those. This site now serves its own two documents, about itself, in
 * `data/legal/`; each game keeps its own set, linked from the game, where the
 * reader is someone the policy actually describes.
 */
