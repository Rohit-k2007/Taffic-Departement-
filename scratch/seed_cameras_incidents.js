const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'natdams_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Seed Cameras
db.cameras = [
  {
    id: "CAM-DL-01",
    name: "India Gate C-Hexagon ANPR Dome",
    location: "C-Hexagon & Rajpath Marg Intersection",
    intersection: "Rajpath - C-Hexagon",
    type: "ANPR_PTZ",
    status: "ONLINE",
    lastActivity: "Just now (Active Feed)",
    eventsToday: 142,
    resolution: "4K 60FPS Ultra HD",
    ip: "10.42.10.15",
    district: "DL-ND",
    state: "DL",
    coordinates: [28.6129, 77.2295],
    installDate: "2024-03-15",
    firmware: "v4.2.9-gov-sec"
  },
  {
    id: "CAM-DL-02",
    name: "Connaught Place Outer Circle South",
    location: "Janpath & Outer Circle Radial 3",
    intersection: "Janpath - Connaught Circus",
    type: "RED_LIGHT_RLVD",
    status: "ONLINE",
    lastActivity: "2 mins ago",
    eventsToday: 98,
    resolution: "4K 30FPS AI Matrix",
    ip: "10.42.10.16",
    district: "DL-ND",
    state: "DL",
    coordinates: [28.6315, 77.2167],
    installDate: "2024-05-10",
    firmware: "v4.2.9-gov-sec"
  },
  {
    id: "CAM-DL-03",
    name: "Dhaula Kuan Arterial Interchange",
    location: "Ring Road - NH-48 Flyover Ramp",
    intersection: "Dhaula Kuan Metro Pier 48",
    type: "SPEED_RADAR_360",
    status: "ONLINE",
    lastActivity: "Just now",
    eventsToday: 215,
    resolution: "4K High-Speed Doppler",
    ip: "10.42.10.18",
    district: "DL-SD",
    state: "DL",
    coordinates: [28.5921, 77.1601],
    installDate: "2023-11-20",
    firmware: "v5.0.1-radar"
  },
  {
    id: "CAM-DL-04",
    name: "AIIMS Trauma Center Ring Road",
    location: "Mahatma Gandhi Marg & Sri Aurobindo Marg",
    intersection: "AIIMS Flyover Underpass",
    type: "CORRIDOR_SURVEILLANCE",
    status: "ONLINE",
    lastActivity: "1 min ago",
    eventsToday: 87,
    resolution: "1080p Thermal + Optical",
    ip: "10.42.10.22",
    district: "DL-SD",
    state: "DL",
    coordinates: [28.5672, 77.2100],
    installDate: "2024-01-12",
    firmware: "v4.2.9-gov-sec"
  },
  {
    id: "CAM-DL-05",
    name: "ITO Crossing & Vikas Marg Junction",
    location: "ITO Red Light & Bahadur Shah Zafar Marg",
    intersection: "ITO Master Junction 1",
    type: "RED_LIGHT_RLVD",
    status: "ONLINE",
    lastActivity: "Just now",
    eventsToday: 312,
    resolution: "4K Multi-Lane RLVD",
    ip: "10.42.10.25",
    district: "DL-ED",
    state: "DL",
    coordinates: [28.6295, 77.2425],
    installDate: "2023-08-18",
    firmware: "v4.3.0-rlvd"
  },
  {
    id: "CAM-DL-06",
    name: "Mayur Vihar Chilla Border Toll Gate",
    location: "Noida Link Road Inter-State Border",
    intersection: "Chilla Regulator Point",
    type: "ANPR_PTZ",
    status: "ONLINE",
    lastActivity: "3 mins ago",
    eventsToday: 274,
    resolution: "4K Dual Optical + IR",
    ip: "10.42.10.29",
    district: "DL-ED",
    state: "DL",
    coordinates: [28.5980, 77.3050],
    installDate: "2024-02-04",
    firmware: "v4.2.9-gov-sec"
  },
  {
    id: "CAM-DL-07",
    name: "Dwarka Sector 21 Underpass Cam",
    location: "Sector 21 Metro Interchange Corridor",
    intersection: "Dwarka Expressway Entry Ramp",
    type: "CORRIDOR_SURVEILLANCE",
    status: "MAINTENANCE",
    lastActivity: "Optical recalibration underway",
    eventsToday: 19,
    resolution: "4K Panoramic",
    ip: "10.42.10.33",
    district: "DL-DW",
    state: "DL",
    coordinates: [28.5520, 77.0580],
    installDate: "2024-06-20",
    firmware: "v5.0.2-beta"
  },
  {
    id: "CAM-DL-08",
    name: "Mukarba Chowk GT Karnal Road",
    location: "NH-44 & Outer Ring Road Cloverleaf",
    intersection: "Mukarba Chowk North Pier",
    type: "SPEED_RADAR_360",
    status: "ONLINE",
    lastActivity: "Just now",
    eventsToday: 389,
    resolution: "4K Multi-Radar Doppler",
    ip: "10.42.10.40",
    district: "DL-RO",
    state: "DL",
    coordinates: [28.7360, 77.1620],
    installDate: "2023-09-14",
    firmware: "v5.0.1-radar"
  },
  {
    id: "CAM-MH-01",
    name: "Bandra-Worli Sea Link Toll Plazas",
    location: "Sea Link North Approach Road",
    intersection: "Bandra Reclamation Toll Corridor",
    type: "ANPR_PTZ",
    status: "ONLINE",
    lastActivity: "Just now",
    eventsToday: 412,
    resolution: "4K High-Speed ANPR",
    ip: "10.22.40.11",
    district: "MH-SUB",
    state: "MH",
    coordinates: [19.0430, 72.8180],
    installDate: "2023-10-01",
    firmware: "v4.2.9-gov-sec"
  },
  {
    id: "CAM-MH-02",
    name: "Marine Drive Coastal Promenade Cam",
    location: "Netaji Subhash Chandra Bose Road",
    intersection: "Nariman Point North Junction",
    type: "CORRIDOR_SURVEILLANCE",
    status: "ONLINE",
    lastActivity: "Just now",
    eventsToday: 164,
    resolution: "4K 60FPS Weatherproof",
    ip: "10.22.40.15",
    district: "MH-MUM",
    state: "MH",
    coordinates: [18.9430, 72.8230],
    installDate: "2024-04-11",
    firmware: "v4.2.9-gov-sec"
  },
  {
    id: "CAM-MH-03",
    name: "Hinjawadi Phase 1 Tech Corridor Cam",
    location: "Shivaji Chowk Arterial Roundabout",
    intersection: "Wakad-Hinjawadi Link Road",
    type: "RED_LIGHT_RLVD",
    status: "ONLINE",
    lastActivity: "4 mins ago",
    eventsToday: 188,
    resolution: "4K RLVD Smart Grid",
    ip: "10.22.40.21",
    district: "MH-PUN",
    state: "MH",
    coordinates: [18.5910, 73.7380],
    installDate: "2024-01-29",
    firmware: "v4.3.0-rlvd"
  },
  {
    id: "CAM-MH-04",
    name: "Samruddhi Mahamarg Nagpur Entry Ramp",
    location: "Nagpur Intermodal Logistics Hub",
    intersection: "Mihan Bypass Kilometer 0",
    type: "SPEED_RADAR_360",
    status: "OFFLINE",
    lastActivity: "Fiber link desync at 18:30 IST",
    eventsToday: 44,
    resolution: "4K Laser Telemetry",
    ip: "10.22.40.35",
    district: "MH-NGP",
    state: "MH",
    coordinates: [21.0720, 79.0550],
    installDate: "2023-12-05",
    firmware: "v5.0.1-radar"
  }
];

