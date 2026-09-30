/**
 * TRAFIX - Comprehensive Automated Test & Verification Suite
 * Tests: Branding, Role Segregation, Strict RBAC Barriers, Input Validations & CRUD Flows
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log("================================================================================");
  console.log("TRAFIX PLATFORM AUTOMATED TEST & VERIFICATION SUITE");
  console.log("================================================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
    }
  }

  // 1. Homepage & Branding
  const resHome = await fetch(`${BASE_URL}/`);
  const htmlHome = await resHome.text();
  assert(resHome.status === 200, "1. Homepage returns HTTP 200 OK");
  assert(htmlHome.includes('TRAFIX'), "2. Homepage includes TRAFIX government brand title");
  assert(htmlHome.includes('portalSectionCitizen') && htmlHome.includes('portalSectionPolice') && htmlHome.includes('portalSectionRto') && htmlHome.includes('portalSectionAdmin'), "3. Divided 4-role multi-portal login gateway present in DOM");

  // 2. Authentication for all 4 roles
  // Citizen
  const resCit = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'citizen@trafix.gov.in', password: 'Citizen@2026', role: 'CITIZEN' })
  });
  const dataCit = await resCit.json();
  assert(dataCit.success && dataCit.user.role === 'CITIZEN', "4. Citizen Login succeeds with role CITIZEN");
  const citToken = dataCit.token;

  // Police
  const resPol = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ badgeNumber: 'TR-INSP-5501', password: 'INSP@2026', pin: '5050', role: 'POLICE' })
  });
  const dataPol = await resPol.json();
  assert(dataPol.success && dataPol.user.role === 'TRAFFIC_POLICE_OFFICER', "5. Police Login succeeds with role TRAFFIC_POLICE_OFFICER");
  const polToken = dataPol.token;

  // RTO
  const resRto = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rto@trafix.gov.in', password: 'Rto@2026', role: 'RTO' })
  });
  const dataRto = await resRto.json();
  assert(dataRto.success && dataRto.user.role === 'RTO_OFFICER', "6. RTO Login succeeds with role RTO_OFFICER");
  const rtoToken = dataRto.token;

  // Admin
  const resAdm = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@trafix.gov.in', password: 'Admin@2026', role: 'ADMIN' })
  });
  const dataAdm = await resAdm.json();
  assert(dataAdm.success && dataAdm.user.role === 'ADMINISTRATOR', "7. Admin Login succeeds with role ADMINISTRATOR");
  const admToken = dataAdm.token;

  // 3. Strict Server-Side RBAC Enforcement
  // Citizen accessing audit logs -> Expected 403
  const resCitAudit = await fetch(`${BASE_URL}/api/audit-logs`, {
    headers: { 'Authorization': `Bearer ${citToken}` }
  });
  assert(resCitAudit.status === 403, "8. RBAC Barrier: Citizen calling /api/audit-logs blocked with HTTP 403 Forbidden");

  // Citizen updating police case -> Expected 403
  const resCitCasePut = await fetch(`${BASE_URL}/api/cases/CASE-2026-101`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${citToken}` },
    body: JSON.stringify({ status: 'Closed' })
  });
  assert(resCitCasePut.status === 403, "9. RBAC Barrier: Citizen calling PUT /api/cases/:id blocked with HTTP 403 Forbidden");

  // Police updating RTO application -> Expected 403
  const resPolRtoPut = await fetch(`${BASE_URL}/api/rto-applications/RTO-APP-01`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${polToken}` },
    body: JSON.stringify({ status: 'APPROVED' })
  });
  assert(resPolRtoPut.status === 403, "10. RBAC Barrier: Police calling PUT /api/rto-applications/:id blocked with HTTP 403 Forbidden");

  // RTO updating police case -> Expected 403
  const resRtoCasePut = await fetch(`${BASE_URL}/api/cases/CASE-2026-101`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${rtoToken}` },
    body: JSON.stringify({ status: 'Closed' })
  });
  assert(resRtoCasePut.status === 403, "11. RBAC Barrier: RTO calling PUT /api/cases/:id blocked with HTTP 403 Forbidden");

  // Admin accessing audit logs -> Expected 200
  const resAdmAudit = await fetch(`${BASE_URL}/api/audit-logs`, {
    headers: { 'Authorization': `Bearer ${admToken}` }
  });
  assert(resAdmAudit.status === 200, "12. RBAC Access: Admin calling /api/audit-logs returns HTTP 200 OK");

  // 4. Input Validation & Verification
  // Empty complaint
  const resBadComplaint = await fetch(`${BASE_URL}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: '', description: 'ab' })
  });
  assert(resBadComplaint.status === 400, "13. Input Validation: Malformed complaint rejected with HTTP 400 Bad Request");

  // Valid complaint
  const resGoodComplaint = await fetch(`${BASE_URL}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'Signal Failure & Congestion',
      description: 'Traffic signals non-functional at Ring Road junction causing heavy delay.',
      locationAddress: 'Ring Road Expressway Gantry 04, New Delhi',
      location: '28.6139° N, 77.2090° E'
    })
  });
  const dataGoodComplaint = await resGoodComplaint.json();
  assert(resGoodComplaint.status === 201 && dataGoodComplaint.caseRecord?.id, "14. Workflow: Citizen complaint successfully registered");

  // Valid accident report
  const resGoodAccident = await fetch(`${BASE_URL}/api/accidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accidentType: 'Collision',
      severity: 'Serious',
      locationAddress: 'NH-48 KM 22 Approach Corridor',
      location: '28.5400° N, 77.2100° E',
      description: 'Multiple vehicle pileup on outer lane, medical assistance dispatched.',
      casualties: 1,
      vehiclesInvolved: 2
    })
  });
  const dataGoodAccident = await resGoodAccident.json();
  assert(resGoodAccident.status === 201 && dataGoodAccident.accident?.id, "15. Workflow: Road accident reported with emergency forensics");

  // Police records a violation
  const resViolation = await fetch(`${BASE_URL}/api/violations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${polToken}` },
    body: JSON.stringify({
      plateNumber: 'DL-01-AB-4921',
      vehicleType: 'Cars & SUVs (4-Wheelers)',
      violationType: 'Speed Violation (>80 km/h in 60 km/h Zone)',
      violationCode: 'SEC-183(2) MV ACT',
      location: 'Ring Road Expressway Gantry 04',
      fineAmount: 2000,
      officerBadge: 'TR-INSP-5501'
    })
  });
  const dataViolation = await resViolation.json();
  assert(resViolation.status === 201 && dataViolation.violation?.id, "16. Workflow: Police officer records statutory violation citation");

  // Pay e-Challan
  const violationId = dataViolation.violation?.id || 'CH-2026-90412';
  const resPay = await fetch(`${BASE_URL}/api/challans/${violationId}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const dataPay = await resPay.json();
  assert(resPay.status === 200 && dataPay.receipt, "17. Workflow: Citizen e-Challan online settlement and receipt issuance");

  // Submit RTO application
  const resRtoApp = await fetch(`${BASE_URL}/api/rto-applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationType: 'LICENCE_RENEWAL',
      applicantName: 'Vikramaditya Sharma',
      citizenId: 'CIT-101',
      targetDlRc: 'DL-1420110023456',
      rtoCode: 'DL-01',
      remarks: 'Applying for statutory renewal with updated medical fitness.'
    })
  });
  const dataRtoApp = await resRtoApp.json();
  assert(resRtoApp.status === 201 && dataRtoApp.application?.id, "18. Workflow: Citizen submits statutory RTO Parivahan application");

  // RTO officer reviews and approves application
  const appId = dataRtoApp.application?.id;
  const resRtoApprove = await fetch(`${BASE_URL}/api/rto-applications/${appId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${rtoToken}` },
    body: JSON.stringify({ status: 'APPROVED', remarks: 'Documents verified and eligibility confirmed.' })
  });
  const dataRtoApprove = await resRtoApprove.json();
  assert(resRtoApprove.status === 200 && dataRtoApprove.application?.status === 'APPROVED', "19. Workflow: RTO officer exercises statutory document approval");

  // VAHAN & Sarathi query
  const resVehicles = await fetch(`${BASE_URL}/api/vehicles`);
  const dataVehicles = await resVehicles.json();
  assert(resVehicles.status === 200 && dataVehicles.vehicles?.length > 0, "20. VAHAN: Vehicle Registry search returns valid records");

  const resLicences = await fetch(`${BASE_URL}/api/licences`);
  const dataLicences = await resLicences.json();
  assert(resLicences.status === 200 && dataLicences.licences?.length > 0, "21. SARATHI: Driving Licence Registry returns valid records");

  // Risk Zones & Analytics
  const resRisk = await fetch(`${BASE_URL}/api/risk-zones`);
  const dataRisk = await resRisk.json();
  assert(resRisk.status === 200 && dataRisk.riskZones?.length > 0, "22. Risk Center: Accident hotspots and safety zones active");

  const resAnalytics = await fetch(`${BASE_URL}/api/analytics`);
  const dataAnalytics = await resAnalytics.json();
  assert(resAnalytics.status === 200 && dataAnalytics.metrics?.anprAccuracyRate, "23. Analytics: Executive metrics & ANPR accuracy returned");

  console.log("================================================================================");
  console.log(`RESULTS: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log("================================================================================");

  if (passed === total) {
    console.log("ALL TESTS COMPLETED SUCCESSFULLY! TRAFIX PLATFORM IS 100% OPERATIONAL.");
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
