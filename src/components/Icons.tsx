import type { PlatformId } from '../data/games';

/**
 * Neutral glyphs rather than store logos. Apple's and Google's marks come with
 * badge-artwork rules and cannot be recoloured to fit a dark palette, so each
 * platform gets a plain pictogram and the store's name in text next to it.
 */
const PATHS: Record<PlatformId, string> = {
  // Globe
  web: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 0c2.5 2.2 3.8 5.3 3.8 9s-1.3 6.8-3.8 9m0-18c-2.5 2.2-3.8 5.3-3.8 9s1.3 6.8 3.8 9M3.5 9h17M3.5 15h17',
  // Phone
  ios: 'M8 2.75h8a1.5 1.5 0 011.5 1.5v15.5a1.5 1.5 0 01-1.5 1.5H8a1.5 1.5 0 01-1.5-1.5V4.25A1.5 1.5 0 018 2.75zM10.5 18.5h3',
  // Phone with rounded corners and a stripe
  android: 'M7.5 2.75h9a1.25 1.25 0 011.25 1.25v16a1.25 1.25 0 01-1.25 1.25h-9A1.25 1.25 0 016.25 20V4a1.25 1.25 0 011.25-1.25zM6.25 6.5h11.5M10.5 18.75h3',
  // Speech bubble
  wechat: 'M12 4.5c4.4 0 8 2.7 8 6s-3.6 6-8 6a10 10 0 01-2.3-.26L6 18.5l.8-2.7A6.6 6.6 0 014 10.5c0-3.3 3.6-6 8-6zM9 9.75h.01M15 9.75h.01',
  // Gamepad
  crazygames: 'M7 8.5h10a4 4 0 013.9 4.85l-.6 2.8A2.4 2.4 0 0118 18a2.4 2.4 0 01-1.9-.95L15 15.5H9l-1.1 1.55A2.4 2.4 0 016 18a2.4 2.4 0 01-2.3-1.85l-.6-2.8A4 4 0 017 8.5zM8.5 11v2.5M7.25 12.25h2.5M15 12h.01M16.75 13.5h.01',
  // Stacked tiles, itch.io's own shape is a wordmark so this stands in for it
  itch: 'M4 7.5l2-3h12l2 3v2.25a1.75 1.75 0 01-3.2 1 1.75 1.75 0 01-3.2 0 1.75 1.75 0 01-3.2 0 1.75 1.75 0 01-3.2 0A1.75 1.75 0 014 9.75V7.5zM5.5 11.5V18a1.5 1.5 0 001.5 1.5h10a1.5 1.5 0 001.5-1.5v-6.5M10 15.5h4',
};

export function PlatformIcon({ platform }: { platform: PlatformId }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[platform]} />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg
      className="icon icon--arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h13M12.5 6l6 6-6 6" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS.web} />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg
      className="icon icon--chevron"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9.5l6 6 6-6" />
    </svg>
  );
}
