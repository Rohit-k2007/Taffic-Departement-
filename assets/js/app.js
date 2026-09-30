/**
 * NATDAMS - Main Application Orchestrator & Flowchart Controller
 * Integrates:
 * 1. Series-Wise Left Sidebar & 9-Panel Navigation Flow
 * 2. High-Level Officer Login (User ID, Pass, Camera Access PIN & Scope)
 * 3. Citizen Flow: Report Issue -> Evidence + GPS -> AI Pre-Processing -> Track Status -> Feedback/Rating
 * 4. Officer Flow: Review Cases -> Verify -> Action (Fine/Warning/Patrol) -> Close Case
 * 5. Emergency Flow: 112 SOS -> Auto GPS -> Dispatch Patrol Unit -> Live Countdown -> Resolve
 * 6. Clean Front GIS Live Map & Google Maps / ISRO Satellite Surveillance
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) lucide.createIcons();
  await App.init();
});

const App = {
  activeTab: 'current',
  activeCameraId: 'CAM-01',
  currentRole: 'citizen',
  currentOfficer: null,
  activeEmergency: null,
  emergencyTimerId: null,

  async init() {
    // 1. Load initial data from backend API / local database
    await window.trafficDB.loadInitialData();

    // 2. Populate Pan-India State & District Selectors
    this.initLocationSelectors();

    // 3. Bind UI Events
    this.bindEvents();

    // 4. Render All Views
    this.renderAllViews();

    // 5. Start live simulation tick
    if (window.liveEngine) window.liveEngine.start();

    // 6. Init Map & Charts
    if (window.mapController) window.mapController.initMap();
    if (window.analyticsController) {
      window.analyticsController.initHistoricalCharts();
      window.analyticsController.initPredictiveCharts();
    }

    this.showToast("NATDAMS Central National Portal Initialized (State: Delhi NCT)", "info");
  },

  initLocationSelectors() {
    const stateSelect = document.getElementById('selectState');
    const distSelect = document.getElementById('selectDistrict');
    if (!stateSelect || !distSelect) return;

    const states = window.trafficDB.getStates();
    stateSelect.innerHTML = states.map(s => 
      `<option value="${s.code}" ${s.code === window.trafficDB.selectedState ? 'selected' : ''}>${s.name}</option>`
    ).join('');

    this.updateDistrictDropdown(window.trafficDB.selectedState);

    stateSelect.addEventListener('change', (e) => {
      const code = e.target.value;
      window.trafficDB.selectedState = code;
      this.updateDistrictDropdown(code);
      const stateObj = window.trafficDB.getStateByCode(code);
      if (stateObj && window.mapController) {
        window.mapController.flyToLocation(stateObj.center[0], stateObj.center[1], stateObj.zoom);
      }
      this.renderAllViews();
      this.showToast(`Jurisdiction Shifted to State: ${stateObj ? stateObj.name : code}`, "info");
    });

    distSelect.addEventListener('change', (e) => {
      const distId = e.target.value;
      window.trafficDB.selectedDistrict = distId;
      const distObj = window.trafficDB.getDistrictById(window.trafficDB.selectedState, distId);
      if (distObj && window.mapController) {
        window.mapController.flyToLocation(distObj.center[0], distObj.center[1], 13);
      }
      this.renderAllViews();
      this.showToast(`Local Enforcement Focused on District: ${distObj ? distObj.name : distId}`, "info");
    });

    // Initialize Vehicle Number Plate Live GPS Tracker
    this.initVehicleTracker();
  },

  updateDistrictDropdown(stateCode) {
    const distSelect = document.getElementById('selectDistrict');
    if (!distSelect) return;

    const districts = window.trafficDB.getDistrictsForState(stateCode);
    distSelect.innerHTML = districts.map((d, idx) => 
      `<option value="${d.id}" ${idx === 0 ? 'selected' : ''}>${d.name}</option>`
    ).join('');

    if (districts.length > 0) {
      window.trafficDB.selectedDistrict = districts[0].id;
    }
  },

  initVehicleTracker() {
    const btnTrack = document.getElementById('btnTrackVehicleLocation');
    const inputPlate = document.getElementById('trackVehiclePlateInput');

    if (btnTrack) {
      btnTrack.addEventListener('click', () => {
        const plate = inputPlate ? inputPlate.value.trim().toUpperCase() : 'DL-01-AB-4921';
        this.trackVehicleByPlate(plate, true);
      });
    }

    if (inputPlate) {
      inputPlate.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.trackVehicleByPlate(inputPlate.value.trim().toUpperCase(), true);
        }
      });
    }

    // Auto-locate default vehicle on map on boot
    setTimeout(() => {
      const defaultPlate = inputPlate && inputPlate.value ? inputPlate.value.trim().toUpperCase() : 'DL-01-AB-4921';
      this.trackVehicleByPlate(defaultPlate, false);
    }, 800);
  },

  trackVehicleByPlate(plateInput, showToastAlert = true) {
    const rawPlate = plateInput || 'DL-01-AB-4921';
    
    // Resolve full vehicle details via Telemetry Vault
    const v = window.telemetryVault 
      ? window.telemetryVault.resolveVehicleDetails(rawPlate)
      : {
          plate: rawPlate,
          owner: "Registered Vehicle Owner",
          makeModel: "Sedan (4-Wheeler)",
          class: "Cars & SUVs (4-Wheelers)",
          icon: "🚗",
          districtName: "National Highway Corridor",
          corridor: "State Arterial Road",
          stateCode: "DL",
          stateName: "Delhi NCT",
          speed: 54,
          lat: 28.6139,
          lng: 77.2090,
          ipAddress: "164.100.24.11",
          fuelType: "Petrol / Hybrid",
          rtoCode: "DL-01"
        };

    const matchedState = window.trafficDB.getStateByCode(v.stateCode);
    if (matchedState) {
      if (matchedState.code !== window.trafficDB.selectedState) {
        window.trafficDB.selectedState = matchedState.code;
        const stateSelect = document.getElementById('selectState');
        if (stateSelect) stateSelect.value = matchedState.code;
        this.updateDistrictDropdown(matchedState.code);
      }
      
      const distSelect = document.getElementById('selectDistrict');
      if (distSelect && distSelect.querySelector(`option[value="${v.rtoCode}"]`)) {
        distSelect.value = v.rtoCode;
        window.trafficDB.selectedDistrict = v.rtoCode;
      }
    }

    // Update status badge with Owner, Make, Location, Speed & Dynamic IP
    const statusEl = document.getElementById('trackedVehicleStatus');
    if (statusEl) {
      statusEl.innerHTML = `Target: <strong>${v.plate}</strong> • Owner: <strong style="color:#b45309;">${v.owner}</strong> • Location: <strong>${v.districtName}</strong> • Speed: <strong>${v.speed} km/h</strong> • IP: <span style="font-family:var(--font-mono); font-weight:700;">${v.ipAddress}</span>`;
    }

    // Plot on GIS/Satellite map
    if (window.mapController) {
      window.mapController.trackVehicleOnMap(v.plate, v);
    }

    if (showToastAlert) {
      this.switchTab('current');
      this.showToast(`🛰️ NavIC GPS Locked: [${v.plate}] Owner: ${v.owner} (${v.districtName})`, "success");
    }
  },

  bindEvents() {
    // Navigation Tabs (Sidebar & any header tabs)
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tabName = item.getAttribute('data-tab');
        if (tabName) this.switchTab(tabName);
      });
    });

    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        if (tabName) this.switchTab(tabName);
      });
    });

    // Theme Toggle
    const btnTheme = document.getElementById('btnThemeToggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        this.showToast(next === 'dark' ? "Command Dark Mode Activated" : "Classic Sovereign Government Theme Set", "info");
      });
    }

    // Satellite Surveillance Toggle (ISRO / NavIC Recon Feed)
    const btnSat = document.getElementById('btnToggleSatellite');
    if (btnSat && window.mapController) {
      btnSat.addEventListener('click', () => {
        const isSat = window.mapController.toggleSatelliteSurveillance();
        const btnText = document.getElementById('satBtnText');
        if (btnText) {
          btnText.innerText = isSat 
            ? "🗺️ Disconnect Satellite (Switch to Vector Map)" 
            : "🛰️ Connect Satellite Surveillance (ISRO Link)";
        }
        btnSat.style.background = isSat ? "#0284c7" : "#0f3057";
        btnSat.style.color = "#ffffff";
        this.showToast(isSat 
          ? "🛰️ ISRO Cartosat-3 / EOS-06 Earth Observation Satellite Feed Connected! (0.28m HD)" 
          : "Switched back to Standard Vector Cartography", isSat ? "success" : "info");
      });
    }

    // Role / Officer Pass Switcher Button (Header)
    const btnOfficerPass = document.getElementById('btnOfficerPass');
    if (btnOfficerPass) {
      btnOfficerPass.addEventListener('click', () => {
        this.openModal('officerPassModal');
      });
    }

    // Citizen Incident Reporting Form
    const formCitizenReport = document.getElementById('formCitizenReport');
    if (formCitizenReport) {
      formCitizenReport.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCitizenReportSubmit();
      });
    }

    // Road Construction Zone Add Button
    const btnNewRoadwork = document.getElementById('btnNewRoadwork');
    if (btnNewRoadwork) {
      btnNewRoadwork.addEventListener('click', () => {
        this.openModal('newRoadworkModal');
      });
    }

    // Google Maps & Satellite Area Search & Route Finder
    const btnSearchRoute = document.getElementById('btnSearchAreaRoute');
    const inputAreaSearch = document.getElementById('mapAreaSearchInput');
    if (btnSearchRoute && inputAreaSearch) {
      btnSearchRoute.addEventListener('click', () => {
        this.handleSearchAreaRoute();
      });
      inputAreaSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSearchAreaRoute();
        }
      });
    }

    const btnGmapsExt = document.getElementById('btnSearchGmapsExternal');
    if (btnGmapsExt && inputAreaSearch) {
      btnGmapsExt.addEventListener('click', () => {
        const q = inputAreaSearch.value.trim() || 'India High Traffic Corridors';
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
      });
    }

    // Live Government & Google Mobility AI Sync Button
    const btnSyncGovtAI = document.getElementById('btnSyncGovtAI');
    if (btnSyncGovtAI) {
      btnSyncGovtAI.addEventListener('click', () => {
        this.handleSyncGovtAI();
      });
    }

    // New Roadwork Form Submission
    const formRoadwork = document.getElementById('formNewRoadwork');
    if (formRoadwork) {
      formRoadwork.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateRoadwork();
      });
    }

    // Officer Pass Verification Form Submission
    const formVerifyPass = document.getElementById('formVerifyOfficerPass');
    if (formVerifyPass) {
      formVerifyPass.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleVerifyOfficerPass();
      });
    }

    // Search Violations Filter
    const searchViolations = document.getElementById('searchViolations');
    if (searchViolations) {
      searchViolations.addEventListener('input', () => this.renderViolationsTable());
    }

    const filterVehicleType = document.getElementById('filterVehicleType');
    if (filterVehicleType) {
      filterVehicleType.addEventListener('change', () => this.renderViolationsTable());
    }

    // Real-time Event listeners
    window.addEventListener('traffic-tick', (e) => this.handleTrafficTick(e.detail));
    window.addEventListener('anpr-detection', (e) => this.handleAnprDetection(e.detail));
  },

  renderAllViews() {
    this.renderViolationsTable();
    this.renderRoadworksList();
    this.renderVehicleRatioStats();
    this.renderAuditLogsTable();
    this.renderVahanDashboard();
    this.renderCasesList();
    this.renderEmergenciesList();
    this.searchAndDisplayCase();
    this.updateCasesBadge();
  },

  // =========================================================================
  // ROLE SWITCHER & SIDEBAR FLOW NAVIGATION
  // =========================================================================

  switchRole(role) {
    this.currentRole = role;

    // 1. Update pills
    document.querySelectorAll('.role-pill-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const pill = document.getElementById(`pillRole${role.charAt(0).toUpperCase() + role.slice(1)}`);
    if (pill) pill.classList.add('active');

    // 2. Update Header Status & Sidebar Profile Card
    const dot = document.getElementById('roleIndicatorDot');
    const roleText = document.getElementById('activeUserRoleText');
    const sidebarName = document.getElementById('sidebarOfficerName');
    const sidebarClear = document.getElementById('sidebarOfficerClearance');

    if (role === 'citizen') {
      if (dot) dot.style.background = '#10b981';
      if (roleText) roleText.innerHTML = `Mode: <strong>Citizen Public Portal</strong>`;
      if (sidebarName) sidebarName.innerText = 'Citizen Guest Portal';
      if (sidebarClear) sidebarClear.innerText = 'Public Access Clearance';
      this.showToast("Switched to Citizen Public Portal Mode", "info");
      this.switchTab('citizen-report');
    } else if (role === 'officer') {
      if (dot) dot.style.background = '#f59e0b';
      const off = this.currentOfficer || {
        name: 'Insp. Rajesh Kumar',
        rank: 'Traffic Inspector (ANPR Lead)',
        badgeNumber: 'TR-INSP-5501',
        clearance: 'Level 3 - Tactical Enforcement'
      };
      this.currentOfficer = off;
      if (roleText) roleText.innerHTML = `Mode: <strong style="color:#b45309;">Officer: ${off.name} (${off.badgeNumber})</strong>`;
      if (sidebarName) sidebarName.innerText = `${off.rank}: ${off.name}`;
      if (sidebarClear) sidebarClear.innerText = `${off.badgeNumber} • ${off.clearance}`;
      this.showToast(`Officer Enforcement Mode Active: ${off.name}`, "info");
      this.switchTab('officer-cases');
    } else if (role === 'admin') {
      if (dot) dot.style.background = '#dc2626';
      if (roleText) roleText.innerHTML = `Mode: <strong style="color:#dc2626;">National Command Administrator</strong>`;
      if (sidebarName) sidebarName.innerText = 'Director General / System Admin';
      if (sidebarClear) sidebarClear.innerText = 'Root Security Clearance (SHA-256)';
      this.showToast("Administrator Command Console Activated", "info");
      this.switchTab('admin');
    }
  },

  switchTab(tabName) {
    this.activeTab = tabName;
    
    // Sync sidebar buttons
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      const target = item.getAttribute('data-tab');
      item.classList.toggle('active', target === tabName);
    });

    // Also sync header nav tabs if present
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });

    // Show selected panel
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`panel-${tabName}`);
    if (target) {
      target.classList.add('active');
    }

    if (tabName === 'current') {
      if (window.mapController) window.mapController.refresh();
    } else if (tabName === 'emergency') {
      this.renderEmergenciesList();
    } else if (tabName === 'citizen-track') {
      this.searchAndDisplayCase();
    } else if (tabName === 'officer-cases') {
      this.renderCasesList();
    } else if (tabName === 'violations') {
      this.renderViolationsTable();
    } else if (tabName === 'roadworks') {
      this.renderRoadworksList();
    } else if (tabName === 'vehicle-ratios') {
      if (window.analyticsController) window.analyticsController.renderVehicleRatiosCharts();
    } else if (tabName === 'admin') {
      this.renderAuditLogsTable();
    }

    if (window.lucide) lucide.createIcons();
  },

  // =========================================================================
  // OFFICER LOGIN (1. User ID, 2. Password, 3. Camera Access PIN & Scope)
  // =========================================================================

  fillOfficerPreset(badge, pass, pin, camScope = 'ALL_CAMS') {
    const badgeEl = document.getElementById('inOfficerBadge');
    const passEl = document.getElementById('inOfficerPass');
    const pinEl = document.getElementById('inOfficerPin');
    const scopeEl = document.getElementById('inOfficerCameraScope');

    if (badgeEl) badgeEl.value = badge;
    if (passEl) passEl.value = pass;
    if (pinEl) pinEl.value = pin;
    if (scopeEl) scopeEl.value = camScope;

    this.showToast(`1-Click Preset Loaded: [${badge}] Pass: ${pass} | PIN: ${pin}`, "info");
  },

  async handleVerifyOfficerPass() {
    const badgeEl = document.getElementById('inOfficerBadge');
    const passEl = document.getElementById('inOfficerPass');
    const pinEl = document.getElementById('inOfficerPin');
    const scopeEl = document.getElementById('inOfficerCameraScope');

    const officerId = badgeEl ? badgeEl.value.trim() : '';
    const passCode = passEl ? passEl.value.trim() : '';
    const pin = pinEl ? pinEl.value.trim() : '';
    const scope = scopeEl ? scopeEl.value : 'ALL_CAMS';

    if (!officerId) {
      this.showToast("Please enter 1. User ID / Officer Badge.", "error");
      return;
    }
    if (!passCode) {
      this.showToast("Please enter 2. Official Clearance Password.", "error");
      return;
    }
    if (!pin) {
      this.showToast("Please enter 3. Camera Access PIN.", "error");
      return;
    }

    // 1. Try Backend API Verification
    try {
      const res = await window.trafficDB.verifyOfficerPass(officerId, passCode, pin);
      if (res && res.success && res.officer) {
        this.onOfficerAuthenticated(res.officer, scope);
        return;
      }
    } catch (e) {
      console.warn("Backend auth call fallback:", e);
    }

    // 2. Client-side Local Fallback Verification
    const officers = window.trafficDB.getOfficers();
    const officer = officers.find(o => 
      (o.badgeNumber && o.badgeNumber.toLowerCase() === officerId.toLowerCase()) || 
      (o.id && o.id.toLowerCase() === officerId.toLowerCase())
    );

    if (!officer) {
      this.showToast("Officer Badge / ID not registered in National Traffic Directory.", "error");
      return;
    }

    const defaultCredentials = {
      'IPS-8801-CIP': { pass: 'DGP@2026', pin: '9090' },
      'OFF-DGP-01': { pass: 'DGP@2026', pin: '9090' },
      'IPS-9244-DEL': { pass: 'SP@2026', pin: '7070' },
      'OFF-SP-02': { pass: 'SP@2026', pin: '7070' },
      'IPS-7714-RJ': { pass: 'RAJ@2026', pin: '6060' },
      'OFF-SP-RJ-06': { pass: 'RAJ@2026', pin: '6060' },
      'TR-INSP-5501': { pass: 'INSP@2026', pin: '5050' },
      'OFF-INSP-03': { pass: 'INSP@2026', pin: '5050' },
      'TR-SI-4219': { pass: 'PATROL@2026', pin: '3030' },
      'OFF-PATROL-04': { pass: 'PATROL@2026', pin: '3030' },
      'TR-WRD-1102': { pass: 'WARDEN@2026', pin: '1010' },
      'OFF-WARDEN-05': { pass: 'WARDEN@2026', pin: '1010' }
    };

    const targetCreds = defaultCredentials[officer.badgeNumber] || defaultCredentials[officer.id] || { pass: 'INSP@2026', pin: '5050' };
    const passMatch = passCode && passCode.toUpperCase() === targetCreds.pass.toUpperCase();
    const pinMatch = pin && pin === targetCreds.pin;

    if (passMatch || pinMatch) {
      this.onOfficerAuthenticated(officer, scope);
    } else {
      this.showToast("Authentication Failed: Invalid Password or Camera PIN.", "error");
    }
  },

  onOfficerAuthenticated(officer, cameraScope) {
    this.currentOfficer = officer;
    this.displayOfficialDutyPass(officer);
    this.closeModal('officerPassModal');
    
    // Switch to Officer role & unlock case review desk
    this.switchRole('officer');
    
    // Log audit trail entry
    window.trafficDB.logAudit({
      user: `${officer.name} (${officer.badgeNumber})`,
      role: officer.rank,
      action: "OFFICER_AUTHENTICATED",
      details: `Successful Level 1-5 Duty Pass Verification. Camera Scope: ${cameraScope}`
    });

    this.showToast(`✓ Officer Authenticated: ${officer.rank} (${officer.clearance}) - Camera Feed Access PIN Verified!`, "success");
    this.switchTab('officer-cases');
  },

  displayOfficialDutyPass(officer) {
    const card = document.getElementById('digitalDutyPassCard');
    if (card) {
      const nameEl = document.getElementById('passOfficerName');
      if (nameEl) nameEl.innerText = officer.name;
      const rankEl = document.getElementById('passOfficerRank');
      if (rankEl) rankEl.innerText = officer.rank;
      const badgeEl = document.getElementById('passBadgeNumber');
      if (badgeEl) badgeEl.innerText = officer.badgeNumber;
      const jurisEl = document.getElementById('passJurisdiction');
      if (jurisEl) jurisEl.innerText = officer.jurisdiction;
      const clearEl = document.getElementById('passClearance');
      if (clearEl) clearEl.innerText = officer.clearance;
      const valEl = document.getElementById('passValidity');
      if (valEl) valEl.innerText = officer.passValidity || '2027-12-31';
      const dutiesEl = document.getElementById('passDuties');
      if (dutiesEl) dutiesEl.innerText = officer.duties;
    }

    // Update Header Active Officer Badge to show authenticated session
    const headerBtn = document.getElementById('btnOfficerPass');
    if (headerBtn) {
      headerBtn.innerHTML = `
        <i data-lucide="shield-check" style="color:#10b981;"></i>
        <span>✓ ${officer.rank.split(' ')[0]}: ${officer.name.split(' ')[0]} (${officer.badgeNumber})</span>
      `;
      headerBtn.style.background = '#064e3b';
      headerBtn.style.borderColor = '#059669';
      if (window.lucide) lucide.createIcons();
    }
  },

  // =========================================================================
  // CITIZEN FLOW: REPORT ISSUE -> EVIDENCE + GPS -> AI PROCESSING
  // =========================================================================

  autoDetectGps() {
    const coordsEl = document.getElementById('citGpsCoords');
    const state = window.trafficDB.getStateByCode(window.trafficDB.selectedState);
    const lat = state && state.center ? state.center[0] : 28.6139;
    const lng = state && state.center ? state.center[1] : 77.2090;
    const offsetLat = (Math.random() * 0.02 - 0.01).toFixed(4);
    const offsetLng = (Math.random() * 0.02 - 0.01).toFixed(4);
    const finalGps = `${(lat + parseFloat(offsetLat)).toFixed(4)}° N, ${(lng + parseFloat(offsetLng)).toFixed(4)}° E`;
    if (coordsEl) coordsEl.value = finalGps;
    this.showToast(`📍 GPS Coordinates Locked via NavIC Satellite (${finalGps})`, "success");
  },

  async handleCitizenReportSubmit() {
    const catEl = document.getElementById('citCategory');
    const locEl = document.getElementById('citLocation');
    const descEl = document.getElementById('citDescription');
    const gpsEl = document.getElementById('citGpsCoords');

    const cat = catEl ? catEl.value : 'Traffic Violation';
    const loc = locEl ? locEl.value.trim() : 'Ring Road Corridor';
    const desc = descEl ? descEl.value.trim() : 'Incident reported by citizen';
    const gps = gpsEl ? gpsEl.value.trim() : '28.6250° N, 77.2100° E';

    if (!desc) {
      this.showToast("Please provide an incident description.", "error");
      return;
    }

    // AI Pre-Processing Engine Simulation
    const isAccident = cat.includes('Accident');
    const isReckless = cat.includes('Violation') || cat.includes('Drunken');
    const aiPriority = isAccident ? "HIGH" : (isReckless ? "MEDIUM" : "NORMAL");
    const aiRisk = isAccident ? "Severe Crash Detected" : (isReckless ? "High-Speed Dangerous Driving" : "Roadway Disruption");
    const actionNeeded = isAccident ? "Dispatch Emergency Ambulance & Patrol" : "Review Evidence & Issue e-Challan";

    const newCase = {
      id: "CASE-2026-" + Math.floor(100 + Math.random() * 900),
      category: cat,
      location: loc,
      description: desc,
      gpsCoords: gps,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: "Under Review",
      stepIndex: 2, // 1: Submitted, 2: Under Review, 3: Action Taken, 4: Closed
      evidenceFile: "photo_dashcam_evidence.jpg",
      aiClassification: {
        priority: aiPriority,
        risk: aiRisk,
        duplicateFound: false,
        recommendedAction: actionNeeded
      },
      assignedOfficer: {
        name: "Insp. Rajesh Kumar",
        badge: "TR-INSP-5501",
        unit: "PCR Gantry 04 Interceptor"
      },
      officerDecision: null,
      fineAmount: isReckless ? 2000 : 0,
      userNotified: true,
      feedbackRating: null,
      feedbackComment: null
    };

    const saved = await window.trafficDB.addCase(newCase);
    this.updateCasesBadge();

    // Auto-populate Case Search and Switch to Case Tracking View
    const inputSearch = document.getElementById('inputCaseSearch');
    if (inputSearch) inputSearch.value = saved.id;
    
    this.switchTab('citizen-track');
    this.searchAndDisplayCase(saved.id);

    this.showToast(`✓ Case #${saved.id} Submitted! AI Classified as [${aiPriority} PRIORITY] & assigned to Officer.`, "success");
  },

  // =========================================================================
  // CITIZEN STATUS TRACKER & 4-STEP VISUAL PROGRESSION + 5-STAR RATING
  // =========================================================================

  searchAndDisplayCase(targetId = null) {
    const inputSearch = document.getElementById('inputCaseSearch');
    const query = (targetId || (inputSearch ? inputSearch.value.trim().toUpperCase() : '')) || 'CASE-2026-801';
    const container = document.getElementById('caseTrackerDisplay');
    if (!container) return;

    let cases = window.trafficDB.getCases();
    let c = cases.find(item => item.id.toUpperCase() === query || (item.category && item.category.toUpperCase().includes(query)));

    if (!c && cases.length > 0) {
      c = cases[0];
    }

    if (!c) {
      container.innerHTML = `<div style="text-align:center; padding:24px; color:#64748b;">No active case record found for "${query}". Try reporting an issue first.</div>`;
      return;
    }

    const step = c.stepIndex || 2;
    const isStep1Done = step >= 1;
    const isStep2Done = step >= 2;
    const isStep3Done = step >= 3;
    const isStep4Done = step >= 4;

    container.innerHTML = `
      <!-- Case Header Card -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:14px;">
        <div>
          <div style="display:flex; gap:6px; align-items:center; margin-bottom:4px;">
            <span style="background:#111827; color:#fff; font-family:var(--font-mono); font-size:12px; font-weight:800; padding:2px 8px; border-radius:3px;">
              ${c.id}
            </span>
            <span style="background:${c.status === 'Closed' ? '#f0fdf4' : '#fffbeb'}; color:${c.status === 'Closed' ? '#15803d' : '#b45309'}; border:1px solid ${c.status === 'Closed' ? '#86efac' : '#fde68a'}; font-size:11px; font-weight:700; padding:2px 8px; border-radius:3px;">
              ${c.status}
            </span>
            <span style="background:#f1f5f9; color:#0f172a; font-size:11px; font-weight:600; padding:2px 8px; border-radius:3px;">
              ${c.category}
            </span>
          </div>
          <div style="font-size:14px; font-weight:800; color:#0a2540;">
            ${c.location}
          </div>
          <div style="font-size:11px; color:#64748b; font-family:var(--font-mono); margin-top:2px;">
            📍 GPS: ${c.gpsCoords || '28.6250° N, 77.2100° E'} • Reported: ${c.dateTime}
          </div>
        </div>

        <div style="text-align:right;">
          <div style="font-size:11px; color:#64748b;">Assigned Officer:</div>
          <div style="font-weight:700; color:#0f172a; font-size:12px;">${c.assignedOfficer ? c.assignedOfficer.name : 'Insp. Rajesh Kumar'}</div>
          <div style="font-size:10px; color:#059669; font-weight:600;">${c.assignedOfficer ? c.assignedOfficer.badge : 'TR-INSP-5501'}</div>
        </div>
      </div>

      <!-- 4-STEP VISUAL PROGRESSION STEPPER -->
      <div class="case-progress-stepper">
        
        <div class="case-step ${isStep1Done ? (step === 1 ? 'active' : 'completed') : ''}">
          <div class="case-step-circle">${isStep1Done && step > 1 ? '✓' : '1'}</div>
          <div class="case-step-label">Submitted</div>
          <div style="font-size:10px; color:#64748b;">Evidence Logged</div>
        </div>

        <div class="case-step ${isStep2Done ? (step === 2 ? 'active' : 'completed') : ''}">
          <div class="case-step-circle">${isStep2Done && step > 2 ? '✓' : '2'}</div>
          <div class="case-step-label">AI &amp; Under Review</div>
          <div style="font-size:10px; color:#64748b;">Officer Reviewing</div>
        </div>

        <div class="case-step ${isStep3Done ? (step === 3 ? 'active' : 'completed') : ''}">
          <div class="case-step-circle">${isStep3Done && step > 3 ? '✓' : '3'}</div>
          <div class="case-step-label">Action Taken</div>
          <div style="font-size:10px; color:#64748b;">e-Challan / Patrol</div>
        </div>

        <div class="case-step ${isStep4Done ? 'completed' : ''}">
          <div class="case-step-circle">${isStep4Done ? '✓' : '4'}</div>
          <div class="case-step-label">Case Closed</div>
          <div style="font-size:10px; color:#64748b;">Feedback / Rating</div>
        </div>

      </div>

      <!-- Details Grid: Description, AI Findings & Officer Action -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:14px;">
        
        <!-- Column 1: Citizen Description & Evidence -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; padding:10px 12px; font-size:11px;">
          <div style="font-weight:700; color:#0f172a; margin-bottom:4px;">📝 Citizen Statement &amp; Evidence</div>
          <div style="color:#334155; line-height:1.5;">${c.description}</div>
          <div style="margin-top:8px; display:flex; align-items:center; gap:8px;">
            <span style="background:#111827; color:#fff; font-size:10px; padding:2px 6px; border-radius:3px;">📷 Photo Evidence Attached</span>
            <span style="color:#059669; font-size:10px;">✓ SHA-256 Integrity Verified</span>
          </div>
        </div>

        <!-- Column 2: AI Pre-Processing & Officer Action -->
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:4px; padding:10px 12px; font-size:11px;">
          <div style="font-weight:700; color:#14532d; margin-bottom:4px;">🤖 AI Processing &amp; Officer Action Status</div>
          <div style="color:#166534; line-height:1.4;">
            • <strong>AI Priority:</strong> <span style="font-weight:800;">${c.aiClassification ? c.aiClassification.priority : 'HIGH'}</span><br/>
            • <strong>Risk Assessment:</strong> ${c.aiClassification ? c.aiClassification.risk : 'Vehicle Breach'}<br/>
            • <strong>Action Required:</strong> ${c.officerDecision ? c.officerDecision : (c.aiClassification ? c.aiClassification.recommendedAction : 'Under Traffic Police Investigation')}<br/>
            ${c.fineAmount ? `• <strong style="color:#b45309;">e-Challan Penalty: ₹${c.fineAmount.toLocaleString()}</strong>` : ''}
          </div>
        </div>

      </div>

      <!-- STEP 4: CITIZEN FEEDBACK & 5-STAR RATING WIDGET -->
      <div style="margin-top:14px; background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="font-weight:700; color:#92400e; font-size:12px;">
              ⭐ Citizen Feedback &amp; Service Rating
            </div>
            <div style="font-size:10px; color:#78350f;">
              Help the Traffic Department improve by rating the response speed and resolution of this case.
            </div>
          </div>

          ${c.feedbackRating ? `
            <div style="background:#fff; border:1px solid #f59e0b; padding:4px 10px; border-radius:4px; font-size:12px; font-weight:700; color:#b45309;">
              ✓ You Rated: ${'⭐'.repeat(c.feedbackRating)} (${c.feedbackRating} / 5 Stars)
            </div>
          ` : `
            <div style="display:flex; gap:6px; align-items:center;">
              <div style="display:flex; gap:2px; font-size:18px; cursor:pointer;" id="starRatingContainer">
                <span onclick="App.submitCaseRating('${c.id}', 1)">⭐</span>
                <span onclick="App.submitCaseRating('${c.id}', 2)">⭐</span>
                <span onclick="App.submitCaseRating('${c.id}', 3)">⭐</span>
                <span onclick="App.submitCaseRating('${c.id}', 4)">⭐</span>
                <span onclick="App.submitCaseRating('${c.id}', 5)">⭐</span>
              </div>
              <span style="font-size:11px; color:#92400e; font-weight:600;">(Click stars to submit rating)</span>
            </div>
          `}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  async submitCaseRating(caseId, rating) {
    await window.trafficDB.submitCaseFeedback(caseId, rating, "Resolved promptly by Traffic Enforcement");
    this.searchAndDisplayCase(caseId);
    this.renderCasesList();
    this.showToast(`Thank you! Your feedback (${rating} Stars) has been recorded and case marked Closed.`, "success");
  },

  // =========================================================================
  // OFFICER FLOW: ASSIGNED CASES QUEUE & REVIEW / ACTION
  // =========================================================================

  renderCasesList() {
    const container = document.getElementById('officerCasesContainer');
    if (!container) return;

    const list = window.trafficDB.getCases();
    if (list.length === 0) {
      container.innerHTML = `<div style="padding:16px; color:#64748b; font-size:12px;">No complaints or cases currently pending officer review.</div>`;
      return;
    }

    container.innerHTML = list.map(c => {
      const isClosed = c.status === 'Closed';
      const isActionTaken = c.stepIndex >= 3;

      return `
        <div style="border:1px solid #e2e8f0; border-radius:6px; padding:14px; margin-bottom:12px; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <div>
              <div style="display:flex; gap:6px; align-items:center; margin-bottom:4px;">
                <span style="background:#111827; color:#fff; font-family:var(--font-mono); font-size:11px; font-weight:800; padding:2px 7px; border-radius:3px;">
                  ${c.id}
                </span>
                <span style="background:#fef2f2; color:#b91c1c; font-weight:700; font-size:11px; padding:2px 7px; border-radius:3px; border:1px solid #fca5a5;">
                  ${c.category}
                </span>
                <span style="background:${c.status === 'Closed' ? '#f0fdf4' : '#fffbeb'}; color:${c.status === 'Closed' ? '#15803d' : '#b45309'}; font-size:11px; font-weight:700; padding:2px 7px; border-radius:3px;">
                  Status: ${c.status}
                </span>
              </div>
              <div style="font-weight:800; color:#0a2540; font-size:13px;">${c.location}</div>
              <div style="font-size:11px; color:#64748b; font-family:var(--font-mono);">
                📍 ${c.gpsCoords || '28.6250° N, 77.2100° E'} • Logged: ${c.dateTime}
              </div>
            </div>

            <div style="text-align:right;">
              <span style="background:#f1f5f9; color:#0f172a; font-size:10px; font-weight:700; padding:3px 8px; border-radius:3px;">
                AI Priority: ${c.aiClassification ? c.aiClassification.priority : 'HIGH'}
              </span>
            </div>
          </div>

          <div style="font-size:12px; color:#334155; line-height:1.5; margin-bottom:10px; background:#f8fafc; padding:8px 10px; border-radius:4px;">
            <strong>Incident Details:</strong> ${c.description}
          </div>

          <!-- Officer Action Flow Buttons -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; border-top:1px solid #f1f5f9; padding-top:8px;">
            <div style="font-size:11px; color:#64748b;">
              ${c.officerDecision ? `Action: <strong style="color:#059669;">${c.officerDecision}</strong>` : 'Action Pending Officer Review'}
            </div>

            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${!isActionTaken ? `
                <button class="btn-action-primary" style="font-size:11px; padding:4px 8px; background:#f0fdf4; border-color:#86efac; color:#15803d;" onclick="App.handleOfficerCaseAction('${c.id}', 'VALIDATE')">
                  ✓ Valid Report
                </button>
                <button class="btn-action-primary" style="font-size:11px; padding:4px 8px; background:#fef2f2; border-color:#fca5a5; color:#b91c1c;" onclick="App.handleOfficerCaseAction('${c.id}', 'REJECT')">
                  ✗ Reject / Info
                </button>
                <button class="btn-action-primary" style="font-size:11px; padding:4px 8px; background:#fffbeb; border-color:#fde68a; color:#b45309;" onclick="App.handleOfficerCaseAction('${c.id}', 'CHALLAN')">
                  Issue e-Challan (₹2,000)
                </button>
                <button class="btn-action-primary" style="font-size:11px; padding:4px 8px; background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8;" onclick="App.handleOfficerCaseAction('${c.id}', 'DISPATCH')">
                  Dispatch Patrol Unit
                </button>
              ` : `
                ${!isClosed ? `
                  <button class="btn-action-primary" style="font-size:11px; padding:4px 8px; background:#0f172a; border-color:#0f172a; color:#fff;" onclick="App.handleOfficerCaseAction('${c.id}', 'CLOSE')">
                    Close Case &amp; Notify Citizen
                  </button>
                ` : `
                  <span style="font-size:11px; color:#059669; font-weight:700;">✓ Case Closed (Feedback Recorded)</span>
                `}
              `}
            </div>
          </div>

        </div>
      `;
    }).join('');
  },

  async handleOfficerCaseAction(caseId, actionType) {
    let patch = {};
    if (actionType === 'VALIDATE') {
      patch = {
        status: "Under Review (Validated)",
        stepIndex: 2,
        officerDecision: "Verified by Officer - Evidence Validated"
      };
      this.showToast(`Case #${caseId} marked as Validated. Investigation ongoing.`, "info");
    } else if (actionType === 'REJECT') {
      patch = {
        status: "Closed (Rejected)",
        stepIndex: 4,
        officerDecision: "Rejected - Insufficient Evidence or Duplicate"
      };
      this.showToast(`Case #${caseId} Rejected & Closed. Citizen notified.`, "info");
    } else if (actionType === 'CHALLAN') {
      patch = {
        status: "Action Taken (Fine Issued)",
        stepIndex: 3,
        fineAmount: 2000,
        officerDecision: "Statutory e-Challan ₹2,000 Issued under Motor Vehicles Act"
      };
      this.showToast(`Official e-Challan of ₹2,000 Issued for Case #${caseId}!`, "success");
    } else if (actionType === 'DISPATCH') {
      patch = {
        status: "Action Taken (Patrol Dispatched)",
        stepIndex: 3,
        officerDecision: "Nearest Highway Patrol Unit Dispatched to GPS Location"
      };
      this.showToast(`Patrol Interceptor Dispatched for Case #${caseId}!`, "success");
    } else if (actionType === 'CLOSE') {
      patch = {
        status: "Closed",
        stepIndex: 4,
        officerDecision: "Case Resolved by Traffic Officer. Ready for Citizen Feedback."
      };
      this.showToast(`Case #${caseId} Closed successfully.`, "success");
    }

    await window.trafficDB.updateCase(caseId, patch);
    this.renderCasesList();
    this.updateCasesBadge();
    this.searchAndDisplayCase(caseId);
  },

  updateCasesBadge() {
    const badge = document.getElementById('badgeCasesCount');
    if (!badge) return;
    const cases = window.trafficDB.getCases();
    const openCount = cases.filter(c => c.status !== 'Closed').length;
    badge.innerText = openCount;
  },

  // =========================================================================
  // EMERGENCY FLOW (112 SOS -> TYPE -> GPS -> DISPATCH -> COUNTDOWN -> RESOLVE)
  // =========================================================================

  async triggerEmergencyType(type) {
    const banner = document.getElementById('emergencyStatusBanner');
    const title = document.getElementById('emgBannerTitle');
    const desc = document.getElementById('emgBannerDesc');
    const countdown = document.getElementById('emgCountdown');

    const state = window.trafficDB.getStateByCode(window.trafficDB.selectedState);
    const locName = state ? `${state.name} Highway Corridor` : 'Central Express Corridor';

    const patrolUnits = {
      'Accident': 'Highway Rescue Unit 09 (Innova Patrol)',
      'Medical': 'Ambulance 108 Green Corridor Escort',
      'Fire': 'Rapid Response Fire Tender 04',
      'Police': 'Interceptor PCR 12 (Armed SI Team)'
    };

    const assigned = patrolUnits[type] || 'Emergency Response Unit 01';
    const emgRecord = {
      id: "SOS-112-" + Math.floor(100 + Math.random() * 900),
      type: type,
      location: locName,
      status: "Patrol Dispatched",
      assignedPatrol: assigned,
      etaMinutes: 3,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    this.activeEmergency = await window.trafficDB.triggerEmergency(emgRecord);

    if (banner) banner.style.display = 'block';
    if (title) title.innerText = `${type.toUpperCase()} EMERGENCY BROADCASTED`;
    if (desc) desc.innerText = `Nearest Response Team: ${assigned} • GPS Locked`;
    
    // Start Live ETA Countdown
    let remainingSecs = 180;
    if (this.emergencyTimerId) clearInterval(this.emergencyTimerId);

    if (countdown) countdown.innerText = "ETA: 3 MINS";

    this.emergencyTimerId = setInterval(() => {
      remainingSecs -= 1;
      if (remainingSecs <= 0) {
        clearInterval(this.emergencyTimerId);
        if (countdown) countdown.innerText = "UNIT ON SCENE";
        if (desc) desc.innerText = `Patrol Unit Arrived at ${locName} • Incident Handled`;
      } else {
        const mins = Math.floor(remainingSecs / 60);
        const secs = remainingSecs % 60;
        if (countdown) countdown.innerText = `ETA: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
    }, 1000);

    this.renderEmergenciesList();
    this.showToast(`🚨 112 SOS Dispatched: ${type} Team en route to ${locName}!`, "error");
  },

  resolveCurrentEmergency() {
    if (this.emergencyTimerId) clearInterval(this.emergencyTimerId);
    const banner = document.getElementById('emergencyStatusBanner');
    if (banner) banner.style.display = 'none';

    if (this.activeEmergency) {
      this.activeEmergency.status = "Resolved";
    }

    this.renderEmergenciesList();
    this.showToast("✓ Emergency Incident Handled & Marked Resolved.", "success");
  },

  renderEmergenciesList() {
    const tbody = document.getElementById('emergencyTableBody');
    if (!tbody) return;

    const list = window.trafficDB.getEmergencies();
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:16px; color:#64748b;">No active 112 emergency calls reported.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(e => `
      <tr>
        <td><strong style="color:#b91c1c; font-family:var(--font-mono);">${e.id}</strong></td>
        <td><span style="background:#fef2f2; color:#b91c1c; font-weight:700; padding:2px 6px; border-radius:3px; font-size:11px;">${e.type}</span></td>
        <td>${e.location}</td>
        <td><span style="background:${e.status === 'Resolved' ? '#f0fdf4' : '#fffbeb'}; color:${e.status === 'Resolved' ? '#15803d' : '#b45309'}; padding:2px 6px; border-radius:3px; font-size:11px; font-weight:700;">${e.status}</span></td>
        <td><strong>${e.assignedPatrol}</strong></td>
        <td><strong style="color:#dc2626; font-family:var(--font-mono);">${e.status === 'Resolved' ? 'Completed' : (e.etaMinutes + ' mins')}</strong></td>
        <td style="font-family:var(--font-mono); font-size:10px; color:#64748b;">${e.timestamp}</td>
      </tr>
    `).join('');
  },

  // =========================================================================
  // REAL-TIME RADAR TELEMETRY & OPTICAL ANPR
  // =========================================================================

  handleTrafficTick(detail) {
    const m = detail.metrics;
    const v = document.getElementById('statActiveVehicles');
    if (v) v.innerText = m.activeVehicles.toLocaleString();
    const s = document.getElementById('statAvgSpeed');
    if (s) s.innerText = m.avgSpeedKmh + " km/h";
    const c = document.getElementById('statCongestionIndex');
    if (c) c.innerText = m.networkCongestionIndex + "%";
    const p = document.getElementById('statPatrolUnits');
    if (p) p.innerText = m.activePatrols + " Patrols";
  },

  handleAnprDetection(event) {
    const list = document.getElementById('liveTelemetryTicker');
    if (!list) return;

    const item = document.createElement('div');
    const isCritical = event.isViolation;
    item.style.cssText = `background:${isCritical ? '#fef2f2' : '#f0fdf4'}; border:1px solid ${isCritical ? '#fca5a5' : '#86efac'}; padding:8px 10px; border-radius:4px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; font-size:11px;`;

    item.innerHTML = `
      <div>
        <div style="font-weight:700; color:${isCritical ? '#b91c1c' : '#047857'};">
          ${isCritical ? '⚠️ OVERSPEED DETECTION' : '✓ PLATE RECORDED'} [${event.plate}]
        </div>
        <div style="color:#111827; font-size:11px; margin-top:2px;">
          <strong>${event.ownerName || 'Registered Vehicle Owner'}</strong> • <span style="color:#64748b;">${event.vehicleType}</span>
        </div>
        <div style="color:#64748b; font-size:10px; margin-top:1px;">
          📍 ${event.location || event.camera} • Speed: <strong>${event.speed} km/h</strong> (Limit: ${event.speedLimit}) • IP: <span style="font-family:var(--font-mono); color:#334155;">${event.ipAddress || '164.100.24.11'}</span>
        </div>
      </div>
      <div style="text-align:right;">
        <span style="font-family:var(--font-mono); font-size:10px; color:#475569;">${event.timestamp}</span>
        ${isCritical ? `<br/><button class="btn-action-primary" style="padding:2px 6px; font-size:10px; margin-top:2px;" onclick="App.quickFine('${event.plate}', ${event.speed})">Issue e-Challan</button>` : ''}
      </div>
    `;

    list.insertBefore(item, list.firstChild);
    while (list.children.length > 20) list.removeChild(list.lastChild);
  },

  quickFine(plate, speed) {
    const v = window.telemetryVault 
      ? window.telemetryVault.resolveVehicleDetails(plate)
      : { 
          owner: "Registered Vehicle Owner", 
          class: "Cars & SUVs (4-Wheelers)", 
          districtName: "National Highway", 
          corridor: "Main Arterial", 
          ipAddress: "164.100.24.11",
          stateCode: window.trafficDB.selectedState,
          rtoCode: window.trafficDB.selectedDistrict,
          speedLimit: 60
        };

    const challan = {
      id: "CH-2026-" + Math.floor(10000 + Math.random() * 90000),
      state: v.stateCode || window.trafficDB.selectedState,
      district: v.rtoCode || window.trafficDB.selectedDistrict,
      plateNumber: plate,
      ownerName: v.owner,
      vehicleType: v.class,
      violationType: `Radar Speed Breach (${speed} km/h in ${v.speedLimit || 60} km/h Zone)`,
      violationCode: "SEC-183(2) MV ACT",
      location: `${v.districtName} (${v.corridor || 'Highway Corridor'})`,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      fineAmount: 2000,
      status: "Pending",
      severity: "Critical",
      officerBadge: "TR-INSP-5501",
      evidenceImage: "",
      ipAddress: v.ipAddress
    };

    window.trafficDB.addViolation(challan);
    this.renderViolationsTable();
    this.showToast(`Official e-Challan #${challan.id} registered for ${v.owner} [${plate}]`, "success");
  },

  renderViolationsTable() {
    const tbody = document.getElementById('violationsTableBody');
    if (!tbody) return;

    let list = window.trafficDB.getViolations(window.trafficDB.selectedState, window.trafficDB.selectedDistrict);
    const query = document.getElementById('searchViolations')?.value?.trim().toUpperCase();
    const vType = document.getElementById('filterVehicleType')?.value;

    if (query) {
      list = list.filter(v => 
        (v.plateNumber && v.plateNumber.toUpperCase().includes(query)) ||
        (v.id && v.id.toUpperCase().includes(query)) ||
        (v.ownerName && v.ownerName.toUpperCase().includes(query))
      );
    }

    if (vType && vType !== 'ALL') {
      list = list.filter(v => v.vehicleType === vType);
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:#64748b;">No enforcement records found for selected jurisdiction filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(v => `
      <tr>
        <td><strong style="color:#111827; font-family:var(--font-mono);">${v.id}</strong></td>
        <td><span style="background:#111827; color:#fff; padding:2px 6px; border-radius:3px; font-family:var(--font-mono); font-weight:700;">${v.plateNumber}</span></td>
        <td>
          <strong style="color:#0f172a;">${v.ownerName}</strong>
          <div style="font-size:10px; color:#64748b;">${v.vehicleType}</div>
        </td>
        <td>
          <div style="font-weight:600;">${v.violationType}</div>
          <div style="font-size:10px; color:#b45309; font-family:var(--font-mono);">${v.violationCode}</div>
        </td>
        <td>
          <div>${v.location}</div>
          <div style="font-size:10px; color:#64748b; font-family:var(--font-mono);">IP: ${v.ipAddress || '164.100.24.11'}</div>
        </td>
        <td><strong>₹${v.fineAmount.toLocaleString()}</strong></td>
        <td><span class="status-tag ${v.status === 'Paid' ? 'status-paid' : 'status-pending'}">${v.status}</span></td>
      </tr>
    `).join('');
  },

  handleSearchAreaRoute() {
    const input = document.getElementById('mapAreaSearchInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) {
      this.showToast("Please enter an area, landmark, or corridor to find the route");
      return;
    }
    this.switchTab('current');
    if (window.mapController) {
      window.mapController.searchAreaAndFindRoute(query);
      this.showToast(`🔍 Searching accurate route for: "${query}" via Google Maps & ISRO Satellite`);
    }
  },

  async handleSyncGovtAI() {
    const btnText = document.getElementById('syncBtnText');
    const origText = btnText ? btnText.innerText : 'Sync Live Govt & AI Feeds';
    if (btnText) btnText.innerText = 'Syncing Feeds...';

    if (window.trafficDB) {
      const res = await window.trafficDB.syncRoadworksWithLiveGovtAI();
      const meta = document.getElementById('govtAiSyncMeta');
      if (meta && res.syncTimestamp) {
        meta.innerHTML = `Last Synced: <strong>${res.syncTimestamp}</strong> (NHAI & Google AI Linked)`;
      }
      this.renderRoadworksList();
      if (window.mapController) {
        window.mapController.renderConstructionZones();
      }
      this.showToast("✓ Live Sync: NHAI Data Lake, MoRTH Bhoomi Rashi & Google Mobility AI Synchronized!");
    }

    if (btnText) btnText.innerText = origText;
  },

  renderRoadworksList() {
    const container = document.getElementById('roadworksListContainer');
    if (!container) return;

    const list = window.trafficDB.getRoadworks(window.trafficDB.selectedState, window.trafficDB.selectedDistrict);
    if (list.length === 0) {
      container.innerHTML = `<div style="padding:16px; color:#64748b; font-size:12px;">No active road construction zones reported for this district. Traffic flowing normally.</div>`;
      return;
    }

    container.innerHTML = list.map(rw => {
      const gmapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rw.roadName + ' ' + (rw.state || ''))}`;
      const gmapsSatUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rw.roadName)}&data=!3m1!1e3`;
      const isSevere = (rw.googleCongestionIndex || 65) >= 80;
      const compPercent = rw.completionPercent || 65;

      return `
      <div class="construction-card" style="border:1px solid #e2e8f0; border-radius:6px; padding:14px; margin-bottom:12px; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
          <div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-bottom:4px;">
              <span class="construction-badge" style="background:#111827; color:#f8fafc; font-size:10px; font-weight:800; padding:2px 7px; border-radius:3px;">
                🚧 ${rw.id}
              </span>
              <span style="background:#f1f5f9; color:#0f172a; font-weight:700; font-size:11px; padding:2px 7px; border-radius:3px; border:1px solid #cbd5e1;">
                🏛️ ${rw.govAgency || 'MoRTH / NHAI Regional Division'}
              </span>
              <span style="background:${isSevere ? '#fef2f2' : '#f0fdf4'}; color:${isSevere ? '#b91c1c' : '#15803d'}; font-weight:700; font-size:11px; padding:2px 7px; border-radius:3px; border:1px solid ${isSevere ? '#fca5a5' : '#86efac'};">
                ${rw.status || 'Active (In Progress)'}
              </span>
            </div>
            <div style="font-weight:800; color:#0a2540; font-size:14px;">${rw.roadName}</div>
            <div style="font-size:11px; color:#64748b; font-family:var(--font-mono); margin-top:2px;">
              ${rw.portalRef || 'MoRTH Public Works Gazette Advisory'}
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:11px; color:#64748b;">
              Target Completion: <strong style="color:#0f172a;">${rw.targetCompletion}</strong>
            </div>
            <div style="font-size:10px; color:#059669; font-family:var(--font-mono); margin-top:3px;">
              ✓ ${rw.lastSyncedGovt || 'Live Telemetry Synced'}
            </div>
          </div>
        </div>

        <div style="font-size:12px; color:#334155; line-height:1.5; margin-bottom:8px;">
          <strong>Scope of Work:</strong> ${rw.workType}<br/>
          <strong>Contractor / Executing Agency:</strong> <em>${rw.contractor}</em>
        </div>

        <div style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:3px;">
            <span style="color:#64748b;">Civil Works Progress:</span>
            <strong style="color:#0a2540;">${compPercent}% Complete</strong>
          </div>
          <div style="background:#e2e8f0; height:6px; border-radius:3px; overflow:hidden;">
            <div style="background:#b45309; width:${compPercent}%; height:100%; border-radius:3px;"></div>
          </div>
        </div>

        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; padding:8px 10px; font-size:11px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <span style="font-weight:700; color:#0f172a;">⚡ Google Mobility AI Telemetry:</span>
            <span style="background:${isSevere ? '#dc2626' : '#d97706'}; color:#fff; font-weight:800; padding:1px 6px; border-radius:3px; font-size:10px; margin-left:4px;">
              ${rw.googleCongestionIndex || 65}% CONGESTION INDEX
            </span>
            <span style="color:#b91c1c; font-weight:700; margin-left:6px;">${rw.aiDelayEstimate || '+18 min delay'}</span>
            <span style="color:#64748b; margin-left:6px;">(Speed: <strong>${rw.aiSpeedIndex || '30 km/h'}</strong>)</span>
          </div>
          <div style="font-size:10px; color:#475569; font-style:italic;">
            ${rw.googleLiveStatus || 'Google Traffic AI Active'}
          </div>
        </div>

        <div style="background:#fffbeb; border:1px solid #fef3c7; padding:9px 11px; border-radius:4px; font-size:11px; color:#92400e; margin-bottom:10px; line-height:1.5;">
          <div>⚠️ <strong>Traffic Restriction:</strong> ${rw.laneImpact} (${rw.speedLimitReduction})</div>
          <div>↪️ <strong>Designated Diversion Route:</strong> ${rw.diversionRoute}</div>
          ${rw.aiOptimalDetour ? `<div style="margin-top:4px; color:#047857;">💡 <strong>Google AI Optimal Detour:</strong> ${rw.aiOptimalDetour}</div>` : ''}
          ${rw.safetyBarricades ? `<div style="margin-top:2px; color:#64748b;">🛡️ <strong>Safety Barricades:</strong> ${rw.safetyBarricades}</div>` : ''}
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; flex-wrap:wrap;">
          <a href="${gmapsSearchUrl}" target="_blank" rel="noopener noreferrer" class="btn-action-primary" style="padding:4px 10px; font-size:11px; text-decoration:none;">
            🗺️ Open Corridor in Google Maps
          </a>
          <a href="${gmapsSatUrl}" target="_blank" rel="noopener noreferrer" class="btn-action-primary" style="padding:4px 10px; font-size:11px; background:#b45309; border-color:#b45309; color:#fff; text-decoration:none;">
            🛰️ Verify with Google Satellite
          </a>
        </div>
      </div>
      `;
    }).join('');
  },

  renderVehicleRatioStats() {
    const container = document.getElementById('vehicleRatioCardsContainer');
    if (!container) return;

    const data = window.trafficDB.getVehicleRatios();
    if (!data) return;

    container.innerHTML = data.vehicleCategories.map(cat => `
      <div class="ratio-stat-card">
        <div class="ratio-card-title">
          <span>${cat.category}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin:4px 0;">
          <div class="ratio-value-big" style="color:#b45309;">${cat.challanPercentage}%</div>
          <div style="font-size:11px; color:#64748b;">Challan Ratio</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:baseline;">
          <div class="ratio-value-big" style="color:#b91c1c; font-size:1.15rem;">${cat.accidentPercentage}%</div>
          <div style="font-size:11px; color:#64748b;">Accident Ratio</div>
        </div>
        <div style="font-size:11px; color:#334155; border-top:1px solid #e2e8f0; padding-top:6px; margin-top:4px;">
          <strong>Primary Cause:</strong> ${cat.primaryAccidentCause}<br/>
          <strong>Fatal Rate:</strong> <span style="color:#dc2626; font-weight:700;">${cat.fatalRate}</span>
        </div>
      </div>
    `).join('');
  },

  renderAuditLogsTable() {
    const tbody = document.getElementById('auditLogsTableBody');
    if (!tbody) return;

    const logs = window.trafficDB.getAuditLogs();
    tbody.innerHTML = logs.map(l => `
      <tr>
        <td style="font-family:var(--font-mono); font-size:11px;">${l.timestamp}</td>
        <td><strong>${l.user}</strong></td>
        <td><span style="background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:3px; font-size:11px; font-weight:600;">${l.action}</span></td>
        <td>${l.details}</td>
        <td style="font-family:var(--font-mono); font-size:11px; color:#64748b;">${l.ipAddress}</td>
      </tr>
    `).join('');
  },

  renderVahanDashboard() {
    const vahan = window.trafficDB.getVahanData();
    if (!vahan) return;

    if (window.analyticsController && typeof window.analyticsController.renderVahanProgressionChart === 'function') {
      window.analyticsController.renderVahanProgressionChart(vahan.growthTimeline);
    }

    const stateTbody = document.getElementById('vahanStateTableBody');
    if (stateTbody && vahan.stateLeague) {
      stateTbody.innerHTML = vahan.stateLeague.map(s => `
        <tr>
          <td><strong>${s.rank}. ${s.state}</strong></td>
          <td><span style="background:#111827; color:#fff; padding:2px 7px; border-radius:3px; font-family:var(--font-mono); font-weight:700; font-size:11px;">${s.code}</span></td>
          <td><strong>${(s.cumulative / 10000000).toFixed(2)} Cr</strong> <span style="font-size:10px; color:#64748b;">(${s.cumulative.toLocaleString()})</span></td>
          <td><span style="color:#b45309; font-weight:700;">+${(s.ytd2026 / 100000).toFixed(2)} Lakhs</span></td>
          <td><span style="font-size:11px; color:#334155;">${s.primarySegment}</span></td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="flex:1; background:#e2e8f0; height:6px; border-radius:3px; overflow:hidden; min-width:45px;">
                <div style="background:#b45309; height:100%; width:${s.share * 7}%;"></div>
              </div>
              <strong style="font-family:var(--font-mono); font-size:11px;">${s.share}%</strong>
            </div>
          </td>
        </tr>
      `).join('');
    }

    const classContainer = document.getElementById('vahanClassCardsContainer');
    if (classContainer && vahan.vehicleClasses) {
      classContainer.innerHTML = vahan.vehicleClasses.map(c => `
        <div class="ratio-stat-card" style="border-top:3px solid ${c.color};">
          <div class="ratio-card-title">
            <span style="font-size:12px; font-weight:700;">${c.className}</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin:6px 0 2px 0;">
            <div class="ratio-value-big" style="color:#111827; font-size:1.35rem;">${c.displayCount}</div>
            <div style="font-size:12px; font-weight:700; color:#b45309;">${c.percentage}% Share</div>
          </div>
          <div style="font-size:11px; color:#64748b; margin-bottom:6px;">
            Fleet Momentum: <strong style="color:#047857;">${c.trend}</strong>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:6px 8px; border-radius:4px; font-size:10px; color:#334155;">
            ⚡ <strong>Clean EV Penetration:</strong> ${c.evShare}
          </div>
        </div>
      `).join('');
    }

    const recordsTbody = document.getElementById('vahanRecordsTableBody');
    if (recordsTbody && vahan.sqlRecords) {
      recordsTbody.innerHTML = vahan.sqlRecords.map(r => `
        <tr>
          <td style="font-family:var(--font-mono); font-weight:700; font-size:11px; color:#111827;">#${r.recordId}</td>
          <td><span style="background:#f1f5f9; color:#0f172a; padding:2px 6px; border-radius:3px; font-size:11px;">${r.geographyLevel}</span></td>
          <td><strong>${r.stateUt}</strong></td>
          <td><span style="font-family:var(--font-mono); font-size:11px;">${r.periodLabel}</span></td>
          <td><span style="font-size:11px; color:#b45309; font-weight:600;">${r.measure}</span></td>
          <td><strong style="font-family:var(--font-mono); font-size:12px;">${(r.vehicleCount / 10000000).toFixed(2)} Cr</strong></td>
        </tr>
      `).join('');
    }
  },

  handleCreateRoadwork() {
    const road = document.getElementById('inRwRoad')?.value.trim();
    const work = document.getElementById('inRwWork')?.value.trim();
    const contractor = document.getElementById('inRwContractor')?.value.trim();
    const impact = document.getElementById('inRwImpact')?.value.trim();
    const detour = document.getElementById('inRwDetour')?.value.trim();
    const target = document.getElementById('inRwTarget')?.value.trim();

    if (!road || !work || !contractor) {
      this.showToast("Please fill all mandatory roadwork fields.", "error");
      return;
    }

    const newRw = {
      state: window.trafficDB.selectedState,
      district: window.trafficDB.selectedDistrict,
      roadName: road,
      workType: work,
      contractor: contractor,
      laneImpact: impact || "Single lane barricaded",
      diversionRoute: detour || "Adjacent service corridor",
      speedLimitReduction: "30 km/h",
      targetCompletion: target || "2026-11-30",
      status: "Active (Scheduled)"
    };

    window.trafficDB.addRoadwork(newRw);
    this.closeModal('newRoadworkModal');
    this.renderRoadworksList();
    if (window.mapController) window.mapController.renderConstructionZones();
    this.showToast(`Construction Zone Registered: ${road}`, "success");
  },

  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="${type === 'error' ? 'alert-triangle' : (type === 'success' ? 'check-circle' : 'info')}" style="color:${type === 'error' ? '#b91c1c' : (type === 'success' ? '#047857' : '#b8861c')};"></i>
      <div style="flex:1;">${message}</div>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }
};

window.App = App;
