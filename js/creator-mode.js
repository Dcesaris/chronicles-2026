/**
 * ============================================
 * CHRONICLES 2026 — Modo Criador de Mundos
 * Interface para construção de cenários customizados
 * ============================================
 */

const StoryCreator = {
  editingScenario: null,
  nodes: {},
  npcs: [],
  locations: {},

  /** Abre o modo criador */
  open() {
    this.editingScenario = {
      id: 'custom_' + Date.now(),
      name: 'Novo Cenário',
      nodes: {},
      npcs: [],
      locations: {}
    };
    this.render();
    document.getElementById('creator-modal').style.display = 'flex';
  },

  /** Fecha o modo criador */
  close() {
    document.getElementById('creator-modal').style.display = 'none';
  },

  /** Renderiza a interface do criador */
  render() {
    const content = document.getElementById('creator-content');
    const s = this.editingScenario;

    content.innerHTML = `
      <div style="display:flex;gap:1rem;margin-bottom:1.5rem;">
        <div style="flex:1;">
          <label style="font-size:0.8rem;color:var(--text-secondary);">Nome do Cenário</label>
          <input type="text" id="creator-name" value="${s.name}" style="width:100%;padding:0.5rem;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:4px;color:var(--text-primary);" onchange="StoryCreator.updateName(this.value)" />
        </div>
        <div style="flex:1;">
          <label style="font-size:0.8rem;color:var(--text-secondary);">ID do Cenário</label>
          <input type="text" id="creator-id" value="${s.id}" style="width:100%;padding:0.5rem;background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:4px;color:var(--text-primary);" />
        </div>
      </div>

      <div style="display:flex;gap:1rem;margin-bottom:1rem;">
        <button class="btn" onclick="StoryCreator.addLocation()">
          <i class="fa-solid fa-map-pin"></i> Adicionar Local
        </button>
        <button class="btn" onclick="StoryCreator.addNPC()">
          <i class="fa-solid fa-user-plus"></i> Adicionar NPC
        </button>
        <button class="btn" onclick="StoryCreator.addNode()">
          <i class="fa-solid fa-file-plus"></i> Adicionar Nó de História
        </button>
        <button class="btn btn-accent" onclick="StoryCreator.exportScenario()">
          <i class="fa-solid fa-download"></i> Exportar JSON
        </button>
      </div>

      <div id="creator-list" style="max-height:400px;overflow-y:auto;">
        ${this.renderList()}
      </div>
    `;
  },

  /** Renderiza lista de elementos */
  renderList() {
    let html = '';

    // Locals
    html += '<h4 style="margin:1rem 0 0.5rem;color:var(--accent);">📍 Locais</h4>';
    for (const [id, loc] of Object.entries(this.editingScenario.locations)) {
      html += `
        <div style="padding:0.5rem;background:var(--bg-glass);border-radius:4px;margin-bottom:0.25rem;display:flex;justify-content:space-between;">
          <span>${loc.name || id}</span>
          <button class="btn-back" style="padding:0.2rem 0.5rem;" onclick="StoryCreator.removeLocation('${id}')">✕</button>
        </div>
      `;
    }

    // NPCs
    html += '<h4 style="margin:1rem 0 0.5rem;color:var(--accent);">👤 NPCs</h4>';
    for (const npc of this.editingScenario.npcs) {
      html += `
        <div style="padding:0.5rem;background:var(--bg-glass);border-radius:4px;margin-bottom:0.25rem;display:flex;justify-content:space-between;">
          <span>${npc.emoji || '👤'} ${npc.name || 'Sem nome'}</span>
          <button class="btn-back" style="padding:0.2rem 0.5rem;" onclick="StoryCreator.removeNPC('${npc.id}')">✕</button>
        </div>
      `;
    }

    // Nós
    html += '<h4 style="margin:1rem 0 0.5rem;color:var(--accent);">📖 Nós de História</h4>';
    for (const [id, node] of Object.entries(this.editingScenario.nodes)) {
      html += `
        <div style="padding:0.5rem;background:var(--bg-glass);border-radius:4px;margin-bottom:0.25rem;display:flex;justify-content:space-between;">
          <span>📄 ${id}</span>
          <button class="btn-back" style="padding:0.2rem 0.5rem;" onclick="StoryCreator.removeNode('${id}')">✕</button>
        </div>
      `;
    }

    if (!html) {
      html = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Nenhum elemento adicionado. Comece adicionando locais, NPCs ou nós de história.</p>';
    }

    return html;
  },

  /** Adiciona local */
  addLocation() {
    const id = prompt('ID do local (ex: centro):') || 'local_' + Date.now();
    const name = prompt('Nome do local:') || id;
    const lat = parseFloat(prompt('Latitude (ex: -23.55):') || '-23.55');
    const lng = parseFloat(prompt('Longitude (ex: -46.63):') || '-46.63');

    this.editingScenario.locations[id] = { name, lat, lng, desc: '' };
    this.render();
  },

  /** Remove local */
  removeLocation(id) {
    delete this.editingScenario.locations[id];
    this.render();
  },

  /** Adiciona NPC */
  addNPC() {
    const id = prompt('ID do NPC:') || 'npc_' + Date.now();
    const name = prompt('Nome:') || 'NPC';
    this.editingScenario.npcs.push({
      id, name, emoji: '👤', role: 'NPC',
      personality: 'neutro', relation: 0,
      allegiance: 'neutro', description: '',
      routes: []
    });
    this.render();
  },

  /** Remove NPC */
  removeNPC(id) {
    this.editingScenario.npcs = this.editingScenario.npcs.filter(n => n.id !== id);
    this.render();
  },

  /** Adiciona nó de história */
  addNode() {
    const id = prompt('ID do nó (ex: inicio):') || 'node_' + Date.now();
    if (this.editingScenario.nodes[id]) {
      alert('Nó já existe!');
      return;
    }
    this.editingScenario.nodes[id] = {
      id, location: '', text: '', choices: [],
      journal: '', news: []
    };
    this.render();
  },

  /** Remove nó */
  removeNode(id) {
    delete this.editingScenario.nodes[id];
    this.render();
  },

  /** Atualiza nome */
  updateName(name) {
    this.editingScenario.name = name;
  },

  /** Exporta cenário como JSON */
  exportScenario() {
    const data = JSON.stringify(this.editingScenario, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.editingScenario.id || 'cenario'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.notify('Cenário exportado com sucesso!', 'success');
  },

  /** Importa cenário de JSON */
  importScenario(jsonText) {
    try {
      const data = JSON.parse(jsonText);
      this.editingScenario = data;
      this.render();
      UI.notify('Cenário importado com sucesso!', 'success');
    } catch (e) {
      UI.notify('Erro ao importar: JSON inválido.', 'danger');
    }
  }
};
