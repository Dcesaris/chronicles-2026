/**
 * ============================================
 * CHRONICLES 2026 — Engine Sandbox IA Pura
 * Sem fallbacks. Tudo via IA.
 * ============================================
 */

const Engine = {
  state: null,
  journal: [],
  history: [],
  isProcessing: false,

  /** Estado inicial */
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
      country: null,
      playerTitle: null,

      stats: {
        hp: 100, maxHp: 100,
        energy: 100, maxEnergy: 100,
        rep: 50, maxRep: 100,
        influence: 10,
        morale: 50,
        resources: 500,
        network: 20,
        legitimacy: 30
      },
      credits: 500,
      currentLocation: 'pinheiros',
      visitedLocations: ['pinheiros'],
      revealedLocations: ['pinheiros'],
      gameDate: '2026-01-01',
      turnNumber: 1,
      activeMissions: [],
      completedMissions: [],
      npcRelations: {},
      mapLayers: { allegiance: false, danger: false, entities: true, landmarks: true, events: true }
    };
  },

  /** Inicia jogo */
  startGame(scenarioId, customState = null) {
    this.state = this.defaultState();
    this.state.scenario = scenarioId;
    this.state.visitedScenarios = 1;

    if (customState) {
      Object.assign(this.state, customState);
    }

    // Inicializa mapa
    if (MapSystem.map) { MapSystem.map.remove(); MapSystem.map = null; }
    MapSystem.init();

    // Inicializa NPCs
    NPCSystem.init(NPC_DATA);

    // Revela locais próximos
    this.revealNearby();

    Storage.save(this.state);
    this.generateOpening();
  },

  revealNearby() {
    const loc = LOCATIONS[this.state.currentLocation];
    if (!loc) return;
    for (const [key, l] of Object.entries(LOCATIONS)) {
      const d = Math.sqrt(Math.pow(loc.lat - l.lat, 2) + Math.pow(loc.lng - l.lng, 2));
      if (d < 0.02) {
        if (!this.state.revealedLocations.includes(key)) this.state.revealedLocations.push(key);
        if (!this.state.visitedLocations.includes(key)) this.state.visitedLocations.push(key);
      }
    }
  },

  /** Gera abertura com IA */
  async generateOpening() {
    const loc = LOCATIONS[this.state.currentLocation];
    const ctx = this.buildContext();
    const country = this.state.country;

    const prompt = `Você é um mestre de RPG sandbox mundial ambientado em Janeiro de 2026.
O jogador é ${this.state.playerName}, ${this.state.profession || 'líder'}, com traços: ${this.state.traits.join(', ') || 'nenhum'}.
${country ? `É ${country.leader}, ${country.title} de ${country.name}.` : 'Começa em ' + (loc?.name || 'São Paulo') + '.'}

Gere UMA abertura imersiva (3-4 parágrafos) que:
1. Descreva a cena inicial no local
2. Apresente uma situação ou desafio imediato
3. Seja em português do Brasil, estilo narrativa literária

FORMATO OBRIGATÓRIO (use exatamente):
[NARRATIVA]
<seu texto aqui>
[/NARRATIVA]

[OPÇÕES]
1. <ação 1>
2. <ação 2>
3. <ação 3>
[/OPÇÕES]`;

    const response = await AIEngine.generateNarrative(ctx, prompt);
    if (response) {
      this.processIAResponse(response);
    } else {
      this.showError('Falha ao conectar com IA. Verifique a API key nas configurações.');
    }
  },

  buildContext() {
    const loc = LOCATIONS[this.state.currentLocation];
    return {
      location: loc?.name || this.state.currentLocation,
      locationDesc: loc?.desc || '',
      country: this.state.country?.name,
      leader: this.state.country?.leader,
      title: this.state.country?.title,
      profession: this.state.profession,
      traits: this.state.traits.join(', '),
      tone: this.state.tone,
      date: this.state.gameDate,
      turn: this.state.turnNumber,
      stats: this.state.stats,
      recentActions: this.history.slice(-5).map(h => h.action.substring(0, 80)),
      nearbyNPCs: NPCSystem.allAlive().filter(n => NPCSystem.canMeet(n.id, this.state.currentLocation)).map(n => `${n.name}(${n.allegiance})`).join(', ') || 'Nenhum'
    };
  },

  processIAResponse(response) {
    const narrativeMatch = response.match(/\[NARRATIVA\]([\s\S]*?)\[\/NARRATIVA\]/);
    const optionsMatch = response.match(/\[OPÇÕES\]([\s\S]*?)\[\/OPÇÕES\]/);
    const narrative = narrativeMatch ? narrativeMatch[1].trim() : response;
    const optionsText = optionsMatch ? optionsMatch[1].trim() : '';

    UI.appendNarrative(narrative);
    this.addJournal(narrative.substring(0, 150) + (narrative.length > 150 ? '...' : ''));

    const choices = optionsText.split('\n')
      .filter(l => l.trim())
      .map(l => ({ text: l.replace(/^\d+\.\s*/, ''), action: l.toLowerCase() }));

    if (choices.length > 0) {
      UI.renderChoices(choices);
    }
  },

  /** Submete ação do jogador */
  async submitAction(action) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    document.getElementById('narrative-choices').innerHTML = '';

    this.history.push({ turn: this.state.turnNumber, date: this.state.gameDate, action });
    if (this.history.length > 15) this.history.shift();

    const context = this.buildContext();
    context.action = action;

    if (!AIEngine.enabled) {
      this.showError('IA não configurada. Vá em Configurações para adicionar a API key.');
      this.isProcessing = false;
      return;
    }

    const prompt = `Ação do jogador: "${action}"

Contexto atual:
- Local: ${context.location}
- Data: ${context.date} (Turno ${context.turn})
- Personagem: ${context.leader || context.playerName} (${context.title || context.profession})
- Traços: ${context.traits || 'nenhum'}
- Ações recentes: ${context.recentActions.join('; ') || 'Nenhuma'}
- NPCs próximos: ${context.nearbyNPCs || 'Nenhum'}

Gere aContinuação da narrativa (2-3 parágrafos) que:
1. Descreva o resultado da ação
2. Mostre consequências no mundo
3. Introdusca um novo desenvolvimento ou escolha
4. Seja em português do Brasil

FORMATO OBRIGATÓRIO:
[NARRATIVA]
<texto>
[/NARRATIVA]

[OPÇÕES]
1. <opção 1>
2. <opção 2>
3. <opção 3>
[/OPÇÕES]`;

    const response = await AIEngine.generateNarrative(context, prompt);
    if (response) {
      this.processIAResponse(response);
    } else {
      this.showError('Resposta da IA falhou. Tentando novamente...');
      setTimeout(() => this.submitAction(action), 1000);
    }
    this.isProcessing = false;
  },

  showError(msg) {
    UI.appendNarrative(`<p style="color:#e53935;">⚠️ ${msg}</p>`);
    UI.renderChoices([{ text: '🔄 Tentar novamente', action: 'tentar novamente' }]);
  },

  /** Viaja para local */
  travelTo(locKey) {
    const loc = LOCATIONS[locKey];
    if (!loc) return;

    this.state.currentLocation = locKey;
    if (!this.state.visitedLocations.includes(locKey)) {
      this.state.visitedLocations.push(locKey);
      this.state.visitedLocationsCount = (this.state.visitedLocationsCount || 0) + 1;
    }
    if (!this.state.revealedLocations.includes(locKey)) {
      this.state.revealedLocations.push(locKey);
    }

    this.state.stats.energy = Math.max(0, this.state.stats.energy - 8);
    this.state.turnNumber++;
    this.state.gameDate = this.advanceDate();

    if (MapSystem.map) {
      MapSystem.updatePlayer(loc.lat, loc.lng, locKey);
      MapSystem.revealLocation(locKey);
      MapSystem.refreshAllMarkers();
    }

    NPCSystem.autoMove(locKey);
    UI.updateStats();
    UI.updateLocation();
    this.generateScene();
  },

  advanceDate() {
    const d = new Date(this.state.gameDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  },

  /** Gera cena atual */
  async generateScene() {
    const loc = LOCATIONS[this.state.currentLocation];
    const context = this.buildContext();
    context.scene = true;

    const prompt = `Você está em ${loc?.name || this.state.currentLocation}.
${loc?.desc || ''}

Contexto:
- Data: ${this.state.gameDate}
- Personagem: ${this.state.playerName} (${this.state.country?.leader || this.state.profession})
- Ações recentes: ${context.recentActions.slice(-2).join('; ') || 'Nenhuma'}

Gere 2-3 parágrafos descrevendo o que acontece agora no local.
Inclua um evento ou desenvolvimento relevante.
Seja em português do Brasil.

FORMATO:
[NARRATIVA]
<texto>
[/NARRATIVA]

[OPÇÕES]
1. <ação 1>
2. <ação 2>
[/OPÇÕES]`;

    const response = await AIEngine.generateNarrative(context, prompt);
    if (response) {
      this.processIAResponse(response);
    } else {
      this.showError('Falha ao gerar cena. Verifique conexão com IA.');
    }
  },

  addJournal(text) {
    this.journal.push({ date: this.state.gameDate, text, turn: this.state.turnNumber });
    this.state.journalEntries = (this.state.journalEntries || 0) + 1;
    if (this.journal.length > 30) this.journal.shift();
    UI.renderJournal();
  },

  updateAll() {
    UI.renderAll();
    Storage.save(this.state);
  },

  loadGame() {
    const saved = Storage.load();
    if (!saved) return false;
    this.state = saved;
    this.journal = saved.journal || [];
    this.history = saved.history || [];
    NPCSystem.init(NPC_DATA);
    MapSystem.init();
    MapSystem.revealedAreas = saved.revealedLocations || [];
    if (MapSystem.map) {
      const loc = LOCATIONS[saved.currentLocation];
      if (loc) MapSystem.updatePlayer(loc.lat, loc.lng, saved.currentLocation);
    }
    UI.renderAll();
    this.generateScene();
    return true;
  }
};
// v2
