import type { LegalDocs } from './types';

export const fr: LegalDocs = {
  privacy: {
    title: 'Confidentialité',
    updatedLabel: 'Dernière mise à jour',
    lead: 'Cette page concerne gamestao.com, le site du studio que vous lisez. Chaque jeu a sa propre politique de confidentialité, accessible depuis le jeu — un jeu avec comptes et achats collecte des choses qu’un site comme celui-ci ne collecte jamais.',
    sections: [
      {
        heading: 'Ce que ce site collecte',
        body: [
          'Rien qui vous identifie. Il n’y a ni compte, ni formulaire, ni commentaire, ni inscription : le site n’accepte aucune saisie. Il ne dépose aucun cookie. Il n’utilise ni mesure d’audience, ni pixel de suivi, ni script publicitaire.',
          'Il ne charge rien non plus depuis des tiers — aucun script, police ni image extérieurs. Ce n’est pas qu’une promesse : le site se limite lui-même par une Content-Security-Policy qui ne nomme que sa propre origine, si bien qu’un traceur ne pourrait pas y être ajouté sans modifier d’abord cette politique.',
        ],
      },
      {
        heading: 'La seule chose stockée sur votre appareil',
        body: [
          'Votre choix de langue, sous la clé gamestao.lang dans le stockage local de votre navigateur, écrite uniquement si vous choisissez une langue dans le sélecteur. Elle reste dans votre navigateur, n’est envoyée nulle part, et effacer les données du site la supprime.',
          'En son absence, une première visite s’appuie sur la langue demandée par votre navigateur pour décider quelle version vous montrer. Cela se passe dans votre navigateur et n’est pas enregistré.',
        ],
      },
      {
        heading: 'Ce que notre hébergeur enregistre',
        body: [
          'Le site est servi par Cloudflare, qui conserve de courts journaux de requêtes comme le fait tout serveur web : adresse IP, heure, page demandée et agent utilisateur du navigateur. Nous nous en servons pour maintenir le site en ligne et voir approximativement le trafic qu’il reçoit. Cloudflare les conserve en tant qu’hébergeur, pour notre compte.',
        ],
      },
      {
        heading: 'Si vous nous écrivez',
        body: [
          'Le courrier adressé à support@gamestao.com ou contact@gamestao.com est acheminé par Cloudflare Email Routing vers une boîte que nous lisons. Nous conservons ce que vous envoyez le temps de vous répondre et de garder une trace de l’échange.',
          'Nous ne vous inscrivons à aucune liste de diffusion. Il n’y en a pas.',
        ],
      },
      {
        heading: 'Liens vers ailleurs',
        body: [
          'Les pages des jeux renvoient vers des boutiques d’applications, vers les jeux eux-mêmes et vers des plateformes comme CrazyGames et itch.io. Ce sont les sites d’autres sociétés, avec leurs propres règles, et le nôtre s’arrête au lien.',
        ],
      },
      {
        heading: 'Vos droits',
        body: [
          'Vous pouvez demander ce que nous détenons à votre sujet, en demander la rectification ou l’effacement, ou vous opposer à sa conservation. Écrivez à contact@gamestao.com.',
          'Dans la plupart des cas, la réponse sera qu’il n’y a rien à rectifier ni à effacer, ce site ne tenant aucun compte et ne construisant aucun profil. L’exception est un échange de courriels que vous avez engagé — celui-là, nous le détenons, et nous le supprimons sur demande.',
        ],
      },
      {
        heading: 'Modifications',
        body: [
          'Si cet avis change, la date ci-dessus change avec lui. Il n’existe pas d’archive des versions antérieures : celle que vous lisez est celle qui s’applique.',
        ],
      },
    ],
  },

  terms: {
    title: 'Conditions d’utilisation',
    updatedLabel: 'Dernière mise à jour',
    lead: 'Elles portent sur ce site web. Les jeux ont leurs propres conditions, que vous acceptez dans le jeu — cette page ne parle pas en leur nom.',
    sections: [
      {
        heading: 'Ce site',
        body: [
          'gamestao.com est publié par gamestao, studio de jeux indépendant, pour présenter le studio et ses jeux.',
          'Il est fourni tel quel. Nous nous efforçons de le garder exact et disponible, et nous y parvenons le plus souvent, mais ni l’un ni l’autre n’est une garantie, et une page d’ici n’est pas un conseil sur lequel agir.',
        ],
      },
      {
        heading: 'Ce que vous pouvez utiliser',
        body: [
          'Tout ce qui figure dans le kit presse — logos, icônes et captures d’écran — peut être utilisé tel quel par les articles, vidéos et fiches de boutique qui parlent des jeux ou les référencent. Merci de ne pas modifier les logos, de ne pas recolorer la marque du studio et de ne pas présenter une capture comme montrant autre chose que ce qu’elle montre.',
          'Le reste du site — son texte, sa mise en page et son code — nous appartient, et le kit presse ne couvre pas sa reproduction. Le citer, avec un lien retour, est bienvenu.',
        ],
      },
      {
        heading: 'Noms et marques',
        body: [
          'gamestao, Nivara, DayDayUp et SumQuest sont les noms que le studio se donne et donne à ses jeux. Les employer pour parler de nous ne pose aucun problème. Les employer de façon à laisser croire que nous avons créé, publié ou approuvé quelque chose qui n’est pas de nous, si.',
        ],
      },
      {
        heading: 'Liens qui mènent ailleurs',
        body: [
          'Lorsque ce site renvoie vers une boutique, une plateforme ou un jeu, ce qui se passe après le lien relève des conditions de ce site-là, et non des présentes.',
        ],
      },
      {
        heading: 'Modifications',
        body: [
          'Si ces conditions changent, la date ci-dessus change avec elles. Continuer à utiliser le site ensuite vaut acceptation de la version alors publiée.',
        ],
      },
    ],
  },
};
