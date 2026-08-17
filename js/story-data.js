/**
 * ============================================
 * CHRONICLES 2026 — Banco de Dados de Histórias
 * Cenário: São Paulo 2026
 * ============================================
 *
 * Cada nó de história contém:
 *   id        — identificador único
 *   location  — local no mapa (key de coordenas)
 *   text      — narração (suporta {{player}} e {{npc}})
 *   npc       — NPC presente (opcional)
 *   choices   —-array de escolhas com:
 *       text    — texto do botão
 *       next    — id do próximo nó
 *       effect  — função que modifica estado (opcional)
 *       tags    — tags que serão adicionadas (opcional)
 *       req     — condição para aparecer (opcional)
 *   combat    — se houver combate (opcional)
 *   journal   — entrada no diário do mundo (opcional)
 *   news      — headline de notícia (opcional)
 *   mapEvent  — evento no mapa (opcional)
 */

const STORY_NODES = {

  // =============================================
  // ATO 1: ABERTURA
  // =============================================

  // A1: Abertura — Acordar em Pinheiros
  open_awakening: {
    location: 'pinheiros',
    text: `São 6h47. O sol de 2026 entra pelas janelas do seu apartamento em Pinheiros, cortando a névoa de poluição que envolve São Paulo desde o amanhecer. O celular vibra na mesinha de cabeceira — notificações empilhadas, mensagens sem lido, alertas da cidade.\n\nVocê acaba de receber uma mensagem anônima: <span class="speaker">"Eles sabem o que você fez em 2024. Encontre-me na Lapa hoje à noite. Traga o drive. — Um velho amigo."</span>\n\nSeu nome é <span class="speaker">{{player}}</span>. A cidade nunca dorme, e hoje parece ainda mais perigosa.`,
    choices: [
      { text: '🔍 Investigar a mensagem antes de agir', next: 'investigate_message', tags: ['cautela'] },
      { text: '🏃 Ir direto para a Lapa hoje à noite', next: 'go_lapa_night', tags: ['impulsivo'] },
      { text: '📱 Procurar informações sobre "o que aconteceu em 2024"', next: 'research_2024', tags: ['investigador'] },
      { text: '☕ Ignorar por enquanto e começar o dia normalmente', next: 'normal_morning', tags: ['calmo'] }
    ],
    journal: 'Dia começa com uma mensagem anônima sobre o passado de {{player}}.',
    news: ['Alerta de qualidade do ar em São Paulo: nível "perigoso" para grupos sensíveis'],
    mapEvent: { type: 'air_alert', loc: 'pinheiros', text: 'Alerta de Qualidade do Ar' }
  },

  // A2: Investigar a mensagem
  investigate_message: {
    location: 'pinheiros',
    text: `Você passa horas analisando a mensagem. O número é bloqueado, mas o estilo de escrita lembra alguém — talvez <span class="speaker">Dona Célia</span>, a faxineira do prédio que sempreteve palavras doces mas olhos perspicazes.\n\nUma busca rápida nas redes revela algo perturbador: em 2024, um escândalo de corrupção envolvendo o prefeito e uma empresa de segurança privada — a <span class="speaker">Sentinela Corp</span> — foi encoberto. Você estava lá, trabalhando como segurança, mas ninguém sabe exatamente o que você viu.\n\n<span class="speaker">"Memória seletiva é a especialidade de São Paulo,"</span> murmura você.`,
    choices: [
      { text: '📞 Tentar ligar para o número anônimo', next: 'call_anon', tags: ['corajoso'] },
      { text: '🚶 Ir até a casa de Dona Célia para confirmar', next: 'visit_dona_celia', tags: ['metódico'] },
      { text: '💻 Tentar rastrear o IP da mensagem', next: 'trace_ip', tags: ['hacker'] }
    ],
    journal: 'Descoberta: Escândalo Sentinela Corp em 2024. {{player}} estava envolvido.',
    news: ['Sentinela Corp anuncia expansão de contratos com prefeitura de SP']
  },

  // A3: Ir para a Lapa à noite
  go_lapa_night: {
    location: 'lapa',
    text: `Às 22h30, você chega à Lapa. Os arcos romanos brilham sob luzes neon, mas algo está diferente esta noite. Polícia militar patrulha a região com mais intensidade do que o normal.\n\nEnquanto procura o ponto de encontro, um homem de terno preto se aproxima. <span class="speaker">"Você é a pessoa certa? O mensageiro disse que viria alguém."</span> Ele não parece um amigo.\n\nAo fundo, você vê <span class="speaker">Gareth</span>, um conhecido do meio underground, observando a cena. Ele também parece tenso.`,
    choices: [
      { text: '🗣️ Falar com o homem de terno', next: 'talk_suit_man', tags: ['corajoso'] },
      { text: '👤 Sinalizar para Gareth secretamente', next: 'signal_gareth', tags: ['astuto'] },
      { text: '🏃 Sair da área rapidamente', next: 'flee_lapa', tags: ['preso'] }
    ],
    journal: '{{player}} foi encontrado na Lapa por um estranho em terno preto.',
    news: ['Operação policial reforçada na Lapa durante horário de pico']
  },

  // A4: Pesquisar sobre 2024
  research_2024: {
    location: 'pinheiros',
    text: `Suas buscas revelam camadas de desinformação. O escândalo de 2024 foi amplamente silenciado — artigos foram removidos, testemunhas mudaram de cidade, e a <span class="speaker">Sentinela Corp</span> agora é um dos maiores contratistas de segurança do estado.\n\nVocê encontra um arquivo corrompido em um servidor pirateado: fotos de uma reunião secreta noHotel Unique, com figuras que você reconhece. Uma delas é <span class="speaker">o próprio prefeito</span>.\n\nAlgo mais aparece nos comentários do arquivo: <span class="speaker">"Eles estão vindo. Se você tem isso, proteja. — R."</span>`,
    choices: [
      { text: '💾 Salvar o arquivo e buscar refúgio', next: 'save_evidence', tags: ['prevenido'] },
      { text: '🔗 Tentar contactar "R" nos comentários', next: 'contact_r', tags: ['conectado'] },
      { text: '🗑️ Apagar tudo e fingir que nada viu', next: 'delete_evidence', tags: ['covarde'] }
    ],
    journal: 'Arquivo do Hotel Unique encontrado. Envolvidos incluem o prefeito.',
    news: ['Servidor de dados hackeado contém informações sobre escândalo de 2024']
  },

  // A5: Manhã normal
  normal_morning: {
    location: 'pinheiros',
    text: `Você ignora a mensagem e segue sua rotina. Café, metrô, trabalho. Mas algo não encaixa — colegas sussurram sobre uma "operação especial" na região da Liberdade, e um notícia no celular fala de um <span class="speaker">"incidente" na Tabaída</span>.\n\nAo passar pela Praça da República, um jovem se aproxima discretamente. <span class="speaker">"Você recebeu a mensagem, não recebeu? Eu sou o 'velho amigo'. Me segue."</span>`,
    choices: [
      { text: '🚶 Seguir o jovem', next: 'follow_young_man', tags: ['confiante'] },
      { text: '🚨 Chamar a polícia', next: 'call_police', tags: ['leal'] },
      { text: '🏃 Fugir pelo beco', next: 'flee_alley', tags: ['esperto'] }
    ],
    journal: '{{player}} encontrou um mensageiro na Praça da República.',
    news: ['Incidente não especificado ocorre na região da Tabaída']
  },

  // =============================================
  // ATO 2: EXPANSÃO
  // =============================================

  // A6: Ligar para o anônimo
  call_anon: {
    location: 'pinheiros',
    text: `A linha conecta por 3 segundos antes de desligar. Mas antes disso, você ouve uma voz: <span class="speaker">"Sentinela. Hotel Unique. Terça. Eles vão limpar tudo. Você é a única testemunha que importa. Encontre-me na Lapa. Traga o que tiver. Confie em Gareth."</span>\n\nA chamada termina. Você tem uma pista: Hotel Unique, terça-feira, e um contato chamado Gareth. A Sentinela não quer que você fale — isso significa que você sabe algo importante.`,
    choices: [
      { text: '🎯 Preparar-se e ir para a Lapa na terça', next: 'prepare_lapa', tags: ['estrategista'] },
      { text: '🔍 Investigar o Hotel Unique primeiro', next: 'investigate_hotel', tags: ['curioso'] },
      { text: '🤝 Procurar Gareth imediatamente', next: 'find_gareth', tags: ['sociável'] }
    ],
    journal: 'Voz anônima revelou: Sentinela, Hotel Unique, terça.',
    news: ['Hotel Unique anuncia renovação completa de segurança']
  },

  // A7: Visitar Dona Célia
  visit_dona_celia: {
    location: 'pinheiros',
    text: `Dona Célia abre a porta com um sorriso cansado. <span class="speaker">"Ah, moço... eu sabia que vinha me procurar. Sente-se."</span>\n\nEla conta que recebeu uma visita na semana passada — um homem alto, olhar carregado, que deixou um envelope sob o tapete da escada. Dentro: uma foto sua com o prefeito e uma nota <span class="speaker">"Eles sabem que você viu demais."</span>\n\n<span class="speaker">"Cuidado, moço. A Sentinela não brinca. Meu neto trabalha com eles... ele disse que gente desaparece."</span>`,
    choices: [
      { text: '📸 Pegar a foto e usar como prova', next: 'take_photo_evidence', tags: ['determinado'] },
      { text: '🏠 Levar Dona Célia para um local seguro', next: 'protect_dona_celia', tags: ['protetor'] },
      { text: '🔗 Pedir para Dona Célia entrar em contato com o neto', next: 'ask_celia_nephew', tags: ['diplomata'] }
    ],
    journal: 'Dona Célia possui foto de {{player}} com o prefeito. Ameaça direta recebida.',
    news: ['Misteriosa ameaça enviada a residente de Pinheiros']
  },

  // A8: Rastrear o IP
  trace_ip: {
    location: 'pinheiros',
    text: `Com ferramentas de tracing que aprendeu nos tempos de hacker, você rastreia a origem. O IP é mascarado por múltiplos proxies, mas o padrão de roteamento revela algo: a mensagem veio de uma rede associada à <span class="speaker">Torre Altino arcis</span>, sede da Sentinela Corp em São Paulo.\n\nMas há outra coisa — um segundo sinal, fraco, vindo da <span class="speaker">Toca da Curupira</span>, uma comunidade no Morro do Pinheirinho. Parece um sinal de socorro codificado.`,
    choices: [
      { text: '🏢 Ir até a Torre Altino para espionar', next: 'infiltrate_tower', tags: ['aventureiro'] },
      { text: '⛰️ Investigar o sinal na Toca da Curupira', next: 'go_toca', tags: ['compaixão'] },
      { text: '💻 Rastrear mais profundamente antes de agir', next: 'deep_trace', tags: ['paciente'] }
    ],
    journal: 'IP da mensagem rastreado até Torre Altino (Sentinela). Sinal de socorro na Toca.',
    news: ['Torre Altino amplía operações de segurança noturna em São Paulo']
  },

  // A9: Salvar evidência
  save_evidence: {
    location: 'pinheiros',
    text: `Você criptografa o arquivo e o distribui por três nuvens diferentes, além de gravar em um pen drive que esconde dentro da base de um vaso na varanda. É o suficiente — se algo acontecer com você, as evidências sairão.\n\nNaquela noite, você sonha com 2024. O Hotel Unique. O prefeito. Algo que você viu mas nunca contou. Acorda suando, com uma certeza: <span class="speaker">precisa fugir de SP ou enfrentar de uma vez.</span>`,
    choices: [
      { text: '✈️ Planejar uma fuga temporária', next: 'plan_escape', tags: ['pragmático'] },
      { text: '⚔️ Enfrentar a Sentinela de frente', next: 'face_sentinel', tags: ['corajoso'] },
      { text: '🤝 Procurar aliados primeiro', next: 'seek_allies', tags: ['estrategista'] }
    ],
    journal: 'Evidências criptografadas e escondidas. {{player}} sonha com o Hotel Unique.',
    news: ['Dados corrompidos do escândalo de 2024 encontrados em servidor pirateado']
  },

  // A10: Encontrar Gareth
  find_gareth: {
    location: 'liberdade',
    text: `Gareth está escondido em um porão na Liberdade, rodeado de monitores e cabos. <span class="speaker">"Você veio. bom."</span> Ele parece mais velho que na última vez que o viu — olheiras profundas, mãos trêmulas.\n\n<span class="speaker">"Eu era da Sentinela. Antes de 2024. Eu vi o que aconteceu no Hotel Unique também. Mas eu fugi. Eles não perdoam desertores."</span> Ele mostra arquivos: listas de pagamentos, gravações, nomes.\n\n<span class="speaker">"Precisamos decidir: entregamos isso à imprensa ou usamos como moeda de troca?"</span>`,
    choices: [
      { text: '📰 Entregar à imprensa imediatamente', next: 'give_to_press', tags: ['justiceiro'] },
      { text: '💰 Usar como moeda de troca com o prefeito', next: 'trade_with_mayor', tags: ['calculista'] },
      { text: '🎭 Criar uma operação para expor tudo publicamente', next: 'public_expose', tags: ['visionário'] }
    ],
    journal: 'Gareth, ex-membro da Sentinela, reúne provas do escândalo.',
    news: ['Vazamento de documentos da Sentinela Corp circula em fóruns underground']
  },

  // A11: Protesto na Praça da Sé
  protest_se: {
    location: 'santa_irem',
    text: `Uma multidão se forma na Praça da Sé. Jovens, moradores de rua, ativistas — todos reagindo ao que chamam de "nova lei de segurança pública" proposta pela Sentinela Corp. <span class="speaker">"Segurança para quem? Para eles!"</span> grita uma manifestante chamada <span class="speaker">Lyra</span>.\n\nLyra te reconhece. <span class="speaker">"Você é a pessoa do Hotel Unique, né? Eu vi nos jornais que foram cancelados!"</span> Ela estende um papel. <span class="speaker">"Tenho mais provas. Quer ajudar?"</span>`,
    choices: [
      { text: '🤝 Aceitar ajudar Lyra', next: 'ally_lyra', tags: ['solidário'] },
      { text: '📹 Gravar o protesto para as redes', next: 'record_protest', tags: ['midiatico'] },
      { text: '🚶 Sair discretamente da multidão', next: 'leave_protest', tags: [' cauteloso'] }
    ],
    journal: 'Protesto na Praça da Sé contra Sentinela Corp. Lyra oferece aliança.',
    news: ['Centenas protestam contra proposta de lei de segurança em SP']
  },

  // A12: Noite na Vila Madalena
  noite_vila: {
    location: 'vila_madalena',
    text: `A Vila Madalena pulsa com arte de rua e música. Mas sob o grafite colorido, uma história sombria: vários artistas desapareceram nos últimos meses, todos ligados a um promotor chamado <span class="speaker">Ricardo Mendes</span>, que tem supostas conexões com a Sentinela.\n\nVocê encontra um mural novo que parece uma mensagem codificada: cores e formas que, decodificadas, apontam para um local no <span class="speaker">Parque da Aclimação</span>.`,
    choices: [
      { text: '🎨 Investigar o mural e seguir a pista', next: 'follow_mural', tags: ['analítico'] },
      { text: '🍺 Tomar uma cerveja e observar o bairro', next: 'watch_bar', tags: ['paciência'] },
      { text: '📱 Postar o mural nas redes para ver reações', next: 'post_mural', tags: ['social'] }
    ],
    journal: 'Mural codificado na Vila Madalena aponta para Parque da Aclimação.',
    news: ['Artistas da Vila Madalena relatam desaparecimentos estranhos']
  },

  // =============================================
  // ATO 3: CONFLITO
  // =============================================

  // A13: O Encontro com o Prefeito
  mayor_meeting: {
    location: 'predo_municipal',
    text: `O prefeito <span class="speaker">Dr. Fernando Carvalho</span> recebe você em seu gabinete no prédio municipal. <span class="speaker">"Sabe, {{player}}... eu li seu histórico. Você foi um bom profissional para a Sentinela. Poderia ser algo maior por mim."</span>\n\nEle empurra um envelope grosso pela mesa. <span class="speaker">"Esqueça o que viu em 2024. esqueça a mensagem. Este envelope é seu. E você nunca mais ouvirá falar em Sentinela."</span>\n\nAo fundo, uma tela mostra mapas de São Paulo com zonas marcadas em vermelho — áreas sob "controle especial".`,
    choices: [
      { text: '💵 Aceitar o suborno e silenciar', next: 'accept_bribe', tags: ['corrompido'] },
      { text: '❌ Recusar e expor tudo', next: 'refuse_bribe', tags: ['integridade'] },
      { text: '🎭 Fingir que aceitou para coletar mais provas', next: 'fake_accept', tags: ['estrategista'] },
      { text: '📹 Gravar a conversa secretamente', next: 'record_mayor', tags: ['astuto'] }
    ],
    journal: '{{player}} encontrou-se com o prefeito Carvalho. Suborno oferecido.',
    news: ['Prefeito Carvalho anuncia novo pacote de segurança pública']
  },

  // A14: Confronto com a Sentinela
  sentinel_confront: {
    location: 'torre_altino',
    text: `Você invade a Torre Altino durante a noite. Câmeras desativadas, portões abertos por um hacker desconhecido — talvez Gareth. Nos andares superiores, você encontra arquivos físicos: os verdadeiros registros do que aconteceu em 2024.\n\nMas na escada, uma figura aparece. <span class="speaker">"Pare aí."</span> É <span class="speaker">Viktor</span>, o chefe de segurança da Sentinela — um homem alto, olhos frios, que conhece cada movimento seu.\n\n<span class="speaker">"Você acha que pode apenas entrar e sair? Vamos ver o que o senhor tem."</span>`,
    choices: [
      { text: '⚔️ Enfrentar Viktor em combate', next: 'fight_viktor', combat: true, tags: ['combatente'] },
      { text: '🏃 Tentar escapar pelos fundos', next: 'escape_viktor', tags: ['ágil'] },
      { text: '🗣️ Tentar negociar com Viktor', next: 'negotiate_viktor', tags: ['diplomata'] }
    ],
    journal: 'Infiltração na Torre Altino. Viktor, chefe de segurança, intercepta {{player}}.',
    news: ['IntrusoDetalhe na Torre Altino é detido pela segurança privada']
  },

  // A15: A Toca da Curupira
  toca_curupira: {
    location: 'pinheirinho',
    text: `O Morro do Pinheirinho se ergue como uma cicatriz urbana. A Toca da Curupira é uma comunidade auto-gestionada que sobrevive à margem do Estado. Lá, você encontra <span class="speaker">Rafael</span>, o remetente do sinal de socorro.\n\n<span class="speaker">"A Sentinela quer destruir nosso morro para construir um complexo de luxo. Eles mataram meu irmão por se opor. Tenho provas — câmeras, documentos, tudo."</span> Rafael entrega um notebook. <span class="speaker">"Mas preciso de alguém que possa levar isso ao mundo."</span>`,
    choices: [
      { text: '💻 Levar as provas de Rafael à imprensa', next: 'take_rafael_proofs', tags: ['aliado'] },
      { text: '🤝 Organizar os moradores para resistir', next: 'organize_resistance', tags: ['líder'] },
      { text: '🏃 Levar Rafael e suas provas para um lugar seguro', next: 'rescue_rafael', tags: ['protetor'] }
    ],
    journal: 'Rafael da Toca da Curupira oferece provas contra Sentinela.',
    news: ['Conflito fundiário se intensifica no Morro do Pinheirinho']
  },

  // A16: O Metrô
  metro_encounter: {
    location: 'tiete',
    text: `No metrô, um casal de agentes da Sentinela observa você. Um deles se aproxima: <span class="speaker">"Senhor, precisamos fazer algumas perguntas sobre recentes atividades suspeitas em Pinheiros."</span>\n\nAo seu redor, passageiros ignoram a cena. Ninguém quer se envolver. Mas uma mulher idosa sussurra: <span class="speaker">"Eu vi tudo, moço. Eles não são polícia. Eles são mercenários."</span>`,
    choices: [
      { text: '🚶 Ignorar e descer na próxima estação', next: 'ignore_agents', tags: ['prudente'] },
      { text: '🗣️ Confrontar os agentes publicamente', next: 'confront_agents', tags: ['corajoso'] },
      { text: '💬 Conversar com a mulher idosa', next: 'talk_old_lady', tags: ['curioso'] }
    ],
    journal: 'Agentes da Sentinela interpelam {{player}} no metrô.',
    news: ['Operação de segurança no Metrô-SP gera debate sobre privacidade']
  },

  // =============================================
  // ATO 4: CLÍMAX
  // =============================================

  // A17: A Revelação do Hotel Unique
  hotel_revelation: {
    location: 'berrini',
    text: `As provas se juntam. O que você viu em 2024 no Hotel Unique não foi um simples acordo de corrupção — foi um <span class="speaker">pacto de extorsão</span>. O prefeito e a Sentinela combinaram para eliminar testemunhas inconvenientes, e você estava lá porque sua competência como segurança era necessária.\n\nMas a revelação mais chocante: o "velho amigo" que mandou a mensagem é <span class="speaker">o próprio Gareth</span>, que fingiu estar escondido quando na verdade sempre esteve operando de dentro do sistema.\n\n<span class="speaker">"Só agora estou pronto para falar,"</span> ele diz por vídeo. <span class="speaker">"Mas preciso que você esteja vivo para contar."</span>`,
    choices: [
      { text: '🎤 Ir ao programa de TV para contar tudo', next: 'tv_appearance', tags: ['corajoso'] },
      { text: '📋 Organizar uma coletiva de imprensa', next: 'press_conference', tags: ['estrategista'] },
      { text: '🕵️ Usar as provas para derrubar o prefeito escondidamente', next: 'quiet_overthrow', tags: ['sombrio'] }
    ],
    journal: 'Verdade sobre o Hotel Unique revelada: pacto de extorsão. Gareth é o verdadeiro informante.',
    news: ['Novas evidências surgem sobre escândalo de 2024 em São Paulo']
  },

  // A18: O Clímax — Operação Limpeza
  final_operation: {
    location: 'pinheiros',
    text: `É noite. A Sentinela inicia a <span class="speaker">"Operação Limpeza"</span> — uma operação coordenada para silenciar todas as testemunhas remanescentes, incluindo você. Veículos pretos circulam por Pinheiros.\n\nSeus aliados se mobilizam: Garethhackers invadem os servidores da Sentinela, Lyra organiza protestos nas ruas, e o prefeito Carvalho entra em pânico, ordenando que Viktor "resolve tudo".\n\n<span class="speaker">"Este é o momento,"</span> pensa você. <span class="speaker">"Tudo ou nada."</span>`,
    choices: [
      { text: '⚔️ Enfrentar Viktor no confronto final', next: 'final_boss', combat: true, tags: ['herói'] },
      { text: '📡 Transmitir as provas ao vivo enquanto acontece', next: 'live_stream', tags: ['estrategista'] },
      { text: '🏃 Fugir com as provas e revelar tudo depois', next: 'escape_final', tags: ['sobrevivente'] }
    ],
    journal: 'Operação Limpeza da Sentinela iniciada. {{player}} deve decidir o destino de SP.',
    news: ['Múltiplas explosões e tiroteios reportados em Pinheiros — SP']
  },

  // =============================================
  // ATO 5: FINAL
  // =============================================

  // F1: Final Heroico — Justiça Pública
  final_heroic: {
    location: 'pinheiros',
    text: `A coletiva de imprensa é transmitida ao vivo para todo o Brasil. As provas do Hotel Unique, os pagamentos da Sentinela, as testemunhas eliminadas — tudo exposto. O prefeito Carvalho é detido horas depois. Viktor tenta fugir mas é encontrado naeroporto de Congonhas.\n\n<span class="speaker">"Você mudou São Paulo hoje, {{player}},"</span> diz Gareth. <span class="speaker">"Não da forma que eu esperava, mas mudou."</span>\n\nA Sentinela Corp é dissolvida. A cidade começa a respirar. E você? Você finalmente pode dormir sem olhar por cima do ombro.`,
    choices: [
      { text: '🏆 Final Heroico — Justiça Pública', next: 'end_heroic', tags: ['herói'], effect: (s) => { s.ending = 'heroic'; s.journal_push('Final atingido: Justiça Pública. Sentinela dissolvida, prefeito preso.'); } }
    ],
    journal: ' Sentinela dissolvida. Prefeito preso. São Paulo começa a se recuperar.',
    news: ['Prefeito Carvalho é denunciado; Sentinela Corp é dissolvida após escândalo']
  },

  // F2: Final Sombrio — O Novo Orden
  final_dark: {
    location: 'pinheiros',
    text: `Você escolheu o caminho das sombras. As provas chegam aos meios certos — não à imprensa, mas a quem controla os meios. O prefeito cai, mas não por justiça: por competição política.\n\nEm seu lugar, surge uma nova figura: <span class="speaker">uma tecnocracia silenciosa</span>, com a Sentinela agora "reformada" e sob novo comando. Você é nomeado "consultor de segurança" — uma forma elegante de dizer que agora trabalha para eles.\n\n<span class="speaker">" Bem-vindo ao outro lado, {{player}},"</span> sussurra o novo prefeito. <span class="speaker">"A cidade nunca muda. Apenas troca de dono."</span>\n\nVocê olha pela janela do gabinete e vê São Paulo brilhando — linda, doentia, eterna.`,
    choices: [
      { text: '🌑 Final Sombrio — O Novo Orden', next: 'end_dark', tags: ['corrompido'], effect: (s) => { s.ending = 'dark'; s.journal_push('Final atingido: O Novo Orden. {{player}} agora trabalha para o sistema.'); } }
    ],
    journal: 'Nova tecnocracia toma o poder. Sentinela reformada. {{player}} é cooptado.',
    news: ['Nova administração anuncia reformas na segurança pública de São Paulo']
  },

  // F3: Final — Fuga
  final_escape: {
    location: 'aeropuerto',
    text: `Você corre pelo aeroporto de Congonhas com o notebook apertado contra o peito. O voo para o México decola às 3h47 da manhã. Através da janela, São Paulo se transforma em um tapete de luzes que se afasta.\n\n<span class="speaker">"Eu sobrevivi,"</span> pensa. <span class="speaker">"Mas a cidade... a cidade ficou para trás."</span>\n\nNos terraços do avião, você abre o notebook. As provas estão lá. Mas quem vai acreditar em uma voz de alguém que fugiu? A cidade que você amava — que você jurou proteger — agora é apenas memória.\n\n<span class="speaker">Talvez um dia...</span> você pensa, fechando os olhos.`,
    choices: [
      { text: '🛫 Final Fuga — Sobrevivência Sozinha', next: 'end_escape', tags: ['isolado'], effect: (s) => { s.ending = 'escape'; s.journal_push('Final atingido: Fuga. {{player}} deixou São Paulo com as provas, mas sozinho.'); } }
    ],
    journal: '{{player}} fugiu de São Paulo. As provas estão seguras, mas o legado é incerto.',
    news: ['Voo com destino a Cancún decola de Congonhas sem passageiros identificados']
  }
};

