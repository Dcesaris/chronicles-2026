/**
 * ============================================
 * CHRONICLES 2026 — Engine de Narrativa
 * Motor principal de estado, choices e lógica
 * ============================================
 */

const Engine = {
  state: null,
  currentScene: null,
  typewriterTimer: null,
  typewriterQueue: [],
  isTyping: false,

  /** Estado inicial do jogo */
  defaultState() {
    return {
      scenario: null,
      playerName: 'Viajante',
      profession: 'reporter',
      avatar: '🎭',
      traits: [],
      tone: 'neutro',
      difficulty: 'normal',
      realism: 'immersive',

      // Stats
      stats: { hp: 100, maxHp: 100, energy: 100, maxEnergy: 100, rep: 50, maxRep: 100 },
      credits: 500,

      // Localização
      currentLocation: 'pinheiros',
      visitedLocations: ['pinheiros'],
      revealedLocations: ['pinheiros'],

      // História
      currentNode: 'open_awakening',
      journal: [],
      memoryLog: [],
      choices: [],
      ending: null,

      // Invetário
      inventory: [],
      maxSlots: 8,

      // Combate
      inCombat: false,
      combatData: null,
      combatWins: 0,

      // Métricas
      visitedScenarios: 0,
      visitedLocationsCount: 0,
      maxNPCRelations: 0,
      techApproaches: 0,
      journalEntries: 0,

      // Metatemporal
      gameDate: '2026-01-15',
      turnNumber: 1,

      // Missões
      activeMissions: [],
      completedMissions: [],

      // NPCs relationships
      npcRelations: {}
    };
  },

  /** Inicia um novo jogo */
  startGame(scenarioId, customState = null) {
    this.state = this.defaultState();
    this.state.scenario = scenarioId;
    this.state.visitedScenarios = 1;

    if (customState) {
      Object.assign(this.state, customState);
    }

    // Inicializa o mapa PRIMEIRO (antes de qualquer operação de mapa)
    MapSystem.init();

    // Revela locais iniciais baseados na localização
    const startLoc = LOCATIONS[this.state.currentLocation];
    if (startLoc) {
      this.state.revealedLocations = ['pinheiros'];
      // Revela locais próximos
      for (const [key, loc] of Object.entries(LOCATIONS)) {
        const dist = Math.sqrt(
          Math.pow(startLoc.lat - loc.lat, 2) +
          Math.pow(startLoc.lng - loc.lng, 2)
        );
        if (dist < 0.02) {
          this.state.revealedLocations.push(key);
          this.state.visitedLocations.push(key);
        }
      }
    }

    // Inicializa NPCs
    NPCSystem.init(NPC_DATA);

    // Carrega primeiro nó
    this.loadNode(this.state.currentNode);

    // Salva
    Storage.save(this.state);
  },

  /** Carrega um nó de história */
  loadNode(nodeId) {
    const node = STORY_NODES[nodeId];
    if (!node) {
      console.error('Nó não encontrado:', nodeId);
      return;
    }

    // Previne loop infinito: se o nó já está carregado, apenas renderiza
    if (this.state.currentNode === nodeId && this.currentScene === node) {
      UI.renderScene(node);
      UI.renderChoices(this.filterChoices(node.choices));
      return;
    }

    this.state.currentNode = nodeId;
    this.currentScene = node;

    // Atualiza localização (sem recursão — skip arrival)
    if (node.location) {
      this.travelTo(node.location, false, true);
    }

    // Renderiza
    UI.renderScene(node);
    UI.renderChoices(this.filterChoices(node.choices));
    UI.renderNPCPortrait(node.npc);

    // Efeitos colaterais do nó
    if (node.journal) {
      this.addJournal(node.journal);
    }
    if (node.news) {
      node.news.forEach(n => UI.addNews(n));
    }
    if (node.mapEvent) {
      const loc = LOCATIONS[node.location];
      if (loc && MapSystem.map) {
        MapSystem.addWorldEvent(
          node.mapEvent.type,
          loc.lat + (Math.random() - 0.5) * 0.005,
          loc.lng + (Math.random() - 0.5) * 0.005,
          node.mapEvent.text
        );
      }
    }

    // Verifica NPCs próximos
    this.checkNearbyNPCs(node);

    // Avança turn
    this.state.turnNumber++;
    this.state.gameDate = this.advanceDate();

    // Evento autônomo de NPC
    const npcEvent = NPCSystem.generateEvent(node.location, this.state);
    if (npcEvent && Math.random() < 0.4) {
      this.addJournal(npcEvent);
      UI.notify(npcEvent, 'info');
    }

    // Save automático
    Storage.save(this.state);
  },

  /** Filtra choices baseado em requisitos */
  filterChoices(choices) {
    if (!choices) return [];
    return choices.filter(c => {
      if (!c.req) return true;
      // Verifica tags necessárias
      if (c.req.tags) {
        return c.req.tags.some(t => this.state.traits.includes(t));
      }
      if (c.req.absence) {
        return !c.req.absence.some(t => this.state.traits.includes(t));
      }
      if (c.req.minRep) {
        return this.state.stats.rep >= c.req.minRep;
      }
      return true;
    });
  },

  /** Executa uma escolha */
  choose(choice) {
    if (!choice) return;

    // Aplica tags
    if (choice.tags) {
      choice.tags.forEach(t => {
        if (!this.state.traits.includes(t)) {
          this.state.traits.push(t);
        }
      });
    }

    // Aplica efeito
    if (choice.effect) {
      choice.effect(this.state);
    }

    // Verifica se é combate
    const node = STORY_NODES[this.state.currentNode];
    if (node && node.combat && choice.next === 'fight_viktor') {
      this.startCombat(node.combat);
      return;
    }

    // Verifica se é final
    if (choice.next.startsWith('end_')) {
      this.finishGame(choice.next);
      return;
    }

    // Avança tempo
    this.advanceTime(choice.timeAdvance || 1);

    // Move para próximo nó
    if (choice.next) {
      this.loadNode(choice.next);
    }
  },

  /** Submete input livre */
  submitFreeInput() {
    const input = document.getElementById('free-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';

    // Interpreta palavras-chave
    const interpretation = this.interpretInput(text);

    if (interpretation.action) {
      // Aplica tags baseadas no input
      if (interpretation.tags) {
        interpretation.tags.forEach(t => {
          if (!this.state.traits.includes(t)) {
            this.state.traits.push(t);
          }
        });
      }

      // Efeitos do input
      if (interpretation.effect) {
        interpretation.effect(this.state);
      }

      // Nó de resposta
      if (interpretation.next) {
        this.loadNode(interpretation.next);
      } else {
        // Gera resposta adaptativa
        this.generateAdaptiveResponse(text);
      }
    } else {
      // Resposta genérica
      this.loadNode('generic_response');
    }

    this.addJournal(`Ação livre: "${text}"`);
  },

  /** Interpreta input livre do jogador */
  interpretInput(text) {
    const lower = text.toLowerCase();
    const node = this.state.currentNode;

    // Palavras-chave mapeadas
    const keywords = {
      investigar: { action: true, tags: ['investigador'], next: 'investigate_message', effect: (s) => { s.stats.energy -= 5; } },
      investigar2: { action: true, tags: ['investigador'], next: 'research_2024', effect: (s) => { s.stats.energy -= 5; } },
      lutar: { action: true, tags: ['combatente'], effect: (s) => { s.stats.energy -= 10; } },
      fugir: { action: true, tags: ['preso'], effect: (s) => { s.stats.hp -= 5; } },
      conversar: { action: true, tags: ['diplomata'], effect: (s) => { s.stats.rep += 2; } },
      hackear: { action: true, tags: ['hacker'], effect: (s) => { s.techApproaches++; s.stats.energy -= 8; } },
      correr: { action: true, tags: ['ágil'], effect: (s) => { s.stats.energy -= 15; } },
      provar: { action: true, tags: ['justiceiro'], effect: (s) => { s.stats.rep += 5; } },
      aceitar: { action: true, tags: ['corrompido'], effect: (s) => { s.credits += 200; s.stats.rep -= 10; } },
      recusar: { action: true, tags: ['integridade'], effect: (s) => { s.stats.rep += 10; } },
      seguir: { action: true },
      esperar: { action: true, effect: (s) => { s.stats.energy = Math.min(s.maxEnergy, s.stats.energy + 10); } },
      descansar: { action: true, effect: (s) => { s.stats.hp = Math.min(s.maxHp, s.stats.hp + 15); s.stats.energy = Math.min(s.maxEnergy, s.stats.energy + 20); } },
      viajar: { action: true },
      ir: { action: true },
      ajudar: { action: true, tags: ['solidário'], effect: (s) => { s.stats.rep += 5; } },
      comprar: { action: true, effect: (s) => { s.credits -= 50; } },
      atacar: { action: true, tags: ['combatente'] },
      defender: { action: true, tags: ['protetor'] },
      mentir: { action: true, tags: ['astuto'], effect: (s) => { s.stats.rep -= 5; } },
      negociar: { action: true, tags: ['diplomata'] },
      coletar: { action: true },
      analisar: { action: true, tags: ['investigador'] }
    };

    for (const [key, val] of Object.entries(keywords)) {
      if (lower.includes(key)) {
        return val;
      }
    }

    return { action: false };
  },

  /** Gera resposta adaptativa quando input não mapeia */
  async generateAdaptiveResponse(text) {
    const responses = [
      { text: `Você decide: "${text}". A cidade observa em silêncio. Algosentirá as consequências.`, next: 'generic_response' },
      { text: `"${text}" — suas palavras ecoam pelos corredores de São Paulo. Ninguém responde imediatamente, mas o mundo se ajusta lentamente às suas escolhas.`, next: 'generic_response2' },
      { text: `Você age conforme "${text}". O resultado é incerto, mas uma coisa é certa: o mundo não esquece.`, next: 'generic_response' }
    ];

    // Tenta IA primeiro se disponível
    if (AIEngine.enabled) {
      const aiResponse = await AIEngine.generateNarrative(
        {
          location: LOCATIONS[this.state.currentLocation]?.name,
          traits: this.state.traits.join(', '),
          recentEvents: this.state.journal.slice(-3).map(j => j.text).join('; '),
          tone: this.state.tone
        },
        text
      );

      if (aiResponse) {
        this.addJournal(`Ação livre: "${text}" → ${aiResponse.substring(0, 200)}`);
        UI.appendNarrative(aiResponse);
        this.state.stats.energy = Math.max(0, this.state.stats.energy - 5);
        UI.updateStats();
        return;
      }
    }

    // Fallback local
    const resp = responses[Math.floor(Math.random() * responses.length)];
    this.addJournal(resp.text);
    UI.appendNarrative(resp.text);

    // Efeito genérico
    this.state.stats.energy = Math.max(0, this.state.stats.energy - 5);
    UI.updateStats();
  },

  /** Viaja para um local */
  travelTo(locKey, advanceTime = true, skipArrival = false) {
    const loc = LOCATIONS[locKey];
    if (!loc) return;

    this.state.currentLocation = locKey;

    if (!this.state.visitedLocations.includes(locKey)) {
      this.state.visitedLocations.push(locKey);
      this.state.visitedLocationsCount++;
    }

    if (!this.state.revealedLocations.includes(locKey)) {
      this.state.revealedLocations.push(locKey);
    }

    // Atualiza mapa (com proteção)
    if (MapSystem.map) {
      MapSystem.updatePlayer(loc.lat, loc.lng, locKey);
      MapSystem.revealLocation(locKey);
      NPCSystem.autoMove(locKey);
      MapSystem.refreshAllMarkers();
    }

    // Custo de energia
    this.state.stats.energy = Math.max(0, this.state.stats.energy - 8);

    if (advanceTime) {
      this.advanceTime(1);
    }

    UI.updateStats();
    UI.updateLocation();

    // Nó de chegada — apenas se não estiver pulando e tiver nó de chegada
    if (!skipArrival) {
      const arrivalNode = this.getArrivalNode(locKey);
      if (arrivalNode && arrivalNode !== this.state.currentNode) {
        this.loadNode(arrivalNode);
      }
    }
  },

  /** Obtém nó de chegada para um local */
  getArrivalNode(locKey) {
    const arrivals = {
      pinheiros: 'open_awakening',
      consolacao: 'visit_dona_celia',
      lapa: 'go_lapa_night',
      liberdade: 'find_gareth',
      se: 'protest_se',
      barra_funda: 'metro_encounter',
      tiete: 'metro_encounter',
      pinheirinho: 'toca_curupira',
     vila_madalena: 'noite_vila',
      berrini: 'investigate_hotel',
      torre_altino: 'sentinel_confront',
      predo_municipal: 'mayor_meeting',
      santa_irem: 'protest_se'
    };
    return arrivals[locKey] || null;
  },

  /** Investiga um local no mapa */
  investigateAt(lat, lng) {
    // Encontra o local mais próximo
    let closest = null;
    let minDist = Infinity;

    for (const [key, loc] of Object.entries(LOCATIONS)) {
      const dist = Math.sqrt(Math.pow(lat - loc.lat, 2) + Math.pow(lng - loc.lng, 2));
      if (dist < minDist && dist < 0.01) {
        minDist = dist;
        closest = key;
      }
    }

    if (closest) {
      this.travelTo(closest);
    } else {
      this.addJournal('Você investigou uma área desconhecida. Nada de interessante encontrado.');
      UI.notify('Área vazia. Nada para investigar aqui.', 'warning');
      this.state.stats.energy = Math.max(0, this.state.stats.energy - 3);
      UI.updateStats();
    }
  },

  /** Fala com NPC */
  talkToNPC(npcId) {
    const npc = NPCSystem.get(npcId);
    if (!npc) return;

    const dialogues = {
      gareth: `Gareth se aproxima. <span class="speaker">"Tenho novidades. A Sentinela está limpaando registros na Torre. Precisamos agir rápido, ${this.state.playerName}."</span>`,
      lyra: `Lyra te encontra no meio da multidão. <span class="speaker">"Os protestos crescem a cada dia, ${this.state.playerName}. Você está comigo?"</span>`,
      viktor: `Viktor encara você com olhos gelados. <span class="speaker">"Sua hora vai chegar, ${this.state.playerName}. Pare agora e viva."</span>`,
      rafael: `Rafael aparece do morro. <span class="speaker">"Eles estão vindo, ${this.state.playerName}. Precisamos de ajuda. Meu irmão morreu por essa verdade."</span>`,
      'dona_celia': `Dona Célia sorri. <span class="speaker">"Moço, tome cuidado. Vi homens estranhos perguntando sobre você no elevador."</span>`,
      prefeito: `O prefeito estende a mão. <span class="speaker">"Ah, ${this.state.playerName}! Sempre um prazer. Que tal um café e uma conversa?"</span>`
    };

    const dialogue = dialogues[npcId] || `${npc.name} sorri e acena.`;
    this.addJournal(`Conversa com ${npc.name}: ${dialogue}`);
    UI.appendNarrative(dialogue);

    // Efeito na relação
    const relationDelta = Math.floor(Math.random() * 10) - 3;
    NPCSystem.updateRelation(npcId, relationDelta);
    this.state.npcRelations[npcId] = (this.state.npcRelations[npcId] || 0) + relationDelta;
    this.state.maxNPCRelations = Math.max(
      this.state.maxNPCRelations,
      Math.abs(this.state.npcRelations[npcId] || 0)
    );

    UI.updateNPCs();
    Storage.save(this.state);
  },

  /** Verifica NPCs próximos */
  checkNearbyNPCs(node) {
    if (!node.location) return;
    const nearby = NPCSystem.allAlive().filter(npc =>
      NPCSystem.canMeet(npc.id, node.location)
    );
    if (nearby.length > 0 && Math.random() < 0.3) {
      const npc = nearby[Math.floor(Math.random() * nearby.length)];
      const greeting = this._getNPCGreeting(npc);
      if (greeting) {
        this.addJournal(greeting);
      }
    }
  },

  /** Saudação de NPC */
  _getNPCGreeting(npc) {
    const greetings = {
      gareth: [`Gareth te avista e faz um sinal de cabeça. "Ainda vivo, hein?"`, `Gareth passa correndo: "${this.state.playerName}, preciso te encontrar depois!"`],
      lyra: [`Lyra te vê e sorri. "Mais um aliado?"`, `Lyra: "${this.state.playerName}! O protesto começa em uma hora!"`],
      viktor: [`Viktor te observa de longe. Seus olhos dizem tudo.`, `Viktor cruza os braços. "${this.state.playerName}... estamos nos vendo muito."`],
      rafael: [`Rafael aparece do morro. "${this.state.playerName}! Tenho novidades!"`, `Rafael acena de longe. "Cuidado lá embaixo!"`],
      'dona_celia': [`Dona Célia: "Moço, tome cuidado com esses talos!"`, `Dona Célia te oferece um café. "Tomem, ajuda a dormir."`],
      prefeito: [`Dr. Carvalho te cumprimenta com um sorriso político.`, `"Ah, ${this.state.playerName}! Que coincidence!"`]
    };
    const options = greetings[npc.id];
    if (!options) return null;
    return options[Math.floor(Math.random() * options.length)];
  },

  /** Inicia combate */
  startCombat(combatData) {
    this.state.inCombat = true;
    this.state.combatData = combatData || { difficulty: 3, enemy: 'Viktor' };
    Combat.start(this.state.combatData);
  },

  /** Finaliza combate */
  endCombat(won) {
    this.state.inCombat = false;
    this.state.combatData = null;

    if (won) {
      this.state.combatWins++;
      this.state.stats.hp = Math.max(10, this.state.stats.hp - 10);
      this.state.stats.energy = Math.max(0, this.state.stats.energy - 20);
      UI.notify('Vitória! Você supera o inimigo.', 'success');
      this.loadNode('mayor_meeting'); // Continue after combat
    } else {
      this.state.stats.hp = Math.max(1, this.state.stats.hp - 30);
      this.state.stats.energy = 0;
      UI.notify('Derrota... Você sobrevive, mas mal.', 'danger');
      if (this.state.stats.hp <= 0) {
        this.finishGame('death');
      } else {
        this.loadNode('open_awakening'); // Reload start
      }
    }
    UI.updateStats();
    document.getElementById('combat-modal').classList.remove('active');
  },

  /** Avança tempo */
  advanceTime(amount) {
    this.state.stats.energy = Math.max(0, this.state.stats.energy - amount * 3);
    // Regen passivo
    if (this.state.stats.energy < 20) {
      this.state.stats.energy = Math.min(this.state.maxEnergy, this.state.stats.energy + 5);
    }
  },

  /** Avança data */
  advanceDate() {
    const date = new Date(this.state.gameDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  },

  /** Adiciona entrada no diário */
  addJournal(text) {
    const entry = {
      date: this.state.gameDate,
      text: text
        .replace(/\{\{player\}\}/g, this.state.playerName || 'você')
        .replace(/\{\{npc\}\}/g, 'NPC'),
      turn: this.state.turnNumber
    };
    this.state.journal.push(entry);
    this.state.journalEntries++;

    // Limita tamanho do journal
    if (this.state.journal.length > 50) {
      this.state.journal.shift();
    }

    UI.renderJournal();
  },

  /** Adiciona ao log de memória */
  addMemory(text) {
    this.state.memoryLog.push({
      date: this.state.gameDate,
      text: text,
      turn: this.state.turnNumber
    });
  },

  /** Finaliza o jogo */
  finishGame(ending) {
    this.state.ending = ending;
    UI.showEnding(ending);
    Storage.save(this.state);
  },

  /** Carrega jogo salvo */
  loadGame() {
    const saved = Storage.load();
    if (saved) {
      this.state = saved;
      this.state.inCombat = false;
      this.state.combatData = null;

      // Re-inicializa NPCs
      NPCSystem.init(NPC_DATA);
      NPCSystem.npcs.forEach(n => {
        if (this.state.npcRelations[n.id] !== undefined) {
          n.relation = this.state.npcRelations[n.id];
        }
      });

      // Restaura localização
      MapSystem.updatePlayer(
        LOCATIONS[this.state.currentLocation]?.lat || -23.55,
        LOCATIONS[this.state.currentLocation]?.lng || -46.63,
        this.state.currentLocation
      );

      MapSystem.revealedAreas = this.state.revealedLocations;
      MapSystem.revealLocation(this.state.currentLocation);

      // Renderiza UI
      UI.renderAll();
      this.loadNode(this.state.currentNode);

      // Mostra resumo
      const lastSave = Storage.getLastSaveInfo();
      if (lastSave) {
        UI.notify(
          `Última vez: ${lastSave.locationName} em ${lastSave.date}. Último evento: ${lastSave.lastEvent.substring(0, 50)}...`,
          'info'
        );
      }

      return true;
    }
    return false;
  }
};