// 2. Seed Camera Events (Smart AI Detections requiring Mandatory Human Review)
db.cameraEvents = [
  {
    id: "EVT-2026-101",
    cameraId: "CAM-DL-02",
    cameraName: "Connaught Place Outer Circle South",
    intersection: "Janpath - Connaught Circus",
    eventType: "RED_LIGHT_VIOLATION",
    confidenceScore: 96.4,
    severity: "HIGH",
    eventStatus: "PENDING_HUMAN_REVIEW",
    timestamp: "2026-09-30 21:52:14 IST",
    location: [28.6315, 77.2167],
    plateNumber: "DL01AB1234",
    vehicleType: "Private Light Motor Vehicle (Sedan)",
    evidence: {
      snapshot: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'><rect width='640' height='360' fill='%230f172a'/><circle cx='480' cy='80' r='18' fill='%23ef4444'/><circle cx='480' cy='125' r='14' fill='%23334155'/><circle cx='480' cy='165' r='14' fill='%23334155'/><rect x='80' y='220' width='360' height='90' rx='8' fill='%231e293b' stroke='%23ef4444' stroke-width='2'/><rect x='160' y='275' width='160' height='26' rx='4' fill='%23fef08a'/><text x='240' y='293' font-family='monospace' font-weight='bold' font-size='14' fill='%23000' text-anchor='middle'>DL 01 AB 1234</text><text x='20' y='30' font-family='sans-serif' font-size='12' fill='%2394a3b8'>TRAFIX AI EVENT DETECTION: RED LIGHT CROSS (RLVD SENSOR 02)</text><text x='20' y='50' font-family='sans-serif' font-size='11' fill='%23e2e8f0'>CAM-DL-02 | 21:52:14 IST | CONFIDENCE: 96.4% | HUMAN REVIEW MANDATORY</text></svg>",
      videoClip: "SECURE_VAULT_STREAM://cam-dl-02/20260930_215214.mp4",
      metadata: "RLVD Stop-Line Trigger #88412; Speed at Line: 54 km/h; Red Signal Duration: 04.2s",
      captureTime: "2026-09-30 21:52:14.382 IST",
      fileHash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      retentionDate: "2027-09-30"
    },
    reviewNotes: "Awaiting Duty Officer verification before any enforcement challan is dispatched.",
    reviewedBy: null,
    actionTaken: null
  },
  {
    id: "EVT-2026-102",
    cameraId: "CAM-DL-03",
    cameraName: "Dhaula Kuan Arterial Interchange",
    intersection: "Ring Road - NH-48 Flyover Ramp",
    eventType: "DOPPLER_SPEED_EXCESS",
    confidenceScore: 98.7,
    severity: "CRITICAL",
    eventStatus: "PENDING_HUMAN_REVIEW",
    timestamp: "2026-09-30 22:04:41 IST",
    location: [28.5921, 77.1601],
    plateNumber: "DL04CA9902",
    vehicleType: "SUV / Heavy Motor Vehicle",
    evidence: {
      snapshot: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'><rect width='640' height='360' fill='%230b192c'/><rect x='100' y='180' width='380' height='120' rx='10' fill='%231e3e62' stroke='%23ef4444' stroke-width='3'/><rect x='200' y='255' width='180' height='30' rx='4' fill='%23fef08a'/><text x='290' y='276' font-family='monospace' font-weight='bold' font-size='16' fill='%23000' text-anchor='middle'>DL 04 CA 9902</text><text x='20' y='30' font-family='sans-serif' font-size='12' fill='%23f97316'>TRAFIX RADAR TELEMETRY: 114 KM/H IN 60 KM/H ZONE (+54 KM/H EXCESS)</text><text x='20' y='50' font-family='sans-serif' font-size='11' fill='%23e2e8f0'>CAM-DL-03 | 22:04:41 IST | DOPPLER SENSOR 360 | CONFIDENCE: 98.7%</text></svg>",
      videoClip: "SECURE_VAULT_STREAM://cam-dl-03/20260930_220441.mp4",
      metadata: "Doppler Radar Beam #3; Recorded Speed: 114 km/h; Corridor Statutory Limit: 60 km/h",
      captureTime: "2026-09-30 22:04:41.109 IST",
      fileHash: "9b3c4f92305a4112e45778dcba127e8a9f0290123be874102948719203847162",
      retentionDate: "2027-09-30"
    },
    reviewNotes: "Requires review by Level-3 Traffic Inspector before Section 183 MV Act challan generation.",
    reviewedBy: null,
    actionTaken: null
  },
  {
    id: "EVT-2026-103",
    cameraId: "CAM-DL-05",
    cameraName: "ITO Crossing & Vikas Marg Junction",
    intersection: "ITO Master Junction 1",
    eventType: "NO_HELMET_TWO_WHEELER",
    confidenceScore: 92.1,
    severity: "MEDIUM",
    eventStatus: "PENDING_HUMAN_REVIEW",
    timestamp: "2026-09-30 22:18:05 IST",
    location: [28.6295, 77.2425],
    plateNumber: "RJ54CK4706",
    vehicleType: "Two-Wheeler (Motorcycle)",
    evidence: {
      snapshot: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'><rect width='640' height='360' fill='%23111827'/><rect x='150' y='160' width='280' height='140' rx='8' fill='%231f2937' stroke='%23f59e0b' stroke-width='2'/><rect x='210' y='250' width='160' height='26' rx='4' fill='%23fef08a'/><text x='290' y='268' font-family='monospace' font-weight='bold' font-size='14' fill='%23000' text-anchor='middle'>RJ 54 CK 4706</text><text x='20' y='30' font-family='sans-serif' font-size='12' fill='%23f59e0b'>TRAFIX AI SAFETY DETECTION: NO SAFETY HELMET DETECTED</text><text x='20' y='50' font-family='sans-serif' font-size='11' fill='%23e2e8f0'>CAM-DL-05 | 22:18:05 IST | CONFIDENCE: 92.1% | DECISION SUPPORT</text></svg>",
      videoClip: "SECURE_VAULT_STREAM://cam-dl-05/20260930_221805.mp4",
      metadata: "YOLO-v9 Safety Headgear Classifier: Rider bare-headed, pillion bare-headed.",
      captureTime: "2026-09-30 22:18:05.512 IST",
      fileHash: "18a4bc89f712390abdf109485729103e91823741829471928471920491823901",
      retentionDate: "2027-09-30"
    },
    reviewNotes: "Visual verification of rider headwear required by reviewing officer.",
    reviewedBy: null,
    actionTaken: null
  },
  {
    id: "EVT-2026-104",
    cameraId: "CAM-DL-01",
    cameraName: "India Gate C-Hexagon ANPR Dome",
    intersection: "Rajpath - C-Hexagon",
    eventType: "WRONG_WAY_ENTRY",
    confidenceScore: 97.2,
    severity: "CRITICAL",
    eventStatus: "VERIFIED",
    timestamp: "2026-09-30 20:30:19 IST",
    location: [28.6129, 77.2295],
    plateNumber: "DL02XY8821",
    vehicleType: "Auto-Rickshaw (Three-Wheeler)",
    evidence: {
      snapshot: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'><rect width='640' height='360' fill='%230f172a'/><rect x='140' y='170' width='300' height='130' rx='8' fill='%23334155'/><text x='20' y='30' font-family='sans-serif' font-size='12' fill='%2310b981'>STATUS: VERIFIED BY DUTY OFFICER (INSP. SHARMA #DL-4081)</text></svg>",
      videoClip: "SECURE_VAULT_STREAM://cam-dl-01/20260930_203019.mp4",
      metadata: "Vector trajectory mismatch: Vehicle moving Southbound in designated Northbound 1-Way Lane.",
      captureTime: "2026-09-30 20:30:19.201 IST",
      fileHash: "338192a019485710293847102938471029384710293847102938471029384710",
      retentionDate: "2027-09-30"
    },
    reviewNotes: "Officer physically verified optical trajectory. Statutory e-Challan issued under Section 184 MV Act.",
    reviewedBy: "Inspector Vikramaditya Sharma (Badge #DL-4081)",
    actionTaken: "CHALLAN_ISSUED_CH-2026-90412"
  }
];

