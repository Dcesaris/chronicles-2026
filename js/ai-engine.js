/**
 * ============================================
 * CHRONICLES 2026 — Motor de Narrativa com IA
 * Usa API OpenAI-compatible com fallback local
 * ============================================
 */

const AIEngine = {
  apiKey: null,
  baseUrl: 'http://localhost:20128/v1',
  model: 'Zeus-copy',
  enabled: false,

  /** Inicializa com API key */
  init(apiKey, baseUrl = 'http://localhost:20128/v1', model = 'Zeus-copy') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
    this.enabled = !!apiKey;
    console.log(`[AIEngine] ${this.enabled ? 'IA ativada' : 'Usando engine local'}`);
  },

  /** Gera resposta narrativa baseada na ação do jogador */
  async generateNarrative(context, action) {
    if (!this.enabled) return null;

    const systemPrompt = `Você é um mestre de RPG sandbox mundial ambientado em 2026.
O jogador é um líder mundial que pode tomar qualquer decisão.
Local atual: ${context.location || 'Mundo'}
País: ${context.country || 'Nenhum'}
Líder: ${context.leader || context.playerName} (${context.title || context.profession})
Tom da história: ${context.tone || 'neutro'}
Nível de restrição: ${context.difficulty || 'normal'}

Responda com uma narração breve (2-4 parágrafos) em português do Brasil.
Seja realista baseado no nível de restrição:
- Arcade: consequências leves, mundo maleável
- Normal: consequências proporcionais
- Hardcore: consequências severas, realismo máximo
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
          max_tokens: 600,
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
