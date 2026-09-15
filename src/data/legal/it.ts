import type { LegalDocs } from './types';

export const it: LegalDocs = {
  privacy: {
    title: 'Privacy',
    updatedLabel: 'Ultimo aggiornamento',
    lead: 'Questa pagina riguarda gamestao.com, il sito dello studio che stai leggendo. Ogni gioco ha la propria informativa sulla privacy, collegata dal gioco stesso — un gioco con account e acquisti raccoglie cose che un sito come questo non raccoglie mai.',
    sections: [
      {
        heading: 'Che cosa raccoglie questo sito',
        body: [
          'Niente che ti identifichi. Non ci sono account, moduli, commenti né registrazione: il sito non accetta alcun input. Non imposta cookie. Non usa analytics, pixel di tracciamento o script pubblicitari.',
          'E non carica nulla da terzi — nessuno script, font o immagine altrui. Non è solo una promessa: il sito si limita da sé con una Content-Security-Policy che nomina soltanto la propria origine, quindi un tracciatore non potrebbe essere aggiunto senza prima cambiare quella policy.',
        ],
      },
      {
        heading: 'L’unica cosa salvata sul tuo dispositivo',
        body: [
          'La lingua che hai scelto, sotto la chiave gamestao.lang nell’archiviazione locale del browser, scritta solo se scegli una lingua dal selettore. Resta nel tuo browser, non viene inviata da nessuna parte, e cancellare i dati del sito la rimuove.',
          'Se non c’è, alla prima visita si usa la lingua richiesta dal tuo browser per decidere quale versione mostrarti. Accade nel tuo browser e non viene registrato.',
        ],
      },
      {
        heading: 'Che cosa registra il nostro host',
        body: [
          'Il sito è servito da Cloudflare, che conserva log di richiesta di breve durata come fa qualsiasi server web: indirizzo IP, ora, pagina richiesta e user agent del browser. Li usiamo per tenere il sito in piedi e per vedere all’incirca quanto traffico riceve. Cloudflare li conserva come nostro fornitore di hosting, per nostro conto.',
        ],
      },
      {
        heading: 'Se ci scrivi',
        body: [
          'La posta a support@gamestao.com o contact@gamestao.com viene inoltrata da Cloudflare Email Routing a una casella che leggiamo. Conserviamo quello che mandi per il tempo necessario a risponderti e a tenere traccia dello scambio.',
          'Non ti aggiungiamo a nessuna mailing list. Non esiste una mailing list.',
        ],
      },
      {
        heading: 'Link altrove',
        body: [
          'Le pagine dei giochi rimandano agli app store, ai giochi stessi e a piattaforme come CrazyGames e itch.io. Sono siti di altre aziende, con regole proprie, e il nostro finisce al link.',
        ],
      },
      {
        heading: 'I tuoi diritti',
        body: [
          'Puoi chiederci che cosa conserviamo su di te, chiederne la correzione o la cancellazione, o opporti alla conservazione. Scrivi a contact@gamestao.com.',
          'Nella maggior parte dei casi la risposta sarà che non c’è nulla da correggere o cancellare, perché questo sito non tiene account e non costruisce profili. L’eccezione è uno scambio di email iniziato da te: quello lo abbiamo, e lo cancelliamo su richiesta.',
        ],
      },
      {
        heading: 'Modifiche',
        body: [
          'Se questa informativa cambia, cambia con essa la data qui sopra. Non c’è un archivio delle versioni precedenti: quella che stai leggendo è quella che vale.',
        ],
      },
    ],
  },

  terms: {
    title: 'Termini di utilizzo',
    updatedLabel: 'Ultimo aggiornamento',
    lead: 'Valgono per questo sito. I giochi hanno termini propri, che accetti nel gioco — questa pagina non parla per loro.',
    sections: [
      {
        heading: 'Questo sito',
        body: [
          'gamestao.com è pubblicato da gamestao, studio di giochi indipendente, per presentare lo studio e i suoi giochi.',
          'È fornito così com’è. Cerchiamo di tenerlo accurato e raggiungibile, e di solito ci riusciamo, ma nessuna delle due cose è una promessa, e una pagina di qui non è un consiglio su cui agire.',
        ],
      },
      {
        heading: 'Che cosa puoi usare',
        body: [
          'Tutto ciò che è nel kit stampa — loghi, icone e screenshot — può essere usato così com’è da articoli, video e schede di negozio che parlano dei giochi o li elencano. Per favore non alterare i loghi, non ricolorare il marchio dello studio e non presentare uno screenshot come qualcosa di diverso da ciò che mostra.',
          'Il resto del sito — testo, impaginazione e codice — è nostro, e il kit stampa non ne copre la riproduzione. Citarlo, con un link di ritorno, è benvenuto.',
        ],
      },
      {
        heading: 'Nomi e marchi',
        body: [
          'gamestao, Nivara, DayDayUp e SumQuest sono i nomi che lo studio dà a sé stesso e ai suoi giochi. Usarli per riferirsi a noi va bene. Usarli in modo da far credere che abbiamo fatto, pubblicato o approvato qualcosa che non è nostro, no.',
        ],
      },
      {
        heading: 'Link che portano via da qui',
        body: [
          'Dove questo sito rimanda a un negozio, a una piattaforma o a un gioco, quanto accade dopo il link è regolato dai termini di quel sito, non da questi.',
        ],
      },
      {
        heading: 'Modifiche',
        body: [
          'Se questi termini cambiano, cambia con essi la data qui sopra. Continuare a usare il sito dopo equivale ad accettare la versione pubblicata in quel momento.',
        ],
      },
    ],
  },
};
