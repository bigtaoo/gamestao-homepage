import type { LegalDocs } from './types';

export const es: LegalDocs = {
  privacy: {
    title: 'Privacidad',
    updatedLabel: 'Última actualización',
    lead: 'Esta página trata de gamestao.com, el sitio del estudio que estás leyendo. Cada juego tiene su propia política de privacidad, enlazada desde el juego — un juego con cuentas y compras recoge cosas que un sitio como este nunca recoge.',
    sections: [
      {
        heading: 'Qué recoge este sitio',
        body: [
          'Nada que te identifique. No hay cuentas, ni formularios, ni comentarios, ni registro: el sitio no acepta ninguna entrada. No pone cookies. No usa analítica, ni píxeles de seguimiento, ni scripts publicitarios.',
          'Tampoco carga nada de terceros: ningún script, tipografía ni imagen ajenos. Y no es solo una promesa: el sitio se limita a sí mismo con una Content-Security-Policy que nombra únicamente su propio origen, de modo que no se podría añadir un rastreador sin cambiar antes esa política.',
        ],
      },
      {
        heading: 'Lo único que se guarda en tu dispositivo',
        body: [
          'Tu elección de idioma, bajo la clave gamestao.lang en el almacenamiento local de tu navegador, escrita solo si eliges un idioma en el selector. Se queda en tu navegador, no se envía a ninguna parte, y borrar los datos del sitio la elimina.',
          'Si no está, en una primera visita se usa el idioma que pide tu navegador para decidir qué versión mostrarte. Eso ocurre en tu navegador y no queda registrado.',
        ],
      },
      {
        heading: 'Qué registra nuestro proveedor',
        body: [
          'El sitio lo sirve Cloudflare, que conserva registros de petición de corta duración como hace cualquier servidor web: dirección IP, hora, página solicitada y agente de usuario del navegador. Los usamos para mantener el sitio en pie y ver aproximadamente cuánto tráfico recibe. Cloudflare los conserva como proveedor de alojamiento, por cuenta nuestra.',
        ],
      },
      {
        heading: 'Si nos escribes',
        body: [
          'El correo a support@gamestao.com o contact@gamestao.com lo reenvía Cloudflare Email Routing a un buzón que leemos. Conservamos lo que envías el tiempo necesario para responderte y para dejar constancia del intercambio.',
          'No te añadimos a ninguna lista de correo. No hay lista de correo.',
        ],
      },
      {
        heading: 'Enlaces a otros sitios',
        body: [
          'Las páginas de los juegos enlazan a tiendas de aplicaciones, a los propios juegos y a plataformas como CrazyGames e itch.io. Son sitios de otras empresas, con sus propias políticas, y el nuestro termina en el enlace.',
        ],
      },
      {
        heading: 'Tus derechos',
        body: [
          'Puedes preguntarnos qué tenemos sobre ti, pedir que se corrija o se elimine, u oponerte a que lo conservemos. Escribe a contact@gamestao.com.',
          'En la mayoría de los casos la respuesta será que no hay nada que corregir ni borrar, porque este sitio no mantiene cuentas ni construye perfiles. La excepción es una conversación por correo que hayas iniciado tú: esa sí la tenemos, y la borramos si lo pides.',
        ],
      },
      {
        heading: 'Cambios',
        body: [
          'Si este aviso cambia, la fecha de arriba cambia con él. No hay archivo de versiones anteriores: la que estás leyendo es la que se aplica.',
        ],
      },
    ],
  },

  terms: {
    title: 'Términos de uso',
    updatedLabel: 'Última actualización',
    lead: 'Cubren este sitio web. Los juegos tienen sus propios términos, que aceptas dentro del juego — esta página no habla por ellos.',
    sections: [
      {
        heading: 'Este sitio',
        body: [
          'gamestao.com lo publica gamestao, un estudio de videojuegos independiente, para presentar el estudio y sus juegos.',
          'Se ofrece tal como está. Procuramos mantenerlo exacto y disponible, y normalmente lo conseguimos, pero ninguna de las dos cosas es una promesa, y una página de aquí no es un consejo sobre el que actuar.',
        ],
      },
      {
        heading: 'Qué puedes usar',
        body: [
          'Todo lo del kit de prensa — logotipos, iconos y capturas — puede usarse tal cual en artículos, vídeos y fichas de tienda que hablen de los juegos o los listen. Por favor, no alteres los logotipos, no recolorees la marca del estudio ni presentes una captura como algo distinto de lo que muestra.',
          'El resto del sitio — su texto, su maquetación y su código — es nuestro, y el kit de prensa no cubre su reproducción. Citarlo, con un enlace de vuelta, es bienvenido.',
        ],
      },
      {
        heading: 'Nombres y marcas',
        body: [
          'gamestao, Nivara, DayDayUp y SumQuest son los nombres que el estudio se da a sí mismo y a sus juegos. Usarlos para referirse a nosotros está bien. Usarlos de manera que sugieran que hicimos, publicamos o respaldamos algo que no es nuestro, no.',
        ],
      },
      {
        heading: 'Enlaces que salen de aquí',
        body: [
          'Cuando este sitio enlaza a una tienda, una plataforma o un juego, lo que ocurre después del enlace se rige por los términos de ese sitio, no por estos.',
        ],
      },
      {
        heading: 'Cambios',
        body: [
          'Si estos términos cambian, la fecha de arriba cambia con ellos. Seguir usando el sitio después equivale a aceptar la versión publicada entonces.',
        ],
      },
    ],
  },
};