// =============================================
// DADOS DOS NPCs
// =============================================
const NPC_DATA = [
  {
    id: 'gareth',
    name: 'Gareth',
    emoji: '🎭',
    role: 'Informante / Hacker',
    personality: 'astuto',
    location: { lat: -23.5505, lng: -46.6338 }, // Liberdade
    relation: 30,
    allegiance: 'aliado',
    description: 'Ex-membro da Sentinela Corp. Sabe mais do que diz.',
    routes: [
      { lat: -23.5505, lng: -46.6338 }, // Liberdade
      { lat: -23.5445, lng: -46.6280 }, // Luz
      { lat: -23.5550, lng: -46.6350 }  // República
    ],
    currentRouteIndex: 0
  },
  {
    id: 'lyra',
    name: 'Lyra',
    emoji: '✊',
    role: 'Líder Protesto',
    personality: 'corajosa',
    location: { lat: -23.5450, lng: -46.6380 }, // Sé
    relation: 20,
    allegiance: 'aliado',
    description: 'Líder estudantil que organiza protestos contra a Sentinela.',
    routes: [
      { lat: -23.5450, lng: -46.6380 }, // Sé
      { lat: -23.5480, lng: -46.6420 }, // República
      { lat: -23.5520, lng: -46.6500 }  // Pinheiros
    ],
    currentRouteIndex: 0
  },
  {
    id: 'viktor',
    name: 'Viktor',
    emoji: '🖤',
    role: 'Chefe Segurança Sentinela',
    personality: 'agressivo',
    location: { lat: -23.5800, lng: -46.6800 }, // Pinheiros/Torre Altino
    relation: -60,
    allegiance: 'inimigo',
    description: 'Chefe de segurança da Sentinela Corp. Responsável pela "limpeza".',
    routes: [
      { lat: -23.5800, lng: -46.6800 }, // Pinheiros
      { lat: -23.5700, lng: -46.6600 }, // Centro
      { lat: -23.5500, lng: -46.6400 }  // República
    ],
    currentRouteIndex: 0,
    isBoss: true
  },
  {
    id: 'rafael',
    name: 'Rafael',
    emoji: '📹',
    role: 'Ativista do Pinheirinho',
    personality: 'leal',
    location: { lat: -23.5200, lng: -46.6100 }, // Pinheirinho
    relation: 10,
    allegiance: 'aliado',
    description: 'Morador da Toca da Curupira. Irmão vítima da Sentinela.',
    routes: [
      { lat: -23.5200, lng: -46.6100 }, // Pinheirinho
      { lat: -23.5400, lng: -46.6300 }, // Centro
      { lat: -23.5500, lng: -46.6350 }  // República
    ],
    currentRouteIndex: 0
  },
  {
    id: 'dona_celia',
    name: 'Dona Célia',
    emoji: '👵',
    role: 'Faxineira / Informante',
    personality: 'leal',
    location: { lat: -23.5620, lng: -46.6890 }, // Pinheiros
    relation: 40,
    allegiance: 'aliado',
    description: 'Faxineira do prédio de {{player}}. Sabe mais sobre o bairro do que aparenta.',
    routes: [
      { lat: -23.5620, lng: -46.6890 }, // Pinheiros
      { lat: -23.5630, lng: -46.6870 }  // Próximo
    ],
    currentRouteIndex: 0
  },
  {
    id: 'prefeito',
    name: 'Dr. Carvalho',
    emoji: '🏛️',
    role: 'Prefeito de SP',
    personality: 'traiçoeiro',
    location: { lat: -23.5450, lng: -46.6380 }, // Câmara Municipal
    relation: -30,
    allegiance: 'neutro',
    description: 'Prefeito envolvido no escândalo do Hotel Unique. Carismático mas perigoso.',
    routes: [
      { lat: -23.5450, lng: -46.6380 }, // Câmara
      { lat: -23.5600, lng: -46.6550 }  // Paulista
    ],
    currentRouteIndex: 0
  }
];

