/**
 * ============================================
 * CHRONICLES 2026 — Sistema de NPCs Autônomos
 * ============================================
 */

const NPCSystem = {
  npcs: [],
  pendingNPCEvents: [],
  routeLines: [],

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

  /** Desenha rotas de patrulha no mapa */
  drawRoutes(map) {
    this.routeLines.forEach(l => map.removeLayer(l));
    this.routeLines = [];

    this.npcs.filter(n => n.alive).forEach(npc => {
      if (npc.routes.length < 2) return;

      const points = npc.routes.map(r => [r.lat, r.lng]);
      const color = npc.allegiance === 'aliado' ? '#00e676' :
                    npc.allegiance === 'inimigo' ? '#e53935' : '#ffb300';

      const route = L.polyline(points, {
        color: color,
        weight: 2,
        opacity: 0.4,
        dashArray: '8, 8'
      }).addTo(map);

      L.circleMarker(points[0], {
        radius: 4, color: color, fillColor: color, fillOpacity: 0.6
      }).addTo(map);

      this.routeLines.push(route);
    });
  },

  /** Move NPCs automaticamente baseado na cena atual */
  autoMove(currentLocation) {
    this.npcs.forEach(npc => {
      if (!npc.alive) return;

      if (Math.random() < 0.3) {
        npc.targetIndex = (npc.targetIndex + 1) % npc.routes.length;
        const target = npc.routes[npc.targetIndex];
        npc.currentLat = target.lat + (Math.random() - 0.5) * 0.002;
        npc.currentLng = target.lng + (Math.random() - 0.5) * 0.002;
      }

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

  // --- Eventos por NPC (genéricos para sandbox global) ---

  _getEventsForNPC(npc, state) {
    const playerName = state.playerName || 'você';
    const country = state.country?.name || 'seu país';

    const events = {
      advisor: [
        `O consultor se aproxima: "{{player}}, temos uma situação delicada em ${country}. Precisa de minha aconselhamento."`,
        `O consultor traz informações de inteligência sobre movimentos de países vizinhos.`,
        `O consultor sugere uma aliança estratégica com nações parceiras.`,
        `O consultor alertou sobre possíveis ameaças internas em ${country}.`
      ],
      rival: [
        `Seu rival espalha boatos sobre suas decisões em ${country}.`,
        `O rival tenta formar uma coalizão contra suas políticas.` ,
        `Seu rival foi visto se reunindo com embaixadores estrangeiros.`,
        `O rival publica uma entrevista criticando seu governo.`
      ],
      spy: [
        `O espião envia uma mensagem anônima: "Tenho informações importantes sobre ${country}."`,
        `Você descobre que o espião está coletando dados sobre suas movimentações.`,
        `O espião oferece informações em troca de proteção.`,
        `Uma fonte anônima revela conspirações contra seu governo.`
      ],
      journalist_npc: [
        `Um repórter busca uma entrevista exclusiva sobre suas últimas decisões.`,
        `Jornalistas investigam possíveis escândalos no governo de ${country}.`,
        `O repórter publica uma matéria influente sobre sua política externa.`,
        `Um jornalista estrangeiro pergunta sobre suas intenções regionais.`
      ],
      general: [
        `O general solicita recursos adicionais para as forças armadas.`,
        `O general informa sobre exercícios militares de rotineiros.`,
        `O general alerta sobre tensões na fronteira com ${country}.`,
        `Forças armadas participam de operação de manutenção da paz.`
      ]
    };

    return events[npc.id] || [`${npc.name} foi visto em ${country}.`];
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
