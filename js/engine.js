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

  /** Sistema de Travas/Restrições (3 níveis) */
  constraints: {
    /**
     * Nível 1 - Arcade: Mundo maleável, consequências leves
     * - Ações ousadas têm 70% de chance de sucesso
     * - Recursos são abundantes
     * - NPCS são cooperativos
     */
    arcade: {
      successChance: 0.7,
      resourceMultiplier: 1.5,
      npcCooperation: 0.8,
      consequenceSeverity: 0.3,
      description: 'Arcade — Mundo maleável, consequências leves'
    },
    /**
     * Nível 2 - Normal: Equilibrado, realismo moderado
     * - Ações ousadas têm 50% de chance de sucesso
     * - Recursos são limitados mas suficientes
     * - NPCS reagem de forma realista
     */
    normal: {
      successChance: 0.5,
      resourceMultiplier: 1.0,
      npcCooperation: 0.5,
      consequenceSeverity: 0.6,
      description: 'Normal — Equilibrado, realismo moderado'
    },
    /**
     * Nível 3 - Hardcore: Realismo máximo, consequências severas
     * - Ações ousadas têm 25% de chance de sucesso
     * - Recursos escassos, gestão crítica
     * - NPCS traiçoeiros, alianças frágeis
     */
    hardcore: {
      successChance: 0.25,
      resourceMultiplier: 0.6,
      npcCooperation: 0.2,
      consequenceSeverity: 1.0,
      description: 'Hardcore — Realismo máximo, consequências severas'
    }
  },

  /** Calcula chance de sucesso baseada nas travas */
  calculateSuccessChance(action, context) {
    const constraint = this.constraints[this.state.difficulty] || this.constraints.normal;

    let baseChance = constraint.successChance;

    // Bônus por influência
    const influenceBonus = (this.state.stats.influence / 100) * 0.2;
    baseChance += influenceBonus;

    // Bônus por recursos
    const resourceBonus = (this.state.stats.resources / 1000) * 0.15;
    baseChance += resourceBonus;

    // Bônus por traços relevantes
    const relevantTraits = ['corajoso', 'estrategista', 'astuto'];
    const traitBonus = this.state.traits.filter(t => relevantTraits.includes(t)).length * 0.05;
    baseChance += traitBonus;

    // Penalidades por ações muito ousadas
    const audacity = this.auditActionAudacity(action);
    const audacityPenalty = audacity * 0.15;
    baseChance -= audacityPenalty;

    // Penalidade por relações ruins
    const badRelations = Object.values(this.state.npcRelations || {}).filter(r => r < -20).length;
    baseChance -= badRelations * 0.1;

    // Clamp entre 0.05 e 0.95
    return Math.max(0.05, Math.min(0.95, baseChance));
  },

  /** Avalia o quão ousada é uma ação (0-10) */
  auditActionAudacity(action) {
    const lower = action.toLowerCase();
    let audacity = 0;

    // Ações militares
    if (lower.includes('declarar guerra') || lower.includes('atacar') || lower.includes('invasion')) {
      audacity += 8;
    }
    if (lower.includes('matar') || lower.includes('assassinar') || lower.includes('executar')) {
      audacity += 9;
    }
    if (lower.includes('golpe') || lower.includes('coup') || lower.includes('derrocar')) {
      audacity += 7;
    }

    // Ações diplomáticas
    if (lower.includes('aliança') || lower.includes('tratado') || lower.includes('pacto')) {
      audacity += 3;
    }
    if (lower.includes('sanção') || lower.includes('embargo') || lower.includes('bloqueio')) {
      audacity += 5;
    }

    // Ações econômicas
    if (lower.includes('confiscar') || lower.includes('nacionalizar') || lower.includes('expropriar')) {
      audacity += 6;
    }
    if (lower.includes('crise') || lower.includes('colapso') || lower.includes('depressão')) {
      audacity += 4;
    }

    // Ações de informação
    if (lower.includes('mentir') || lower.includes('enganar') || lower.includes('fraude')) {
      audacity += 4;
    }
    if (lower.includes('vazar') || lower.includes('denunciar') || lower.includes('expor')) {
      audacity += 3;
    }

    return Math.min(10, audacity);
  },

  /** Aplica consequências baseadas nas travas */
  applyConsequences(result, audacity) {
    const constraint = this.constraints[this.state.difficulty] || this.constraints.normal;
    const severity = constraint.consequenceSeverity;

    if (result.success) {
      const resourceGain = Math.floor(result.resourceEffect * constraint.resourceMultiplier);
      this.state.stats.resources = Math.max(0, this.state.stats.resources + resourceGain);
      this.state.stats.influence = Math.min(100, this.state.stats.influence + result.influenceEffect);
      this.state.stats.morale = Math.min(100, this.state.stats.morale + result.moraleEffect);
    } else {
      const penalty = severity * 2;
      this.state.stats.resources = Math.max(0, this.state.stats.resources - Math.floor(audacity * penalty));
      this.state.stats.influence = Math.max(0, this.state.stats.influence - Math.floor(audacity * penalty * 0.5));
      this.state.stats.morale = Math.max(0, this.state.stats.morale - Math.floor(audacity * penalty * 0.3));
      this.state.stats.legitimacy = Math.max(0, this.state.stats.legitimacy - Math.floor(audacity * penalty * 0.4));
    }
  },

  /** Estado inicial */
  defaultState() {
    return {
      scenario: null,
      playerName: 'Viajante',
      profession: 'leader',
      avatar: '🎭',
      traits: [],
      tone: 'neutro',
      difficulty: 'normal',
      realism: 'immersive',
      country: null,
      playerTitle: null,
      era: null,

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
      currentLocation: 'world',
      visitedLocations: ['world'],
      revealedLocations: ['world'],
      gameDate: '2026-01-01',
      turnNumber: 1,
      activeMissions: [],
      completedMissions: [],
      npcRelations: {},
      mapLayers: { allegiance: false, danger: false, entities: true, landmarks: true, events: true },
      visitedLocationsCount: 1,
      maxNPCRelations: 0,
      erasCreated: 0,
      erasPlayed: 0,
      journalEntries: 0,
      inventory: [
        { icon: '📱', name: 'Celular' },
        { icon: '🔑', name: 'Chaves' },
        { icon: '💳', name: 'Carteira' }
      ],
      maxSlots: 10
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
      if (d < 0.5) { // Global scale
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
${country ? `É ${country.leader.name}, ${country.leader.title} de ${country.name}.` : 'Começa em ' + (loc?.name || 'o mundo') + '.'}
${this.state.era ? `Era criada: ${this.state.era.name} (${this.state.era.year}).` : ''}

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
    const country = this.state.country;
    return {
      location: loc?.name || country?.name || this.state.currentLocation,
      locationDesc: loc?.desc || country?.description || '',
      country: country?.name,
      leader: country?.leader?.name,
      title: country?.leader?.title,
      profession: this.state.profession,
      traits: this.state.traits.join(', '),
      tone: this.state.tone,
      date: this.state.gameDate,
      turn: this.state.turnNumber,
      stats: this.state.stats,
      recentActions: this.history.slice(-5).map(h => h.action.substring(0, 80)),
      nearbyNPCs: NPCSystem.allAlive().map(n => `${n.name}(${n.allegiance})`).join(', ') || 'Nenhum',
      difficulty: this.state.difficulty
    };
  },

  processIAResponse(response) {
    const narrativeMatch = response.match(/\[NARRATIVA\]([\s\S]*?)\[\/NARRATIVA\]/);
    const consequencesMatch = response.match(/\[CONSEQUENCIAS\]([\s\S]*?)\[\/CONSEQUENCIAS\]/);
    const optionsMatch = response.match(/\[OPCOES\]([\s\S]*?)\[\/OPCOES\]/);

    const narrative = narrativeMatch ? narrativeMatch[1].trim() : response;
    const consequencesText = consequencesMatch ? consequencesMatch[1].trim() : '';
    const optionsText = optionsMatch ? optionsMatch[1].trim() : '';

    // Parse consequências
    let resourceChange = 0;
    let influenceChange = 0;
    let moraleChange = 0;

    const resMatch = consequencesText.match(/Recursos:\s*([+-]?\d+)/i);
    if (resMatch) resourceChange = parseInt(resMatch[1]);

    const infMatch = consequencesText.match(/Influencia:\s*([+-]?\d+)/i);
    if (infMatch) influenceChange = parseInt(infMatch[1]);

    const morMatch = consequencesText.match(/Moral:\s*([+-]?\d+)/i);
    if (morMatch) moraleChange = parseInt(morMatch[1]);

    if (resourceChange !== 0 || influenceChange !== 0 || moraleChange !== 0) {
      this.state.stats.resources = Math.max(0, Math.min(10000, this.state.stats.resources + resourceChange));
      this.state.stats.influence = Math.max(0, Math.min(100, this.state.stats.influence + influenceChange));
      this.state.stats.morale = Math.max(0, Math.min(100, this.state.stats.morale + moraleChange));
      UI.updateStats();
    }

    UI.appendNarrative(narrative);
    this.addJournal(`Turno ${this.state.turnNumber}: ${narrative.substring(0, 100)}...`);

    // Renderiza opções
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

    const audacity = this.auditActionAudacity(action);
    this.history.push({ turn: this.state.turnNumber, date: this.state.gameDate, action, audacity });
    if (this.history.length > 15) this.history.shift();

    const context = this.buildContext();
    context.action = action;
    context.audacity = audacity;

    if (!AIEngine.enabled) {
      this.showError('IA não configurada. Vá em Configurações para adicionar a API key.');
      this.isProcessing = false;
      return;
    }

    const prompt = `Ação do jogador: "${action}"

Contexto atual:
- Local: ${context.location}
- País: ${context.country || 'Nenhum'}
- Líder: ${context.leader || context.playerName} (${context.title || context.profession})
- Data: ${context.date} (Turno ${context.turn})
- Personagem: ${context.playerName} (${context.profession})
- Traços: ${context.traits || 'nenhum'}
- Ações recentes: ${context.recentActions.join('; ') || 'Nenhuma'}
- NPCs próximos: ${context.nearbyNPCs || 'Nenhum'}
- Nível de restrição: ${context.difficulty || 'normal'}
- Ousadia da ação: ${audacity}/10

Gere a continuação da narrativa (2-3 parágrafos) que:
1. Descreva o resultado da ação
2. Mostre consequências no mundo (recursos, influência, moral)
3. Introduza um novo desenvolvimento ou escolha
4. Seja em português do Brasil
5. Seja realista baseado no nível de restrição (${context.difficulty})

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
- Personagem: ${this.state.playerName} (${this.state.country?.leader?.name || this.state.profession})
- Ações recentes: ${context.recentActions.slice(-2).join('; ') || 'Nenhuma'}
- Nível de restrição: ${this.state.difficulty}

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

  /** Submete input livre do jogador */
  async submitFreeInput() {
    const input = document.getElementById('free-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    await this.submitAction(text);
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
