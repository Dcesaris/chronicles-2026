/**
 * ============================================
 * CHRONICLES 2026 — App Principal
 * Orquestra telas, wizard, tutorial e conquistas
 * ============================================
 */

const App = {
  currentScreen: 'title',

  /** Inicializa o app */
  init() {
    this.renderScenarioCards();
    this.renderTraitButtons();
    this.setupKeyboard();

    // Verifica API key salva e configura IA automaticamente
    const savedApiConfig = localStorage.getItem('chronicles2026_api');
    if (savedApiConfig) {
      try {
        const config = JSON.parse(savedApiConfig);
        if (config.key && config.baseUrl && config.model) {
          AIEngine.init(config.key, config.baseUrl, config.model);
        }
      } catch(e) {}
    }

    // Verifica save existente
    if (Storage.hasSave()) {
      const info = Storage.getLastSaveInfo();
      if (info) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-accent';
        btn.style.marginTop = '1rem';
        btn.innerHTML = `<i class="fa-solid fa-folder-open"></i> Continuar (${info.locationName})`;
        btn.onclick = () => {
          Engine.loadGame();
          this.showScreen('game');
        };
        document.querySelector('.title-buttons').appendChild(btn);
      }
    }
  },

  /** Mostra uma tela */
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById('screen-' + screenId);
    if (screen) {
      screen.classList.add('active');
      this.currentScreen = screenId;
    }

    // Atualiza tema baseado no cenário
    if (screenId === 'scenarios') {
      this.renderScenarioCards();
    }
  },

  /** Renderiza cards de cenários */
  renderScenarioCards() {
    const grid = document.getElementById('scenarios-grid');
    if (!grid) return;

    grid.innerHTML = SCENARIOS.map(s => `
      <div class="scenario-card" onclick="App.selectScenario('${s.id}')" data-scenario="${s.id}">
        <div class="scenario-card-thumb" style="background:linear-gradient(135deg, var(--accent), var(--accent2));opacity:0.3;"></div>
        <div class="scenario-card-body">
          <h3>${s.name}</h3>
          <p>${s.description}</p>
          <div class="scenario-meta">
            <span><i class="fa-solid fa-signal"></i> ${s.difficulty}</span>
            <span><i class="fa-solid fa-clock"></i> ${s.timeEstimate}</span>
            <span><i class="fa-solid fa-map-pin"></i> ${s.coords.lat.toFixed(2)}, ${s.coords.lng.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  /** Seleciona cenário e inicia wizard */
  selectScenario(scenarioId) {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Aplica tema
    document.documentElement.setAttribute('data-scenario', scenario.theme);
    document.documentElement.setAttribute('data-theme', scenario.theme);

    // Inicia wizard
    Wizard.init(scenarioId);
    this.showScreen('wizard');
  },

  /** Renderiza botões de traços */
  renderTraitButtons() {
    const container = document.getElementById('trait-selector');
    if (!container) return;

    container.innerHTML = TRAITS.map(t => `
      <button class="trait-btn" data-trait="${t.id}" onclick="Wizard.toggleTrait(this)">
        ${t.icon} ${t.label}
      </button>
    `).join('');
  },

  /** Configura teclas de atalho */
  setupKeyboard() {
    document.getElementById('free-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') Engine.submitFreeInput();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (document.getElementById('full-map-modal').classList.contains('active')) {
          MapSystem.collapseMap();
        }
        if (document.getElementById('tutorial-modal').classList.contains('active')) {
          document.getElementById('tutorial-modal').style.display = 'none';
        }
      }
    });
  },

  /** Abre configurações (inclui API key) */
  showSettings() {
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.9);backdrop-filter:blur(12px);
      z-index:1100;display:flex;align-items:center;justify-content:center;padding:1rem;
    `;
    modal.innerHTML = `
      <div style="width:100%;max-width:400px;background:var(--bg-panel);border:1px solid var(--border-glass);border-radius:16px;padding:1.5rem;">
        <h3 style="font-family:var(--font-title);margin-bottom:1rem;">⚙️ Configurações de IA</h3>
        <div class="form-group">
          <label>API Key</label>
          <input type="password" id="settings-api-key" placeholder="Sua API key..." style="width:100%;padding:0.75rem;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-family:var(--font-terminal);font-size:0.85rem;">
        </div>
        <div class="form-group">
          <label>Base URL</label>
          <input type="text" id="settings-api-url" placeholder="https://api.omniroute.ai/v1" style="width:100%;padding:0.75rem;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:0.85rem;">
        </div>
        <div class="form-group">
          <label>Modelo</label>
          <select id="settings-api-model" style="width:100%;padding:0.75rem;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:0.85rem;">
            <option value="Zeus Copy">Zeus Copy (recomendado)</option>
            <option value="omniroute/Zeus-2.0">Zeus 2.0</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="custom">Outro (digite abaixo)</option>
          </select>
        </div>
        <div class="form-group" id="custom-model-group" style="display:none;">
          <label>Modelo personalizado</label>
          <input type="text" id="settings-api-model-custom" placeholder="nome-do-modelo" style="width:100%;padding:0.75rem;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-family:var(--font-terminal);font-size:0.85rem;">
        </div>
        <div style="display:flex;gap:0.5rem;margin-top:1rem;">
          <button class="btn-back" style="flex:1;min-height:44px;" onclick="document.getElementById('settings-modal').remove()">Cancelar</button>
          <button class="btn-next" style="flex:1;min-height:44px;" onclick="App.saveSettings()">Salvar</button>
        </div>
        <p style="font-size:0.7rem;color:var(--text-muted);margin-top:0.75rem;text-align:center;">Sua API key é salva localmente no navegador.</p>
      </div>
    `;
    document.body.appendChild(modal);

    // Pré-preenche se houver config salva
    const saved = localStorage.getItem('chronicles2026_api');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        document.getElementById('settings-api-key').value = config.key || '';
        document.getElementById('settings-api-url').value = config.baseUrl || 'http://localhost:20128/v1';
        document.getElementById('settings-api-model').value = config.model || 'Zeus Copy';
        if (config.model === 'custom') {
          document.getElementById('custom-model-group').style.display = 'block';
          document.getElementById('settings-api-model-custom').value = config.customModel || '';
        }
      } catch(e) {}
    }

    // Toggle custom model input
    document.getElementById('settings-api-model').addEventListener('change', (e) => {
      document.getElementById('custom-model-group').style.display = e.target.value === 'custom' ? 'block' : 'none';
    });
  },

  /** Salva configurações de API */
  saveSettings() {
    const key = document.getElementById('settings-api-key').value.trim();
    const baseUrl = document.getElementById('settings-api-url').value.trim() || 'http://localhost:20128/v1';
    const modelSelect = document.getElementById('settings-api-model').value;
    const model = modelSelect === 'custom'
      ? document.getElementById('settings-api-model-custom').value.trim()
      : modelSelect;

    if (key && model) {
      AIEngine.init(key, baseUrl, model);
      localStorage.setItem('chronicles2026_api', JSON.stringify({
        key,
        baseUrl,
        model,
        customModel: modelSelect === 'custom' ? model : null
      }));
      UI.notify(`IA configurada com ${model}!`, 'success');
    } else if (!key) {
      AIEngine.enabled = false;
      localStorage.removeItem('chronicles2026_api');
      UI.notify('IA desativada.', 'info');
    } else {
      UI.notify('Preencha o modelo.', 'warning');
    }

    document.getElementById('settings-modal').remove();
  },

  /** Abre modal de saves */
  showSaveSlots() {
    const modal = document.getElementById('save-modal');
    const list = document.getElementById('save-slots-list');
    modal.style.display = 'flex';

    const slots = Storage.getSlots();
    let html = '';

    for (let i = 1; i <= 3; i++) {
      const slot = slots[i-1];
      const saved = Storage.loadSlot(i);
      const hasSave = slot || saved;

      html += `
        <div style="padding:0.75rem;border:1px solid var(--border-glass);border-radius:8px;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:600;">Slot ${i}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">
              ${hasSave ? (slot?.name || 'Personagem') + ' · ' + (slot?.date || '') : 'Vazio'}
            </div>
          </div>
          <div style="display:flex;gap:0.5rem;">
            ${hasSave ? `<button class="btn-back" style="padding:0.5rem 0.75rem;font-size:0.8rem;min-height:36px;" onclick="App.loadSave(${i})">Carregar</button>` : ''}
            <button class="btn-back" style="padding:0.5rem 0.75rem;font-size:0.8rem;min-height:36px;" onclick="App.clearSave(${i})">Limpar</button>
          </div>
        </div>
      `;
    }

    list.innerHTML = html || '<p style="color:var(--text-muted);text-align:center;">Nenhum save encontrado.</p>';
  },

  /** Carrega save de um slot */
  loadSave(slotIndex) {
    const saved = Storage.loadSlot(slotIndex);
    if (saved) {
      Engine.state = saved;
      NPCSystem.init(NPC_DATA);
      MapSystem.init();
      MapSystem.revealedAreas = saved.revealedLocations || [];
      UI.renderAll();
      Engine.loadNode(saved.currentNode);
      document.getElementById('save-modal').style.display = 'none';
      this.showScreen('game');
      UI.notify('Jogo carregado!', 'success');
    }
  },

  /** Limpa save de um slot */
  clearSave(slotIndex) {
    Storage.clearSlot(slotIndex);
    this.showSaveSlots();
    UI.notify('Slot limpo.', 'info');
  },

  /** Abre tutorial */
  showTutorial() {
    Tutorial.init();
    document.getElementById('tutorial-modal').style.display = 'flex';
    document.getElementById('tutorial-modal').classList.add('active');
  },

  /** Abre conquistas */
  showAchievements() {
    const grid = document.getElementById('achievements-grid');
    grid.innerHTML = ACHIEVEMENTS.map(a => `
      <div class="achievement locked" id="ach-${a.id}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
        <div class="achievement-desc">${a.desc}</div>
      </div>
    `).join('');

    // Verifica conquistas desbloqueadas
    const saved = Storage.load();
    if (saved) {
      ACHIEVEMENTS.forEach(a => {
        if (a.check(saved)) {
          const el = document.getElementById('ach-' + a.id);
          if (el) {
            el.classList.remove('locked');
            el.classList.add('unlocked');
          }
        }
      });
    }

    document.getElementById('achievements-modal').style.display = 'flex';
  },

  /** Switch abas mobile */
  switchMobileTab(tab) {
    const game = document.getElementById('screen-game');
    document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.mobile-tab[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');

    game.classList.remove('show-character', 'show-map');

    if (tab === 'character') {
      game.classList.add('show-character');
    } else if (tab === 'map') {
      game.classList.add('show-map');
    }
    // 'scene' — remove ambas classes, mostra cena central
  },
};

