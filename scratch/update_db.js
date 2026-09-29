const fs = require('fs');
const path = require('path');
const vault = require('../assets/js/telemetry-vault.js');

const dbPath = path.join(__dirname, '..', 'data', 'natdams_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Expand states list with all Indian States & UTs from telemetryVault
const registry = vault.PAN_INDIA_REGISTRY;
for (const [code, info] of Object.entries(registry)) {
  const existing = db.states.find(s => s.code === code);
  const districtList = Object.entries(info.rtoDistricts || {}).map(([rtoNum, rtoObj]) => ({
    id: code + '-' + rtoNum,
    name: rtoObj.name,
    center: rtoObj.center,
    corridor: rtoObj.corridor
  }));

  if (existing) {
    if (districtList.length > existing.districts.length) {
      existing.districts = districtList;
    }
  } else {
    db.states.push({
      code: code,
      name: info.stateName,
      center: info.center,
      zoom: 11,
      districts: districtList
    });
  }
}

// 2. Generate 30 diverse violations across all Indian States & districts with unique names & IPs
const sampleViolationPlates = [
  'DL-01-AB-4921', 'RJ-14-CC-4001', 'MH-12-DE-9944', 'KA-05-MN-2210', 'UP-16-BZ-5501',
  'TN-01-AX-7722', 'GJ-01-KH-3311', 'WB-01-JJ-4422', 'PB-10-TR-8811', 'KL-07-ZZ-9900',
  'RJ-19-UA-8821', 'RJ-20-KK-1122', 'MH-01-AA-1000', 'TS-09-XY-3412', 'MP-09-BC-4455',
  'AP-16-DD-8833', 'BR-01-GG-7744', 'CH-01-EE-3322', 'GA-07-FF-5511', 'JK-01-HH-9922',
  'UK-07-JJ-6633', 'HP-01-KK-4411', 'HR-26-LL-8855', 'DL-03-MM-1234', 'UP-32-NN-5678',
  'MH-02-PP-9012', 'KA-01-QQ-3456', 'TN-07-RR-7890', 'GJ-05-SS-2345', 'RJ-01-TT-6789'
];

const VIOLATION_TYPES = [
  { type: 'Automated Radar Speed Breach (>80 km/h)', code: 'SEC-183(2) MV ACT', fine: 2000, sev: 'Critical' },
  { type: 'Dangerous Driving & Hazardous Lane Swapping', code: 'SEC-184 MV ACT', fine: 2500, sev: 'High' },
  { type: 'Red Light Jump / Stop Line Transgression', code: 'SEC-119 MV ACT', fine: 1000, sev: 'Medium' },
  { type: 'Driving Without Certified Helmet / Seatbelt', code: 'SEC-129 MV ACT', fine: 1000, sev: 'Medium' },
  { type: 'Commercial Overloading Beyond Permissible Gross Weight', code: 'SEC-194 MV ACT', fine: 5000, sev: 'Critical' },
  { type: 'Operating Without Valid Green Pollution Certificate (PUCC)', code: 'SEC-190(2) MV ACT', fine: 10000, sev: 'Critical' }
];

db.violations = sampleViolationPlates.map((plate, idx) => {
  const v = vault.resolveVehicleDetails(plate);
  const vType = VIOLATION_TYPES[idx % VIOLATION_TYPES.length];
  const dateStr = new Date(Date.now() - idx * 3600000 * 5).toISOString().replace('T', ' ').substring(0, 19);

  return {
    id: 'CH-2026-' + (10000 + idx * 73),
    state: v.stateCode,
    district: v.rtoCode,
    plateNumber: v.plate,
    ownerName: v.owner,
    vehicleType: v.class,
    violationType: vType.type,
    violationCode: vType.code,
    location: v.districtName + ' (' + v.corridor + ')',
    dateTime: dateStr,
    fineAmount: vType.fine,
    status: idx % 3 === 0 ? 'Paid' : (idx % 3 === 1 ? 'Pending' : 'Court'),
    severity: vType.sev,
    officerBadge: 'TR-ENF-' + (1000 + (idx % 20)),
    evidenceImage: 'assets/images/cctv_sample.jpg',
    ipAddress: v.ipAddress
  };
});

// 3. Update Audit Logs with authentic dynamic IPs and user records
db.auditLogs = [
  {
    id: 'SEC-LOG-9921',
    timestamp: '2026-09-30 02:25:10',
    user: 'Director General Dr. Arvind K. Saxena (IPS-8801-CIP)',
    role: 'Level 5 - Supreme Command',
    action: 'POLICY_OVERRIDE_AUDIT',
    details: 'Verified national radar gantry calibration across 36 States/UTs',
    ipAddress: '164.100.24.11 (NIC National Portal Backbone)'
  },
  {
    id: 'SEC-LOG-9922',
    timestamp: '2026-09-30 02:18:44',
    user: 'DCP Vikram Vardhan (IPS-9244-DEL)',
    role: 'Level 4 - Regional Command',
    action: 'DISPATCH_PATROL',
    details: 'Dispatched Interceptor Unit 04 to AIIMS Ring Road Corridor',
    ipAddress: '10.142.66.92 (Delhi Police MDT)'
  },
  {
    id: 'SEC-LOG-9923',
    timestamp: '2026-09-30 02:10:15',
    user: 'SP Ajay Singh Shekhawat (IPS-7714-RJ)',
    role: 'Level 4 - Regional Command',
    action: 'CONSTRUCTION_DETOUR_APPROVAL',
    details: 'Approved Sanganer - Diggi Malpura Detour for Jaipur Ring Road Phase-2',
    ipAddress: '10.88.204.14 (Rajasthan Police Intranet)'
  },
  {
    id: 'SEC-LOG-9924',
    timestamp: '2026-09-30 01:45:00',
    user: 'Inspector Rajeshwar Nath (TR-INSP-5501)',
    role: 'Level 3 - Traffic Inspector',
    action: 'ISSUED_CITATION',
    details: 'Issued automated e-Challan for speeding vehicle on JLN Marg Jaipur',
    ipAddress: '172.24.105.33 (CCTNS Police Desk)'
  },
  {
    id: 'SEC-LOG-9925',
    timestamp: '2026-09-30 01:12:30',
    user: 'Sub-Inspector Priya Sharma (TR-SI-4219)',
    role: 'Level 2 - Patrol Desk',
    action: 'ANPR_CAMERA_LOCK',
    details: 'Locked radar track on commercial multi-axle freight carrier',
    ipAddress: '100.84.192.45 (FASTag Cellular Gateway)'
  }
];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('SUCCESS: natdams_db.json successfully updated with Pan-India states, 30 diverse violations & dynamic IPs.');
