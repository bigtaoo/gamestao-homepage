import type { LegalDocs } from './types';

/**
 * The source text. The ten translations are translations *of this*, so a change
 * starts here and the others follow — and every claim below was checked against
 * the code rather than copied from another site's policy.
 */
export const en: LegalDocs = {
  privacy: {
    title: 'Privacy',
    updatedLabel: 'Last updated',
    lead: 'This page is about gamestao.com, the studio site you are reading. Each game has its own privacy policy, linked from the game itself — a game with accounts and purchases collects things a site like this one never does.',
    sections: [
      {
        heading: 'What this site collects',
        body: [
          'Nothing that identifies you. There are no accounts, no forms, no comments and no sign-up: the site takes no input at all. It sets no cookies. It runs no analytics, no tracking pixels and no advertising scripts.',
          'It also loads nothing from anyone else — no third-party scripts, fonts or images. That is not only a promise: the site restricts itself with a Content-Security-Policy that names its own origin and nothing besides, so a tracker could not be added without that policy being changed first.',
        ],
      },
      {
        heading: 'The one thing stored on your device',
        body: [
          'Your language choice, under the key gamestao.lang in your browser’s local storage, written only when you pick a language from the switcher. It stays in your browser, it is never sent anywhere, and clearing site data removes it.',
          'If it is not there, a first visit uses the language your browser asks for to decide which version to show you. That happens in your browser and is not recorded.',
        ],
      },
      {
        heading: 'What our host records',
        body: [
          'The site is served by Cloudflare, which keeps short-lived request logs the way any web server does: IP address, time, the page requested, and the browser’s user agent. We use them to keep the site up and to see roughly how much traffic it gets. Cloudflare holds them as our hosting provider, on our behalf.',
        ],
      },
      {
        heading: 'If you write to us',
        body: [
          'Mail to support@gamestao.com or contact@gamestao.com is forwarded by Cloudflare Email Routing to a mailbox we read. We keep what you send for as long as it takes to answer you and to have a record of the exchange.',
          'We do not add you to a mailing list. There is no mailing list.',
        ],
      },
      {
        heading: 'Links to other places',
        body: [
          'The game pages link to app stores, to the games themselves, and to platforms such as CrazyGames and itch.io. Those are other companies’ sites with their own policies, and this one ends at the link.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You can ask us what we hold about you, ask for it to be corrected or deleted, or object to our holding it. Write to contact@gamestao.com.',
          'In most cases the answer will be that there is nothing to correct or delete, because this site keeps no account and builds no profile. The exception is an email conversation you started, which we do hold — and can delete on request.',
        ],
      },
      {
        heading: 'Changes',
        body: [
          'If this notice changes, the date above changes with it. There is no archive of earlier versions: the one you are reading is the one that applies.',
        ],
      },
    ],
  },

  terms: {
    title: 'Terms',
    updatedLabel: 'Last updated',
    lead: 'These cover this website. The games have their own terms, which you accept in the game — this page does not speak for them.',
    sections: [
      {
        heading: 'This site',
        body: [
          'gamestao.com is published by gamestao, an independent game studio, to describe the studio and its games.',
          'It is provided as it stands. We try to keep it accurate and available and generally succeed, but neither is a promise, and a page here is not advice to act on.',
        ],
      },
      {
        heading: 'What you may use',
        body: [
          'Everything in the press kit — logos, icons and screenshots — may be used as it is by articles, videos and store listings that write about or list the games. Please do not alter the logos, recolour the studio mark, or present a screenshot as something other than what it shows.',
          'The rest of the site — its text, its layout and its code — is ours, and reproducing it is not covered by the press kit. Quoting it, with a link back, is welcome.',
        ],
      },
      {
        heading: 'Names and marks',
        body: [
          'gamestao, Nivara, DayDayUp and SumQuest are the studio’s names for itself and its games. Using them to refer to us is fine. Using them so as to suggest that we made, published or endorsed something we did not is not.',
        ],
      },
      {
        heading: 'Links away from here',
        body: [
          'Where this site links to a store, a platform or a game, what happens after the link is governed by that site’s terms, not by these.',
        ],
      },
      {
        heading: 'Changes',
        body: [
          'If these terms change, the date above changes with them. Continuing to use the site after that is acceptance of the version then published.',
        ],
      },
    ],
  },
};
