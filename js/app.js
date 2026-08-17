/**
 * ============================================
 * CHRONICLES 2026 — App Principal
 * Sandbox global: escolha qualquer líder, qualquer era
 * ============================================
 */

const App = {
  currentScreen: 'title',
  currentEra: null,
  isEraMode: false,

  /** Inicializa o app */
  init() {
    this.renderTraitButtons();
    this.setupKeyboard();

    const savedApiConfig = localStorage.getItem('chronicles2026_api');
    if (savedApiConfig) {
      try {
        const config = JSON.parse(savedApiConfig);
        if (config.key && config.baseUrl && config.model) {
          AIEngine.init(config.key, config.baseUrl, config.model);
        }
      } catch(e) {}
    }

    this.renderRecentGames();
  },

  /** Renderiza jogos recentes na tela inicial */
  renderRecentGames() {
    const slots = Storage.getSlots();
    if (slots.length === 0) return;

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
        document.querySelector('.title-buttons')?.appendChild(btn);
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
        if (document.getElementById('full-map-modal')?.classList.contains('active')) {
          MapSystem.collapseMap();
        }
        if (document.getElementById('tutorial-modal').style.display === 'flex') {
          document.getElementById('tutorial-modal').style.display = 'none';
        }
        if (document.getElementById('achievements-modal').style.display === 'flex') {
          document.getElementById('achievements-modal').style.display = 'none';
        }
      }
    });
  },

  /** =============================================
   * MODO ERA (IA CRIA O CENÁRIO)
   * ============================================= */

  showEraCreator() {
    this.isEraMode = true;
    this.showScreen('era-creator');
  },

  setEraSuggestion(text) {
    const input = document.getElementById('era-command');
    if (input) input.value = text;
  },

  async createEra() {
    const input = document.getElementById('era-command');
    if (!input) return;
    const command = input.value.trim();
    if (!command) {
      UI.notify('Digite uma era para criar (ex: EUA 1986, Brasil 1964)', 'warning');
      return;
    }

    UI.notify('Criando era com IA...', 'info');

    const era = await EraCreator.createEra(command);
    if (era) {
      this.currentEra = era;
      this.isEraMode = false;
      Wizard.init('era', era);
      this.showScreen('wizard');
    } else {
      UI.notify('Falha ao criar era. Verifique a API key.', 'danger');
    }
  },

  /** =============================================
   * MODO PAÍS (ESCOLHE NAÇÃO)
   * ============================================= */

  showCountryPicker() {
    this.isEraMode = false;
    this.showScreen('country-picker');
    this.renderCountryPicker();
  },

  renderCountryPicker() {
    const container = document.getElementById('country-picker-list');
    if (!container) return;

    let html = '';
    for (const [continent, data] of Object.entries(GLOBAL_COUNTRIES)) {
      html += `<div class="continent-section"><h3>${data.label}</h3><div class="country-grid">`;
      for (const country of data.countries) {
        html += `
          <div class="country-card" onclick="App.selectCountry('${country.id}')">
            <div class="country-flag">${this.getCountryFlag(country.id)}</div>
            <div class="country-info">
              <div class="country-name">${country.name}</div>
              <div class="country-leader">${country.leader.name}</div>
              <div class="country-title">${country.leader.title}</div>
            </div>
          </div>
        `;
      }
      html += '</div></div>';
    }
    container.innerHTML = html;
  },

  selectCountry(countryId) {
    let country = null;
    for (const continent of Object.values(GLOBAL_COUNTRIES)) {
      const found = continent.countries.find(c => c.id === countryId);
      if (found) {
        country = { ...found, continent: continent.label };
        break;
      }
    }
    if (!country) return;

    Wizard.init('country', country);
    this.showScreen('wizard');
  },

  getCountryFlag(id) {
    const flags = {
      'usa': '🇺🇸', 'canada': '🇨🇦', 'mexico': '🇲🇽',
      'brazil': '🇧🇷', 'argentina': '🇦🇷', 'chile': '🇨🇱', 'colombia': '🇨🇴',
      'venezuela': '🇻🇪', 'peru': '🇵🇪', 'ecuador': '🇪🇨', 'bolivia': '🇧🇴',
      'paraguay': '🇵🇾', 'uruguay': '🇺🇾',
      'uk': '🇬🇧', 'france': '🇫🇷', 'germany': '🇩🇪', 'italy': '🇮🇹',
      'spain': '🇪🇸', 'portugal': '🇵🇹', 'netherlands': '🇳🇱', 'belgium': '🇧🇪',
      'switzerland': '🇨🇭', 'austria': '🇦🇹', 'poland': '🇵🇱', 'czech-republic': '🇨🇿',
      'hungary': '🇭🇺', 'romania': '🇷🇴', 'bulgaria': '🇧🇬', 'ukraine': '🇺🇦',
      'russia': '🇷🇺', 'turkey': '🇹🇷', 'greece': '🇬🇷', 'sweden': '🇸🇪',
      'norway': '🇳🇴', 'finland': '🇫🇮', 'denmark': '🇩🇰', 'ireland': '🇮🇪',
      'china': '🇨🇳', 'japan': '🇯🇵', 'india': '🇮🇳', 'south-korea': '🇰🇷',
      'north-korea': '🇰🇵', 'indonesia': '🇮🇩', 'thailand': '🇹🇭', 'vietnam': '🇻🇳',
      'philippines': '🇵🇭', 'malaysia': '🇲🇾', 'singapore': '🇸🇬', 'pakistan': '🇵🇰',
      'bangladesh': '🇧🇩', 'saudi-arabia': '🇸🇦', 'iran': '🇮🇷', 'iraq': '🇮🇶',
      'israel': '🇮🇱', 'united-arab-emirates': '🇦🇪', 'qatar': '🇶🇦', 'kuwait': '🇰🇼',
      'nigeria': '🇳🇬', 'south-africa': '🇿🇦', 'egypt': '🇪🇬', 'ethiopia': '🇪🇹',
      'kenya': '🇰🇪', 'ghana': '🇬🇭', 'morocco': '🇲🇦', 'algeria': '🇩🇿',
      'tunisia': '🇹🇳', 'tanzania': '🇹🇿', 'uganda': '🇺🇬', 'drc': '🇨🇩',
      'cameroon': '🇨🇲', 'zimbabwe': '🇿🇼', 'zambia': '🇿🇲', 'madagascar': '🇲🇬',
      'australia': '🇦🇺', 'new-zealand': '🇳🇿', 'papua-new-guinea': '🇵🇬'
    };
    return flags[id] || '🏳️';
  },

  /** =============================================
   * TELAS AUXILIARES
   * ============================================= */

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
          <input type="text" id="settings-api-url" placeholder="http://localhost:20128/v1" style="width:100%;padding:0.75rem;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:0.85rem;">
        </div>
        <div class="form-group">
          <label>Modelo</label>
          <select id="settings-api-model" style="width:100%;padding:0.75rem;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:8px;color:var(--text-primary);font-size:0.85rem;">
            <option value="Zeus Copy">Zeus Copy (recomendado)</option>
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
      </div>
    `;
    document.body.appendChild(modal);

    const saved = localStorage.getItem('chronicles2026_api');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        document.getElementById('settings-api-key').value = config.key || '';
        document.getElementById('settings-api-url').value = config.baseUrl || 'http://localhost:20128/v1';
        document.getElementById('settings-api-model').value = config.model || 'Zeus Copy';
      } catch(e) {}
    }

    document.getElementById('settings-api-model').addEventListener('change', (e) => {
      document.getElementById('custom-model-group').style.display = e.target.value === 'custom' ? 'block' : 'none';
    });
  },

  saveSettings() {
    const key = document.getElementById('settings-api-key').value.trim();
    const baseUrl = document.getElementById('settings-api-url').value.trim() || 'http://localhost:20128/v1';
    const modelSelect = document.getElementById('settings-api-model').value;
    const model = modelSelect === 'custom'
      ? document.getElementById('settings-api-model-custom').value.trim()
      : modelSelect;

    if (key && model) {
      AIEngine.init(key, baseUrl, model);
      localStorage.setItem('chronicles2026_api', JSON.stringify({ key, baseUrl, model }));
      UI.notify(`IA configurada com ${model}!`, 'success');
    }
    document.getElementById('settings-modal').remove();
  },

  showTutorial() {
    document.getElementById('tutorial-modal').style.display = 'flex';
  },

  showAchievements() {
    const modal = document.getElementById('achievements-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    this.renderAchievements();
  },

  renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;

    const state = Engine.state || {};
    let html = '';
    for (const ach of ACHIEVEMENTS) {
      const unlocked = ach.check(state);
      html += `
        <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
          <div class="achievement-info">
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.desc}</div>
          </div>
        </div>
      `;
    }
    grid.innerHTML = html;
  },

  showSaveSlots() {
    const modal = document.getElementById('save-modal');
    const list = document.getElementById('save-slots-list');
    if (!modal || !list) return;
    modal.style.display = 'flex';

    const slots = Storage.getSlots();
    let html = '';
    for (let i = 1; i <= 3; i++) {
      const slot = slots[i-1];
      const hasSave = slot;
      html += `
        <div style="padding:0.75rem;border:1px solid var(--border-glass);border-radius:8px;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:600;">Slot ${i}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">
              ${hasSave ? (slot.name || 'Jogo') + ' · ' + (slot.date || '') : 'Vazio'}
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

  loadSave(slotIndex) {
    const saved = Storage.loadSlot(slotIndex);
    if (saved) {
      Engine.state = saved;
      NPCSystem.init(NPC_DATA);
      MapSystem.init();
      MapSystem.revealedAreas = saved.revealedLocations || [];
      UI.renderAll();
      Engine.generateScene();
      document.getElementById('save-modal').style.display = 'none';
      this.showScreen('game');
      UI.notify('Jogo carregado!', 'success');
    }
  },

  clearSave(slotIndex) {
    Storage.clearSlot(slotIndex);
    this.showSaveSlots();
    UI.notify('Slot limpo.', 'info');
  },

  switchMobileTab(tab) {
    const game = document.getElementById('screen-game');
    document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.mobile-tab[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');

    game.classList.remove('show-character', 'show-map');
    if (tab === 'character') game.classList.add('show-character');
    else if (tab === 'map') game.classList.add('show-map');
  }
};

