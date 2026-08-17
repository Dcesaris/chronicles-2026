/**
 * ============================================
 * CHRONICLES 2026 — Sistema de Combate
 * Mini-game de resolução de desafios
 * ============================================
 */

const Combat = {
  selectedApproach: null,
  enemyHP: 0,
  playerHP: 0,
  difficulty: 3,

  /** Inicia o modal de combate */
  start(data) {
    this.selectedApproach = null;
    this.difficulty = data.difficulty || 3;
    this.enemyHP = this.difficulty * 25;
    this.playerHP = Engine.state.stats.hp;

    const stars = '★'.repeat(this.difficulty) + '☆'.repeat(5 - this.difficulty);

    document.getElementById('combat-title').textContent =
      data.enemy || 'Confronto!';
    document.getElementById('combat-difficulty').innerHTML =
      `Dificuldade: <span style="color:var(--accent)">${stars}</span>`;
    document.getElementById('combat-description').textContent =
      data.description || 'Um inimigo bloqueia seu caminho.';

    document.getElementById('dice-container').style.display = 'none';
    document.getElementById('combat-submit').style.display = 'none';
    document.getElementById('combat-result').classList.remove('show');
    document.getElementById('combat-result').innerHTML = '';

    // Reseta botões
    document.querySelectorAll('.approach-btn').forEach(btn => {
      btn.classList.remove('selected');
      btn.disabled = false;
    });

    document.getElementById('combat-modal').classList.add('active');
  },

  /** Seleciona abordagem */
  selectApproach(btn) {
    document.querySelectorAll('.approach-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    this.selectedApproach = btn.dataset.approach;
    document.getElementById('combat-submit').style.display = 'block';
  },

  /** Resolve o combate */
  resolve() {
    if (!this.selectedApproach) return;

    const diceContainer = document.getElementById('dice-container');
    const dice = document.getElementById('dice');
    const diceFace = document.getElementById('dice-face');
    const resultText = document.getElementById('dice-result-text');

    diceContainer.style.display = 'block';
    document.getElementById('combat-submit').style.display = 'none';

    // Animação do dado
    dice.classList.add('dice-rolling');
    diceFace.textContent = '?';

    setTimeout(() => {
      dice.classList.remove('dice-rolling');

      // Rolagem simulada
      const playerStat = this._getPlayerStat();
      const approachBonus = this._getApproachBonus();
      const traitBonus = this._getTraitBonus();
      const roll = Math.floor(Math.random() * 20) + 1;
      const total = roll + playerStat + approachBonus + traitBonus;
      const threshold = this.difficulty * 8;

      diceFace.textContent = roll;
      const won = total >= threshold;

      resultText.textContent = `Rolagem: ${roll} + ${playerStat} (stat) + ${approachBonus} (abordagem) + ${traitBonus} (traços) = ${total} vs ${threshold}`;

      const resultEl = document.getElementById('combat-result');
      if (won) {
        resultEl.innerHTML = `<strong style="color:#00e676">Vitória!</strong> Você supera o desafio com ${total} pontos.`;
        Engine.endCombat(true);
      } else {
        const damage = Math.floor((threshold - total) * 2);
        Engine.state.stats.hp = Math.max(0, Engine.state.stats.hp - damage);
        resultEl.innerHTML = `<strong style="color:#e53935">Derrota!</strong> Você sofreu ${damage} de dano. (Rolou ${total}, precisava de ${threshold})`;
        UI.updateStats();
        setTimeout(() => Engine.endCombat(false), 2000);
      }
      resultEl.classList.add('show');
    }, 900);
  },

  /** Obtém bônus do stat do jogador */
  _getPlayerStat() {
    const s = Engine.state;
    const stats = {
      forca: Math.floor(s.stats.hp / 20),
      inteligencia: 3,
      carisma: Math.floor(s.stats.rep / 20),
      furtividade: 2,
      tecnologia: s.techApproaches > 0 ? 3 : 1
    };
    return stats[this.selectedApproach] || 2;
  },

  /** Bônus da abordagem */
  _getApproachBonus() {
    const bonuses = {
      forca: 4, inteligencia: 3, carisma: 3, furtividade: 4, tecnologia: 3
    };
    return bonuses[this.selectedApproach] || 2;
  },

  /** Bônus de traços */
  _getTraitBonus() {
    const traitBonuses = {
      combatente: 2, corajoso: 1, astuto: 1, estrategista: 1,
      hacker: 1, justiceiro: 1, protegido: 1
    };
    return Engine.state.traits.reduce((sum, t) => sum + (traitBonuses[t] || 0), 0);
  }
};