// =============================================
// LOCAÇÕES DO MAPA
// =============================================
const LOCATIONS = {
  pinheiros:      { lat: -23.5620, lng: -46.6890, name: 'Pinheiros', desc: 'Bairro boêmio e intelectual, lar de {{player}}.' },
  consolacao:     { lat: -23.5570, lng: -46.6700, name: 'Consolação', desc: 'Região universitária, próxima ao Muca.' },
  lapa:           { lat: -23.5280, lng: -46.6810, name: 'Lapa', desc: 'Famosa pelos arcos e vida noturna.' },
  liberdade:      { lat: -23.5505, lng: -46.6338, name: 'Liberdade', desc: 'Bairro japonês, coração da comunidade asiática.' },
  se:             { lat: -23.5450, lng: -46.6380, name: 'Praça da Sé', desc: 'Centro histórico, coração político de SP.' },
  barra_funda:    { lat: -23.5700, lng: -46.6950, name: 'Barra Funda', desc: 'Região ferroviária, porta de entrada oeste.' },
  mooca:          { lat: -23.5470, lng: -46.5980, name: 'Mooca', desc: 'Bairro operário com forte herança italiana.' },
  tiete:          { lat: -23.5150, lng: -46.6300, name: 'Terminal Tietê', desc: 'Maior terminal de ônibus da América Latina.' },
  santa_irem:     { lat: -23.5480, lng: -46.6420, name: 'Santa Iria', desc: 'Região leste, comunidade em crescimento.' },
  pinheirinho:    { lat: -23.5200, lng: -46.6100, name: 'Morro do Pinheirinho', desc: 'Comunidade auto-gestionada, alvo da Sentinela.' },
  hospital:       { lat: -23.5600, lng: -46.6550, name: 'Hospital das Clínicas', desc: 'Maior hospital público de SP.' },
  toca:           { lat: -23.5180, lng: -46.6080, name: 'Toca da Curupira', desc: 'Comunidade no morro, resistindo à Sentinela.' },
  piranhaba:      { lat: -23.5300, lng: -46.6000, name: 'Pirituba', desc: 'Bairro Zona Norte, longe do centro.' },
  vila_madalena:  { lat: -23.5380, lng: -46.6880, name: 'Vila Madalena', desc: 'Bairro artístico, grafites eivecadas.' },
  berrini:        { lat: -23.5850, lng: -46.6830, name: 'Pinheiros/Berrini', desc: 'Distrito financeiro, sede da Sentinela Corp.' },
  torre_altino:   { lat: -23.5830, lng: -46.6800, name: 'Torre Altino', desc: 'Sede da Sentinela Corp em SP.' },
  predo_municipal:{ lat: -23.5440, lng: -46.6370, name: 'Câmara Municipal', desc: 'Sede do poder político de SP.' }
};

