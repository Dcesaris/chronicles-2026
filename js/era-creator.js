/**
 * ============================================
 * CHRONICLES 2026 — Sistema de Criador de Eras
 * Digite qualquer era e a IA cria o cenário
 * Ex: "EUA 1986", "Brasil 1964", "URSS 1991"
 * ============================================
 */

const EraCreator = {
  /** Cria cenário a partir de comando IA */
  async createEra(command) {
    const prompt = `Você é um criador de cenários de RPG histórico. O jogador digitou: "${command}"

Crie um cenário completo de RPG sandbox baseado nesta era/ano/lugar. Responda SOMENTE com JSON válido:

{
  "name": "Nome do cenário",
  "year": ano em números,
  "location": "país/região",
  "date": "data inicial no formato YYYY-MM-DD",
  "description": "Descrição de 2-3 frases do contexto histórico",
  "leaders": [
    {"name": "Nome", "title": "Cargo", "emoji": "👤"}
  ],
  "events": ["evento 1", "evento 2", "evento 3"],
  "atmosphere": "tom da era (ex: tensa, otimista, caótica)",
  "startingStats": {"influence": 50, "resources": 50, "morale": 50}
}

Regras:
- Seja preciso historicamente
- Inclua líderes reais da época
- Cite eventos reais relevantes
- Se o comando for ambíguo, escolhe o mais provável
- Responda APENAS com JSON, sem explicações`;

    const response = await AIEngine.generateNarrative({}, prompt);
    if (response) {
      try {
        // Extrai JSON da resposta
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const era = JSON.parse(jsonMatch[0]);
          return era;
        }
      } catch (e) { /* fallback */ }
    }
    return null;
  },

  /** Gera abertura da era criada */
  async generateEraOpening(era, playerData) {
    const prompt = `Você é um mestre de RPG sandbox histórico.

ERA CRIADA: ${era.name} (${era.year})
LOCAL: ${era.location}
DATA: ${era.date}
ATMOSFERA: ${era.atmosphere}

Líderes: ${era.leaders.map(l => `${l.name} (${l.title})`).join(', ')}

Eventos da época: ${era.events.join(', ')}

O jogador é ${playerData.playerName}, ${playerData.profession || 'líder'}, com traços: ${playerData.traits.join(', ') || 'nenhum'}.

Gere uma abertura imersiva (3-4 parágrafos) que:
1. Descreva a cena no dia inicial da era
2. Mostre o contexto político/social da época
3. Apresente um desafio ou oportunidade imediata
4. Seja em português do Brasil, estilo narrativa histórica

FORMATO OBRIGATÓRIO:
[NARRATIVA]
<texto>
[/NARRATIVA]

[OPÇÕES]
1. <ação 1>
2. <ação 2>
3. <ação 3>
[/OPÇÕES]`;

    const response = await AIEngine.generateNarrative({ era, playerData }, prompt);
    return response;
  },

  /** Sugestões de eras populares */
  getSuggestions() {
    return [
      '🇺🇸 EUA 1969 — Apollo 11, Guerra do Vietnã',
      '🇧🇷 Brasil 1964 — Golpe militar, Ditadura',
      '🇷🇺 URSS 1991 — Colapso soviético',
      '🇩🇪 Alemanha 1939 — Início da WWII',
      '🇬🇧 Reino Unido 1940 — Churchill, Blitz',
      '🇨🇳 China 1949 — Revolução Comunista',
      '🇫🇷 França 1789 — Revolução Francesa',
      '🇯🇵 Japão 1945 — Rendição, ocupação',
      '🇺🇸 EUA 1963 — JFK, Direitos Civis',
      '🇧🇷 Brasil 1988 — Nova Constituição',
      '🇺🇸 EUA 1929 — Crash da Bolsa, Grande Depressão',
      '🇬🇧 Reino Unido 1066 — Batalha de Hastings',
      '🇮🇹 Itália 1861 — Unificação Italiana',
      '🇺🇸 EUA 2001 — 11 de Setembro',
      '🇧🇷 Brasil 2013 — Protestos de Junho'
    ];
  }
};