// 3. Seed Incidents (Traffic Incidents for Operational Dispatch)
db.incidents = [
  {
    id: "INC-2026-001",
    incidentNumber: "INC-2026-9011",
    type: "Multi-Vehicle Pileup",
    location: "Ring Road near Dhaula Kuan Flyover Ramp",
    coordinates: [28.5921, 77.1601],
    severity: "CRITICAL",
    detectedTime: "2026-09-30 21:40:00 IST",
    status: "IN_PROGRESS",
    assignedOfficer: "ACP Rajendra Verma (IPS Level-4)",
    relatedVehicle: "DL04CA9902 & DL10TR9981",
    relatedViolation: "VIO-2026-8802",
    description: "Container truck brake failure caused 3-vehicle rear-end collision blocking Lane 1 and 2.",
    timeline: [
      { time: "21:40", text: "Automated corridor sensor detected abnormal speed drop to 4 km/h." },
      { time: "21:44", text: "Control Room verified live feed from CAM-DL-03." },
      { time: "21:48", text: "Emergency 112 Patrol Van PB-04 and CATS Ambulance dispatched." },
      { time: "21:58", text: "Heavy hydraulic crane deployed for vehicle tow." }
    ],
    auditHistory: [
      { time: "21:40", action: "INCIDENT_CREATED", user: "SYSTEM_AI_SENSORS" },
      { time: "21:45", action: "ASSIGNED", user: "Control Room Dispatcher (CR-88)" },
      { time: "21:55", action: "STATUS_UPDATE_IN_PROGRESS", user: "ACP Rajendra Verma" }
    ]
  },
  {
    id: "INC-2026-002",
    incidentNumber: "INC-2026-9012",
    type: "Signal Hardware Failure",
    location: "ITO Crossing & Bahadur Shah Zafar Marg Junction",
    coordinates: [28.6295, 77.2425],
    severity: "HIGH",
    detectedTime: "2026-09-30 22:10:00 IST",
    status: "OPEN",
    assignedOfficer: "Sub-Inspector Anita Rawat (DL-TP-3321)",
    relatedVehicle: null,
    relatedViolation: null,
    description: "Phase 3 master relay blackout causing flashing amber failure and gridlock.",
    timeline: [
      { time: "22:10", text: "SCADA power watchdog detected phase drop at ITO Master Signal." },
      { time: "22:15", text: "Manual traffic police marshalling deployed on site." }
    ],
    auditHistory: [
      { time: "22:10", action: "INCIDENT_CREATED", user: "SCADA_MONITOR" },
      { time: "22:14", action: "ASSIGNED", user: "Duty Officer (DL-HQ)" }
    ]
  },
  {
    id: "INC-2026-003",
    incidentNumber: "INC-2026-9013",
    type: "Commercial Cargo Spill",
    location: "Mayur Vihar Chilla Border Toll Gate",
    coordinates: [28.5980, 77.3050],
    severity: "MEDIUM",
    detectedTime: "2026-09-30 20:15:00 IST",
    status: "RESOLVED",
    assignedOfficer: "Traffic Inspector Mahendra Pal (DL-TP-1988)",
    relatedVehicle: "UP16BT4019",
    relatedViolation: "VIO-2026-8809",
    description: "Building material gravel spillage cleared with Municipal PWD sweeping machine.",
    timeline: [
      { time: "20:15", text: "Reported by border check-post staff." },
      { time: "20:30", text: "PWD mechanical sweeper mobilized." },
      { time: "21:05", text: "Lane reopened for regular traffic." }
    ],
    auditHistory: [
      { time: "20:15", action: "INCIDENT_CREATED", user: "Border Checkpost PB-11" },
      { time: "21:05", action: "RESOLVED", user: "Traffic Inspector Mahendra Pal" }
    ]
  }
];

