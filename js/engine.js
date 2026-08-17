/**
 * ============================================
 * CHRONICLES 2026 — Engine de Sandbox IA
 * Motor principal: mundo vivo, narrativa dinâmica
 * Inspirado no Davia.ai
 * ============================================
 */

const Engine = {
  state: null,
  journal: [],
  history: [], // Últimas N ações para contexto
  isProcessing: false,

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

      // Stats estilo Davia
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

      // Localização
      currentLocation: 'pinheiros',
      visitedLocations: ['pinheiros'],
      revealedLocations: ['pinheiros'],

      // Metatemporal
      gameDate: '2026-01-15',
      turnNumber: 1,

      // Missões
      activeMissions: [],
      completedMissions: [],

      // NPCs relationships
      npcRelations: {},

      // Mapa
      mapLayers: {
        allegiance: false,
        danger: false,
        entities: true,
        landmarks: true,
        events: true
      }
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

    // Inicializa o mapa
    if (MapSystem.map) {
      MapSystem.map.remove();
      MapSystem.map = null;
    }
    MapSystem.init();

    // Inicializa NPCs
    NPCSystem.init(NPC_DATA);

    // Revela locais próximos
    this.revealNearbyLocations();

    // Salva
    Storage.save(this.state);

    // Gera abertura com IA
    this.generateOpening();
  },

  /** Revela locais próximos ao início */
  revealNearbyLocations() {
    const startLoc = LOCATIONS[this.state.currentLocation];
    if (!startLoc) return;

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
    this.state.revealedLocations = [...new Set(this.state.revealedLocations)];
  },

  /** Gera texto de abertura usando IA */
  async generateOpening() {
    const loc = LOCATIONS[this.state.currentLocation];
    const context = this.buildContext();

    const prompt = `Você é um mestre de RPG sandbox ambientado em São Paulo, 2026.

O jogador é ${this.state.playerName}, ${this.state.profession}, com traços: ${this.state.traits.join(', ') || 'nenhum'}.
Está em ${loc?.name || 'São Paulo'} no dia ${this.state.gameDate}.

Gere uma abertura imersiva (3-5 parágrafos) que:
1. Descreva o ambiente e a atmosfera do local
2. Apresente um gancho narrativo (algo que chama atenção do jogador)
3. Sugira 2-3 ações possíveis de forma orgânica
4. Seja em português do Brasil, estilo narrativa literária

Formato de saída (use EXATAMENTE estas tags):
[NARRATIVA]
<seu texto aqui>
[/NARRATIVA]

[OPÇÕES]
1. <ação 1>
2. <ação 2>
3. <ação 3>
[/OPÇÕES]`;

    const response = await AIEngine.generateNarrative(context, prompt);
    
    if (response) {
      this.processIAResponse(response);
    } else {
      // Fallback local
      this.generateLocalOpening();
    }
  },

  /** Gera abertura local (fallback) */
  generateLocalOpening() {
    const isGlobal = this.state.scenario === 'global';

    if (isGlobal && this.state.countryName) {
      const leader = this.state.leader || {};
      const capital = this.state.countryName;
      const timeStr = this.getTimeString();
      const leaderInfo = leader.name ? 'sob o governo de ' + leader.name + ', ' + leader.title + '.' : '';
      const countryDesc = this.state.description || '';
      const opening = 'É 1 de janeiro de 2026. ' + timeStr + '. Você está na capital de ' + capital + '. ' + leaderInfo + '\n\n' + countryDesc + ' A cidade ao seu redor carrega o peso de um novo ano e as tensões de um mundo em transformação.\n\n' + this.getOpeningHook(isGlobal);

      UI.appendNarrative(opening);
      this.addJournal('1 de janeiro de 2026. Dia começa em ' + capital + ', ' + this.state.countryName + '.');

      // Adiciona notícias iniciais do país
      if (this.state.news && this.state.news.length > 0) {
        this.state.news.slice(0, 3).forEach(n => UI.addNews(n));
      }

      UI.renderChoices([
        { text: '🏛️ Ir ao palácio/governo para avaliar a situação política', next: null, action: 'governo' },
        { text: '📰 Buscar informações nos meios de comunicação locais', next: null, action: 'informação' },
        { text: '🚶 Caminhar pela cidade para sentir o clima social', next: null, action: 'explorar' }
      ]);
      return;
    }

    const loc = LOCATIONS[this.state.currentLocation];
    const opening = 'São ' + this.getTimeString() + '. Você está em ' + (loc?.name || 'São Paulo') + '. A cidade pulsa ao seu redor com sua energia caótica habitual.\n\n' + this.getOpeningHook();

    UI.appendNarrative(opening);
    this.addJournal('Dia começa em ' + (loc?.name || 'São Paulo') + '.');
    UI.renderChoices([
      { text: '🔍 Investigar os arredores', next: null, action: 'investigar' },
      { text: '📱 Verificar celular/mensagens', next: null, action: 'verificar' },
      { text: '🚶 Explorar a região', next: null, action: 'explorar' }
    ]);
  },

  getTimeString() {
    const hour = Math.floor(Math.random() * 14) + 6;
    return `${hour}h`;
  },

  getOpeningHook(isGlobal = false) {
    if (isGlobal) {
      const hooks = [
        'Uma notícia urgente aparece no celular: uma crise política acaba de eclodir na capital.',
        'Um assessora do governo te aborda na rua — há algo que precisam te dizer.',
        'Manifestações eclodem nos arredores. O clima está tenso.',
        'Seu telefone toca — uma ligação de um número desconhecido.',
        'Reportagens falham sobre movimentos militares incomuns na região.'
      ];
      return hooks[Math.floor(Math.random() * hooks.length)];
    }
    const hooks = [
      'Um estranho te observa de longe. Parece estar esperando algo.',
      'Notícias no celular falham sobre um incidente na região.',
      'Uma mensagem anônima chega: "Eles estão te procurando."',
      'Você nota alguém seguindo você pela rua.',
      'Um evento improvviso acontece perto de você.'
    ];
    return hooks[Math.floor(Math.random() * hooks.length)];
  },

  /** Constrói contexto para IA */
  buildContext() {
    const loc = LOCATIONS[this.state.currentLocation];
    const nearbyNPCs = NPCSystem.allAlive().filter(n =>
      NPCSystem.canMeet(n.id, this.state.currentLocation)
    );
    const isGlobal = this.state.scenario === 'global';

    return {
      location: isGlobal ? (this.state.countryName || this.state.currentLocation) : (loc?.name || this.state.currentLocation),
      locationDesc: isGlobal ? (this.state.description || '') : (loc?.desc || ''),
      country: isGlobal ? this.state.countryName : null,
      leader: isGlobal ? (this.state.leader?.name || '') : null,
      leaderTitle: isGlobal ? (this.state.leader?.title || '') : null,
      traits: this.state.traits.join(', '),
      profession: this.state.profession,
      tone: this.state.tone,
      difficulty: this.state.difficulty,
      stats: this.state.stats,
      nearbyNPCs: nearbyNPCs.map(n => `${n.name} (${n.allegiance})`),
      recentEvents: this.history.slice(-5).map(h => h.action.substring(0, 100)),
      date: this.state.gameDate,
      turn: this.state.turnNumber
    };
  },

  /** Processa resposta da IA */
  processIAResponse(response) {
    // Parsea a resposta
    const narrativeMatch = response.match(/\[NARRATIVA\]([\s\S]*?)\[\/NARRATIVA\]/);
    const optionsMatch = response.match(/\[OPÇÕES\]([\s\S]*?)\[\/OPÇÕES\]/);

    const narrative = narrativeMatch ? narrativeMatch[1].trim() : response;
    const optionsText = optionsMatch ? optionsMatch[1].trim() : '';

    // Renderiza narrativa
    UI.appendNarrative(narrative);

    // Parseia opções
    const choices = optionsText.split('\n')
      .filter(line => line.trim())
      .map(line => ({
        text: line.replace(/^\d+\.\s*/, ''),
        next: null,
        action: line.toLowerCase()
      }));

    // Renderiza escolhas
    UI.renderChoices(choices);

    // Adiciona ao journal
    this.addJournal(narrative.substring(0, 200) + (narrative.length > 200 ? '...' : ''));
  },

  /** Submete ação do jogador */
  async submitAction(action) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Limpa choices anteriores
    document.getElementById('narrative-choices').innerHTML = '';

    // Adiciona ação ao histórico
    this.history.push({
      turn: this.state.turnNumber,
      date: this.state.gameDate,
      action: action,
      result: null
    });

    // Limita histórico
    if (this.history.length > 20) {
      this.history.shift();
    }

    const context = this.buildContext();

    // Tenta IA primeiro
    if (AIEngine.enabled) {
      const response = await AIEngine.generateNarrative(context, action);
      if (response) {
        this.processIAResponse(response);
        this.isProcessing = false;
        return;
      }
    }

    // Fallback: engine local
    this.processLocalAction(action);
    this.isProcessing = false;
  },

  /** Processa ação localmente (sem IA) */
  processLocalAction(action) {
    const lower = action.toLowerCase();
    let result = '';
    let effects = {};

    // Interpreta ação
    if (lower.includes('investig') || lower.includes('explorar')) {
      result = this.generateInvestigationResult();
      effects = { energy: -5, influence: 1 };
    } else if (lower.includes('fugir') || lower.includes('correr')) {
      result = this.generateEscapeResult();
      effects = { energy: -15, hp: -5 };
    } else if (lower.includes('conversar') || lower.includes('falar') || lower.includes('negociar')) {
      result = this.generateSocialResult(action);
      effects = { rep: 2, network: 1 };
    } else if (lower.includes('hackear') || lower.includes('hack')) {
      result = this.generateHackResult();
      effects = { energy: -10, influence: 2 };
    } else if (lower.includes('combate') || lower.includes('lutar') || lower.includes('atacar')) {
      result = this.generateCombatResult();
      effects = { energy: -10, hp: -10 };
    } else if (lower.includes('viajar') || lower.includes('ir para') || lower.includes('mudar')) {
      result = this.generateTravelResult(action);
      effects = { energy: -8 };
    } else {
      result = this.generateGenericResult(action);
      effects = { energy: -3 };
    }

    // Aplica efeitos
    Object.entries(effects).forEach(([key, val]) => {
      if (this.state.stats[key] !== undefined) {
        this.state.stats[key] = Math.max(0, Math.min(
          key === 'hp' || key === 'energy' ? this.state.stats[`max${key.charAt(0).toUpperCase() + key.slice(1)}`] || 100 : 100,
          this.state.stats[key] + val
        ));
      }
    });

    // Renderiza resultado
    UI.appendNarrative(result);
    this.addJournal(`Ação: ${action.substring(0, 50)}... → ${result.substring(0, 100)}`);
    UI.updateStats();
    Storage.save(this.state);
  },

  generateInvestigationResult() {
    const discoveries = [
      'Você encontra informações relevantes sobre a movimentação da Sentinela Corp na região.',
      'Ao explorar, percebe padrões de vigilancia estratégica no bairro.',
      'Descobre um point de encontro underground onde moradores discutem os eventos recentes.',
      'Encontra documentos descartados que revelam operações não autorizadas.',
      'Observa movimentos suspeitos que corroborm com rumores locais.'
    ];
    return discoveries[Math.floor(Math.random() * discoveries.length)];
  },

  generateEscapeResult() {
    const results = [
      'Você consegue se afastar, mas a tensão permanece.',
      'A fuga é bem-sucedida, porém você perde tempo precioso.',
      'Consegue escapar, mas algo importante fica para trás.',
      'A fuga causa atenção indesejada de autoridades locais.'
    ];
    return results[Math.floor(Math.random() * results.length)];
  },

  generateSocialResult(action) {
    const responses = [
      'Suas palavras encontram eco. Alguém na multidão parece interessado no que você tem a dizer.',
      'A conversa revela informações valiosas sobre o clima na cidade.',
      'Você faz uma conexão inesperada que pode ser útil no futuro.',
      'O diálogo tensione as coisas, mas também abre portas.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },

  generateHackResult() {
    const results = [
      'Você acessa dados confidenciais. Informações sobre operações da Sentinela estão agora nas suas mãos.',
      'O hack é bem-sucedido, mas deixa um rastro digital que pode ser rastreado.',
      'Consegue informações cruciais, mas o sistema de segurança está mais ativo do que o esperado.',
      'O acesso revela uma rede de contatos que pode ser explorada.'
    ];
    return results[Math.floor(Math.random() * results.length)];
  },

  generateCombatResult() {
    const results = [
      'O confronto é intenso. Você consegue se sair, mas saiu ferido.',
      'A luta termina com vitória, porém a atenção que chamou é preocupante.',
      'Você supera o adversário, mas o custo emocional é alto.',
      'O confronto termina em empate estratégico — ambos recuam.'
    ];
    return results[Math.floor(Math.random() * results.length)];
  },

  generateTravelResult(action) {
    // Tenta extrair destino
    const locMatch = action.match(/para (?:o|a)?\s*([^\s,]+)/i);
    if (locMatch) {
      const destKey = Object.keys(LOCATIONS).find(k => 
        LOCATIONS[k].name.toLowerCase().includes(locMatch[1].toLowerCase())
      );
      if (destKey && this.state.revealedLocations.includes(destKey)) {
        Engine.travelTo(destKey);
        return `Você viaja para ${LOCATIONS[destKey].name}.`;
      }
    }
    return 'Você se desloca pela cidade. Novos lugares se revelam a cada esquina.';
  },

  generateGenericResult(action) {
    const results = [
      `Você tenta "${action}". A cidade responde de formas imprevisíveis.`,
      `"${action}" — suas ações ecoam pelo tecido urbano de São Paulo.`,
      `O mundo se ajusta às suas intenções. Consequências surgem onde menos se espera.`,
      `Sua decisão influencia o fluxo da narrativa. O que acontece a seguir é incerto.`
    ];
    return results[Math.floor(Math.random() * results.length)];
  },

  /** Viaja para local */
  travelTo(locKey) {
    const loc = LOCATIONS[locKey];
    if (!loc) return;

    this.state.currentLocation = locKey;

    if (!this.state.visitedLocations.includes(locKey)) {
      this.state.visitedLocations.push(locKey);
    }
    if (!this.state.revealedLocations.includes(locKey)) {
      this.state.revealedLocations.push(locKey);
    }

    // Custo
    this.state.stats.energy = Math.max(0, this.state.stats.energy - 8);

    // Atualiza mapa
    if (MapSystem.map) {
      MapSystem.updatePlayer(loc.lat, loc.lng, locKey);
      MapSystem.revealLocation(locKey);
      MapSystem.refreshAllMarkers();
    }

    UI.updateStats();
    UI.updateLocation();

    // Gera nova cena
    this.generateScene();
  },

  /** Gera cena atual */
  async generateScene() {
    const loc = LOCATIONS[this.state.currentLocation];
    const context = this.buildContext();

    const prompt = `Continuação da narrativa em ${loc?.name || this.state.currentLocation}.

Contexto atual:
- Jogador: ${this.state.playerName} (${this.state.profession})
- Local: ${loc?.desc || ''}
- Hora: ${this.state.gameDate}
- Traços: ${this.state.traits.join(', ')}
- NPCs próximos: ${context.nearbyNPCs.join(', ') || 'Nenhum'}
- Últimas ações: ${context.recentEvents.slice(-3).join(' | ')}

Gere 2-3 parágrafos de narrativa imersiva que:
1. Descreva o que acontece no momento
2. Introduza um gancho ou desenvolvimento
3. Seja coerente com o estado do mundo

Formato:
[NARRATIVA]
<texto>
[/NARRATIVA]`;

    if (AIEngine.enabled) {
      const response = await AIEngine.generateNarrative(context, prompt);
      if (response) {
        this.processIAResponse(response);
        return;
      }
    }

    this.generateLocalScene();
  },

  generateLocalScene() {
    const loc = LOCATIONS[this.state.currentLocation];
    const scene = `Você está em ${loc?.name || 'São Paulo'}. ${loc?.desc || 'A cidade continua seu ritmo incessante.'}\n\n${this.getRandomEvent()}`;
    UI.appendNarrative(scene);
    this.addJournal(`Chegada em ${loc?.name || 'São Paulo'}.`);
    UI.renderChoices([
      { text: '🔍 Investigar a área', action: 'investigar' },
      { text: '🚶 Mover-se para outro local', action: 'viajar' },
      { text: '💬 Tentar falar com alguém', action: 'conversar' }
    ]);
  },

  getRandomEvent() {
    const events = [
      'Um grupo de manifestantes passa pela rua.',
      'Veículos da Sentinela Corp são vistos na região.',
      'Notícias de um incidente recente circulam.',
      'Você nota olhares curiosos enquanto caminha.',
      'Um estranho se aproxima e faz uma pergunta.'
    ];
    return events[Math.floor(Math.random() * events.length)];
  },

  /** Adiciona ao journal */
  addJournal(text) {
    const entry = {
      date: this.state.gameDate,
      text: text,
      turn: this.state.turnNumber
    };
    this.journal.push(entry);
    this.state.journalEntries++;

    // Limita
    if (this.journal.length > 50) {
      this.journal.shift();
    }

    UI.renderJournal();
  },

  /** Atualiza UI completa */
  updateAll() {
    UI.renderAll();
    UI.updateStats();
    Storage.save(this.state);
  },

  /** Carrega jogo salvo */
  loadGame() {
    const saved = Storage.load();
    if (saved) {
      this.state = saved;
      this.history = saved.history || [];
      this.journal = saved.journal || [];

      // Re-inicializa NPCs
      NPCSystem.init(NPC_DATA);
      NPCSystem.npcs.forEach(n => {
        if (this.state.npcRelations[n.id] !== undefined) {
          n.relation = this.state.npcRelations[n.id];
        }
      });

      // Restaura mapa
      MapSystem.init();
      MapSystem.updatePlayer(
        LOCATIONS[this.state.currentLocation]?.lat || -23.55,
        LOCATIONS[this.state.currentLocation]?.lng || -46.63,
        this.state.currentLocation
      );
      MapSystem.revealedAreas = this.state.revealedLocations || [];

      // Renderiza
      UI.renderAll();
      this.generateScene();

      return true;
    }
    return false;
  }
};
