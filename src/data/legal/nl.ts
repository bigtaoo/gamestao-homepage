import type { LegalDocs } from './types';

export const nl: LegalDocs = {
  privacy: {
    title: 'Privacy',
    updatedLabel: 'Laatst bijgewerkt',
    lead: 'Deze pagina gaat over gamestao.com, de studiosite die je nu leest. Elk spel heeft zijn eigen privacybeleid, vanuit het spel zelf gelinkt — een spel met accounts en aankopen verzamelt dingen die een site als deze nooit verzamelt.',
    sections: [
      {
        heading: 'Wat deze site verzamelt',
        body: [
          'Niets waarmee je te identificeren bent. Er zijn geen accounts, geen formulieren, geen reacties en geen aanmelding: de site neemt helemaal geen invoer aan. Hij plaatst geen cookies. Hij gebruikt geen analytics, geen trackingpixels en geen advertentiescripts.',
          'Hij laadt ook niets van derden — geen externe scripts, lettertypen of afbeeldingen. Dat is niet alleen een belofte: de site beperkt zichzelf met een Content-Security-Policy die alleen zijn eigen herkomst noemt, dus een tracker zou er niet bij kunnen zonder dat beleid eerst te wijzigen.',
        ],
      },
      {
        heading: 'Het enige dat op je apparaat wordt bewaard',
        body: [
          'Je taalkeuze, onder de sleutel gamestao.lang in de lokale opslag van je browser, alleen weggeschreven als je een taal kiest in de schakelaar. Hij blijft in je browser, gaat nergens heen, en het wissen van sitegegevens verwijdert hem.',
          'Staat hij er niet, dan bepaalt bij een eerste bezoek de taal die je browser vraagt welke versie je te zien krijgt. Dat gebeurt in je browser en wordt niet vastgelegd.',
        ],
      },
      {
        heading: 'Wat onze host vastlegt',
        body: [
          'De site wordt geserveerd door Cloudflare, dat kortlopende verzoeklogs bijhoudt zoals elke webserver doet: IP-adres, tijd, opgevraagde pagina en de user agent van de browser. We gebruiken ze om de site in de lucht te houden en ruwweg te zien hoeveel verkeer er komt. Cloudflare bewaart ze als onze hostingprovider, namens ons.',
        ],
      },
      {
        heading: 'Als je ons schrijft',
        body: [
          'Post aan support@gamestao.com of contact@gamestao.com wordt door Cloudflare Email Routing doorgestuurd naar een mailbox die wij lezen. We bewaren wat je stuurt zolang als nodig is om je te antwoorden en de uitwisseling vast te leggen.',
          'We zetten je op geen enkele mailinglijst. Die is er niet.',
        ],
      },
      {
        heading: 'Links naar elders',
        body: [
          'De spelpagina’s linken naar appwinkels, naar de spellen zelf en naar platforms als CrazyGames en itch.io. Dat zijn sites van andere bedrijven met hun eigen regels, en de onze houdt op bij de link.',
        ],
      },
      {
        heading: 'Je rechten',
        body: [
          'Je kunt vragen wat we van je hebben, om correctie of verwijdering vragen, of bezwaar maken tegen het bewaren ervan. Schrijf naar contact@gamestao.com.',
          'Meestal is het antwoord dat er niets te corrigeren of te wissen valt, omdat deze site geen account bijhoudt en geen profiel opbouwt. De uitzondering is een e-mailwisseling die jij begonnen bent — die hebben we wel, en die wissen we op verzoek.',
        ],
      },
      {
        heading: 'Wijzigingen',
        body: [
          'Verandert deze mededeling, dan verandert de datum hierboven mee. Er is geen archief van eerdere versies: die je nu leest is de versie die geldt.',
        ],
      },
    ],
  },

  terms: {
    title: 'Gebruiksvoorwaarden',
    updatedLabel: 'Laatst bijgewerkt',
    lead: 'Deze gaan over deze website. De spellen hebben eigen voorwaarden, die je in het spel aanvaardt — deze pagina spreekt niet namens hen.',
    sections: [
      {
        heading: 'Deze site',
        body: [
          'gamestao.com wordt uitgegeven door gamestao, een onafhankelijke spelstudio, om de studio en haar spellen te beschrijven.',
          'Hij wordt geleverd zoals hij is. We proberen hem juist en bereikbaar te houden, en dat lukt meestal, maar geen van beide is een toezegging, en een pagina hier is geen advies om naar te handelen.',
        ],
      },
      {
        heading: 'Wat je mag gebruiken',
        body: [
          'Alles in het perskit — logo’s, iconen en schermafbeeldingen — mag ongewijzigd worden gebruikt door artikelen, video’s en winkelvermeldingen die over de spellen schrijven of ze vermelden. Wijzig de logo’s niet, verkleur het studiomerk niet en presenteer een schermafbeelding niet als iets anders dan wat erop staat.',
          'De rest van de site — de tekst, de opmaak en de code — is van ons, en het perskit dekt het verveelvoudigen daarvan niet. Citeren, met een link terug, is welkom.',
        ],
      },
      {
        heading: 'Namen en merken',
        body: [
          'gamestao, Nivara, DayDayUp en SumQuest zijn de namen die de studio aan zichzelf en aan haar spellen geeft. Ze gebruiken om naar ons te verwijzen is prima. Ze zo gebruiken dat het lijkt alsof wij iets gemaakt, uitgegeven of goedgekeurd hebben wat niet van ons is, niet.',
        ],
      },
      {
        heading: 'Links hiervandaan',
        body: [
          'Waar deze site naar een winkel, een platform of een spel linkt, geldt voor wat na de link gebeurt het reglement van die site, niet dit.',
        ],
      },
      {
        heading: 'Wijzigingen',
        body: [
          'Veranderen deze voorwaarden, dan verandert de datum hierboven mee. Wie de site daarna blijft gebruiken, aanvaardt de dan gepubliceerde versie.',
        ],
      },
    ],
  },
};
