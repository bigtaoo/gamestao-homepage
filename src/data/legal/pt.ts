import type { LegalDocs } from './types';

export const pt: LegalDocs = {
  privacy: {
    title: 'Privacidade',
    updatedLabel: 'Última atualização',
    lead: 'Esta página é sobre o gamestao.com, o site do estúdio que estás a ler. Cada jogo tem a sua própria política de privacidade, ligada a partir do próprio jogo — um jogo com contas e compras recolhe coisas que um site como este nunca recolhe.',
    sections: [
      {
        heading: 'O que este site recolhe',
        body: [
          'Nada que te identifique. Não há contas, nem formulários, nem comentários, nem registo: o site não aceita qualquer entrada. Não coloca cookies. Não usa análise de tráfego, nem pixéis de rastreio, nem scripts de publicidade.',
          'Também não carrega nada de terceiros — nenhum script, tipo de letra ou imagem alheios. E não é apenas uma promessa: o site limita-se a si próprio com uma Content-Security-Policy que nomeia apenas a sua própria origem, pelo que não seria possível acrescentar um rastreador sem alterar primeiro essa política.',
        ],
      },
      {
        heading: 'A única coisa guardada no teu dispositivo',
        body: [
          'A tua escolha de idioma, sob a chave gamestao.lang no armazenamento local do navegador, escrita apenas se escolheres um idioma no seletor. Fica no teu navegador, nunca é enviada para lado nenhum, e limpar os dados do site remove-a.',
          'Se não existir, numa primeira visita é o idioma pedido pelo teu navegador que decide qual versão te é mostrada. Isso acontece no teu navegador e não fica registado.',
        ],
      },
      {
        heading: 'O que o nosso alojamento regista',
        body: [
          'O site é servido pela Cloudflare, que mantém registos de pedidos de curta duração como qualquer servidor web: endereço IP, hora, página pedida e o agente do navegador. Usamo-los para manter o site de pé e para ver aproximadamente quanto tráfego recebe. A Cloudflare guarda-os enquanto nosso fornecedor de alojamento, por nossa conta.',
        ],
      },
      {
        heading: 'Se nos escreveres',
        body: [
          'O correio para support@gamestao.com ou contact@gamestao.com é reencaminhado pelo Cloudflare Email Routing para uma caixa que lemos. Guardamos o que envias durante o tempo necessário para te responder e para ter registo da troca.',
          'Não te acrescentamos a nenhuma lista de correio. Não existe lista de correio.',
        ],
      },
      {
        heading: 'Ligações para outros sítios',
        body: [
          'As páginas dos jogos ligam a lojas de aplicações, aos próprios jogos e a plataformas como a CrazyGames e a itch.io. São sites de outras empresas, com regras próprias, e o nosso acaba na ligação.',
        ],
      },
      {
        heading: 'Os teus direitos',
        body: [
          'Podes perguntar o que temos sobre ti, pedir correção ou eliminação, ou opor-te a que o guardemos. Escreve para contact@gamestao.com.',
          'Na maioria dos casos a resposta será que não há nada para corrigir nem apagar, porque este site não mantém contas nem constrói perfis. A exceção é uma troca de mensagens iniciada por ti — essa temos, e apagamo-la a pedido.',
        ],
      },
      {
        heading: 'Alterações',
        body: [
          'Se este aviso mudar, a data acima muda com ele. Não há arquivo de versões anteriores: a que estás a ler é a que se aplica.',
        ],
      },
    ],
  },

  terms: {
    title: 'Termos de utilização',
    updatedLabel: 'Última atualização',
    lead: 'Aplicam-se a este site. Os jogos têm termos próprios, que aceitas dentro do jogo — esta página não fala por eles.',
    sections: [
      {
        heading: 'Este site',
        body: [
          'O gamestao.com é publicado pela gamestao, um estúdio de jogos independente, para apresentar o estúdio e os seus jogos.',
          'É fornecido tal como está. Procuramos mantê-lo exato e disponível, e normalmente conseguimos, mas nenhuma das duas coisas é uma promessa, e uma página daqui não é um conselho para agir.',
        ],
      },
      {
        heading: 'O que podes usar',
        body: [
          'Tudo o que está no kit de imprensa — logótipos, ícones e capturas de ecrã — pode ser usado tal como está por artigos, vídeos e fichas de loja que escrevam sobre os jogos ou os listem. Por favor não alteres os logótipos, não mudes a cor da marca do estúdio, nem apresentes uma captura como sendo algo diferente do que mostra.',
          'O resto do site — o texto, a disposição e o código — é nosso, e o kit de imprensa não cobre a sua reprodução. Citá-lo, com ligação de volta, é bem-vindo.',
        ],
      },
      {
        heading: 'Nomes e marcas',
        body: [
          'gamestao, Nivara, DayDayUp e SumQuest são os nomes que o estúdio dá a si próprio e aos seus jogos. Usá-los para falar de nós não tem problema. Usá-los de modo a sugerir que fizemos, publicámos ou apoiámos algo que não é nosso, tem.',
        ],
      },
      {
        heading: 'Ligações que saem daqui',
        body: [
          'Onde este site liga a uma loja, uma plataforma ou um jogo, o que acontece depois da ligação rege-se pelos termos desse site, não por estes.',
        ],
      },
      {
        heading: 'Alterações',
        body: [
          'Se estes termos mudarem, a data acima muda com eles. Continuar a usar o site depois disso é aceitar a versão então publicada.',
        ],
      },
    ],
  },
};
