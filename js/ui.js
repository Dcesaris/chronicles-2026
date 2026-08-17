/**
 * ============================================
 * CHRONICLES 2026 — UI Manager
 * Manipulação de DOM, animações, renderização
 * ============================================
 */

const UI = {
  typewriterEl: null,
  typewriterTimeout: null,

  /** Renderiza a cena completa */
  renderScene(node) {
    const box = document.getElementById('narrative-box');
    const choices = document.getElementById('narrative-choices');

    // Limpa
    box.innerHTML = '';
    choices.innerHTML = '';

    // Atualiza background
    this.updateSceneBackground(node.location);

    // Typewriter no texto
    this.typeText(box, node.text);

    // Escolhas aparecem após o texto
    this.typewriterTimeout = setTimeout(() => {
      this.renderChoices(node.choices);
    }, node.text.length * 15 + 500);
  },

  /** Append narrative text (para IA) */
  appendNarrative(html) {
    const box = document.getElementById('narrative-box');
    const el = document.createElement('div');
    el.className = 'narrative-text fade-up';
    el.style.marginTop = '1rem';
    el.style.opacity = '0.9';
    el.innerHTML = html;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
  },

  /** Typewriter effect */
  typeText(container, html) {
    if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);

    // Remove html anterior
    container.innerHTML = '';

    const el = document.createElement('div');
    el.className = 'narrative-text';
    container.appendChild(el);

    // Parse HTML em partes
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const fullText = temp.innerHTML;

    let i = 0;
    const speed = 12; // ms por caractere

    const type = () => {
      if (i < fullText.length) {
        // Detecta tags HTML
        if (fullText[i] === '<') {
          const closeIdx = fullText.indexOf('>', i);
          if (closeIdx !== -1) {
            el.innerHTML = fullText.substring(0, closeIdx + 1);
            i = closeIdx + 1;
          }
        } else {
          el.innerHTML = fullText.substring(0, i + 1);
          i++;
        }

        // Scroll automático
        container.scrollTop = container.scrollHeight;
        this.typewriterTimeout = setTimeout(type, speed);
      } else {
        el.innerHTML = fullText;
        el.classList.remove('typing-cursor');
      }
    };

    type();
  },

  /** Adiciona texto à narrativa existente */
  appendNarrative(html) {
    const box = document.getElementById('narrative-box');
    const el = document.createElement('div');
    el.className = 'narrative-text fade-up';
    el.style.marginTop = '1rem';
    el.style.opacity = '0.8';
    el.innerHTML = html;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
  },

  /** Renderiza escolhas */
  renderChoices(choices) {
    const container = document.getElementById('narrative-choices');
    container.innerHTML = '';

    if (!choices || choices.length === 0) return;

    choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = `choice-card stagger-${Math.min(i + 1, 5)}`;
      btn.innerHTML = choice.text;
      btn.onclick = () => {
        if (choice.action) {
          Engine.submitAction(choice.action);
        } else if (choice.next) {
          Engine.choose(choice);
        }
      };
      container.appendChild(btn);
    });
  },

  /** Atualiza background da cena */
  updateSceneBackground(location) {
    const bg = document.getElementById('scene-background');
    const html = document.documentElement;

    // Remove classes de localização anterior
    html.removeAttribute('data-location');

    if (location && LOCATIONS[location]) {
      html.setAttribute('data-location', location);
    }
  },

  /** Renderiza retrato de NPC */
  renderNPCPortrait(npcId) {
    // Remove retrato anterior
    const existing = document.querySelector('.npc-portrait');
    if (existing) existing.remove();

    if (!npcId) return;

    const npc = NPCSystem.get(npcId);
    if (!npc) return;

    const relType = NPCSystem.getRelationType(npcId);
    const relColor = relType === 'friendly' ? '#00e676' :
                     relType === 'hostile' ? '#e53935' : '#ffb300';

    const portrait = document.createElement('div');
    portrait.className = 'npc-portrait fade-up';
    portrait.innerHTML = `
      <div class="npc-portrait-avatar">${npc.emoji}</div>
      <div class="npc-portrait-info">
        <h4>${npc.name} <span style="font-size:0.7rem;color:${relColor}">(${relType === 'friendly' ? '+' : ''}${npc.relation})</span></h4>
        <div class="npc-role">${npc.role}</div>
      </div>
    `;

    const box = document.getElementById('narrative-box');
    box.insertBefore(portrait, box.firstChild);
  },

  /** Atualiza personagem e cena */
  renderAll() {
    this.updateCharacterPanel();
    this.updateStats();
    this.updateInventory();
    this.updateTraits();
    this.renderJournal();
    this.updateNPCs();
    this.updateMissions();
    this.updateNews();
    this.updateLocation();
  },

  /** Atualiza painel do personagem */
  },
    const s = Engine.state;
    document.getElementById('char-avatar-display').textContent = s.avatar;
    document.getElementById('char-name-display').textContent = s.playerName;
    document.getElementById('char-profession-display').textContent =
      this.getProfessionLabel(s.profession);
  },

  /** Atualiza barras de status */
  updateStats() {
    const s = Engine.state;
    const stats = s.stats;

    document.getElementById('stat-hp-val').textContent = `${stats.hp}/${stats.maxHp}`;
    document.getElementById('stat-hp-bar').style.width = `${(stats.hp / stats.maxHp) * 100}%`;

    document.getElementById('stat-energy-val').textContent = `${stats.energy}/${stats.maxEnergy}`;
    document.getElementById('stat-energy-bar').style.width = `${(stats.energy / stats.maxEnergy) * 100}%`;

    document.getElementById('stat-rep-val').textContent = `${stats.rep}/${stats.maxRep}`;
    document.getElementById('stat-rep-bar').style.width = `${(stats.rep / stats.maxRep) * 100}%`;

    document.getElementById('stat-credits-val').textContent = s.credits;

    // Stats estilo Davia
    const infEl = document.getElementById('stat-influence-val');
    if (infEl) {
      infEl.textContent = stats.influence;
      const infBar = document.getElementById('stat-influence-bar');
      if (infBar) infBar.style.width = `${stats.influence}%`;
    }

    const morEl = document.getElementById('stat-morale-val');
    if (morEl) {
      morEl.textContent = stats.morale;
      const morBar = document.getElementById('stat-morale-bar');
      if (morBar) morBar.style.width = `${stats.morale}%`;
    }

    const resEl = document.getElementById('stat-resources-val');
    if (resEl) {
      resEl.textContent = stats.resources;
      const resBar = document.getElementById('stat-resources-bar');
      if (resBar) resBar.style.width = `${Math.min(100, stats.resources / 10)}%`;
    }

    const netEl = document.getElementById('stat-network-val');
    if (netEl) {
      netEl.textContent = stats.network;
      const netBar = document.getElementById('stat-network-bar');
      if (netBar) netBar.style.width = `${stats.network}%`;
    }
  },

  /** Atualiza traços */
  updateTraits() {
    const container = document.getElementById('traits-list');
    container.innerHTML = '';
    Engine.state.traits.forEach(t => {
      const trait = TRAITS.find(tr => tr.id === t);
      if (trait) {
        const badge = document.createElement('span');
        badge.className = 'trait-badge';
        badge.innerHTML = `${trait.icon} ${trait.label}`;
        container.appendChild(badge);
      }
    });
  },

  /** Atualiza inventário */
  updateInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';

    const items = [
      { icon: '📱', name: 'Celular' },
      { icon: '🔑', name: 'Chaves' },
      { icon: '💳', name: 'Carteira' },
      { icon: '🔦', name: 'Lanterna' }
    ];

    Engine.state.inventory.forEach((item, i) => {
      const slot = document.createElement('div');
      slot.className = 'inv-slot filled';
      slot.textContent = item.icon;
      slot.title = item.name;
      grid.appendChild(slot);
    });

    // Slots vazios
    for (let i = Engine.state.inventory.length; i < Engine.state.maxSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      grid.appendChild(slot);
    }
  },

  /** Atualiza diário */
  renderJournal() {
    const container = document.getElementById('diary-entries');
    container.innerHTML = '';

    const entries = Engine.state.journal.slice(-15).reverse();
    entries.forEach(entry => {
      const el = document.createElement('div');
      el.className = 'diary-entry';
      el.innerHTML = `<span class="entry-timestamp">${entry.date} · T${entry.turn}</span>${entry.text}`;
      container.appendChild(el);
    });
  },

  /** Atualiza lista de NPCs */
  updateNPCs() {
    const container = document.getElementById('npc-list');
    container.innerHTML = '';

    const npcData = NPCSystem.getSidebarData();
    npcData.forEach(npc => {
      const el = document.createElement('div');
      el.className = 'npc-list-item';
      el.innerHTML = `
        <div class="npc-list-icon" style="background:${npc.relationType === 'friendly' ? '#00e676' : npc.relationType === 'hostile' ? '#e53935' : '#ffb300'}22;">
          ${npc.emoji}
        </div>
        <div class="npc-list-name">${npc.name}</div>
        <span class="npc-list-rel rel-${npc.relationType}">
          ${npc.relation > 0 ? '+' : ''}${npc.relation}
        </span>
      `;
      el.onclick = () => MapSystem.interactNPC(npc.id);
      container.appendChild(el);
    });
  },

  /** Atualiza missões */
  updateMissions() {
    const container = document.getElementById('missions-list');
    container.innerHTML = '';

    const missions = [
      { title: 'Investigue a mensagem anônima', status: 'ativa', completed: false },
      { title: 'Encontre Gareth na Liberdade', status: 'ativa', completed: false },
      { title: 'Desmascare a Sentinela Corp', status: 'ativa', completed: false }
    ];

    missions.forEach(m => {
      const el = document.createElement('div');
      el.className = `mission-item${m.completed ? ' completed' : ''}`;
      el.innerHTML = `
        <div class="mission-title">${m.completed ? '✅' : '📌'} ${m.title}</div>
        <div class="mission-status">${m.status}</div>
      `;
      container.appendChild(el);
    });
  },

  /** Adiciona notícia ao feed */
  async addNews(headline) {
    const container = document.getElementById('news-feed');
    const el = document.createElement('div');
    el.className = 'news-item memory-notif';
    el.innerHTML = `
      <div class="news-headline">${headline}</div>
      <div class="news-time">${Engine.state.gameDate}</div>
    `;
    container.insertBefore(el, container.firstChild);

    // Tenta gerar headline com IA
    if (AIEngine.enabled && headline.includes('{{')) {
      const aiHeadline = await AIEngine.generateNews(headline);
      if (aiHeadline) {
        el.querySelector('.news-headline').textContent = aiHeadline;
      }
    }

    // Limita notícias
    while (container.children.length > 10) {
      container.removeChild(container.lastChild);
    }
  },

  /** Atualiza feed de notícias */
  updateNews() {
    const defaults = [
      'Sentinela Corp anuncia novo contrato de segurança com prefeitura',
      'Protestos crescem em São Paulo contra vigilância estatal',
      'Qualidade do ar em SP atinge nível "perigoso" na manhã de hoje',
      'Prefeito Carvalho nega envolvimento em escândalos de 2024',
      'Nova lei de segurança pública gera debate no Congresso'
    ];
    const container = document.getElementById('news-feed');
    if (container.children.length === 0) {
      defaults.slice(0, 3).forEach(d => this.addNews(d));
    }
  },

  /** Atualiza localização */
  updateLocation() {
    const loc = LOCATIONS[Engine.state.currentLocation];
    const el = document.getElementById('char-location-display');
    const mapLabel = document.getElementById('map-location-label');
    if (loc) {
      el.textContent = `📍 ${loc.name}`;
      if (mapLabel) mapLabel.textContent = loc.name;
    }
  },

  /** Mostra final do jogo */
  showEnding(ending) {
    const endings = {
      heroic: {
        title: '✨ FIM — Justiça Pública',
        text: `Você expôs a verdade. A Sentinela Corp foi dissolvida, o prefeito Carvalho foi condenado, e São Paulo pode finalmente respirar. O mapa da cidade brilha diferente agora — menos sombras, mais luz.\n\n<span class="speaker">Obrigado por jogar Chronicles 2026.</span>`
      },
      dark: {
        title: '🌑 FIM — O Novo Orden',
        text: `Você escolheu o caminho do poder. A Sentinela agora opera sob nova liderança, e você é parte dela. São Paulo permanece como sempre foi — uma cidade de luzes e sombras.\n\n<span class="speaker">Obrigado por jogar Chronicles 2026.</span>`
      },
      escape: {
        title: '✈️ FIM — Fuga',
        text: `Você sobreviveu. As provas estão seguras em algum lugar, esperando o dia certo para serem reveladas. São Paulo fica para trás, mas a memória permanece.\n\n<span class="speaker">Obrigado por jogar Chronicles 2026.</span>`
      },
      death: {
        title: '💀 FIM — Derrota',
        text: `Suas forças falharam. A cidade continua girando indiferente, mas sua história... sua história foi apenas começada.\n\n<span class="speaker">Tente novamente. O mundo responde a quem persiste.</span>`
      }
    };

    const end = endings[ending] || endings.death;

    const box = document.getElementById('narrative-box');
    box.innerHTML = `
      <div style="text-align:center;padding:2rem;">
        <h2 style="font-family:var(--font-title);margin-bottom:1rem;color:var(--accent);">${end.title}</h2>
        <p style="font-family:var(--font-narration);line-height:1.8;max-width:500px;margin:0 auto;">${end.text}</p>
        <div style="margin-top:2rem;">
          <button class="btn btn-accent" onclick="App.showScreen('title')" style="margin-right:0.5rem;">
            <i class="fa-solid fa-home"></i> Menu Principal
          </button>
          <button class="btn" onclick="App.showScreen('scenarios')" style="margin-left:0.5rem;">
            <i class="fa-solid fa-redo"></i> Novo Jogo
          </button>
        </div>
      </div>
    `;

    document.getElementById('narrative-choices').innerHTML = '';
  },

  /** Notificação toast */
  notify(message, type = 'info') {
    const area = document.getElementById('notification-area');
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.innerHTML = message;
    area.appendChild(el);

    setTimeout(() => {
      el.style.animation = 'notifSlideOut 300ms ease forwards';
      setTimeout(() => el.remove(), 300);
    }, 4000);
  },

  /** Helper: label de profissão */
  getProfessionLabel(id) {
    const labels = {
      reporter: 'Repórter Investigativo',
      hacker: 'Hacker / Anonym',
      influencer: 'Influencer Digital',
      soldier: 'Ex-Militar',
      doctor: 'Médico(a)',
      entrepreneur: 'Empreendedor(a) Tech',
      journalist: 'Jornalista',
      activist: 'Ativista Social',
      detective: 'Detetive Particular',
      street: 'Morador de Rua'
    };
    return labels[id] || id;
  }
};