/** ============================================
 * WIZARD DE CRIAÇÃO
 * ============================================ */
const Wizard = {
  step: 1,
  scenario: null,
  selectedTraits: [],
  selectedTone: 'neutro',
  wizardMap: null,
  wizardMarker: null,

  /** Inicializa o wizard */
  init(scenarioId) {
    this.step = 1;
    this.scenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];
    this.selectedTraits = [];
    this.selectedTone = 'neutro';
    this.selectedStartLocation = null;
    this._formState = null;

    // Reset visual
    document.querySelectorAll('.wizard-step-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === 0);
      dot.classList.toggle('done', false);
    });
    document.querySelectorAll('.wizard-body').forEach((body, i) => {
      body.style.display = i === 0 ? 'flex' : 'none';
    });
    document.getElementById('wizard-prev').style.visibility = 'hidden';
    document.getElementById('wizard-next').innerHTML = 'Próximo <i class="fa-solid fa-arrow-right"></i>';

    // Reset form
    const nameInput = document.getElementById('char-name');
    if (nameInput) nameInput.value = '';
    const avatarInput = document.getElementById('char-avatar');
    if (avatarInput) avatarInput.value = '🎭';
    document.querySelectorAll('.trait-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('selected'));
    const defaultTone = document.querySelector('.tone-btn[data-tone="neutro"]');
    if (defaultTone) defaultTone.classList.add('selected');
    const mapInfo = document.getElementById('wizard-map-info');
    if (mapInfo) mapInfo.textContent = 'Clique no mapa para selecionar seu início';

    // Wizard map — destrói se existir
    if (this.wizardMap) {
      this.wizardMap.remove();
      this.wizardMap = null;
      this.wizardMarker = null;
    }
  },

  /** Próximo passo */
  nextStep() {
    if (this.step === 1) {
      const name = document.getElementById('char-name').value.trim();
      if (!name) {
        UI.notify('Por favor, insira um nome para seu personagem.', 'warning');
        return;
      }
      if (this.selectedTraits.length === 0) {
        UI.notify('Selecione pelo menos 1 traço de personalidade.', 'warning');
        return;
      }
    }

    if (this.step === 2) {
      // Inicializa mapa do wizard SOMENTE quando o passo 3 for exibido
      setTimeout(() => this.initWizardMap(), 50);
    }

    if (this.step === 3) {
      // Finaliza criação
      this.finish();
      return;
    }

    this.step++;
    this.updateUI();
    // Re-inicializa mapa após transição se estiver no passo 3
    if (this.step === 3 && !this.wizardMap) {
      setTimeout(() => this.initWizardMap(), 100);
    }
  },

  /** Passo anterior */
  prevStep() {
    if (this.step > 1) {
      this.step--;
      this.updateUI();
    }
  },

  /** Atualiza UI do wizard */
  updateUI() {
    // Dots
    document.querySelectorAll('.wizard-step-dot').forEach((dot, i) => {
      dot.classList.remove('active', 'done');
      if (i + 1 === this.step) dot.classList.add('active');
      if (i + 1 < this.step) dot.classList.add('done');
    });

    // Bodies
    document.querySelectorAll('.wizard-body').forEach((body, i) => {
      body.style.display = i + 1 === this.step ? 'flex' : 'none';
    });

    // Botões
    document.getElementById('wizard-prev').style.visibility = this.step > 1 ? 'visible' : 'hidden';

    const nextBtn = document.getElementById('wizard-next');
    if (this.step === 3) {
      nextBtn.innerHTML = '<i class="fa-solid fa-rocket"></i> Começar Aventura';
    } else {
      nextBtn.innerHTML = 'Próximo <i class="fa-solid fa-arrow-right"></i>';
    }

    // Título
    const titles = { 1: 'Criar Personagem', 2: 'Definir o Mundo', 3: 'Ponto de Partida' };
    document.getElementById('wizard-title').textContent = titles[this.step] || '';
  },

  /** Seleciona traço */
  toggleTrait(btn) {
    const trait = btn.dataset.trait;
    if (btn.classList.contains('selected')) {
      btn.classList.remove('selected');
      this.selectedTraits = this.selectedTraits.filter(t => t !== trait);
    } else {
      if (this.selectedTraits.length >= 3) {
        UI.notify('Máximo de 3 traços selecionados.', 'warning');
        return;
      }
      btn.classList.add('selected');
      this.selectedTraits.push(trait);
    }
  },

  /** Seleciona tom */
  selectTone(btn) {
    document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    this.selectedTone = btn.dataset.tone;
  },

  /** Inicializa mapa do wizard */
  initWizardMap() {
    const container = document.getElementById('wizard-map');
    if (!container) return;
    // Só inicializa se o container estiver visível
    if (container.offsetParent === null && !container.getBoundingClientRect().width) return;
    if (this.wizardMap) return; // já existe

    try {
      this.wizardMap = L.map('wizard-map', {
        center: this.scenario.coords,
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(this.wizardMap);

      // Marcadores dos locais
      this.scenario.locations?.forEach(locKey => {
        const loc = LOCATIONS[locKey];
        if (loc) {
          L.marker([loc.lat, loc.lng], {
            icon: L.divIcon({ className: 'marker-landmark', iconSize: [14, 14], iconAnchor: [7, 7] })
          }).addTo(this.wizardMap).bindPopup(`<div class="popup-title">${loc.name}</div>`);
        }
      });

      // Clique para selecionar início
      this.wizardMap.on('click', (e) => {
        if (this.wizardMarker) this.wizardMap.removeLayer(this.wizardMarker);
        this.wizardMarker = L.marker([e.latlng.lat, e.latlng.lng], {
          icon: L.divIcon({ className: 'marker-player', iconSize: [20, 20], iconAnchor: [10, 10] })
        }).addTo(this.wizardMap);

        // Encontra local mais próximo
        let closest = null;
        let minDist = Infinity;
        for (const [key, loc] of Object.entries(LOCATIONS)) {
          const dist = Math.sqrt(
            Math.pow(e.latlng.lat - loc.lat, 2) +
            Math.pow(e.latlng.lng - loc.lng, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            closest = key;
          }
        }

        this.selectedStartLocation = closest || this.scenario.startLocation;
        const mapInfo = document.getElementById('wizard-map-info');
        if (mapInfo) {
          mapInfo.textContent = `Ponto selecionado: ${closest ? LOCATIONS[closest]?.name : this.scenario.startLocation}`;
        }
      });

      // Invalida size após animação
      setTimeout(() => this.wizardMap.invalidateSize(), 200);
    } catch (err) {
      console.error('Erro ao inicializar mapa do wizard:', err);
      UI.notify('Erro ao carregar mapa. Tentando continuar...', 'warning');
    }
  },

  /** Finaliza criação e inicia jogo */
  finish() {
    // Salva valores dos campos do formulário no state do wizard
    this._formState = {
      playerName: document.getElementById('char-name')?.value.trim() || 'Viajante',
      profession: document.getElementById('char-profession')?.value || 'reporter',
      avatar: document.getElementById('char-avatar')?.value || '🎭',
      tone: this.selectedTone,
      difficulty: document.getElementById('game-difficulty')?.value || 'normal',
      realism: document.getElementById('game-realism')?.value || 'immersive',
      currentLocation: this.selectedStartLocation || this.scenario.startLocation,
      scenario: this.scenario.id
    };

    Engine.startGame(this._formState.scenario, this._formState);
    // Mapa já foi inicializado pelo Engine.startGame()
    UI.renderAll();
    App.showScreen('game');
    UI.notify(`Bem-vindo a ${this.scenario.name}, ${this._formState.playerName}!`, 'success');
  }
};

/** ============================================
 * TUTORIAL
 * ============================================ */
const Tutorial = {
  step: 0,
  steps: [
    {
      title: '🎮 Bem-vindo a Chronicles 2026',
      text: 'Um RPG sandbox de narrativa interativa ambientado em 2026. Suas escolhas moldam o mundo ao seu redor. Não há caminho certo — apenas consequências.'
    },
    {
      title: '🗺️ O Mapa',
      text: 'O mapa mostra onde você está e o que pode explorar. Clique em locais para viajar. Marcadores coloridos indicam NPCs (verde=aliado, amarelo=neutro, vermelho=inimigo). Zonas sombreadas são áreas desconhecidas.'
    },
    {
      title: '📖 Narrativa',
      text: 'A história é contada na coluna central. Leia com atenção, pois cada detalhe importa. As escolhas que você faz adicionam tags ao seu personagem e abrem ou fecham caminhos futuros.'
    },
    {
      title: '✍️ Ações Livres',
      text: 'Além dos botões de escolha, você pode digitar o que quiser na caixa de texto. Palavras-chave como "investigar", "lutar", "fugir", "hackear" são interpretadas automaticamente. O mundo responde às suas intenções.'
    },
    {
      title: '💾 Save Automático',
      text: 'O jogo salva automaticamente a cada decisão. Você pode voltar a qualquer momento pelo menu principal. NPCs agem sozinhos — suas relações mudam, aliados podem trair, inimigos podem morrer. O mundo não espera por você.'
    }
  ],

  init() {
    this.step = 0;
    this.renderDots();
    this.renderStep();
  },

  renderDots() {
    const container = document.getElementById('tutorial-dots');
    container.innerHTML = this.steps.map((_, i) =>
      `<div class="tutorial-dot ${i === this.step ? 'active' : ''}"></div>`
    ).join('');
  },

  renderStep() {
    const container = document.getElementById('tutorial-steps');
    const step = this.steps[this.step];
    container.innerHTML = `
      <div class="tutorial-step active">
        <h3>${step.title}</h3>
        <p>${step.text}</p>
      </div>
    `;

    // Botões
    document.getElementById('tutorial-prev').style.visibility = this.step > 0 ? 'visible' : 'hidden';
    document.getElementById('tutorial-next').textContent =
      this.step === this.steps.length - 1 ? '✅ Começar a Jogar' : 'Próximo →';
  },

  next() {
    if (this.step < this.steps.length - 1) {
      this.step++;
      this.renderDots();
      this.renderStep();
    } else {
      document.getElementById('tutorial-modal').style.display = 'none';
      document.getElementById('tutorial-modal').classList.remove('active');
    }
  },

  prev() {
    if (this.step > 0) {
      this.step--;
      this.renderDots();
      this.renderStep();
    }
  }
};

/** ============================================
 * INICIALIZAÇÃO
 * ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Configura IA se API key estiver disponível
  const savedApiConfig = localStorage.getItem('chronicles2026_api');
  if (savedApiConfig) {
    try {
      const config = JSON.parse(savedApiConfig);
      AIEngine.init(config.key, config.baseUrl, config.model);
    } catch(e) {}
  }

  App.init();

  // Swipe navigation para mobile
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    const absDiff = Math.abs(diff);

    // Mínimo de 80px para considerar swipe
    if (absDiff < 80) return;

    // Swipe left — próximo painel
    if (diff > 0) {
      const game = document.getElementById('screen-game');
      if (game.classList.contains('show-character')) {
        game.classList.remove('show-character');
        document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.mobile-tab[data-tab="scene"]').classList.add('active');
      } else if (game.classList.contains('show-map')) {
        game.classList.remove('show-map');
        document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.mobile-tab[data-tab="scene"]').classList.add('active');
      }
    }
    // Swipe right — abrir painel
    else {
      const activeTab = document.querySelector('.mobile-tab.active');
      if (activeTab?.dataset.tab === 'scene') {
        document.getElementById('screen-game').classList.add('show-map');
        document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.mobile-tab[data-tab="map"]').classList.add('active');
      } else if (activeTab?.dataset.tab === 'map') {
        document.getElementById('screen-game').classList.add('show-character');
        document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.mobile-tab[data-tab="character"]').classList.add('active');
      }
    }
  }
});
