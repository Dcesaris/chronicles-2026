/**
 * ============================================
 * CHRONICLES 2026 — Sistema de NPCs Autônomos
 * ============================================
 */

const NPCSystem = {
  npcs: [],
  pendingNPCEvents: [],

  /** Inicializa NPCs a partir dos dados do cenário */
  init(npcDefs) {
    this.npcs = npcDefs.map(n => ({
      ...n,
      currentLat: n.location.lat,
      currentLng: n.location.lng,
      targetIndex: 0,
      moveTimer: 0,
      lastScene: null,
      alive: true
    }));
  },

  /** Retorna NPC por ID */
  get(id) {
    return this.npcs.find(n => n.id === id);
  },

  /** Todos os NPCs vivos */
  allAlive() {
    return this.npcs.filter(n => n.alive);
  },

  /** Move NPCs automaticamente baseado na cena atual */
  autoMove(currentLocation) {
    this.npcs.forEach(npc => {
      if (!npc.alive) return;

      // Chance de NPC se mover a cada cena
      if (Math.random() < 0.3) {
        npc.targetIndex = (npc.targetIndex + 1) % npc.routes.length;
        const target = npc.routes[npc.targetIndex];
        npc.currentLat = target.lat + (Math.random() - 0.5) * 0.002;
        npc.currentLng = target.lng + (Math.random() - 0.5) * 0.002;
      }

      // NPCs aliados podem se aproximar do jogador
      if (npc.allegiance === 'aliado' && Math.random() < 0.15) {
        const loc = LOCATIONS[currentLocation];
        if (loc) {
          const dx = loc.lat - npc.currentLat;
          const dy = loc.lng - npc.currentLng;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist > 0.01) {
            npc.currentLat += dx * 0.05;
            npc.currentLng += dy * 0.05;
          }
        }
      }
    });
  },

  /** Gera evento autônomo de NPC */
  generateEvent(currentLocation, playerState) {
    const alive = this.allAlive();
    if (alive.length === 0) return null;

    const npc = alive[Math.floor(Math.random() * alive.length)];
    if (npc.lastScene === currentLocation) return null;
    npc.lastScene = currentLocation;

    const events = this._getEventsForNPC(npc, playerState);
    return events[Math.floor(Math.random() * events.length)] || null;
  },

  /** Verifica se NPC pode ser encontrado no local atual */
  canMeet(npcId, location) {
    const npc = this.get(npcId);
    if (!npc || !npc.alive) return false;
    const loc = LOCATIONS[location];
    if (!loc) return false;
    const dx = loc.lat - npc.currentLat;
    const dy = loc.lng - npc.currentLng;
    return Math.sqrt(dx*dx + dy*dy) < 0.015;
  },

  /** Atualiza relação com NPC */
  updateRelation(npcId, delta) {
    const npc = this.get(npcId);
    if (!npc) return;
    npc.relation = Math.max(-100, Math.min(100, npc.relation + delta));
  },

  /** NPC morre */
  kill(npcId, killer) {
    const npc = this.get(npcId);
    if (!npc) return;
    npc.alive = false;
    npc.deathReason = killer || 'desconhecido';
    MapSystem.removeMarker('npc_' + npcId);
  },

  /** Retorna tipo de relação para display */
  getRelationType(npcId) {
    const npc = this.get(npcId);
    if (!npc) return 'neutral';
    if (npc.relation >= 40) return 'friendly';
    if (npc.relation <= -30) return 'hostile';
    return 'neutral';
  },

  // --- Eventos por NPC ---

  _getEventsForNPC(npc, state) {
    const playerName = state.playerName || 'você';
    const recentEvents = state.journal.slice(-3).map(e => e.text);

    const events = {
      gareth: [
        `Gareth te enviou uma mensagem: "Encontrei mais arquivos na Torre. Eles sabem que estamos investigando."`,
        `Gareth foi até o distrito comercial sozinho e voltou com informações sobre a Sentinela.`,
        `Gareth decidiu não confiar mais em você depois do incidente no metrô.`,
        `Gareth aparece do nada: "{{player}}, preciso te mostrar algo nos monitores."`
      ],
      lyra: [
        `Lyra organou um protesto na Praça da Sé hoje. Várias pessoas foram presas.`,
        `Lyra te procura: "{{player}}, os alunos querem sua ajuda. Vamos marchar?"`,
        `Lyra cruzou caminhos com você no metrô. Ela parecia estar fuga de alguém.`,
        `Notícia: Lyra foi vista distribuindo panfletos contra a Sentinela na Liberdade.`
      ],
      viktor: [
        `Viktor foi visto patrulhando Pinheiros à noite com dois homens armados.`,
        `Agentes da Sentinela interrogaram moradores do seu prédio sobre {{player}}.`,
        `Viktor enviou uma mensagem: "Pare de investigar. Sua saúde é importante."`,
        `Viaturas da Sentinela foram vistas perto da Torre Altino esta manhã.`
      ],
      rafael: [
        `Rafael mandou um sinal de socorro do morro. A situação está ficando crítica.`,
        `Moradores da Toca da Curupira relataram presença de homens da Sentinela nas cercanias.`,
        `Rafael: "{{player}}, meu irmão tinha razão. Eles estão vindo aqui também."`,
        `O notebook com as provas de Rafael está sendo guardado por um aliado confiável.`
      ],
      'dona_celia': [
        `Dona Célia comentou que viu estranhos no elevador do prédio.`,
        `Dona Célia deixou um aviso sob o tapete: "Cuidado com o entregador."`,
        `Dona Célia contou para o porteiro sobre sua situação. Ele quer ajudar.`,
        `Dona Célia apareceu no portão com um envelope: "Isso é seu, moço."`
      ],
      prefeito: [
        `O prefeito Carvalho fez um discurso na Câmara prometendo "mais segurança para todos."`,
        `Fontes próximas ao prefeito dizem que ele está "preocupado com ameaças à segurança pública."`,
        `O gabinete do prefeito recebeu uma visita surpresa na quinta-feira à tarde.`,
        `Dr. Carvalho foi visto jantar com executivos da Sentinela Corp no Itaim.`
      ]
    };

    return events[npc.id] || [`${npc.name} foi visto na região.`];
  },

  /** Retorna dados para o mapa */
  getMapData() {
    return this.npcs.filter(n => n.alive).map(npc => ({
      id: npc.id,
      name: npc.name,
      emoji: npc.emoji,
      lat: npc.currentLat,
      lng: npc.currentLng,
      relation: npc.relation,
      relationType: this.getRelationType(npc.id),
      allegiance: npc.allegiance,
      role: npc.role,
      description: npc.description
    }));
  },

  /** Retorna dados para a sidebar */
  getSidebarData() {
    return this.npcs.filter(n => n.alive).map(npc => ({
      id: npc.id,
      name: npc.name,
      emoji: npc.emoji,
      relation: npc.relation,
      relationType: this.getRelationType(npc.id),
      role: npc.role
    }));
  }
};
