/**
 * ============================================
 * CHRONICLES 2026 — Sistema de Armazenamento
 * Persistência via LocalStorage
 * ============================================
 */

const Storage = {
  KEY: 'chronicles2026_save',
  SLOTS_KEY: 'chronicles2026_slots',

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

  /** Limpa o save atual */
  clear() {
    localStorage.removeItem(this.KEY);
  },

  /** Salva múltiplos slots de personagem */
  saveSlot(slotIndex, state) {
    try {
      const slots = JSON.parse(localStorage.getItem(this.SLOTS_KEY) || '[]');
      slots[slotIndex] = {
        name: state.playerName,
        scenario: state.scenario,
        date: state.gameDate,
        location: state.currentLocation,
        timestamp: Date.now()
      };
      localStorage.setItem(this.SLOTS_KEY, JSON.stringify(slots));
    } catch (e) {
      console.error('Erro ao salvar slot:', e);
    }
  },

  /** Obtém lista de slots */
  getSlots() {
    try {
      return JSON.parse(localStorage.getItem(this.SLOTS_KEY) || '[]');
    } catch { return []; }
  },

  // --- Métodos internos ---

  _replacer(key, value) {
    // Evita serializar funções
    if (typeof value === 'function') return undefined;
    return value;
  },

  _reviver(key, value) {
    // Reconstroi datas como strings
    if (key === 'gameDate' && typeof value === 'string') return value;
    return value;
  },

  _updateSlots(state) {
    this.saveSlot(0, state);
  }
};
