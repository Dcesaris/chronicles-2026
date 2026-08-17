/**
 * ============================================
 * CHRONICLES 2026 — Global Sandbox Scenarios
 * Todos os países do mundo com líderes em Jan 2026
 * O jogador pode escolher qualquer líder e reshaped a história
 * ============================================
 */

const GLOBAL_COUNTRIES = {
  'north-america': {
    label: '🌎 América do Norte',
    countries: [
      {
        id: 'usa',
        name: 'Estados Unidos',
        capital: 'Washington, D.C.',
        leader: { name: 'Donald Trump', title: 'Presidente' },
        coords: { lat: 38.9072, lng: -77.0369 },
        description: 'A superpotência em transformação. Polarização extrema, guerra comercial com a China, e uma base industrial que busca renascer.',
        startingStats: { influence: 90, morale: 45, resources: 95, network: 85 },
        theme: 'usa',
        difficulty: 'Difícil',
        timeEstimate: '90-120 min',
        news: ['Trump anuncia nova tarifa de 25% sobre importações chinesas', 'Estados Unidos retiram-se de acordo climático global', 'Wall Street em alta histórica após corte de impostos']
      },
      {
        id: 'canada',
        name: 'Canadá',
        capital: 'Ottawa',
        leader: { name: 'Justin Trudeau', title: 'Primeiro-Ministro' },
        coords: { lat: 45.4215, lng: -75.6972 },
        description: 'O aliado mais próximo dos EUA, mas cada vez mais busca independência. Crise habitacional, tensões com Quebec, e recursos naturais abundantes.',
        startingStats: { influence: 55, morale: 60, resources: 70, network: 60 },
        theme: 'canada',
        difficulty: 'Médio',
        timeEstimate: '60-80 min',
        news: ['Canadá impõe tarifas sobre produtos agrícolas americanos', 'Protestos em Toronto contra política de imigração', 'Descoberta de jazida de lítio no Território do Noroeste']
      },
      {
        id: 'mexico',
        name: 'México',
        capital: 'Cidade do México',
        leader: { name: 'Claudia Sheinbaum', title: 'Presidenta' },
        coords: { lat: 19.4326, lng: -99.1332 },
        description: 'A nação que se tornou a quarta maior economia das Américas. Maquiladoras boom, guerra contra cartéis, e tensões com Washington.',
        startingStats: { influence: 50, morale: 55, resources: 60, network: 45 },
        theme: 'mexico',
        difficulty: 'Difícil',
        timeEstimate: '60-80 min',
        news: ['Sheinbaum inaugura maior complexo industrial de manufatura da América Latina', 'Cartel CJNG declara guerra aberta ao governo', 'Terminal de GNL na Baja California começa operações']
      }
    ]
  },
  'south-america': {
    label: '🌎 América do Sul',
    countries: [
      {
        id: 'brazil',
        name: 'Brasil',
        capital: 'Brasília',
        leader: { name: 'Luiz Inácio Lula da Silva', title: 'Presidente' },
        coords: { lat: -15.7975, lng: -47.8919 },
        description: 'O gigante adormecido? Lula retorna com promessa de crescimento sustentável, mas desafios enormes: dívida pública, desmatamento, e polarização.',
        startingStats: { influence: 60, morale: 55, resources: 55, network: 50 },
        theme: 'brazil',
        difficulty: 'Médio',
        timeEstimate: '70-100 min',
        news: ['Lula anuncia programa de infraestrutura de R$500 bi', 'Desmatamento da Amazônia cai 30% no último trimestre', 'Brasil sedia cúpula do BRICS+ em São Paulo']
      },
      {
        id: 'argentina',
        name: 'Argentina',
        capital: 'Buenos Aires',
        leader: { name: 'Javier Milei', title: 'Presidente' },
        coords: { lat: -34.6037, lng: -58.3816 },
        description: 'O "demolição" no poder. Hiperinflação, AIE (ajuste interno por esgarçamento), e uma reforma estatal sem precedentes.',
        startingStats: { influence: 35, morale: 30, resources: 25, network: 30 },
        theme: 'argentina',
        difficulty: 'Hard',
        timeEstimate: '80-110 min',
        news: ['Peso argentino desvaloriza mais 40% após novo pacote econômico', 'Milei decreta estado de sítio econômico por 180 dias', 'FMI aprova novo crédito de US$20 bi para Argentina']
      },
      {
        id: 'chile',
        name: 'Chile',
        capital: 'Santiago',
        leader: { name: 'Gabriel Boric', title: 'Presidente' },
        coords: { lat: -33.4489, lng: -70.6693 },
        description: 'O laboratório progresista da América do Sul. Reforma constitucional, direitos indígenas, e a corrida pelo lítio que alimenta o mundo.',
        startingStats: { influence: 50, morale: 55, resources: 55, network: 55 },
        theme: 'chile',
        difficulty: 'Médio',
        timeEstimate: '50-70 min',
        news: ['Chile aprova nova constituição com direitos da natureza', 'Produção de lítio triplica com investimento chinês', 'Protestos estudantis exigem educação gratuita']
      },
      {
        id: 'colombia',
        name: 'Colômbia',
        capital: 'Bogotá',
        leader: { name: 'Gustavo Petro', title: 'Presidente' },
        coords: { lat: 4.7110, lng: -74.0721 },
        description: 'A Colômbia transita da guerra para a paz — ou não. Petro avança com reformas agrárias e energéticas, mas FARC dissidentes permanecem.',
        startingStats: { influence: 40, morale: 40, resources: 45, network: 40 },
        theme: 'colombia',
        difficulty: 'Médio',
        timeEstimate: '55-75 min',
        news: ['Petro anuncia transição energética: fim de novas perfurações de petróleo', 'Acordo de paz com dissidentes da FARC entra em colapso', 'Bogotá sedia conferência internacional sobre amazônia']
      },
      {
        id: 'venezuela',
        name: 'Venezuela',
        capital: 'Caracas',
        leader: { name: 'Nicolás Maduro', title: 'Presidente' },
        coords: { lat: 10.4806, lng: -66.9036 },
        description: 'O colapso que não acaba. Sanções, crise humanitária, e uma ditadura que se mantém pelo petróleo e pela lealdade militar.',
        startingStats: { influence: 25, morale: 15, resources: 35, network: 20 },
        theme: 'venezuela',
        difficulty: 'Hard',
        timeEstimate: '70-90 min',
        news: ['Maduro anuncia nova moeda digital do petróleo', 'Crise humanitária se intensifica: 7 milhões de venezuelanos no exterior', 'EUA flexibilizam sanções em troca de eleições']
      },
      {
        id: 'peru',
        name: 'Peru',
        capital: 'Lima',
        leader: { name: 'Dina Boluarte', title: 'Presidenta' },
        coords: { lat: -12.0464, lng: -77.0428 },
        description: 'Instabilidade política crônica. Boluarte governa com apoio parlamentar frágil, protestos frequentes, e uma oposição que não cala.',
        startingStats: { influence: 30, morale: 35, resources: 40, network: 30 },
        theme: 'peru',
        difficulty: 'Difícil',
        timeEstimate: '60-80 min',
        news: ['Peru enfrenta nova onda de protestos contra governo Boluarte', 'Mineração de cobre atrai investimento chinês bilionário', 'Lima declara estado de emergência após enchentes']
      },
      {
        id: 'ecuador',
        name: 'Equador',
        capital: 'Quito',
        leader: { name: 'Daniel Noboa', title: 'Presidente' },
        coords: { lat: -0.1807, lng: -78.4678 },
        description: 'O presidente mais jovem das Américas. Enfrenta a violência do narcotráfico que transformou o Equador em hub de cocaína.',
        startingStats: { influence: 30, morale: 35, resources: 35, network: 25 },
        theme: 'ecuador',
        difficulty: 'Difícil',
        timeEstimate: '55-75 min',
        news: ['Noboa decreta "guerra interna" contra narcotráfico', 'Ecuador perde posto de maior exportador de bananas para Vietnam', 'Ilha de Galápagos enfrenta crise de turismo e conservação']
      },
      {
        id: 'uruguay',
        name: 'Uruguai',
        capital: 'Montevidéu',
        leader: { name: 'Yamandú Orsi', title: 'Presidente' },
        coords: { lat: -34.9011, lng: -56.1645 },
        description: 'O Suíça sul-americano. Estabilidade democrática, mas pressão de vizinhos mais populosos e uma economia pequena mas resiliente.',
        startingStats: { influence: 25, morale: 65, resources: 40, network: 35 },
        theme: 'uruguay',
        difficulty: 'Fácil',
        timeEstimate: '40-60 min',
        news: ['Uruguai se torna hub de data centers na América do Sul', 'Orsi propõe referendo sobre legalização de cannabis', 'Montevidéu sedia cúpula do Mercosul-EU']
      }
    ]
  },
  'europe': {
    label: '🌍 Europa',
    countries: [
      {
        id: 'uk',
        name: 'Reino Unido',
        capital: 'Londres',
        leader: { name: 'Keir Starmer', title: 'Primeiro-Ministro' },
        coords: { lat: 51.5074, lng: -0.1278 },
        description: 'O Brexit atingiu seu fundo? Starmer promete "refazer a britânia", mas NHS em colapso, Grande Londres em crise habitacional, e Escócia cada vez mais independente.',
        startingStats: { influence: 70, morale: 50, resources: 65, network: 75 },
        theme: 'uk',
        difficulty: 'Médio',
        timeEstimate: '60-80 min',
        news: ['Starmer anuncia plano de R$200 bi para NHS', 'Escócia marca novo referendo de independência para 2027', 'Londres sedia cúpula NATO com foco em Ucrânia']
      },
      {
        id: 'france',
        name: 'França',
        capital: 'Paris',
        leader: { name: 'Emmanuel Macron', title: 'Presidente' },
        coords: { lat: 48.8566, lng: 2.3522 },
        description: 'Macron em seu segundo mandato. Reforma previdenciária impopular, pressão do FN/RN, e a ambição de fazer da França o líder europeu em defesa.',
        startingStats: { influence: 70, morale: 50, resources: 65, network: 70 },
        theme: 'france',
        difficulty: 'Médio',
        timeEstimate: '60-80 min',
        news: ['Macron propõe "Europa dos 27" com exército comum', 'Greve geral paralisa França por 3º dia consecutivo', 'Paris 2028: preparativos entram em crise por falta de verba']
      },
      {
        id: 'germany',
        name: 'Alemanha',
        capital: 'Berlim',
        leader: { name: 'Olaf Scholz', title: 'Chanceler' },
        coords: { lat: 52.5200, lng: 13.4050 },
        description: 'O motor europeu engasga. Crise energética pós-Rússia, ascensão da AfD, e a disputa por liderar a transição verde da Europa.',
        startingStats: { influence: 75, morale: 55, resources: 75, network: 70 },
        theme: 'germany',
        difficulty: 'Médio',
        timeEstimate: '60-80 min',
        news: ['Scholz anuncia pacote de R$150 bi para indústria alemã', 'AfD atinge 22% nas pesquisas — maior nível desde 1933', 'Berlim sedia conferência climática com líderes globais']
      },
      {
        id: 'italy',
        name: 'Itália',
        capital: 'Roma',
        leader: { name: 'Giorgia Meloni', title: 'Primeira-Ministra' },
        coords: { lat: 41.9028, lng: 12.4964 },
        description: 'A primeira mulher premier da Itália. Direita nacional no poder, mas presidiendo uma das economias mais problemáticas da Zona Euro.',
        startingStats: { influence: 50, morale: 45, resources: 50, network: 50 },
        theme: 'italy',
        difficulty: 'Difícil',
        timeEstimate: '55-75 min',
        news: ['Meloni enfrenta protestos massivos em Roma contra políticas de imigração', 'Dívida italiana atinge 145% do PIB', 'Roma sedia encontro do G7 com foco em Inflação e clima']
      },
      {
        id: 'spain',
        name: 'Espanha',
        capital: 'Madrid',
        leader: { name: 'Pedro Sánchez', title: 'Primeiro-Ministro' },
        coords: { lat: 40.4168, lng: -3.7038 },
        description: 'Espanha navega entre separatismo catalão, turismo em crise, e a ambição de se tornar capital europeia de energias renováveis.',
        startingStats: { influence: 45, morale: 55, resources: 50, network: 45 },
        theme: 'spain',
        difficulty: 'Médio',
        timeEstimate: '50-70 min',
        news: ['Sánchez aprova lei histórica de transparência empresarial', 'Catalunha explode: novos protestos pela independência', 'Espanha se torna maior produtor de energia solar da Europa']
      },
      {
        id: 'russia',
        name: 'Rússia',
        capital: 'Moscou',
        leader: { name: 'Vladimir Putin', title: 'Presidente' },
        coords: { lat: 55.7558, lng: 37.6173 },
        description: 'O império em declínio? Putin enfrenta guerra na Ucrânia, sanções sem precedentes, e uma elite que começa a questionar o custo.',
        startingStats: { influence: 65, morale: 40, resources: 55, network: 50 },
        theme: 'russia',
        difficulty: 'Difícil',
        timeEstimate: '80-110 min',
        news: ['Putin anuncia mobilização parcial na Ucrânia', 'Rússia expande comércio em YUAN — sanções perdem efeito', 'Oligarcas russos disputam sucessão em reuniões secretas']
      },
      {
        id: 'ukraine',
        name: 'Ucrânia',
        capital: 'Kyiv',
        leader: { name: 'Volodymyr Zelenskyy', title: 'Presidente' },
        coords: { lat: 50.4501, lng: 30.5234 },
        description: 'Oherói que se tornou presidente. Zelenskyy lidera uma nação em guerra, buscando apoio ocidental enquanto o front se arrasta.',
        startingStats: { influence: 40, morale: 60, resources: 20, network: 55 },
        theme: 'ukraine',
        difficulty: 'Hard',
        timeEstimate: '90-120 min',
        news: ['Zelenskyy solicita 100 bilhões em ajuda ocidental', 'Kyiv sofre maior ataque aéreo do ano', 'Ucrânia firma acordo histórico de lítio com EUA']
      },
      {
        id: 'turkey',
        name: 'Turquia',
        capital: 'Ancara',
        leader: { name: 'Recep Tayyip Erdoğan', title: 'Presidente' },
        coords: { lat: 39.9334, lng: 32.8597 },
        description: 'O sultão da Anatólia. Erdoğan consolidou poder absoluto, mas a lira despenca, a influência regional é contestada, e a oposição renasce.',
        startingStats: { influence: 50, morale: 45, resources: 40, network: 55 },
        theme: 'turkey',
        difficulty: 'Difícil',
        timeEstimate: '65-85 min',
        news: ['Erdoğan vence eleições antecipadas com 52% dos votos', 'Lira turca atinge novo mínimo histórico', 'Turquia mediadora entre Rússia e Ucrânia']
      },
      {
        id: 'poland',
        name: 'Polônia',
        capital: 'Varsóvia',
        leader: { name: 'Donald Tusk', title: 'Primeiro-Ministro' },
        coords: { lat: 52.2297, lng: 21.0122 },
        description: 'A Polônia restaura sua democracia europeia. Tusk retorna para consolidar instituições, mas o PIB cresce e o país se torna potência regional.',
        startingStats: { influence: 45, morale: 60, resources: 50, network: 50 },
        theme: 'poland',
        difficulty: 'Médio',
        timeEstimate: '50-70 min',
        news: ['Tusk firma acordo de defesa com EUA: 3.000 tropas americanas na Polônia', 'Varsóvia sedia cúpula da Europa Central', 'Polônia se torna maior produtora de energia eólica da UE']
      },
      {
        id: 'sweden',
        name: 'Suécia',
        capital: 'Estocolmo',
        leader: { name: 'Ulf Kristersson', title: 'Primeiro-Ministro' },
        coords: { lat: 59.3293, lng: 18.0686 },
        description: 'A Suécia, agora NATO, busca seu lugar no novo norte da Europa. Inovação tecnológica, mas tensões com a Rússia e integração militar.',
        startingStats: { influence: 45, morale: 70, resources: 55, network: 50 },
        theme: 'sweden',
        difficulty: 'Fácil',
        timeEstimate: '45-65 min',
        news: ['Suécia inaugura maior base militar da NATO fora dos EUA', 'Estocolmo se torna hub de IA na Europa', 'Crise habitacional debate no parlamento sueco']
      }
    ]
  },
  'asia': {
    label: '🌏 Ásia',
    countries: [
      {
        id: 'china',
        name: 'China',
        capital: 'Pequim',
        leader: { name: 'Xi Jinping', title: 'Secretário-Geral / Presidente' },
        coords: { lat: 39.9042, lng: 116.4074 },
        description: 'O dragão desperta. Xi consolidou poder total, mas a China enfrenta crise imobiliária, desemprego juvenil, e confronto com o Ocidente.',
        startingStats: { influence: 90, morale: 55, resources: 85, network: 80 },
        theme: 'china',
        difficulty: 'Difícil',
        timeEstimate: '90-120 min',
        news: ['Xi anuncia nova estratégia "Dual Circulation" para economia', 'Hong Kong entra em nova era de protestos silenciosos', 'China lança missão tripulada à Lua para 2030']
      },
      {
        id: 'japan',
        name: 'Japão',
        capital: 'Tóquio',
        leader: { name: 'Fumio Kishida', title: 'Primeiro-Ministro' },
        coords: { lat: 35.6762, lng: 139.6503 },
        description: 'O sol nascente enfraquece. Envelhecimento populacional, yen fracassado, mas o Japão se reinventa como potência tecnológica e de semicondutores.',
        startingStats: { influence: 65, morale: 60, resources: 70, network: 70 },
        theme: 'japan',
        difficulty: 'Médio',
        timeEstimate: '60-80 min',
        news: ['Japão anuncia plano de R$300 bi para semicondutores', 'Tóquio enfrenta tremores sequenciais de magnitude 7+', 'Yen atinge menor nível em 30 anos frente ao dólar']
      },
      {
        id: 'india',
        name: 'Índia',
        capital: 'Nova Déli',
        leader: { name: 'Narendra Modi', title: 'Primeiro-Ministro' },
        coords: { lat: 28.6139, lng: 77.2090 },
        description: 'A potência que não para. Índia cresce a 7% ao ano, mas pobreza, tensões religiosas, e uma democracia sob pressão.',
        startingStats: { influence: 70, morale: 55, resources: 55, network: 60 },
        theme: 'india',
        difficulty: 'Médio',
        timeEstimate: '70-90 min',
        news: ['Índia lança missão tripulada ao espaço com sucesso', 'Modi inicia terceiro mandato com promessa de "Nova Índia"', 'Déli sedia G20 com foco em Sul Global']
      },
      {
        id: 'south-korea',
        name: 'Coreia do Sul',
        capital: 'Seul',
        leader: { name: 'Yoon Suk Yeol', title: 'Presidente' },
        coords: { lat: 37.5665, lng: 126.9780 },
        description: 'A Coreia vive em tensão permanente. Yoon aposta em alinhamento com EUA, mas a peninsula ameaça conflito a qualquer momento.',
        startingStats: { influence: 55, morale: 50, resources: 65, network: 60 },
        theme: 'south-korea',
        difficulty: 'Difícil',
        timeEstimate: '65-85 min',
        news: ['Coreia do Sul desperta alerta de mísseis: Pyongyang realiza teste', 'Seul se torna capital global de K-content e IA', 'Yoon enfrenta maior protestos da história do país']
      },
      {
        id: 'iran',
        name: 'Irã',
        capital: 'Teerã',
        leader: { name: 'Ebrahim Raisi', title: 'Presidente' },
        coords: { lat: 35.6892, lng: 51.3890 },
        description: 'A república islâmica em colapso silencioso. Sanções, protestos por direitos das mulheres, e a procura por armas nucleares.',
        startingStats: { influence: 40, morale: 30, resources: 45, network: 35 },
        theme: 'iran',
        difficulty: 'Hard',
        timeEstimate: '70-90 min',
        news: ['Irã enriquece urânio a 60% — linha vermelha do Ocidente', 'Teerã enfrenta protestos massivos por direitos das mulheres', 'Irã firma acordo estratégico de 25 anos com China']
      },
      {
        id: 'israel',
        name: 'Israel',
        capital: 'Jerusalém',
        leader: { name: 'Benjamin Netanyahu', title: 'Primeiro-Ministro' },
        coords: { lat: 31.7683, lng: 35.2137 },
        description: 'O Estado judeu em guerra permanente. Netanyahu enfrenta múltiplas frentes: Hamas, Hezbollah, Irã, e protestos internos por reféns.',
        startingStats: { influence: 60, morale: 50, resources: 55, network: 65 },
        theme: 'israel',
        difficulty: 'Hard',
        timeEstimate: '80-100 min',
        news: ['Netanyahu anuncia operação militar ampliada em Gaza', 'Israel e Arábia Saudita iniciam negociações secretas', 'Tech startup israelense desenvolve IA defensiva']
      },
      {
        id: 'saudi-arabia',
        name: 'Arábia Saudita',
        capital: 'Riyad',
        leader: { name: 'Mohammed bin Salman', title: 'Correeiro Príncipe' },
        coords: { lat: 24.7136, lng: 46.6753 },
        description: 'MBS transforma a Arábia Saudita. Vision 2030, NEOM, futebol, e repressão. Um país tentando se reinventar enquanto queima petróleo.',
        startingStats: { influence: 55, morale: 40, resources: 70, network: 50 },
        theme: 'saudi',
        difficulty: 'Difícil',
        timeEstimate: '60-80 min',
        news: ['MBS inaugura primeira fase do NEOM, a cidade do futuro', 'Arábia Saudita atinge record de produção de petróleo', 'Riyad sedia encontro histórico Israel-Saudi']
      },
      {
        id: 'uae',
        name: 'Emirados Árabes Unidos',
        capital: 'Abu Dhabi',
        leader: { name: 'Mohamed bin Zayed', title: 'Presidente' },
        coords: { lat: 24.4539, lng: 54.3773 },
        description: 'A Dubaiização do mundo. Emirados são o hub de negócios do Oriente Médio, com influência crescente e diplomacia pragmática.',
        startingStats: { influence: 50, morale: 60, resources: 60, network: 65 },
        theme: 'uae',
        difficulty: 'Fácil',
        timeEstimate: '40-60 min',
        news: ['Emirados anunciam plano de R$50 bi para energia solar', 'Abu Dhabi se torna hub de IA e fintech do Médio Oriente', 'UAE media paz entre Arábia Saudita e Irã']
      },
      {
        id: 'pakistan',
        name: 'Paquistão',
        capital: 'Islamabad',
        leader: { name: 'Shehbaz Sharif', title: 'Primeiro-Ministro' },
        coords: { lat: 33.6844, lng: 73.0479 },
        description: 'O gigante nuclear em perigo. Colapso econômico, tensões com a Índia, e o constante risco de radicalização.',
        startingStats: { influence: 35, morale: 25, resources: 30, network: 30 },
        theme: 'pakistan',
        difficulty: 'Hard',
        timeEstimate: '70-90 min',
        news: ['Paquistão pede resgate do FMI de US$3 bi', 'Islamabad enfrenta enchentes devastadoras', 'Exército paquistanês aumenta vigilância na fronteira com Índia']
      },
      {
        id: 'indonesia',
        name: 'Indonésia',
        capital: 'Jacarta',
        leader: { name: 'Joko Widodo', title: 'Presidente' },
        coords: { lat: -6.2088, lng: 106.8456 },
        description: 'O Elefante Asiático. A maior economia do Sudeste Asiático, mas enfrentando desmatamento, corrupção, e a disputa pela nova capital.',
        startingStats: { influence: 50, morale: 55, resources: 45, network: 50 },
        theme: 'indonesia',
        difficulty: 'Médio',
        timeEstimate: '55-75 min',
        news: ['Indonésia inaugura nova capital Nusantara na Borneo', 'Widodo firma acordo de mineração de níquel com China', 'Jacarta afunda 25cm por ano — alerta de desastre']
      },
      {
        id: 'thailand',
        name: 'Tailândia',
        capital: 'Bangkok',
        leader: { name: 'Srettha Thavisin', title: 'Primeiro-Ministro' },
        coords: { lat: 13.7563, lng: 100.5018 },
        description: 'A Terra dos Sorrisos em turbulência. Monarquia poderosa, militares influentes, e uma juventude que exige reformas.',
        startingStats: { influence: 40, morale: 50, resources: 45, network: 40 },
        theme: 'thailand',
        difficulty: 'Médio',
        timeEstimate: '50-70 min',
        news: ['Tailândia libera pagamento de R$500 a todos os cidadãos', 'Bangkok enfrenta protestos estudantis por reformas monárquicas', 'Tailândia se torna hub de turismo médico da Ásia']
      },
      {
        id: 'vietnam',
        name: 'Vietnã',
        capital: 'Hanói',
        leader: { name: 'To Lam', title: 'Secretário-Geral do PCV' },
        coords: { lat: 21.0278, lng: 105.8342 },
        description: 'O novo工厂 do mundo. Vietnã atrai empresas que fogem da China, mas o regime comunista permanece firme.',
        startingStats: { influence: 40, morale: 60, resources: 40, network: 35 },
        theme: 'vietnam',
        difficulty: 'Fácil',
        timeEstimate: '45-65 min',
        news: ['Vietnã atrai US$30 bi em investimento direto estrangeiro', 'Hanói inaugura metrô após 15 anos de obra', 'Vietnã se torna maior exportador de arroz do mundo']
      }
    ]
  },
  'africa': {
    label: '🌍 África',
    countries: [
      {
        id: 'nigeria',
        name: 'Nigéria',
        capital: 'Abuja',
        leader: { name: 'Bola Tinubu', title: 'Presidente' },
        coords: { lat: 9.0765, lng: 7.3986 },
        description: 'O gigante africano tropeça. Tinubu remove subsídios de combustível, inflação explode, mas a Nigéria continua sendo a maior economia do continente.',
        startingStats: { influence: 55, morale: 30, resources: 45, network: 40 },
        theme: 'nigeria',
        difficulty: 'Difícil',
        timeEstimate: '65-85 min',
        news: ['Nigéria desvaloriza naira em 40% — impacto nos preços', 'Lagos se torna maior megacidade da África', 'Tinubu enfrenta protestos massivos em Abuja']
      },
      {
        id: 'south-africa',
        name: 'África do Sul',
        capital: 'Pretoria',
        leader: { name: 'Cyril Ramaphosa', title: 'Presidente' },
        coords: { lat: -33.9249, lng: 18.4241 },
        description: 'A nação do arco-íris em crise. Desigualdade extrema, escândalos de corrupção, mas uma democracia vibrante e uma economia diversa.',
        startingStats: { influence: 45, morale: 40, resources: 50, network: 45 },
        theme: 'south-africa',
        difficulty: 'Médio',
        timeEstimate: '55-75 min',
        news: ['África do Sul sedia COP30 com foco em transição justa', 'Ramaphosa anuncia pacote de R$100 bi para energia renovável', 'Protestos por emprego afetam Joanesburgo e Cidade do Cabo']
      },
      {
        id: 'egypt',
        name: 'Egito',
        capital: 'Cairo',
        leader: { name: 'Abdel Fattah el-Sisi', title: 'Presidente' },
        coords: { lat: 30.0444, lng: 31.2357 },
        description: 'O faraó moderno. Sisi governa com mão de ferro, mas o Egito enfrenta crise hídrica do Nilo, inflação, e pressão religiosa.',
        startingStats: { influence: 45, morale: 35, resources: 40, network: 40 },
        theme: 'egypt',
        difficulty: 'Difícil',
        timeEstimate: '60-80 min',
        news: ['Egito conclui nova capital administrativa no deserto', 'Sisi firma acordo com Etiópia sobre represa do Nilo', 'Cairo enfrenta protestos por aumento de preços']
      },
      {
        id: 'ethiopia',
        name: 'Etiópia',
        capital: 'Adis Abeba',
        leader: { name: 'Abiy Ahmed', title: 'Primeiro-Ministro' },
        coords: { lat: 9.0192, lng: 38.7525 },
        description: 'A Etiópia busca renascer. Abiy, prêmio Nobel da paz que perdeu, enfrenta guerra étnica, inflação, e a ambição de ser potência regional.',
        startingStats: { influence: 40, morale: 35, resources: 30, network: 35 },
        theme: 'ethiopia',
        difficulty: 'Hard',
        timeEstimate: '70-90 min',
        news: ['Etiópia inaugura barragem do Renascimento do Nilo', 'Abiy Ahmed enfrenta rebelião no Tigray e Amhara', 'Adis Abeba se torna sede da União Africana renovada']
      },
      {
        id: 'kenya',
        name: 'Quênia',
        capital: 'Nairóbi',
        leader: { name: 'William Ruto', title: 'Presidente' },
        coords: { lat: -1.2921, lng: 36.8219 },
        description: 'O Safari Digital. Quênia é hub tecnológico da África, mas Ruto enfrenta protestos por impostos e desigualdade.',
        startingStats: { influence: 40, morale: 45, resources: 35, network: 40 },
        theme: 'kenya',
        difficulty: 'Médio',
        timeEstimate: '50-70 min',
        news: ['Quênia se torna hub de tecnologia financeira da África', 'Ruto anuncia reforma tributária após protestos massivos', 'Nairóbi sedia conferência de IA da África']
      },
      {
        id: 'morocco',
        name: 'Marrocos',
        capital: 'Rabat',
        leader: { name: 'Mohammed VI', title: 'Rei' },
        coords: { lat: 34.0209, lng: -6.8416 },
        description: 'O Marrocos moderno. Mohammed VI moderniza o país, sedia Copa do Mundo 2030, mas dissidência no Saara Ocidental permanece.',
        startingStats: { influence: 40, morale: 55, resources: 40, network: 40 },
        theme: 'morocco',
        difficulty: 'Fácil',
        timeEstimate: '45-65 min',
        news: ['Marrocos e Espanha firmam acordo de energia verde', 'Rei Mohammed VI anuncia investimento de R$100 bi em infraestrutura', 'Copa do Mundo 2030: obras avançam em Marrakech e Casablanca']
      },
      {
        id: 'algeria',
        name: 'Argélia',
        capital: 'Argel',
        leader: { name: 'Abdelmadjid Tebboune', title: 'Presidente' },
        coords: { lat: 36.7538, lng: 3.0588 },
        description: 'O gigante silencioso. Argélia possui gás natural abundante, mas política repressiva e economia dependente de hidrocarbonetos.',
        startingStats: { influence: 35, morale: 40, resources: 50, network: 30 },
        theme: 'algeria',
        difficulty: 'Difícil',
        timeEstimate: '55-75 min',
        news: ['Argélia amplia exportações de gás para Europa', 'Tebboune enfrenta protestos por salários e liberdade', 'Deserto do Saara: Argélia testa usina solar gigante']
      },
      {
        id: 'drc',
        name: 'República Democrática do Congo',
        capital: 'Kinshasa',
        leader: { name: 'Félix Tshisekedi', title: 'Presidente' },
        coords: { lat: -4.4419, lng: 15.2663 },
        description: 'O continente em miniatura. Ricos em minerais estratégicos, mas assolada por conflitos, corrupção, e influência de potências estrangeiras.',
        startingStats: { influence: 25, morale: 20, resources: 30, network: 20 },
        theme: 'drc',
        difficulty: 'Hard',
        timeEstimate: '80-100 min',
        news: ['RDC firma acordo com China para mineração de cobalto', 'Kinshasa enfrenta violência em bairros periféricos', 'DRC se torna player chave na corrida por lítio africano']
      },
      {
        id: 'senegal',
        name: 'Senegal',
        capital: 'Dacar',
        leader: { name: 'Bassirou Diomaye Faye', title: 'Presidente' },
        coords: { lat: 14.6928, lng: -17.4467 },
        description: 'A nova voz da África. Faye, economista, promete renegociar dívidas e investir em indústria. Senegal é democracia estável no Sahel.',
        startingStats: { influence: 35, morale: 55, resources: 30, network: 35 },
        theme: 'senegal',
        difficulty: 'Médio',
        timeEstimate: '50-70 min',
        news: ['Senegal renegocia dívidas com França e China', 'Dacar se torna hub de energias renováveis do Sahel', 'Faye anuncia plano de industrialização nacional']
      },
      {
        id: 'tanzania',
        name: 'Tanzânia',
        capital: 'Dodoma',
        leader: { name: 'Samia Suluhu Hassan', title: 'Presidenta' },
        coords: { lat: -6.1630, lng: 35.7516 },
        description: 'A mulher que abriu a Tanzânia. Samia reverteu políticas autoritárias do sucessor, atraindo investimentos e turismo.',
        startingStats: { influence: 30, morale: 50, resources: 35, network: 30 },
        theme: 'tanzania',
        difficulty: 'Fácil',
        timeEstimate: '45-65 min',
        news: ['Tanzânia torna-se maior exportador de gás da África Oriental', 'Presidenta Samia promove direitos das mulheres e empreendedorismo', 'Zanzibar negocia autonomia ampliada com Dar es Salaam']
      }
    ]
  },
  'oceania': {
    label: '🌏 Oceania',
    countries: [
      {
        id: 'australia',
        name: 'Austrália',
        capital: 'Canberra',
        leader: { name: 'Anthony Albanese', title: 'Primeiro-Ministro' },
        coords: { lat: -35.2809, lng: 149.1300 },
        description: 'O continente-ilha em dilema. Aliado dos EUA mas dependente da China, Austrália navega entre segurança e economia.',
        startingStats: { influence: 55, morale: 60, resources: 60, network: 55 },
        theme: 'australia',
        difficulty: 'Médio',
        timeEstimate: '50-70 min',
        news: ['Austrália firma acordo de defesa AUKUS com EUA e Reino Unido', 'Albanese enfrenta protestos por mudanças climáticas', '悉尼港口 tension with China intensifies']
      },
      {
        id: 'new-zealand',
        name: 'Nova Zelândia',
        capital: 'Wellington',
        leader: { name: 'Christopher Luxon', title: 'Primeiro-Ministro' },
        coords: { lat: -41.2865, lng: 174.7762 },
        description: 'A Terra da Longa Nuvem Branca. Nova Zelândia busca equilíbrio entre Ocidente e Pacífico, com foco em clima e indústria criativa.',
        startingStats: { influence: 30, morale: 65, resources: 40, network: 35 },
        theme: 'new-zealand',
        difficulty: 'Fácil',
        timeEstimate: '40-60 min',
        news: ['Nova Zelândia anuncia plano de R$10 bi para energia limpa', 'Luxon enfrenta pressão de povos Māori por terra e autonomia', 'Wellington sedia cúpula do Pacífico com líderes insulares']
      },
      {
        id: 'papua-new-guinea',
        name: 'Papua-Nova Guiné',
        capital: 'Port Moresby',
        leader: { name: 'James Marape', title: 'Primeiro-Ministro' },
        coords: { lat: -6.7275, lng: 146.5197 },
        description: 'A Papua-Nova Guiné na era das grandes potências. Riquezas naturais, mas governança frágil e influência crescente da China.',
        startingStats: { influence: 20, morale: 35, resources: 30, network: 20 },
        theme: 'png',
        difficulty: 'Médio',
        timeEstimate: '45-65 min',
        news: ['China firma acordo de segurança com Papua-Nova Guiné', 'Marape negocia investimento australiano em mineração', 'Port Moresby enfrenta crise de segurança e violência de gangues']
      }
    ]
  }
};

