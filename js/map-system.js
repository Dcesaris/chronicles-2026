/**
 * ============================================
 * CHRONICLES 2026 — Sistema de Mapa (Leaflet.js)
 * ============================================
 */

const MapSystem = {
  map: null,
  fullMap: null,
  isExpanded: false,
  playerMarker: null,
  markers: {},
  routes: [],
  factionZones: [],
  fogCircles: [],
  revealedAreas: [],
  currentLocation: null,
  activeLayers: {
    allegiance: false,
    danger: false,
    entities: true,
    landmarks: true,
    events: true
  },
  zoneLayers: [],

  /** Inicializa o mini-mapa na sidebar */
  init() {
    if (this.map) return;
    const container = document.getElementById('map-container');
    if (!container) return;

    this.map = L.map('map-container', {
      center: [-23.55, -46.63],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
      layersControl: false
    });

    // Tiles escuros (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    // Clique no mapa para investigar/viajar
    this.map.on('click', (e) => this.onMapClick(e));

    // Fog of war inicial (círculo ao redor do jogador)
    this.updateFogOfWar();
  },

  /** Inicializa o mapa expandido */
  initFullMap() {
    if (this.fullMap) return;

    this.fullMap = L.map('full-map-container', {
      center: [-23.55, -46.63],
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OSM © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.fullMap);

    this.fullMap.on('click', (e) => this.onMapClick(e));
  },

  /** Atualiza a posição do jogador no mapa */
  updatePlayer(lat, lng, locationKey) {
    this.currentLocation = locationKey;

    if (this.playerMarker) {
      this.playerMarker.setLatLng([lat, lng]);
    } else {
      const playerIcon = L.divIcon({
        className: 'marker-player',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      this.playerMarker = L.marker([lat, lng], { icon: playerIcon })
        .addTo(this.map)
        .bindPopup(`<div class="popup-title">Você está aqui</div><div class="popup-desc">${LOCATIONS[locationKey]?.name || locationKey}</div>`);
    }

    if (this.fullMap) {
      if (this.playerMarker) {
        this.fullMap.removeLayer(this.playerMarker);
      }
      this.playerMarker = L.marker([lat, lng], {
        icon: L.divIcon({ className: 'marker-player', iconSize: [20, 20], iconAnchor: [10, 10] })
      }).addTo(this.fullMap);
    }

    this.updateFogOfWar();
    this.updateMapLocationLabel(locationKey);

    // Animação de rota se houver localização anterior
    if (this.prevLocation) {
      this.drawRoute(this.prevLocation, { lat, lng });
    }
    this.prevLocation = { lat, lng };
  },

  /** Adiciona marcador de NPC no mapa */
  addNPCKMarker(npcData) {
    const relClass = npcData.relationType === 'friendly' ? 'marker-npc-ally' :
                     npcData.relationType === 'hostile' ? 'marker-npc-hostile' : 'marker-npc-neutral';

    const icon = L.divIcon({
      className: relClass,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const marker = L.marker([npcData.lat, npcData.lng], { icon })
      .addTo(this.map)
      .bindPopup(`
        <div class="popup-title">${npcData.emoji} ${npcData.name}</div>
        <div class="popup-desc">${npcData.role}</div>
        <div class="popup-desc">Relação: ${npcData.relation > 0 ? '+' : ''}${npcData.relation}</div>
        <div class="popup-desc">${npcData.description}</div>
        <button class="popup-btn" onclick="MapSystem.interactNPC('${npcData.id}')">Interagir</button>
      `);

    this.markers['npc_' + npcData.id] = marker;
    return marker;
  },

  /** Atualiza posição de NPC no mapa */
  updateNPCMarker(npcId, lat, lng) {
    const marker = this.markers['npc_' + npcId];
    if (marker) {
      marker.setLatLng([lat, lng]);
    }
  },

  /** Remove marcador de NPC */
  removeMarker(id) {
    if (this.markers[id]) {
      this.map.removeLayer(this.markers[id]);
      delete this.markers[id];
    }
  },

  /** Adiciona marcador de local */
  addLocationMarker(locKey) {
    const loc = LOCATIONS[locKey];
    if (!loc || this.markers['loc_' + locKey]) return;

    const icon = L.divIcon({
      className: 'marker-landmark',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const marker = L.marker([loc.lat, loc.lng], { icon })
      .addTo(this.map)
      .bindPopup(`<div class="popup-title">${loc.name}</div><div class="popup-desc">${loc.desc.replace('{{player}}', Engine.state.playerName || 'você')}</div>`);

    this.markers['loc_' + locKey] = marker;
  },

  /** Adiciona evento de mundo no mapa */
  addWorldEvent(type, lat, lng, text) {
    const icon = L.divIcon({
      className: 'marker-event',
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const marker = L.marker([lat, lng], { icon })
      .addTo(this.map)
      .bindPopup(`<div class="popup-title">⚠️ ${text}</div>`);

    const id = 'event_' + Date.now();
    this.markers[id] = marker;

    // Remove após 5 turnos
    setTimeout(() => this.removeMarker(id), 30000);
  },

  /** Desenha rota entre dois pontos */
  drawRoute(from, to) {
    const line = L.polyline(
      [[from.lat, from.lng], [to.lat, to.lng]],
      { color: '#00ffff', weight: 2, opacity: 0.6, dashArray: '10, 6' }
    ).addTo(this.map);

    this.routes.push(line);
    // Limita número de rotas visíveis
    if (this.routes.length > 10) {
      const old = this.routes.shift();
      this.map.removeLayer(old);
    }
  },

  /** Atualiza Fog of War com áreas descobertas persistentes */
  updateFogOfWar() {
    // Remove fogos anteriores
    this.fogCircles.forEach(c => this.map.removeLayer(c));
    this.fogCircles = [];

    if (!this.currentLocation) return;

    const loc = LOCATIONS[this.currentLocation];
    if (!loc) return;

    // Círculo de visão revelada (raio maior)
    const revealRadius = 0.015; // ~1.7km
    const revealCircle = L.circle([loc.lat, loc.lng], {
      radius: revealRadius * 111000,
      color: '#00ffff',
      fillColor: '#00ffff',
      fillOpacity: 0.08,
      weight: 1,
      opacity: 0.4
    }).addTo(this.map);
    this.fogCircles.push(revealCircle);

    // Revelar locais próximos automaticamente
    for (const [key, l] of Object.entries(LOCATIONS)) {
      const dist = Math.sqrt(Math.pow(loc.lat - l.lat, 2) + Math.pow(loc.lng - l.lng, 2));
      if (dist < revealRadius * 1.5 && !this.revealedAreas.includes(key)) {
        this.revealedAreas.push(key);
        this.addLocationMarker(key);
      }
    }

    // Círculos de "fog" (escuridão) ao redor
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = revealRadius * 2 + Math.random() * 0.015;
      const fogLat = loc.lat + Math.cos(angle) * dist;
      const fogLng = loc.lng + Math.sin(angle) * dist;

      const fog = L.circle([fogLat, fogLng], {
        radius: 1000,
        color: 'transparent',
        fillColor: '#0a0a0f',
        fillOpacity: 0.5
      }).addTo(this.map);
      this.fogCircles.push(fog);
    }
  },

  /** Clique no mapa */
  onMapClick(e) {
    if (this.isExpanded) return; // Não interagir quando expandido

    // Verifica se clicou perto de algum landmark
    const clickedLat = e.latlng.lat;
    const clickedLng = e.latlng.lng;

    for (const [key, loc] of Object.entries(LOCATIONS)) {
      const dist = Math.sqrt(
        Math.pow(clickedLat - loc.lat, 2) +
        Math.pow(clickedLng - loc.lng, 2)
      );
      if (dist < 0.008) {
        // Verifica se o local está revelado
        if (this.isLocationRevealed(key)) {
          Engine.travelTo(key);
        } else {
          UI.notify('Área ainda não revelada. Explore mais para descobrir.', 'warning');
        }
        return;
      }
    }

    // Clique em área aberta — investigar
    Engine.investigateAt(clickedLat, clickedLng);
  },

  /** Verifica se local foi revelado */
  isLocationRevealed(locKey) {
    if (!this.currentLocation) return false;
    const current = LOCATIONS[this.currentLocation];
    const target = LOCATIONS[locKey];
    if (!current || !target) return false;

    const dist = Math.sqrt(
      Math.pow(current.lat - target.lat, 2) +
      Math.pow(current.lng - target.lng, 2)
    );
    return dist < 0.03; // ~3km de alcance
  },

  /** Interagir com NPC pelo popup */
  interactNPC(npcId) {
    this.closePopups();
    Engine.talkToNPC(npcId);
  },

  /** Alterna camada do mapa */
  toggleLayer(layer) {
    this.activeLayers[layer] = !this.activeLayers[layer];

    // Atualiza visual do botão
    const btn = document.getElementById('layer-' + layer);
    if (btn) {
      btn.style.background = this.activeLayers[layer] ? 'rgba(0,255,255,0.15)' : '';
      btn.style.borderColor = this.activeLayers[layer] ? 'var(--accent)' : '';
    }

    // Atualiza visualização no mapa
    if (layer === 'allegiance') {
      this.updateAllegianceLayer();
    } else if (layer === 'danger') {
      this.updateDangerLayer();
    } else if (layer === 'entities') {
      this.refreshAllMarkers();
    }
  },

  /** Atualiza camada de facções */
  updateAllegianceLayer() {
    // Remove zona anterior
    this.zoneLayers.forEach(z => this.map.removeLayer(z));
    this.zoneLayers = [];

    if (!this.activeLayers.allegiance) return;

    // Zonas de facção (simuladas)
    const factions = [
      { name: 'Sentinela Corp', color: '#e53935', center: [-23.583, -46.680], radius: 2000 },
      { name: 'Resistência', color: '#00e676', center: [-23.520, -46.610], radius: 1500 },
      { name: 'Gareth (Hacker)', color: '#7c4dff', center: [-23.550, -46.633], radius: 1000 }
    ];

    factions.forEach(f => {
      const zone = L.circle([f.center[0], f.center[1]], {
        radius: f.radius,
        color: f.color,
        fillColor: f.color,
        fillOpacity: 0.15,
        weight: 1,
        opacity: 0.5
      }).addTo(this.map);
      zone.bindPopup(`<div class="popup-title">${f.name}</div><div class="popup-desc">Zona de influência</div>`);
      this.zoneLayers.push(zone);
    });
  },

  /** Atualiza camada de perigo */
  updateDangerLayer() {
    this.zoneLayers.forEach(z => this.map.removeLayer(z));
    this.zoneLayers = [];

    if (!this.activeLayers.danger) return;

    // Áreas de perigo
    const dangerZones = [
      { name: 'Torre Altino', center: [-23.583, -46.680], radius: 800, level: 'alto' },
      { name: 'Morro do Pinheirinho', center: [-23.520, -46.610], radius: 1200, level: 'médio' },
      { name: 'Lapa (noite)', center: [-23.528, -46.681], radius: 600, level: 'baixo' }
    ];

    dangerZones.forEach(d => {
      const color = d.level === 'alto' ? '#e53935' : d.level === 'médio' ? '#ffb300' : '#7c4dff';
      const zone = L.circle([d.center[0], d.center[1]], {
        radius: d.radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 1,
        dashArray: '5,5'
      }).addTo(this.map);
      zone.bindPopup(`<div class="popup-title">⚠️ ${d.name}</div><div class="popup-desc">Nível de perigo: ${d.level}</div>`);
      this.zoneLayers.push(zone);
    });
  },

  /** Fecha popups */
  closePopups() {
    this.map.closePopup();
    if (this.fullMap) this.fullMap.closePopup();
  },

  /** Expande o mapa para tela cheia */
  expandMap() {
    this.isExpanded = true;
    this.initFullMap();
    document.getElementById('full-map-modal').classList.add('active');
    setTimeout(() => this.fullMap.invalidateSize(), 100);

    // Repopula marcadores
    this.refreshAllMarkers();
  },

  /** Colapsa o mapa */
  collapseMap() {
    this.isExpanded = false;
    document.getElementById('full-map-modal').classList.remove('active');
    if (this.fullMap) {
      this.fullMap.remove();
      this.fullMap = null;
    }
  },

  /** Atualiza rótulo do local no mapa */
  updateMapLocationLabel(locKey) {
    const el = document.getElementById('map-location-label');
    if (el && LOCATIONS[locKey]) {
      el.textContent = LOCATIONS[locKey].name;
    }
  },

  /** Atualiza todos os marcadores */
  refreshAllMarkers() {
    // Remove marcadores antigos de NPCs
    Object.keys(this.markers).forEach(k => {
      if (k.startsWith('npc_')) this.map.removeLayer(this.markers[k]);
    });
    this.markers = {};

    // Repopula
    NPCSystem.allAlive().forEach(npc => {
      this.addNPCKMarker({
        id: npc.id,
        name: npc.name,
        emoji: npc.emoji,
        lat: npc.currentLat,
        lng: npc.currentLng,
        relation: npc.relation,
        relationType: NPCSystem.getRelationType(npc.id),
        allegiance: npc.allegiance,
        role: npc.role,
        description: npc.description
      });
    });

    // Redesenha rotas de patrulha
    NPCSystem.drawRoutes(this.map);

    // Marcadores de locais revelados
    this.revealedAreas.forEach(loc => this.addLocationMarker(loc));

    // Centro no jogador
    if (this.playerMarker) {
      const pos = this.playerMarker.getLatLng();
      this.map.setView(pos, 14);
      if (this.fullMap) this.fullMap.setView(pos, 14);
    }
  },

  /** Revela novo local no mapa */
  revealLocation(locKey) {
    if (!this.revealedAreas.includes(locKey)) {
      this.revealedAreas.push(locKey);
      this.addLocationMarker(locKey);
    }
  },

  /** Centraliza no jogador */
  centerOnPlayer() {
    if (this.playerMarker) {
      const pos = this.playerMarker.getLatLng();
      this.map.setView(pos, 15);
    }
  }
};
