/**
 * ============================================
 * CHRONICLES 2026 — Sistema de Armazenamento
 * Persistência via LocalStorage com múltiplos slots
 * ============================================
 */

const Storage = {
  KEY: 'chronicles2026_save',
  SLOTS_KEY: 'chronicles2026_slots',
  MAX_SLOTS: 3,

  /** Salva o estado atual do jogo */
  save(state) {
    try {
      const data = JSON.stringify(state, this._replacer);
      localStorage.setItem(this.KEY, data);
      this._updateSlots(state);
      return true;
    } catch (e) {
      console.error('Erro ao salvar:', e);
      return false;
    }
  },

  /** Carrega o estado salvo */
  load() {
    try {
      const data = localStorage.getItem(this.KEY);
      if (!data) return null;
      return JSON.parse(data, this._reviver);
    } catch (e) {
      console.error('Erro ao carregar:', e);
      return null;
    }
  },

  /** Verifica se há save ativo */
  hasSave() {
    return !!localStorage.getItem(this.KEY);
  },

  /** Obtém informações do último save */
  getLastSaveInfo() {
    const state = this.load();
    if (!state) return null;
    return {
      location: state.currentLocation,
      locationName: LOCATIONS[state.currentLocation]?.name || state.currentLocation,
      lastEvent: state.journal[state.journal.length - 1]?.text || 'Nenhuma',
      date: state.gameDate,
      hp: state.stats.hp,
      credits: state.credits
    };
  },

  /** Salva em slot específico (1-3) */
  saveSlot(slotIndex, state) {
    try {
      const slots = JSON.parse(localStorage.getItem(this.SLOTS_KEY) || '[]');
      slots[slotIndex] = {
        name: state.playerName,
        scenario: state.scenario,
        date: state.gameDate,
        location: state.currentLocation,
        turn: state.turnNumber,
        timestamp: Date.now()
      };
      localStorage.setItem(this.SLOTS_KEY, JSON.stringify(slots));
    } catch (e) {
      console.error('Erro ao salvar slot:', e);
    }
  },

  /** Carrega save de um slot específico */
  loadSlot(slotIndex) {
    try {
      const data = localStorage.getItem(`chronicles2026_slot${slotIndex}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  /** Salva estado completo em um slot */
  saveToSlot(slotIndex, state) {
    try {
      localStorage.setItem(`chronicles2026_slot${slotIndex}`, JSON.stringify(state));
      this.saveSlot(slotIndex, state);
      return true;
    } catch (e) {
      return false;
    }
  },

  /** Obtém lista de slots salvos */
  getSlots() {
    try {
      return JSON.parse(localStorage.getItem(this.SLOTS_KEY) || '[]');
    } catch { return []; }
  },

  /** Limpa um slot específico */
  clearSlot(slotIndex) {
    localStorage.removeItem(`chronicles2026_slot${slotIndex}`);
    const slots = this.getSlots();
    if (slots[slotIndex]) {
      slots[slotIndex] = null;
      localStorage.setItem(this.SLOTS_KEY, JSON.stringify(slots));
    }
  },

  /** Limpa o save atual */
  clear() {
    localStorage.removeItem(this.KEY);
  },

  /** Limpa todos os saves */
  clearAll() {
    localStorage.removeItem(this.KEY);
    for (let i = 1; i <= this.MAX_SLOTS; i++) {
      localStorage.removeItem(`chronicles2026_slot${i}`);
    }
    localStorage.removeItem(this.SLOTS_KEY);
  },

  // --- Métodos internos ---

  _replacer(key, value) {
    if (typeof value === 'function') return undefined;
    return value;
  },

  _reviver(key, value) {
    if (key === 'gameDate' && typeof value === 'string') return value;
    return value;
  },

  _updateSlots(state) {
    this.saveSlot(0, state);
  }
};