/**
 * Retorna todos os países achatados por continente
 */
function getAllCountries() {
  const result = [];
  for (const [continentKey, continentData] of Object.entries(GLOBAL_COUNTRIES)) {
    for (const country of continentData.countries) {
      result.push({ ...country, continent: continentKey, continentLabel: continentData.label });
    }
  }
  return result;
}

/**
 * Retorna país por ID
 */
function getCountryById(id) {
  for (const continent of Object.values(GLOBAL_COUNTRIES)) {
    const found = continent.countries.find(c => c.id === id);
    if (found) return { ...found, continent: Object.keys(GLOBAL_COUNTRIES).find(k => GLOBAL_COUNTRIES[k] === continent), continentLabel: continent.label };
  }
  return null;
}

// =============================================
// INTEGRATION: Adiciona ao jogo principal
// =============================================

// Adiciona países como locais no mapa
for (const [continent, data] of Object.entries(GLOBAL_COUNTRIES)) {
  for (const country of data.countries) {
    if (!LOCATIONS[country.id]) {
      LOCATIONS[country.id] = {
        lat: country.coords.lat,
        lng: country.coords.lng,
        name: country.capital,
        desc: `${country.capital}, ${country.name}. Capital de ${country.leader.name}.`
      };
    }
  }
}

// Adiciona cenário global
SCENARIOS.push({
  id: 'global',
  name: 'Mundo 2026 — Sandbox Global',
  subtitle: 'Escolha uma nação. Reshape a história.',
  description: 'Janeiro de 2026. O mundo está em transformação. Você é um líder mundial. Suas decisões vão ecoar por décadas.',
  difficulty: 'Hard',
  timeEstimate: 'Indefinido',
  coords: { lat: 20.0, lng: 0.0 },
  theme: 'singapura',
  startLocation: null,
  isGlobal: true,
  countries: GLOBAL_COUNTRIES
});