// =============================================
// CENÁRIOS DISPONÍVEIS
// =============================================
const SCENARIOS = [
  {
    id: 'saopaulo',
    name: 'São Paulo 2026',
    subtitle: 'Corrupção, resistência e luzes Urbanas',
    description: 'São Paulo, janeiro de 2026. A Sentinela Corp controla as ruas com contratos de segurança pública. Um escândalo do passado ressurge, e você está no centro dele.',
    difficulty: 'Médio',
    timeEstimate: '45-60 min',
    coords: { lat: -23.55, lng: -46.63 },
    theme: 'saopaulo',
    startLocation: 'pinheiros',
    locations: Object.keys(LOCATIONS)
  },
  {
    id: 'neotokyo',
    name: 'Neo-Tóquio Cyberpunk',
    subtitle: 'Neons, corporações e a cidade que nunca dorme',
    description: 'Tóquio, 2026. Mega-corporações governam os distritos. Hackers, yakuza e corporações lutam pelo controle da cidade digital.',
    difficulty: 'Difícil',
    timeEstimate: '60-90 min',
    coords: { lat: 35.68, lng: 139.69 },
    theme: 'neotokyo',
    startLocation: 'shibuya',
    locations: ['shibuya', 'shinjuku', 'akihabara', 'shiogama', 'otoya']
  },
  {
    id: 'london',
    name: 'Londres Pós-Brexit',
    subtitle: 'Império em declínio, novaslealdades',
    description: 'Londres, 2026. O Brexit deixou cicatrizes. Novos partidos surgem, e você precisa escolher um lado na guerra política que redefine a Grã-Bretanha.',
    difficulty: 'Médio',
    timeEstimate: '50-70 min',
    coords: { lat: 51.51, lng: -0.13 },
    theme: 'london',
    startLocation: 'westminster',
    locations: ['westminster', 'shoreditch', 'canary_wharf', 'brixton', 'camden']
  },
  {
    id: 'singapura',
    name: 'Cidade-Estado de Singapura',
    subtitle: 'Utopia tecnológica ou prisão dourada?',
    description: 'Singapura, 2026. A cidade mais segura do mundo esconde segredos sombrios. Surveillance estatal, Inteligência artificial, e uma população obediente.',
    difficulty: 'Difícil',
    timeEstimate: '55-80 min',
    coords: { lat: 1.35, lng: 103.82 },
    theme: 'singapura',
    startLocation: 'marina_bay',
    locations: ['marina_bay', 'little_india', 'chinatown', 'woodlands', 'jurong']
  },
  {
    id: 'desastre',
    name: 'Zona de Desastre Ambiental',
    subtitle: 'Colapso climático, sobrevivência humana',
    description: 'Brasil, 2026. Uma zona de desastre ambiental devasta o sertão nordestino. Refugiados climáticos, corporações predatórias, e a luta pela água.',
    difficulty: 'Hard',
    timeEstimate: '70-100 min',
    coords: { lat: -7.25, lng: -35.88 },
    theme: 'desastre',
    startLocation: 'recife',
    locations: ['recife', 'jolao', 'caatinga', 'litoral', 'sertao']
  }
];

