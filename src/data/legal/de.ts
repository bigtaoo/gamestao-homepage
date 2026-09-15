import type { LegalDocs } from './types';

export const de: LegalDocs = {
  privacy: {
    title: 'Datenschutz',
    updatedLabel: 'Zuletzt aktualisiert',
    lead: 'Diese Seite betrifft gamestao.com, die Studio-Website, die Sie gerade lesen. Jedes Spiel hat seine eigene Datenschutzerklärung, verlinkt im Spiel selbst — ein Spiel mit Konten und Käufen erhebt Dinge, die eine Website wie diese nie erhebt.',
    sections: [
      {
        heading: 'Was diese Website erhebt',
        body: [
          'Nichts, was Sie identifiziert. Es gibt keine Konten, keine Formulare, keine Kommentare und keine Anmeldung: Die Website nimmt überhaupt keine Eingaben entgegen. Sie setzt keine Cookies. Sie verwendet keine Analyse, keine Tracking-Pixel und keine Werbeskripte.',
          'Sie lädt auch nichts von Dritten — keine fremden Skripte, Schriften oder Bilder. Das ist nicht nur ein Versprechen: Die Website beschränkt sich selbst mit einer Content-Security-Policy, die ausschließlich die eigene Herkunft nennt. Ein Tracker ließe sich also nicht einbauen, ohne zuerst diese Richtlinie zu ändern.',
        ],
      },
      {
        heading: 'Das Einzige, was auf Ihrem Gerät gespeichert wird',
        body: [
          'Ihre Sprachwahl, unter dem Schlüssel gamestao.lang im lokalen Speicher Ihres Browsers, geschrieben nur, wenn Sie im Umschalter eine Sprache wählen. Sie bleibt in Ihrem Browser, wird nirgendwohin gesendet, und das Löschen der Websitedaten entfernt sie.',
          'Fehlt sie, entscheidet beim ersten Besuch die von Ihrem Browser angefragte Sprache, welche Fassung Sie sehen. Das geschieht in Ihrem Browser und wird nicht aufgezeichnet.',
        ],
      },
      {
        heading: 'Was unser Hoster aufzeichnet',
        body: [
          'Die Website wird von Cloudflare ausgeliefert, das wie jeder Webserver kurzlebige Zugriffsprotokolle führt: IP-Adresse, Zeit, angeforderte Seite und User-Agent des Browsers. Wir nutzen sie, um die Website am Laufen zu halten und ungefähr zu sehen, wie viel Verkehr sie bekommt. Cloudflare speichert sie als unser Hosting-Anbieter in unserem Auftrag.',
        ],
      },
      {
        heading: 'Wenn Sie uns schreiben',
        body: [
          'Post an support@gamestao.com oder contact@gamestao.com wird von Cloudflare Email Routing an ein Postfach weitergeleitet, das wir lesen. Wir behalten, was Sie senden, so lange, wie es dauert, Ihnen zu antworten und den Austausch dokumentiert zu haben.',
          'Wir nehmen Sie in keinen Verteiler auf. Es gibt keinen Verteiler.',
        ],
      },
      {
        heading: 'Links an andere Orte',
        body: [
          'Die Spieleseiten verlinken auf App-Stores, auf die Spiele selbst und auf Plattformen wie CrazyGames und itch.io. Das sind Websites anderer Unternehmen mit eigenen Richtlinien, und unsere endet beim Link.',
        ],
      },
      {
        heading: 'Ihre Rechte',
        body: [
          'Sie können fragen, was wir über Sie gespeichert haben, Berichtigung oder Löschung verlangen oder der Speicherung widersprechen. Schreiben Sie an contact@gamestao.com.',
          'Meist wird die Antwort lauten, dass es nichts zu berichtigen oder zu löschen gibt, weil diese Website kein Konto führt und kein Profil bildet. Die Ausnahme ist ein von Ihnen begonnener E-Mail-Austausch — den haben wir, und wir löschen ihn auf Wunsch.',
        ],
      },
      {
        heading: 'Änderungen',
        body: [
          'Ändert sich dieser Hinweis, ändert sich das Datum oben mit. Ein Archiv früherer Fassungen gibt es nicht: Die Fassung, die Sie lesen, ist die geltende.',
        ],
      },
    ],
  },

  terms: {
    title: 'Nutzungsbedingungen',
    updatedLabel: 'Zuletzt aktualisiert',
    lead: 'Diese gelten für diese Website. Die Spiele haben eigene Bedingungen, die Sie im Spiel annehmen — diese Seite spricht nicht für sie.',
    sections: [
      {
        heading: 'Diese Website',
        body: [
          'gamestao.com wird von gamestao herausgegeben, einem unabhängigen Spielestudio, um das Studio und seine Spiele vorzustellen.',
          'Sie wird so bereitgestellt, wie sie ist. Wir bemühen uns, sie richtig und erreichbar zu halten, und das gelingt meistens, aber beides ist keine Zusage, und eine Seite hier ist keine Grundlage, auf die hin man handelt.',
        ],
      },
      {
        heading: 'Was Sie verwenden dürfen',
        body: [
          'Alles im Pressekit — Logos, Icons und Screenshots — darf von Artikeln, Videos und Store-Einträgen unverändert verwendet werden, die über die Spiele berichten oder sie listen. Bitte ändern Sie die Logos nicht, färben Sie die Studio-Marke nicht um und geben Sie einen Screenshot nicht als etwas aus, das er nicht zeigt.',
          'Der Rest der Website — Texte, Layout und Code — gehört uns, und seine Vervielfältigung deckt das Pressekit nicht ab. Zitieren mit Link zurück ist willkommen.',
        ],
      },
      {
        heading: 'Namen und Marken',
        body: [
          'gamestao, Nivara, DayDayUp und SumQuest sind die Namen des Studios für sich selbst und seine Spiele. Sie zu verwenden, um auf uns zu verweisen, ist in Ordnung. Sie so zu verwenden, dass der Eindruck entsteht, wir hätten etwas gemacht, veröffentlicht oder unterstützt, was nicht von uns stammt, ist es nicht.',
        ],
      },
      {
        heading: 'Links von hier fort',
        body: [
          'Wo diese Website auf einen Store, eine Plattform oder ein Spiel verlinkt, gilt für alles nach dem Klick deren Regelwerk, nicht dieses.',
        ],
      },
      {
        heading: 'Änderungen',
        body: [
          'Ändern sich diese Bedingungen, ändert sich das Datum oben mit. Wer die Website danach weiter nutzt, nimmt die dann veröffentlichte Fassung an.',
        ],
      },
    ],
  },
};