/** ============================================
 * WIZARD DE CRIAÇÃO
 * ============================================ */
const Wizard = {
  step: 1,
  scenario: null,
  selectedTraits: [],
  selectedTone: 'neutro',
  selectedConstraint: 'normal',
  wizardMap: null,
  wizardMarker: null,
  selectedCountry: null,
  selectedEra: null,
  skipMapStep: false,

  init(type, data) {
    this.step = 1;
    this.selectedTraits = [];
    this.selectedTone = 'neutro';
    this.selectedConstraint = 'normal';
    this.wizardMap = null;
    this.wizardMarker = null;
    this.skipMapStep = false;

    if (type === 'era') {
      this.scenario = data;
      this.selectedEra = data;
      this.skipMapStep = true;
    } else if (type === 'country') {
      this.selectedCountry = data;
      this.skipMapStep = true;
    }

    document.querySelectorAll('.wizard-step-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === 0);
      dot.classList.remove('done');
    });
    document.querySelectorAll('.wizard-body').forEach((body, i) => {
      body.style.display = i === 0 ? 'flex' : 'none';
    });
    document.getElementById('wizard-prev').style.visibility = 'hidden';
    document.getElementById('wizard-next').innerHTML = 'Próximo <i class="fa-solid fa-arrow-right"></i>';

    const nameInput = document.getElementById('char-name');
    if (nameInput) nameInput.value = '';
    const avatarInput = document.getElementById('char-avatar');
    if (avatarInput) avatarInput.value = '🎭';
    document.querySelectorAll('.trait-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('selected'));
    const defaultTone = document.querySelector('.tone-btn[data-tone="neutro"]');
    if (defaultTone) defaultTone.classList.add('selected');

    if (this.skipMapStep) {
      document.querySelectorAll('.wizard-step-dot')[2]?.style.setProperty('display', 'none');
    } else {
      document.querySelectorAll('.wizard-step-dot')[2]?.style.setProperty('display', '');
    }
  },

  nextStep() {
    if (this.step === 1) {
      const name = document.getElementById('char-name')?.value.trim();
      if (!name) {
        UI.notify('Por favor, insira um nome para seu personagem.', 'warning');
        return;
      }
      if (this.selectedTraits.length === 0) {
        UI.notify('Selecione pelo menos 1 traço de personalidade.', 'warning');
        return;
      }
    }

    if (this.step === 2 && this.skipMapStep) {
      this.finish();
      return;
    }

    this.step++;
    this.updateUI();
  },

  prevStep() {
    if (this.step > 1) {
      this.step--;
      this.updateUI();
    }
  },

  updateUI() {
    document.querySelectorAll('.wizard-step-dot').forEach((dot, i) => {
      dot.classList.remove('active', 'done');
      if (i + 1 === this.step) dot.classList.add('active');
      if (i + 1 < this.step) dot.classList.add('done');
    });

    document.querySelectorAll('.wizard-body').forEach((body, i) => {
      body.style.display = i + 1 === this.step ? 'flex' : 'none';
    });

    document.getElementById('wizard-prev').style.visibility = this.step > 1 ? 'visible' : 'hidden';

    const nextBtn = document.getElementById('wizard-next');
    if (this.step >= (this.skipMapStep ? 2 : 3)) {
      nextBtn.innerHTML = '<i class="fa-solid fa-rocket"></i> Começar Aventura';
    } else {
      nextBtn.innerHTML = 'Próximo <i class="fa-solid fa-arrow-right"></i>';
    }

    const titles = { 1: 'Criar Personagem', 2: 'Definir o Mundo', 3: 'Confirmar' };
    document.getElementById('wizard-title').textContent = titles[this.step] || '';
  },

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

  selectConstraint(card, constraint) {
    document.querySelectorAll('.constraint-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    this.selectedConstraint = constraint;
  },

  finish() {
    const state = {
      playerName: document.getElementById('char-name')?.value.trim() || 'Viajante',
      profession: document.getElementById('char-profession')?.value || 'leader',
      avatar: document.getElementById('char-avatar')?.value || '🎭',
      traits: this.selectedTraits,
      tone: document.getElementById('game-tone')?.value || 'neutro',
      difficulty: this.selectedConstraint,
      currentLocation: this.selectedCountry?.id || 'world',
      scenario: this.selectedEra?.name || (this.selectedCountry?.name || 'Mundo')
    };

    if (this.selectedCountry) {
      state.country = this.selectedCountry;
      state.currentLocation = this.selectedCountry.id;
      state.playerTitle = this.selectedCountry.leader.title;
    }

    if (this.selectedEra) {
      state.era = this.selectedEra;
      state.gameDate = this.selectedEra.date || new Date().toISOString().split('T')[0];
      state.erasCreated = (Engine.state?.erasCreated || 0) + 1;
      state.erasPlayed = (Engine.state?.erasPlayed || 0) + 1;
    }

    Engine.startGame('sandbox', state);
    UI.renderAll();
    App.showScreen('game');
    UI.notify(`Bem-vindo, ${state.playerName}!`, 'success');
  }
};

/** ============================================
 * INICIALIZAÇÃO
 * ============================================ */
document.addEventListener('DOMContentLoaded', () => {
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
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) < 80) return;

    const game = document.getElementById('screen-game');
    if (!game) return;

    if (diff > 0) {
      if (game.classList.contains('show-character')) {
        game.classList.remove('show-character');
        document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.mobile-tab[data-tab="scene"]')?.classList.add('active');
      } else if (game.classList.contains('show-map')) {
        game.classList.remove('show-map');
        document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.mobile-tab[data-tab="scene"]')?.classList.add('active');
      }
    } else {
      const activeTab = document.querySelector('.mobile-tab.active')?.dataset.tab;
      if (activeTab === 'scene') {
        game.classList.add('show-map');
        document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.mobile-tab[data-tab="map"]')?.classList.add('active');
      } else if (activeTab === 'map') {
        game.classList.add('show-character');
        document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.mobile-tab[data-tab="character"]')?.classList.add('active');
      }
    }
  }, { passive: true });
});
