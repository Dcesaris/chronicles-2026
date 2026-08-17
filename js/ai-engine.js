/**
 * ============================================
 * CHRONICLES 2026 — Motor de Narrativa com IA
 * Usa API OpenAI-compatible com fallback local
 * ============================================
 */

const AIEngine = {
  apiKey: null,
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  enabled: false,

  /** Inicializa com API key */
  init(apiKey, baseUrl = 'https://api.openai.com/v1', model = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
    this.enabled = !!apiKey;
    console.log(`[AIEngine] ${this.enabled ? 'IA ativada' : 'Usando engine local'}`);
  },

  /** Gera resposta narrativa baseada na ação do jogador */
  async generateNarrative(context, action) {
    if (!this.enabled) return null;

    const systemPrompt = `Você é um mestre de RPG sandbox ambientado em São Paulo, 2026.
O jogador está em ${context.location || 'São Paulo'}.
Traços do personagem: ${context.traits || 'nenhum'}.
Histórico recente: ${context.recentEvents || 'início da aventura'}.
Tom da história: ${context.tone || 'neutro'}.

Responda com uma narração breve (2-4 parágrafos) em português do Brasil.
Inclua opções de ação numeradas no final.
NUNCA revele que é uma IA. Mantenha imersão total.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: action }
          ],
          max_tokens: 500,
          temperature: 0.8
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.error('[AIEngine] Erro:', err);
      return null;
    }
  },

  /** Gera diálogos de NPCs */
  async generateNPCDialogue(npc, playerAction, relation) {
    if (!this.enabled) return null;

    const persona = {
      gareth: 'hacker deserador da Sentinela, desconfiado mas leal',
      lyra: 'líder estudantil revolucionária, apaixonada',
      viktor: 'chefe de segurança mercenário, frio e calculista',
      rafael: 'ativista do morro, desesperado mas esperançoso',
      'dona_celia': 'velha faxineira sábia, mãe de bairro',
      prefeito: 'político carismático mas corrupto'
    };

    const prompt = `${npc.name} (${persona[npc.id] || 'NPC'}) está reagindo a: "${playerAction}"
Relação com jogador: ${relation > 0 ? 'positiva (' + relation + ')' : relation < 0 ? 'negativa (' + relation + ')' : 'neutra'}.
Gere um diálogo curto e imersivo em português.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'Você é um NPC em um RPG de São Paulo 2026. Fale como seu personagem, nunca quebre a quarta parede.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
          temperature: 0.9
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.error('[AIEngine] Erro no diálogo:', err);
      return null;
    }
  },

  /** Gera headline de notícia */
  async generateNews(event) {
    if (!this.enabled) return null;
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'Você é um jornalista de São Paulo em 2026. Gere apenas o título da manchete, sem explicações.' },
            { role: 'user', content: `Gere uma manchete de jornal sobre: ${event}` }
          ],
          max_tokens: 80,
          temperature: 0.7
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch { return null; }
  },

  /** Verifica se a API está funcionando */
  async healthCheck() {
    if (!this.enabled) return false;
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return response.ok;
    } catch { return false; }
  }
};
