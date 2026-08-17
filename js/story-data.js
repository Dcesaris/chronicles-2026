/**
 * ============================================
 * CHRONICLES 2026 — Banco de Dados Global
 * Somente dados globais, sem cenários fixos
 * ============================================
 */

// =============================================
// TRAÇOS DISPONÍVEIS
// =============================================
const TRAITS = [
  { id: 'corajoso', label: 'Corajoso', icon: '🦁' },
  { id: 'cautela', label: 'Cauteloso', icon: '🛡️' },
  { id: 'astuto', label: 'Astuto', icon: '🦊' },
  { id: 'justiceiro', label: 'Justiceiro', icon: '⚖️' },
  { id: 'protetor', label: 'Protetor', icon: '💪' },
  { id: 'investigador', label: 'Investigador', icon: '🔍' },
  { id: 'estrategista', label: 'Estrategista', icon: '♟️' },
  { id: 'corrompido', label: 'Corrompido', icon: '💀' },
  { id: 'isolado', label: 'Isolado', icon: '🌑' },
  { id: 'solidario', label: 'Solidário', icon: '❤️' },
  { id: 'impulsivo', label: 'Impulsivo', icon: '⚡' },
  { id: 'paciente', label: 'Paciente', icon: '🐢' }
];

// =============================================
// CONQUISTAS
// =============================================
const ACHIEVEMENTS = [
  { id: 'first_step', name: 'Primeiro Passo', desc: 'Inicie seu primeiro jogo', icon: '👣', check: (s) => s.turnNumber > 1 },
  { id: 'worldshaper', name: 'Modelador do Mundo', desc: 'Jogue por 30 turnos', icon: '🌍', check: (s) => s.turnNumber >= 30 },
  { id: 'diplomat', name: 'Diplomata', desc: 'Alcance relation +50 com um NPC', icon: '🤝', check: (s) => s.maxNPCRelations >= 50 },
  { id: 'tyrant', name: 'Tiranno', desc: 'Alcance relation -50 com um NPC', icon: '👑', check: (s) => s.maxNPCRelations <= -50 },
  { id: 'explorer', name: 'Explorador', desc: 'Visite 10 localizações diferentes', icon: '🗺️', check: (s) => s.visitedLocationsCount >= 10 },
  { id: 'influencer', name: 'Influenciador', desc: 'Alcance Influence 80+', icon: '📢', check: (s) => s.stats?.influence >= 80 },
  { id: 'rich', name: 'Magnata', desc: 'Acumule 2000+ recursos', icon: '💰', check: (s) => s.stats?.resources >= 2000 },
  { id: 'survivor', name: 'Sobrevivente', desc: 'Sobreviva a 50 turnos', icon: '💀', check: (s) => s.turnNumber >= 50 },
  { id: 'creator', name: 'Criador de Eras', desc: 'Crie um cenário via IA', icon: '✨', check: (s) => s.erasCreated >= 1 },
  { id: 'historian', name: 'Historiador', desc: 'Jogue em 3 eras diferentes', icon: '📜', check: (s) => s.erasPlayed >= 3 },
  { id: 'conqueror', name: 'Conquistador', desc: 'Declare guerra a 3 países', icon: '⚔️', check: (s) => (s.warsDeclared || 0) >= 3 },
  { id: 'peacemaker', name: 'Pacificador', desc: 'Faça paz com 5 inimigos', icon: '🕊️', check: (s) => (s.peaceTreaties || 0) >= 5 }
];

// =============================================
// NPCs GLOBAIS (genéricos, reaproveitáveis)
// =============================================
const NPC_DATA = [
  {
    id: 'advisor',
    name: 'Consultor',
    emoji: '👔',
    role: 'Assessor',
    personality: 'astuto',
    location: { lat: 0, lng: 0 },
    relation: 20,
    allegiance: 'aliado',
    description: 'Seu principal assessor. Sempre presente.',
    routes: [{ lat: 0, lng: 0 }],
    currentRouteIndex: 0
  },
  {
    id: 'rival',
    name: 'Rival',
    emoji: '😤',
    role: 'Opositor',
    personality: 'agressivo',
    location: { lat: 0, lng: 0 },
    relation: -30,
    allegiance: 'inimigo',
    description: 'Seu rival político. Quer seu lugar.',
    routes: [{ lat: 0, lng: 0 }],
    currentRouteIndex: 0
  },
  {
    id: 'spy',
    name: 'Espião',
    emoji: '🕵️',
    role: 'Informante',
    personality: 'traiçoeiro',
    location: { lat: 0, lng: 0 },
    relation: 0,
    allegiance: 'neutro',
    description: 'Ninguém sabe em quem confiar.',
    routes: [{ lat: 0, lng: 0 }],
    currentRouteIndex: 0
  },
  {
    id: 'journalist_npc',
    name: 'Repórter',
    emoji: '📰',
    role: 'Jornalista',
    personality: 'investigador',
    location: { lat: 0, lng: 0 },
    relation: 10,
    allegiance: 'neutro',
    description: 'Sempre buscando a próxima história.',
    routes: [{ lat: 0, lng: 0 }],
    currentRouteIndex: 0
  },
  {
    id: 'general',
    name: 'General',
    emoji: '🎖️',
    role: 'Comandante Militar',
    personality: 'disciplinado',
    location: { lat: 0, lng: 0 },
    relation: 0,
    allegiance: 'neutro',
    description: 'Comanda as forças armadas. Leal ao estado, não a você.',
    routes: [{ lat: 0, lng: 0 }],
    currentRouteIndex: 0
  }
];

// =============================================
// LOCATIONS GLOBAIS (populados pelo global-scenarios.js)
// =============================================
const LOCATIONS = {};

// =============================================
// CENÁRIOS (será populado pelo global-scenarios.js)
// =============================================
const SCENARIOS = [];
