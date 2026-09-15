import type { GameId } from '../lib/routes';

export type PlatformId = 'web' | 'ios' | 'android' | 'wechat' | 'crazygames' | 'itch';

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
   * Each is traceable to the game's own art, not picked to look nice here:
   * Nivara and SumQuest from the dominant chromatic colour of their real store
   * icons, DayDayUp from the locked element palette in its own
   * `design/13-worldview-art-direction.md`. All three clear 4.5:1 both as text
   * on `--surface` and as a button background under near-black text, and the
   * three hues sit at least 54 degrees apart so the cards stay distinct.
   */
  accent: string;
  /** How many screenshots exist at public/assets/games/<id>/shot-<n>.webp */
  screenshots: number;
  links: PlatformLink[];
};

/**
 * Release status as of 2026-09-02, cross-checked against each project repo
 * (`D:\funny`, `D:\daydayup`, `D:\number\docs\distribution.md`).
 *
 * To launch a platform: change `status: 'soon'` to `status: 'live'` and add its
 * `url`. Nothing else in the site needs touching — the badges, the game page's
 * download row and the structured data all read this table.
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
    id: 'daydayup',
    name: 'DayDayUp',
    // The game's own locked crystal/poison hue. Not its fire hue (#FF7043),
    // which sits 20 degrees from SumQuest's real orange and would blur the two
    // cards together; DayDayUp has no published icon to be faithful to, so it
    // is the one free to move.
    accent: '#9ccc65',
    screenshots: 4,
    links: [
      { platform: 'web', status: 'live', url: 'https://b.gamestao.com' },
      { platform: 'ios', status: 'soon' },
      { platform: 'android', status: 'soon' },
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

/**
 * Legal pages are served by the Nivara client and shared across all three
 * games — the studio has one privacy policy, one ToS, one refund policy.
 * Linked, never duplicated here.
 *
 * Extensionless on purpose: the Nivara client 307s `/privacy.html` to
 * `/privacy`, so the `.html` form these used to carry cost every footer on all
 * 44 pages an extra round trip to reach the same document.
 */
export const LEGAL_URLS = {
  privacy: 'https://nivara.gamestao.com/privacy',
  terms: 'https://nivara.gamestao.com/terms',
  refunds: 'https://nivara.gamestao.com/refunds',
} as const;