// =============================================
// TRATOS DISPONÍVEIS
// =============================================
const TRAITS = [
  { id: 'corajoso', label: 'Corajoso', icon: '🦁' },
  { id: 'cautela', label: 'Cauteloso', icon: '🛡️' },
  { id: 'astuto', label: 'Astuto', icon: '🦊' },
  { id: 'justiceiro', label: 'Justiceiro', icon: '⚖️' },
  { id: 'protetor', label: 'Protetor', icon: '💪' },
  { id: 'investigador', label: 'Investigador', icon: '🔍' },
  { id: 'estrategista', label: 'Estrategista', icon: '♟️' },
  { id: 'corrompido', label: 'Corrompido', icon: '💀' },
  { id: 'isolado', label: 'Isolado', icon: '🌑' },
  { id: 'solidario', label: 'Solidário', icon: '❤️' },
  { id: 'impulsivo', label: 'Impulsivo', icon: '⚡' },
  { id: 'paciência', label: 'Paciente', icon: '🐢' }
];

// =============================================
// CONQUISTAS
// =============================================
const ACHIEVEMENTS = [
  { id: 'first_step', name: 'Primeiro Passo', desc: 'Complete o tutorial de criação', icon: '👣', check: (s) => s.visitedScenarios > 0 },
  { id: 'survivor', name: 'Sobrevivente de 2026', desc: 'Complete São Paulo 2026', icon: '🏆', check: (s) => s.ending === 'heroic' || s.ending === 'dark' },
  { id: 'hero', name: 'Herói de SP', desc: 'Alcance o final heroico', icon: '⭐', check: (s) => s.ending === 'heroic' },
  { id: 'dark_path', name: 'Caminho Sombrio', desc: 'Alcance o final sombrio', icon: '🌑', check: (s) => s.ending === 'dark' },
  { id: 'escape', name: 'Fugitivo', desc: 'Alcance o final fuga', icon: '✈️', check: (s) => s.ending === 'escape' },
  { id: 'explorer', name: 'Explorador Urbano', desc: 'Visite 5 locais diferentes', icon: '🗺️', check: (s) => s.visitedLocations >= 5 },
  { id: 'networker', name: 'Conectado', desc: 'Alcance relação +50 com 2 NPCs', icon: '🤝', check: (s) => s.maxNPCRelations >= 2 },
  { id: 'hacker', name: 'Anonym', desc: 'Use a abordagem Tecnologia 3 vezes', icon: '💻', check: (s) => s.techApproaches >= 3 },
  { id: 'fighter', name: 'Guerreiro', desc: 'Vença 3 combates', icon: '⚔️', check: (s) => s.combatWins >= 3 },
  { id: 'diary', name: 'Cronista', desc: 'Acumule 10 entradas no Diário', icon: '📜', check: (s) => s.journalEntries >= 10 }
];
