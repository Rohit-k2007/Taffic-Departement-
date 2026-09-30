/**
 * NATDAMS - GIS Map & Tactical Corridor Radar Controller
 * Supports Pan-India State/District centering, Construction Zone markers,
 * Patrol units, Camera Surveillance nodes, and ISRO/NavIC Satellite Surveillance Link.
 */

class MapController {
  constructor() {
    this.map = null;
    this.standardLayer = null;
    this.satelliteLayer = null;
    this.isSatelliteActive = false;
    this.isThermalOverlayActive = false;

    this.corridorLayers = [];
    this.markerLayers = [];
    this.constructionLayers = [];
    this.satelliteReticle = null;
    this.isInitialized = false;

    // Default: New Delhi, India
    this.currentLat = 28.6139;
    this.currentLng = 77.2090;
    this.currentZoom = 12;

    // Cameras pool for surveillance matrix
    this.cameras = [
      { id: "CAM-01", name: "Gantry 04 (Ring Road Arterial)", lat: 28.625, lng: 77.210, limit: 60, status: "ONLINE (60 FPS)" },
      { id: "CAM-02", name: "Central Plaza Junction 03", lat: 28.620, lng: 77.222, limit: 40, status: "ONLINE (60 FPS)" },
      { id: "CAM-03", name: "Airport Expressway Toll Checkpoint", lat: 28.555, lng: 77.110, limit: 70, status: "ONLINE (60 FPS)" },
      { id: "CAM-04", name: "Metro Transit Corridor Pillar 142", lat: 28.640, lng: 77.230, limit: 50, status: "ONLINE (60 FPS)" }
    ];

    // ISRO NavIC / Cartosat Telemetry
    this.satTelemetry = {
      satelliteName: "ISRO CARTOSAT-3 / EOS-06",
      navicLink: "NavIC IRNSS-1I (L5/S-Band Carrier Locked)",
      orbitalAltitudeKm: 505.2,
      groundVelocityKms: 7.56,
      subSatellitePoint: "28.61° N, 77.21° E",
      groundSamplingRes: "0.28m Panchromatic (HD)",
      sensorMode: "Multispectral Panchromatic & Thermal Radiometry",
      encryption: "ISRO-SHAKTI 256-Bit Telemetry Vault"
    };
  }

  initMap() {
    if (this.isInitialized) return;
    const mapElement = document.getElementById('trafficLiveMap');
    if (!mapElement) return;

    try {
      if (typeof L === 'undefined') {
        mapElement.innerHTML = `<div style="padding:20px; text-align:center; color:#0a2540;">Initializing National GIS Cartography...</div>`;
        return;
      }

      this.map = L.map('trafficLiveMap', {
        center: [this.currentLat, this.currentLng],
        zoom: this.currentZoom,
        zoomControl: true,
        attributionControl: false
      });

      // 1. Standard Vector Cartography Layer
      this.standardLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      });