// 4. Seed Evidence Files (Digital Evidence Vault with SHA-256 Hashes)
db.evidenceFiles = [
  {
    id: "EV-VAULT-001",
    caseReference: "INC-2026-9011",
    fileType: "Optical 4K Snapshot",
    fileName: "dhaula_kuan_pileup_cam03.jpg",
    fileHash: "9b3c4f92305a4112e45778dcba127e8a9f0290123be874102948719203847162",
    fileSizeKb: 2840,
    captureTime: "2026-09-30 21:40:12 IST",
    retentionDate: "2029-09-30 (Statutory 3-Year Evidence Hold)",
    securityClassification: "RESTRICTED_POLICE_JUDICIAL",
    verifiedBy: "Inspector Vikramaditya Rathore",
    status: "SEALED_CHAIN_OF_CUSTODY"
  },
  {
    id: "EV-VAULT-002",
    caseReference: "EVT-2026-101",
    fileType: "RLVD Stop-Line Video Burst",
    fileName: "cp_outer_circle_rlvd_rec.mp4",
    fileHash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    fileSizeKb: 14800,
    captureTime: "2026-09-30 21:52:14 IST",
    retentionDate: "2027-09-30",
    securityClassification: "OFFICIAL_ENFORCEMENT_RECORD",
    verifiedBy: null,
    status: "PENDING_OFFICER_REVIEW"
  },
  {
    id: "EV-VAULT-003",
    caseReference: "CAS-2026-8801",
    fileType: "Citizen Photo Evidence",
    fileName: "illegal_commercial_dump_citizen.jpg",
    fileHash: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    fileSizeKb: 1950,
    captureTime: "2026-09-30 19:10:00 IST",
    retentionDate: "2027-09-30",
    securityClassification: "PUBLIC_CITIZEN_GRIEVANCE",
    verifiedBy: "RTO Verification Desk RJ-54",
    status: "VERIFIED"
  }
];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Seeded successfully:');
console.log('- Cameras:', db.cameras.length);
console.log('- Camera Events:', db.cameraEvents.length);
console.log('- Incidents:', db.incidents.length);
console.log('- Evidence Files:', db.evidenceFiles.length);