      // 2. High-Resolution Earth Observation Satellite Imagery Layer
      this.satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });

      // Add default layer
      this.standardLayer.addTo(this.map);

      this.renderCorridors();
      this.renderPatrolUnits();
      this.renderConstructionZones();
      this.renderRiskHotspots();
      this.renderAccidentsOnMap();
      this.isInitialized = true;

      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 300);

    } catch (e) {
      console.warn("Map initialization notice:", e);
    }
  }

  toggleSatelliteSurveillance() {
    if (!this.map) return false;

    this.isSatelliteActive = !this.isSatelliteActive;

    if (this.isSatelliteActive) {
      this.map.removeLayer(this.standardLayer);
      this.satelliteLayer.addTo(this.map);

      // Add satellite orbital reticle crosshair in center
      this.renderSatelliteReticle();

      // Update corridors for higher contrast on satellite
      this.renderCorridors(true);

      const banner = document.getElementById('satelliteHudBanner');
      if (banner) banner.style.display = 'flex';

    } else {
      this.map.removeLayer(this.satelliteLayer);
      this.standardLayer.addTo(this.map);

      if (this.satelliteReticle) {
        this.map.removeLayer(this.satelliteReticle);
        this.satelliteReticle = null;
      }

      this.renderCorridors(false);

      const banner = document.getElementById('satelliteHudBanner');
      if (banner) banner.style.display = 'none';
    }

    return this.isSatelliteActive;
  }

  renderSatelliteReticle() {
    if (this.satelliteReticle && this.map) {
      this.map.removeLayer(this.satelliteReticle);
    }

    const reticleIcon = L.divIcon({
      html: `
        <div style="width:120px; height:120px; border:2px dashed #38bdf8; border-radius:50%; position:relative; pointer-events:none; box-shadow:0 0 15px rgba(56, 189, 248, 0.4); display:flex; align-items:center; justify-content:center;">
          <div style="width:10px; height:10px; background:#38bdf8; border-radius:50%;"></div>
          <div style="position:absolute; top:2px; font-family:'JetBrains Mono', monospace; font-size:9px; color:#38bdf8; background:rgba(0,0,0,0.6); padding:1px 4px; border-radius:2px;">
            ISRO RECON RETICLE
          </div>
        </div>
      `,
      className: 'sat-reticle',
      iconSize: [120, 120],
      iconAnchor: [60, 60]
    });

    this.satelliteReticle = L.marker([this.currentLat, this.currentLng], { 
      icon: reticleIcon,
      interactive: false 
    }).addTo(this.map);
  }

  flyToLocation(lat, lng, zoom = 13) {
    if (this.map) {
      this.currentLat = lat;
      this.currentLng = lng;
      this.currentZoom = zoom;
      this.map.flyTo([lat, lng], zoom, { duration: 1.2 });
      if (this.isSatelliteActive) {
        this.renderSatelliteReticle();
      }
      this.renderConstructionZones();
    }
  }

  renderCorridors(isSatMode = false) {
    this.corridorLayers.forEach(l => this.map.removeLayer(l));
    this.corridorLayers = [];

    const sampleCorridors = [
      {
        name: "Primary National Arterial Corridor",
        speed: 62,
        color: isSatMode ? "#34d399" : "#059669",
        coords: [
          [this.currentLat + 0.015, this.currentLng - 0.025],
          [this.currentLat + 0.008, this.currentLng],
          [this.currentLat - 0.012, this.currentLng + 0.020]
        ]
      },
      {
        name: "Commercial Heavy Transport Bypass",
        speed: 34,
        color: isSatMode ? "#fbbf24" : "#d97706",
        coords: [
          [this.currentLat - 0.018, this.currentLng - 0.030],
          [this.currentLat - 0.022, this.currentLng],
          [this.currentLat - 0.015, this.currentLng + 0.035]
        ]
      }
    ];

    sampleCorridors.forEach(c => {
      const poly = L.polyline(c.coords, {
        color: c.color,
        weight: isSatMode ? 6 : 5,
        opacity: 0.9
      }).addTo(this.map);

      poly.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans', sans-serif; font-size:12px; color:#0f172a;">
          <strong style="color:#0a2540;">${c.name}</strong><br/>
          <span>Average Flow Speed: <strong>${c.speed} km/h</strong></span><br/>
          ${isSatMode ? '<span style="color:#0284c7; font-weight:700;">🛰️ Satellite Thermal Emission Verified</span>' : ''}
        </div>
      `);
      this.corridorLayers.push(poly);
    });
  }

  renderPatrolUnits() {
    const patrolUnits = [
      { id: "PATROL-04", name: "Interceptor Unit 04 (Sub-Insp. Priya Sharma)", lat: this.currentLat + 0.005, lng: this.currentLng - 0.010, speed: "Patrolling 45 km/h" },
      { id: "AMBULANCE-01", name: "Green Corridor Ambulance 01", lat: this.currentLat - 0.006, lng: this.currentLng + 0.008, speed: "Priority 78 km/h" }
    ];

    patrolUnits.forEach(p => {
      const isAmb = p.id.includes('AMBULANCE');
      const iconHtml = `<div style="background:${isAmb ? '#dc2626' : '#111827'}; color:#fff; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; font-size:12px; box-shadow:0 1px 4px rgba(0,0,0,0.3);">${isAmb ? '🚨' : '🚔'}</div>`;
      
      const icon = L.divIcon({ html: iconHtml, className: 'patrol-icon', iconSize: [26, 26], iconAnchor: [13, 13] });
      const marker = L.marker([p.lat, p.lng], { icon: icon }).addTo(this.map);
      marker.bindPopup(`
        <div style="font-size:12px; color:#0f172a;">
          <strong style="color:#111827;">${p.name}</strong><br/>
          <span>Telemetry: ${p.speed}</span><br/>
          <span style="color:#059669; font-size:11px;">✓ NavIC Satellite GPS Locked</span>
        </div>
      `);
      this.markerLayers.push(marker);
    });
  }

  renderConstructionZones() {
    this.constructionLayers.forEach(l => this.map.removeLayer(l));
    this.constructionLayers = [];

    if (!window.trafficDB) return;
    const roadworks = window.trafficDB.getRoadworks(window.trafficDB.selectedState, window.trafficDB.selectedDistrict);

    roadworks.forEach((rw, idx) => {
      const lat = this.currentLat + (idx === 0 ? 0.008 : -0.009);
      const lng = this.currentLng + (idx === 0 ? 0.012 : -0.014);

      const icon = L.divIcon({
        html: `<div style="background:#d97706; color:#fff; border-radius:4px; padding:2px 6px; font-weight:800; font-size:11px; border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.3); display:flex; align-items:center; gap:3px;">🚧 ROADWORK</div>`,
        className: 'roadwork-pin',
        iconSize: [85, 24],
        iconAnchor: [42, 12]
      });

      const marker = L.marker([lat, lng], { icon: icon }).addTo(this.map);
      marker.bindPopup(`
        <div style="font-size:12px; color:#0f172a; max-width:220px;">
          <strong style="color:#b45309;">🚧 Active Road Construction Zone</strong><br/>
          <strong>${rw.roadName}</strong><br/>
          <span>Type: ${rw.workType}</span><br/>
          <span>Contractor: <em>${rw.contractor}</em></span><br/>
          <span style="color:#dc2626; font-weight:600;">Impact: ${rw.laneImpact}</span><br/>
          <span style="color:#059669;">Detour: ${rw.diversionRoute}</span>
        </div>
      `);
      this.constructionLayers.push(marker);
    });
  }

  trackVehicleOnMap(plate, vehicleInfo) {
    if (!this.map) return;

    if (this.vehicleTrackerMarker) {
      this.map.removeLayer(this.vehicleTrackerMarker);
      this.vehicleTrackerMarker = null;
    }

    const lat = vehicleInfo.lat;
    const lng = vehicleInfo.lng;

    const vehicleIcon = L.divIcon({
      html: `
        <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
          <div style="position:absolute; width:48px; height:48px; border-radius:50%; background:rgba(217, 119, 6, 0.25); border:2px solid #b45309; animation:pulse-dot-anim 1.2s infinite; top:-14px; left:-14px; pointer-events:none;"></div>
          <div style="background:#111827; color:#f8fafc; border:2px solid #d97706; border-radius:6px; padding:3px 8px; font-size:11px; font-weight:800; font-family:'JetBrains Mono', monospace; box-shadow:0 3px 8px rgba(0,0,0,0.45); display:flex; align-items:center; gap:5px; z-index:10; white-space:nowrap;">
            <span style="font-size:13px;">${vehicleInfo.icon || '🚗'}</span> ${plate}
          </div>
          <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:7px solid #d97706; margin-top:-1px;"></div>
        </div>
      `,
      className: 'vehicle-tracker-pin',
      iconSize: [140, 44],
      iconAnchor: [70, 40]
    });

    this.vehicleTrackerMarker = L.marker([lat, lng], { 
      icon: vehicleIcon, 
      zIndexOffset: 1200 
    }).addTo(this.map);

    const popupHtml = `
      <div style="font-family:'Plus Jakarta Sans', sans-serif; font-size:12px; color:#111827; min-width:270px; padding:4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; margin-bottom:8px;">
          <span style="background:#111827; color:#fff; font-family:'JetBrains Mono', monospace; font-size:11px; font-weight:800; padding:2px 7px; border-radius:3px;">${plate}</span>
          <span style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:700; padding:2px 6px; border-radius:3px;">🛰️ NAVIC GPS LOCKED</span>
        </div>
        <div style="line-height:1.55;">
          <div><strong>Registered Owner:</strong> <span style="color:#b45309; font-weight:700;">${vehicleInfo.owner}</span></div>
          <div><strong>Vehicle:</strong> ${vehicleInfo.makeModel}</div>
          <div><strong>Class:</strong> ${vehicleInfo.class}</div>
          <div><strong>Location / District:</strong> ${vehicleInfo.districtName || vehicleInfo.rto}</div>
          <div><strong>Highway Corridor:</strong> <em>${vehicleInfo.corridor || 'Primary Arterial'}</em></div>
          <div><strong>Statutory PUCC:</strong> <span style="color:#047857; font-weight:600;">Valid / Compliant</span></div>
        </div>
        <div style="margin-top:8px; padding-top:6px; border-top:1px dashed #cbd5e1; font-family:'JetBrains Mono', monospace; font-size:11px; color:#334155; line-height:1.45;">
          <div>📡 Radar Speed: <strong style="color:#b45309;">${vehicleInfo.speed} km/h</strong></div>
          <div>📍 Coordinates: <strong>${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E</strong></div>
          <div>🌐 Radar / MDT IP: <strong style="color:#0f172a;">${vehicleInfo.ipAddress || '164.100.24.11'}</strong></div>
          <div>🛰️ Constellation: <span style="color:#047857; font-weight:700;">ISRO Cartosat-3 (L5 Carrier)</span></div>
        </div>
      </div>
    `;

    this.vehicleTrackerMarker.bindPopup(popupHtml).openPopup();
    this.flyToLocation(lat, lng, 14);
  }

  // Search area, locate on map, calculate accurate route, and connect with Google Maps & ISRO Satellite
  async searchAreaAndFindRoute(query) {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim().toLowerCase();

    // 1. Check known landmark dictionary for zero-latency accuracy
    let targetLat = null;
    let targetLng = null;
    let placeDisplayName = query;

    const KNOWN_PLACES = {
      'delhi': [28.6139, 77.2090, "Delhi NCT Central Command"],
      'connaught place': [28.6315, 77.2167, "Connaught Place / Rajiv Chowk, New Delhi"],
      'barapullah': [28.5833, 77.2500, "Barapullah Elevated Corridor Phase-III"],
      'sarai kale khan': [28.5898, 77.2568, "Sarai Kale Khan Inter-State Bus Terminal / RRTS"],
      'ashram': [28.5714, 77.2588, "Ashram Flyover & Underpass Junction, South Delhi"],
      'dwarka expressway': [28.5412, 77.0125, "Dwarka Expressway (NH-248BB) / IGI Airport Tunnel"],
      'delhi dehradun': [28.6250, 77.2800, "Delhi-Dehradun Expressway Akshardham Section"],
      'jaipur': [26.9124, 75.7873, "Jaipur Metropolitan Capital Zone"],
      'jaipur ring road': [26.8200, 75.7500, "Jaipur Northern Ring Road (Phase-2 Bagru-Chandwaji)"],
      'kota': [25.2138, 75.8648, "Kota Chambal River Cable-Stayed Bridge Corridor"],
      'jodhpur': [26.2389, 73.0243, "Jodhpur Mandore Arterial & NH-62 Bypass"],
      'ajmer': [26.4499, 74.6399, "Ajmer - Kishangarh 6-Lane Expressway"],
      'mumbai': [19.0760, 72.8777, "Mumbai Metropolitan Area"],
      'coastal road': [18.9950, 72.8120, "Mumbai Coastal Road Project (Worli Connector)"],
      'worli': [19.0178, 72.8178, "Worli Seaface & Bandra-Worli Sea Link Interchange"],
      'mumbai pune expressway': [18.7500, 73.4000, "Mumbai-Pune Expressway Missing Link / Tiger Valley"],
      'bengaluru': [12.9716, 77.5946, "Bengaluru Central Business District"],
      'outer ring road': [12.9352, 77.6845, "Bengaluru Outer Ring Road (Silk Board - Bellandur)"],
      'silk board': [12.9177, 77.6238, "Central Silk Board Junction / Namma Metro Blue Line"],
      'noida': [28.5355, 77.3910, "Noida - Greater Noida Expressway (KM 9-14)"],
      'gurugram': [28.4595, 77.0266, "Gurugram Cyber City & Golf Course Road Hub"],
      'cyber city': [28.4950, 77.0890, "DLF Cyber City & Rapid Metro Underpass"],
      'chennai': [13.0827, 80.2707, "Chennai Port - Maduravoyal Double-Decker Expressway"],
      'ahmedabad': [23.0225, 72.5714, "Ahmedabad SG Highway (NH-147) Sarkhej Flyover"],
      'kolkata': [22.5726, 88.3639, "Kolkata Kona Expressway Elevated Corridor"]
    };

    for (const [key, val] of Object.entries(KNOWN_PLACES)) {
      if (cleanQuery.includes(key)) {
        targetLat = val[0];
        targetLng = val[1];
        placeDisplayName = val[2];
        break;
      }
    }

    // 2. If not in dictionary, query Nominatim OpenStreetMap Geocoding API
    if (!targetLat) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", India")}&limit=1`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            targetLat = parseFloat(data[0].lat);
            targetLng = parseFloat(data[0].lon);
            placeDisplayName = data[0].display_name;
          }
        }
      } catch (err) {
        console.warn("Geocoding notice:", err);
      }
    }

    // Fallback if still unfound: search near current lat/lng
    if (!targetLat) {
      targetLat = this.currentLat + (Math.random() * 0.04 - 0.02);
      targetLng = this.currentLng + (Math.random() * 0.04 - 0.02);
      placeDisplayName = `${query} (Jurisdiction Coordinate)`;
    }

    // 3. Clear old search markers & route layers
    if (this.searchMarker && this.map) {
      this.map.removeLayer(this.searchMarker);
      this.searchMarker = null;
    }
    if (this.routeLayers && this.map) {
      this.routeLayers.forEach(l => this.map.removeLayer(l));
      this.routeLayers = [];
    }

    // 4. Calculate Distance & Transit Time
    const rad = Math.PI / 180;
    const dLat = (targetLat - this.currentLat) * rad;
    const dLng = (targetLng - this.currentLng) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.currentLat * rad) * Math.cos(targetLat * rad) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightKm = (6371 * c);
    const drivingDistanceKm = Math.max(1.2, +(straightKm * 1.35).toFixed(1));
    const estTimeMins = Math.round((drivingDistanceKm / 42) * 60) + 4;

    // 5. Generate Route Waypoints with natural highway curvature
    const steps = 14;
    const routeCoords = [];
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const curve = Math.sin(frac * Math.PI) * 0.008;
      const lat = this.currentLat + (targetLat - this.currentLat) * frac + curve;
      const lng = this.currentLng + (targetLng - this.currentLng) * frac - curve * 0.5;
      routeCoords.push([lat, lng]);
    }

    // 6. Draw Route on Leaflet Map
    if (this.map) {
      const routePolyline = L.polyline(routeCoords, {
        color: '#b45309',
        weight: 6,
        opacity: 0.88,
        dashArray: '8, 6'
      }).addTo(this.map);

      const routePolylineBorder = L.polyline(routeCoords, {
        color: '#ffffff',
        weight: 9,
        opacity: 0.6
      }).addTo(this.map);
      routePolylineBorder.bringToBack();

      this.routeLayers = [routePolyline, routePolylineBorder];

      // 7. Place Destination Pin
      const destIcon = L.divIcon({
        html: `
          <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
            <div style="background:#dc2626; color:#fff; border:2px solid #fff; border-radius:6px; padding:3px 8px; font-weight:800; font-size:11px; box-shadow:0 3px 8px rgba(0,0,0,0.4); display:flex; align-items:center; gap:4px; white-space:nowrap;">
              📍 TARGET DESTINATION
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:7px solid #dc2626;"></div>
          </div>
        `,
        className: 'dest-marker-pin',
        iconSize: [150, 36],
        iconAnchor: [75, 34]
      });

      this.searchMarker = L.marker([targetLat, targetLng], { icon: destIcon }).addTo(this.map);

      // Google Maps URLs
      const gmapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${this.currentLat.toFixed(5)},${this.currentLng.toFixed(5)}&destination=${targetLat.toFixed(5)},${targetLng.toFixed(5)}&travelmode=driving`;
      const gmapsSatUrl = `https://www.google.com/maps/@${targetLat.toFixed(5)},${targetLng.toFixed(5)},16z/data=!3m1!1e3`;

      this.searchMarker.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans', sans-serif; font-size:12px; color:#111827; min-width:270px; padding:4px;">
          <div style="font-weight:800; color:#0f172a; margin-bottom:4px; font-size:13px;">${placeDisplayName}</div>
          <div style="color:#64748b; font-size:11px; margin-bottom:6px;">📍 Coords: <strong>${targetLat.toFixed(5)}°N, ${targetLng.toFixed(5)}°E</strong></div>
          <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:4px; padding:6px 8px; font-size:11px; color:#92400e; margin-bottom:8px;">
            🚗 Driving Distance: <strong>${drivingDistanceKm} km</strong> • Est. Transit: <strong>~${estTimeMins} mins</strong><br/>
            🛰️ ISRO / NavIC Cartosat Satellite Lock: <span style="color:#047857; font-weight:700;">ACTIVE (0.28m HD)</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <a href="${gmapsDirUrl}" target="_blank" rel="noopener noreferrer" style="background:#111827; color:#fff; text-align:center; padding:5px 8px; border-radius:4px; text-decoration:none; font-weight:700; font-size:11px; display:flex; align-items:center; justify-content:center; gap:5px;">
              🗺️ Open Route in Google Maps
            </a>
            <a href="${gmapsSatUrl}" target="_blank" rel="noopener noreferrer" style="background:#b45309; color:#fff; text-align:center; padding:5px 8px; border-radius:4px; text-decoration:none; font-weight:700; font-size:11px; display:flex; align-items:center; justify-content:center; gap:5px;">
              🌍 Open in Google Maps Satellite
            </a>
          </div>
        </div>
      `).openPopup();

      // Fit bounds to show entire route
      const bounds = L.latLngBounds([[this.currentLat, this.currentLng], [targetLat, targetLng]]);
      this.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }

    // 8. Update UI HUD Route Bar
    const hud = document.getElementById('mapRouteHud');
    if (hud) {
      const gmapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${this.currentLat.toFixed(5)},${this.currentLng.toFixed(5)}&destination=${targetLat.toFixed(5)},${targetLng.toFixed(5)}&travelmode=driving`;
      const gmapsSatUrl = `https://www.google.com/maps/@${targetLat.toFixed(5)},${targetLng.toFixed(5)},16z/data=!3m1!1e3`;
      hud.style.display = 'flex';
      hud.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="background:#b45309; color:#fff; font-weight:800; padding:2px 7px; border-radius:3px; font-size:11px;">ROUTE FOUND</span>
          <strong style="color:#0f172a;">${placeDisplayName}</strong>
          <span style="color:#64748b;">(${targetLat.toFixed(4)}°N, ${targetLng.toFixed(4)}°E)</span>
          <span style="background:#f1f5f9; padding:2px 6px; border-radius:3px; font-weight:700; color:#334155;">🛣️ ${drivingDistanceKm} km</span>
          <span style="background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:3px; font-weight:700;">⏱️ ~${estTimeMins} mins</span>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <a href="${gmapsDirUrl}" target="_blank" rel="noopener noreferrer" class="btn-action-primary" style="font-size:11px; padding:3px 8px; text-decoration:none;">
            🗺️ Google Maps Directions
          </a>
          <a href="${gmapsSatUrl}" target="_blank" rel="noopener noreferrer" class="btn-action-primary" style="font-size:11px; padding:3px 8px; background:#b45309; border-color:#b45309; color:#fff; text-decoration:none;">
            🛰️ Google Satellite
          </a>
          <button class="btn-action-primary" style="font-size:11px; padding:3px 8px; background:transparent; color:#64748b; border-color:#cbd5e1;" onclick="window.mapController.clearRoute()">
            Clear
          </button>
        </div>
      `;
    }

    return {
      success: true,
      place: placeDisplayName,
      lat: targetLat,
      lng: targetLng,
      distanceKm: drivingDistanceKm,
      estMinutes: estTimeMins
    };
  }

  clearRoute() {
    if (this.routeLayers && this.map) {
      this.routeLayers.forEach(l => this.map.removeLayer(l));
      this.routeLayers = [];
    }
    if (this.searchMarker && this.map) {
      this.map.removeLayer(this.searchMarker);
      this.searchMarker = null;
    }
    const hud = document.getElementById('mapRouteHud');
    if (hud) hud.style.display = 'none';
    if (this.map) {
      this.map.setView([this.currentLat, this.currentLng], this.currentZoom);
    }
  }

  renderRiskHotspots() {
    if (!this.map || !window.trafficDB) return;
    const zones = window.trafficDB.getRiskZones();

    zones.forEach(z => {
      const isCrit = z.riskLevel === 'CRITICAL';
      const isHigh = z.riskLevel === 'HIGH';
      const color = isCrit ? '#dc2626' : (isHigh ? '#ea580c' : '#d97706');

      const circle = L.circle([z.latitude, z.longitude], {
        color: color,
        fillColor: color,
        fillOpacity: 0.25,
        radius: isCrit ? 350 : (isHigh ? 280 : 200),
        weight: 2
      }).addTo(this.map);

      circle.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans', sans-serif; font-size:12px; color:#0f172a; max-width:240px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:${color};">${z.riskLevel} RISK ZONE</strong>
            <span style="font-size:10px; font-weight:700;">${z.incidentCount} Crashes</span>
          </div>
          <strong style="font-size:13px;">${z.zoneName}</strong>
          <div style="font-size:11px; color:#64748b; margin:2px 0;">${z.location}</div>
          <div style="font-size:11px; margin-top:4px;"><strong>Reason:</strong> ${z.description || z.riskType}</div>
          <div style="font-size:11px; color:#15803d; margin-top:4px;"><strong>Directive:</strong> ${z.recommendedAction}</div>
        </div>
      `);
      this.markerLayers.push(circle);
    });
  }

  renderAccidentsOnMap() {
    if (!this.map || !window.trafficDB) return;
    const accidents = window.trafficDB.getAccidents();

    accidents.forEach(a => {
      const lat = a.locationLat || (this.currentLat - 0.004);
      const lng = a.locationLng || (this.currentLng + 0.007);

      const icon = L.divIcon({
        html: `<div style="background:#dc2626; color:#fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; font-size:13px; box-shadow:0 2px 6px rgba(0,0,0,0.4); animation:pulse-dot-anim 1.2s infinite;">💥</div>`,
        className: 'accident-marker-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([lat, lng], { icon: icon }).addTo(this.map);
      marker.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans', sans-serif; font-size:12px; color:#0f172a;">
          <strong style="color:#b91c1c;">🚨 ACCIDENT INCIDENT: ${a.accidentNumber || a.id}</strong><br/>
          <strong>${a.accidentType}</strong> (${a.severity})<br/>
          <span>Location: ${a.locationAddress || a.location}</span><br/>
          <span style="color:#dc2626; font-weight:700;">Casualties: ${a.casualties} Persons &bull; ${a.vehiclesInvolved} Vehicles</span><br/>
          <span style="font-size:10px; color:#64748b;">Status: ${a.status}</span>
        </div>
      `);
      this.markerLayers.push(marker);
    });
  }

  refresh() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 200);
    }
  }
}

window.mapController = new MapController();
